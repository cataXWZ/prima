import type { TestIdentity, RawReport, RawSuite, RawSpec, RawTest, SuiteRunInput, BuildEvidence, SourceIntegrity, NormalizedTest, NormalizedRun, Provenance, GatePolicy, VerifiedArtifact, PerformanceEvidence } from './contracts.ts';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const suiteEvidenceDigest = (value: unknown): string => createHash('sha256').update(typeof value === 'string' ? value : canonical(value) ?? 'null').digest('hex');
const digest = suiteEvidenceDigest;
const object = <T>(value: T): value is T & Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const canonical = (value: unknown): string => JSON.stringify(order(value));
function order(value: unknown): unknown { if (Array.isArray(value)) return value.map(order); if (object(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, order(value[key])])); return value; }
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/;
const HASH = /^[a-f0-9]{64}$/;
const safeString = (value: unknown, fallback = '') => typeof value === 'string' && value.length <= 500 ? value : fallback;
interface ReportRow extends TestIdentity { project: string; repeatEachIndex: number; path: string; title: string; origin: string; test: RawTest; spec: RawSpec; }
function records(report: RawReport | undefined): ReportRow[] {
  if (!object(report) || !Array.isArray(report.suites)) throw new Error('invalid_playwright_report');
  const rows: ReportRow[] = [], repeated = new Map<string, { signature: string; count: number }>();
  function walk(suite: RawSuite, ancestors: string[]) {
    if (!object(suite)) throw new Error('invalid_playwright_suite');
    const titles = [...ancestors, safeString(suite.title)].filter(Boolean);
    for (const spec of suite.specs || []) {
      if (!object(spec) || !Array.isArray(spec.tests)) throw new Error('invalid_playwright_spec');
      const file = safeString(spec.file || suite.file).replaceAll('\\', '/');
      const title = [...titles, safeString(spec.title)].join(' › ');
      for (const test of spec.tests) {
        const project = safeString(test.projectName, 'default') || 'default';
        const annotation = (test.annotations || []).find(item => item?.type === 'suite-test-id')?.description;
        const tagged = annotation || `${spec.title || ''} ${(spec.tags || []).join(' ')}`.match(/(?:^|\s)@suite-test:([a-zA-Z0-9][a-zA-Z0-9._:-]{0,159})(?:\s|$)/)?.[1];
        if (tagged && !ID.test(tagged)) throw new Error('invalid_stable_test_id');
        const id = tagged || `manual-${digest({ file, title, project }).slice(0, 24)}`;
        const repetitionLimit = report?.config?.projects?.find(item => item.name === project)?.repeatEach ?? report?.config?.repeatEach ?? 1;
        const repetitionKey = `${id}\u0000${project}`, signature = `${file}\u0000${title}`;
        const prior = repeated.get(repetitionKey);
        const occurrence = prior?.count || 0;
        repeated.set(repetitionKey, { signature, count: occurrence + 1 });
        const inferredRepeat = Number.isSafeInteger(repetitionLimit) && repetitionLimit > 1 && repetitionLimit <= 100 && occurrence < repetitionLimit && (!prior || prior.signature === signature) ? occurrence : 0;
        const repeatEachIndex = test.repeatEachIndex ?? inferredRepeat;
        if (!Number.isSafeInteger(repeatEachIndex) || repeatEachIndex < 0 || repeatEachIndex > 100) throw new Error('invalid_repeat_index');
        rows.push({ id, project, repeatEachIndex, path: file, title, origin: /(?:^|\/)manual\//.test(file) ? 'manual' : tagged ? 'generated' : 'manual', test, spec });
        if (rows.length > 10000) throw new Error('test_inventory_limit');
      }
    }
    for (const child of suite.suites || []) walk(child, titles);
  }
  for (const suite of report.suites) walk(suite, []);
  return rows;
}
const key = (test: TestIdentity) => `${test.id}\u0000${test.project || 'default'}\u0000${test.repeatEachIndex || 0}`;

/** Use --list JSON from the same selection BEFORE execution; never derive expected tests from run output. */
export function discoverSuiteTests(report: RawReport | undefined, { sourceDigests = {} }: { sourceDigests?: Record<string, string> } = {}) {
  const tests = records(report).map(({ id, project, repeatEachIndex, path, title, origin }) => {
    const sourcePath = HASH.test(sourceDigests[path] || '') ? path : HASH.test(sourceDigests[`tests/${path}`] || '') ? `tests/${path}` : path;
    return { id, project, repeatEachIndex, path: sourcePath, title, origin, sourceDigest: HASH.test(sourceDigests[sourcePath] || '') ? sourceDigests[sourcePath] : null };
  });
  if (new Set(tests.map(key)).size !== tests.length) throw new Error('duplicate_stable_test_id');
  return tests;
}
function deploymentEvidence(value: BuildEvidence | undefined): BuildEvidence {
  if (!object(value) || value.status === 'unverified') return { status: 'unverified', reason: 'build_identity_unavailable' };
  if (value.status === 'observed' && value.method === 'response-header' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value.header || '') && HASH.test(value.expected || '') && value.before === value.expected && value.after === value.expected && safeString(value.origin)) {
    return { status: 'observed', method: value.method, header: value.header, expected: value.expected, before: value.before, after: value.after, origin: value.origin };
  }
  return { status: 'mismatch', reason: 'observed_build_identity_invalid_or_changed' };
}
function sourceIntegrity(value: SourceIntegrity | undefined): SourceIntegrity {
  if (!object(value)) return { status: 'unverified' };
  if (value.status === 'unchanged' && HASH.test(value.before || '') && value.before === value.after) return { status: 'unchanged', before: value.before, after: value.after };
  if (value.status === 'changed' && HASH.test(value.before || '') && HASH.test(value.after || '') && value.before !== value.after) return { status: 'changed', before: value.before, after: value.after };
  return { status: 'unavailable', before: HASH.test(value.before || '') ? value.before : null, after: null };
}
function metadata(input: SuiteRunInput) {
  return { suiteId: safeString(input.suiteId), suiteVersion: input.suiteVersion ?? null, suiteDigest: safeString(input.suiteDigest), appRevision: typeof input.appRevision === 'number' && Number.isFinite(input.appRevision) ? String(input.appRevision) : safeString(input.appRevision), environment: object(input.environment) ? order(input.environment) : safeString(input.environment), sourceCommit: safeString(input.sourceCommit), deploymentEvidence: deploymentEvidence(input.deploymentEvidence), sourceIntegrity: sourceIntegrity(input.sourceIntegrity), runId: safeString(input.runId), selection: input.selection ?? { full: true, args: [] }, interrupted: input.interrupted === true, timedOut: input.timedOut === true, expectedTestsDigest: digest(input.expectedTests), exitCode: Number.isInteger(input.exitCode) ? input.exitCode! : null, reportDigest: digest(input.report), ...(input.performance !== undefined ? {performance: object(input.performance) ? order(input.performance) as PerformanceEvidence : {required:true,status:'blocked',reason:'invalid_performance_evidence'}} : {}) };
}
/** Keys belong to the execution host / CI secret store. Never accept a verification key from a request body. */
export function signSuiteRunReceipt(input: SuiteRunInput, secret: string) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('receipt_key_too_short');
  if (!['local', 'ci'].includes(input.kind || '')) throw new Error('invalid_receipt_kind');
  const payload = { schemaVersion: 1, kind: input.kind, ...metadata(input), runId: safeString(input.runId), recordedAt: safeString(input.recordedAt || new Date().toISOString()) };
  if (!payload.suiteId || !HASH.test(payload.suiteDigest) || !payload.appRevision || !payload.environment || payload.exitCode === null || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(payload.sourceCommit) || !Number.isSafeInteger(payload.suiteVersion) || payload.suiteVersion === null || payload.suiteVersion < 1 || !payload.runId) throw new Error('receipt_binding_incomplete');
  return { ...payload, signature: createHmac('sha256', secret).update(canonical(payload)).digest('hex') };
}
function receiptProvenance(input: SuiteRunInput): Provenance {
  const receipt = input.receipt;
  if (!receipt) return { status: 'unverified', reason: 'execution_receipt_missing' };
  if (typeof input.receiptKey !== 'string' || input.receiptKey.length < 32) return { status: 'unverified', reason: 'verification_key_unavailable' };
  if (!object(receipt) || !HASH.test(receipt.signature || '')) return { status: 'unverified', reason: 'invalid_execution_receipt' };
  const { signature, ...payload } = receipt;
  const expected = createHmac('sha256', input.receiptKey).update(canonical(payload)).digest('hex');
  if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) return { status: 'unverified', reason: 'execution_receipt_signature_mismatch' };
  const bindings = metadata(input);
  if (payload.schemaVersion !== 1 || !['local', 'ci'].includes(payload.kind || '') || Object.entries(bindings).some(([field, value]) => canonical(payload[field]) !== canonical(value))) return { status: 'unverified', reason: 'execution_receipt_binding_mismatch' };
  return { status: payload.kind === 'ci' ? 'verified-ci' : 'verified-local', runId: payload.runId, recordedAt: payload.recordedAt };
}

export function normalizeSuiteRun(input: SuiteRunInput = {}, verification: VerifiedArtifact | null = null): NormalizedRun {
  const { report, expectedTests } = input;
  if (!Array.isArray(expectedTests) || expectedTests.length === 0 || expectedTests.length > 10000 || expectedTests.some(item => !object(item) || !ID.test(item.id || '') || (item.project !== undefined && (typeof item.project !== 'string' || !item.project || item.project.length > 500 || /[\x00-\x1f]/.test(item.project))) || !Number.isSafeInteger(item.repeatEachIndex ?? 0) || (item.repeatEachIndex ?? 0) < 0 || (item.repeatEachIndex ?? 0) > 100) || new Set(expectedTests.map(key)).size !== expectedTests.length) throw new Error('invalid_expected_test_inventory');
  let observed: ReportRow[] = [], invalidReport: string | null = null;
  try { observed = records(report); } catch (error) { invalidReport = error instanceof Error ? error.message : String(error); }
  const grouped = new Map<string, ReportRow[]>();
  for (const row of observed) { const identity = key(row); grouped.set(identity, [...(grouped.get(identity) || []), row]); }
  const expectedKeys = new Set(expectedTests.map(key));
  const tests: NormalizedTest[] = expectedTests.map(expected => {
    const base = { ...expected, project: expected.project || 'default', sourceDigest: HASH.test(expected.sourceDigest || '') ? expected.sourceDigest : null };
    const matched = grouped.get(key(base));
    if (!matched?.length) return { ...base, status: 'missing', firstAttemptPassed: false, attempts: [] };
    if (matched.length !== 1) return { ...base, status: 'failed', reason: 'duplicate_test_result', firstAttemptPassed: false, attempts: [] };
    const actual = matched[0].test;
    const malformedResults = !Array.isArray(actual.results);
    const attempts = (Array.isArray(actual.results) ? actual.results : []).map((result, index) => ({ retry: Number.isInteger(result?.retry) ? result.retry! : index, status: safeString(result?.status, 'unknown'), durationMs: typeof result?.duration === 'number' && Number.isFinite(result.duration) && result.duration >= 0 ? result.duration : 0 }));
    let status;
    // Expected-failure annotations must not turn a business defect into a passing delivery gate.
    if (malformedResults) status = 'failed';
    else if (actual.expectedStatus && actual.expectedStatus !== 'passed') status = actual.expectedStatus === 'skipped' ? 'skipped' : 'failed';
    else if (actual.status && !['expected', 'unexpected', 'flaky', 'skipped'].includes(actual.status)) status = 'failed';
    else if (!attempts.length || attempts.every(attempt => attempt.status === 'skipped')) status = 'skipped';
    else if (attempts.some(attempt => !['passed', 'failed', 'timedOut', 'interrupted', 'skipped'].includes(attempt.status)) || attempts.some((attempt, index) => attempt.retry !== index)) status = 'failed';
    else if (attempts.at(-1)!.status !== 'passed') status = attempts.at(-1)!.status === 'skipped' ? 'skipped' : 'failed';
    else if (attempts.length !== 1 || attempts.some(attempt => attempt.status !== 'passed') || actual.status === 'flaky') status = 'flaky';
    else if (actual.status === 'unexpected') status = 'failed';
    else status = 'passed';
    return { ...base, status, firstAttemptPassed: attempts[0]?.status === 'passed' && status === 'passed', attempts, durationMs: attempts.reduce((sum, attempt) => sum + attempt.durationMs, 0) };
  });
  for (const row of observed.filter(row => !expectedKeys.has(key(row)))) tests.push({ id: row.id, project: row.project, repeatEachIndex: row.repeatEachIndex, path: row.path, status: 'unexpected', firstAttemptPassed: false, attempts: [] });
  const counts = Object.fromEntries(['passed', 'flaky', 'failed', 'skipped', 'missing', 'unexpected'].map(status => [status, tests.filter(item => item.status === status).length]));
  const reportErrors = invalidReport ? 1 : Array.isArray(report?.errors) ? report.errors.length : report?.errors === undefined ? 0 : 1;
  const githubVerified = verification?.source === 'github-actions' && verification.evidenceDigest === digest(input) && verification.headSha === input.sourceCommit && verification.repository && verification.runId && verification.artifactId;
  const result = { schemaVersion: 1, ...metadata(input), executionId: safeString(input.runId || input.executionId), expectedCount: expectedTests.length, tests, counts, reportErrors, reportError: invalidReport, complete: counts.missing === 0 && counts.unexpected === 0 && reportErrors === 0,
    provenance: githubVerified ? { status: 'verified-ci', source: 'github-actions', repository: verification.repository, headSha: verification.headSha, runId: verification.runId, runAttempt: verification.runAttempt, artifactId: verification.artifactId, workflowPath: verification.workflowPath, conclusion: verification.conclusion } : receiptProvenance(input) };
  return { ...result, runDigest: digest(result) };
}

export function evaluateSuiteGate(run: NormalizedRun, policy: GatePolicy = {}) {
  const effective = { allowFlaky: false, allowSkipped: false, requireVerifiedCI: false, requireFullSuite: true, ...policy };
  const reasons: { code: string; testIds?: string[] }[] = [];
  if (!object(run) || !Array.isArray(run.tests) || !run.expectedCount) return { status: 'blocked', passed: false, reasons: [{ code: 'execution_evidence_missing' }], policy: effective };
  if (!object(policy) || ['allowFlaky', 'allowSkipped', 'requireVerifiedCI', 'requireFullSuite'].some(field => typeof effective[field as keyof GatePolicy] !== 'boolean')) reasons.push({ code: 'invalid_gate_policy' });
  if (effective.requireFullSuite && run.selection?.full !== true) reasons.push({ code: 'full_suite_execution_required' });
  if (run.complete !== true || run.tests.length !== run.expectedCount || run.tests.some(test => !['passed', 'failed', 'flaky', 'missing', 'skipped', 'unexpected'].includes(test.status))) reasons.push({ code: 'incomplete_execution_evidence' });
  if (effective.requireVerifiedCI && run.provenance?.source === 'github-actions' && run.provenance.conclusion !== 'success') reasons.push({ code: 'ci_workflow_not_successful' });
  if (!run.suiteId || !run.appRevision || !run.environment || !HASH.test(run.suiteDigest || '')) reasons.push({ code: 'execution_binding_incomplete' });
  if (run.interrupted || run.timedOut) reasons.push({ code: 'execution_interrupted_or_timed_out' });
  if (run.deploymentEvidence?.status === 'mismatch') reasons.push({ code: 'application_build_mismatch' });
  if (['changed', 'unavailable'].includes(run.sourceIntegrity?.status)) reasons.push({ code: 'runtime_source_changed_or_unverifiable' });
  if (run.sourceIntegrity?.status === 'unchanged' && run.sourceIntegrity.before !== run.suiteDigest) reasons.push({ code: 'runtime_source_digest_mismatch' });
  if (run.exitCode !== 0) reasons.push({ code: 'process_failed_or_missing' });
  if (run.reportErrors) reasons.push({ code: 'runner_errors' });
  if (run.performance !== undefined && (run.performance?.required !== true || run.performance.status !== 'passed' || !['contractDigest','gateDigest','measurementDigest'].every(field => HASH.test(run.performance![field as 'contractDigest' | 'gateDigest' | 'measurementDigest'] || '')))) reasons.push({ code: 'performance_gate_blocked' });
  for (const status of ['failed', 'missing', 'unexpected', ...(!effective.allowFlaky ? ['flaky'] : []), ...(!effective.allowSkipped ? ['skipped'] : [])]) {
    const testIds = run.tests.filter(test => test.status === status).map(test => `${test.id}@${test.project}`);
    if (testIds.length) reasons.push({ code: `tests_${status}`, testIds });
  }
  if (effective.requireVerifiedCI && run.provenance?.status !== 'verified-ci') reasons.push({ code: 'verified_ci_receipt_required' });
  return { status: reasons.length ? 'blocked' : 'passed', passed: reasons.length === 0, reasons, policy: effective };
}

export function summarizeSuiteReliability(runs: NormalizedRun[] = []) {
  if (!Array.isArray(runs)) throw new Error('invalid_run_history');
  const groups = new Map<string, { id: string; project: string; suiteId: string; sourceDigest?: string | null; appRevision: string; applicationBuild: string | null; environment: unknown; comparable: boolean; samples: number; firstAttemptPasses: number; passed: number; failed: number; retryFlaky: number; verifiedSamples: number }>();
  const seen = new Set();
  for (const run of runs) {
    if (!run?.runDigest || seen.has(run.runDigest)) continue;
    seen.add(run.runDigest);
    const observedDeployment = deploymentEvidence(run.deploymentEvidence);
    const applicationBuild = observedDeployment.status === 'observed' ? observedDeployment.expected || null : null;
    for (const test of run.tests || []) {
      if (!['passed', 'flaky', 'failed'].includes(test.status)) continue;
      const comparable = Boolean(run.suiteId && HASH.test(run.suiteDigest || '') && HASH.test(test.sourceDigest || '') && run.appRevision && run.environment && applicationBuild);
      // Unknown bindings never silently merge into one apparently comparable population.
      const groupId = digest({ suiteId: run.suiteId, id: test.id, project: test.project, sourceDigest: test.sourceDigest, appRevision: run.appRevision, applicationBuild, environment: run.environment, suiteDigest: run.suiteDigest, unboundRun: comparable ? null : run.runDigest });
      if (!groups.has(groupId)) groups.set(groupId, { id: test.id, project: test.project, suiteId: run.suiteId, sourceDigest: test.sourceDigest, appRevision: run.appRevision, applicationBuild, environment: run.environment, comparable, samples: 0, firstAttemptPasses: 0, passed: 0, failed: 0, retryFlaky: 0, verifiedSamples: 0 });
      const group = groups.get(groupId)!;
      group.samples++; group.firstAttemptPasses += Number(test.firstAttemptPassed === true);
      group.passed += Number(test.status === 'passed'); group.failed += Number(test.status === 'failed'); group.retryFlaky += Number(test.status === 'flaky');
      group.verifiedSamples += Number(['verified-local', 'verified-ci'].includes(run.provenance?.status));
    }
  }
  return { runCount: seen.size, groups: [...groups.values()].map(group => ({ ...group, firstAttemptPassRate: group.samples ? group.firstAttemptPasses / group.samples : null, intermittent: group.retryFlaky > 0 || group.comparable && group.passed > 0 && group.failed > 0, assessment: group.retryFlaky > 0 || group.comparable && group.passed > 0 && group.failed > 0 ? 'unstable' : !group.comparable ? 'build_identity_unverified' : group.samples < 2 ? 'insufficient_samples' : group.failed > 0 ? 'consistently_failing' : 'no_instability_observed' })) };
}

/** Canonical report hash used by signed receipts and host-verified Actions artifacts. */
export const suiteReportDigest = (report: unknown) => digest(report);

/** A functional run never claims that an attached load contract has executed. */
export function pendingSuitePerformance(metadataBytes: string, functionalPassed: boolean) {
  const metadata = JSON.parse(metadataBytes) as { schemaVersion?: number; manifest?: { measurementDigest?: string } };
  if (!object(metadata) || metadata.schemaVersion !== 1 || !HASH.test(metadata.manifest?.measurementDigest || '')) throw new Error('invalid_attached_performance_metadata');
  return { required:true, status:'blocked', contractDigest:digest(metadataBytes), measurementDigest:metadata.manifest!.measurementDigest, gateDigest:null, reason:functionalPassed ? 'performance_execution_pending' : 'functional_gate_blocked' };
}

/** Reconcile raw shard evidence, never trust a claimed aggregate pass or union alone. */
export function aggregateSuiteShardInputs(inputs: SuiteRunInput[], { expectedShards, groupId }: { expectedShards?: number; groupId?: string } = {}): SuiteRunInput {
  function need(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
  need(typeof expectedShards === 'number' && Number.isSafeInteger(expectedShards) && expectedShards >= 1 && expectedShards <= 16, 'invalid_expected_shard_count');
  need(Array.isArray(inputs) && inputs.length === expectedShards, 'missing_or_extra_shards');
  need(typeof groupId === 'string' && /^[A-Za-z0-9_.:-]{1,160}$/.test(groupId), 'invalid_execution_group');
  const first = inputs[0], complete = first?.aggregation?.fullExpectedTests;
  need(Array.isArray(complete) && complete.length > 0 && complete.length <= 10000 && new Set(complete.map(key)).size === complete.length, 'invalid_complete_inventory');
  need(complete.every(item => ID.test(item?.id || '') && typeof item.project === 'string' && HASH.test(item.sourceDigest || '')), 'unbound_complete_inventory');
  need(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(first.sourceCommit || ''), 'aggregate_requires_source_commit');
  const inventoryDigest = digest(complete), seenShards = new Set(), seenTests = new Set();
  const allByKey = new Map(complete.map(test => [key(test), test]));
  const binding = (value: SuiteRunInput) => ({ suiteId: value.suiteId, suiteVersion: value.suiteVersion, suiteDigest: value.suiteDigest, sourceCommit: value.sourceCommit, appRevision: value.appRevision, environment: value.environment, profileDigest: value.aggregation?.profileDigest });
  const expectedBinding = digest(binding(first)), runs: NormalizedRun[] = [];
  for (const input of inputs) {
    const aggregation = input?.aggregation, index = aggregation?.shard?.index;
    need(aggregation?.schemaVersion === 1 && aggregation.groupId === groupId && aggregation.shard!.total === expectedShards && typeof index === 'number' && Number.isSafeInteger(index) && index >= 1 && index <= expectedShards && !seenShards.has(index), 'invalid_or_duplicate_shard');
    seenShards.add(index);
    need(HASH.test(aggregation.profileDigest || '') && digest(binding(input)) === expectedBinding, 'shard_source_build_profile_binding_mismatch');
    need(aggregation.inventoryDigest === inventoryDigest && digest(aggregation.fullExpectedTests) === inventoryDigest, 'shard_complete_inventory_mismatch');
    need(input.reportDigest === digest(input.report), 'shard_report_digest_mismatch');
    need(input.sourceIntegrity?.status === 'unchanged' && input.sourceIntegrity.before === input.suiteDigest && input.sourceIntegrity.after === input.suiteDigest, 'shard_source_changed');
    const build = deploymentEvidence(input.deploymentEvidence);
    need(build.status === 'observed' && digest(build) === digest(deploymentEvidence(first.deploymentEvidence)), 'shards_require_same_observed_build');
    need(Array.isArray(input.expectedTests) && input.expectedTests!.length > 0, 'empty_shard_inventory');
    for (const test of input.expectedTests) {
      const identity = key(test);
      need(!seenTests.has(identity), 'duplicate_test_across_shards');
      need(allByKey.has(identity) && digest(test) === digest(allByKey.get(identity)), 'shard_test_outside_complete_inventory');
      seenTests.add(identity);
    }
    need(input.selection?.full === false && Array.isArray(input.selection.args) && input.selection.args.filter(arg => /^--shard=/.test(arg)).length === 1 && input.selection.args.includes(`--shard=${index}/${expectedShards}`) && !input.selection.args.some(arg => /^--(?:grep|grep-invert|project|repeat-each)=/.test(arg)), 'shard_has_unapproved_filter');
    runs.push(normalizeSuiteRun(input));
  }
  need(seenTests.size === complete.length && complete.every(test => seenTests.has(key(test))), 'incomplete_shard_test_coverage');
  const report = { config: { ...first.report?.config, shard: null }, suites: inputs.flatMap(input => input.report?.suites || []), errors: inputs.flatMap(input => input.report?.errors || []) };
  const failed = runs.some(run => { const {performance,...functional} = run; return !evaluateSuiteGate(functional, { requireFullSuite: false }).passed; });
  const result = { schemaVersion: 1, runId: first.runId, suiteId: first.suiteId, suiteVersion: first.suiteVersion, suiteDigest: first.suiteDigest, sourceCommit: first.sourceCommit, appRevision: first.appRevision, environment: first.environment, deploymentEvidence: first.deploymentEvidence, sourceIntegrity: first.sourceIntegrity, expectedTests: complete, exitCode: failed ? 1 : 0, interrupted: runs.some(run => run.interrupted), timedOut: runs.some(run => run.timedOut), selection: { full: true, args: [] }, report, reportDigest: digest(report), quality: first.quality,
    aggregation: { schemaVersion: 1, groupId, total: expectedShards, inventoryDigest, profileDigest: first.aggregation!.profileDigest, shards: inputs.map(input => ({ index: input.aggregation!.shard!.index, artifactName: `studio-suite-shard-${input.aggregation!.shard!.index}`, runId: input.runId, evidenceDigest: digest(input), expectedCount: input.expectedTests!.length })).sort((a,b) => a.index-b.index) } };
  return result;
}
