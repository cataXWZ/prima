/** Runtime evidence contracts. Raw JSON is still checked by the result validators before it contributes to a gate. */
export interface TestIdentity {
  id: string; project?: string; repeatEachIndex?: number; path?: string; title?: string;
  origin?: string; sourceDigest?: string | null;
}
export interface RawAttempt { retry?: number; status?: string; duration?: number; }
export interface RawTest { projectName?: string; annotations?: { type: string; description?: string }[]; repeatEachIndex?: number; results?: RawAttempt[]; expectedStatus?: string; status?: string; }
export interface RawSpec { title?: string; file?: string; tags?: string[]; tests: RawTest[]; }
export interface RawSuite { title?: string; file?: string; specs?: RawSpec[]; suites?: RawSuite[]; }
export interface RawReport { config?: { projects?: { name: string; repeatEach?: number }[]; repeatEach?: number; shard?: unknown }; suites?: RawSuite[]; errors?: unknown[]; }
export interface BuildEvidence {
  status: string; configured?: boolean; method?: string; header?: string; expected?: string; before?: string | null; after?: string | null;
  origin?: string; observed?: string | null; reason?: string;
}
export interface SourceIntegrity { status: string; before?: string | null; after?: string | null; }
export interface PerformanceEvidence {
  required: boolean; status: string; contractDigest?: string; gateDigest?: string | null; measurementDigest?: string; reason?: string;
}
export interface QualityEvidence {
  status: string; sourceDigest: string; sourceHashes: Record<string, string>;
  checks?: string[]; findings?: unknown[]; warnings?: unknown[]; failures?: string[];
}
export interface ShardAggregation {
  schemaVersion: number; groupId: string; shard?: { index: number; total: number }; total?: number; shards?: { index: number; artifactName: string; runId?: string; evidenceDigest: string; expectedCount: number }[];
  fullExpectedTests?: TestIdentity[]; inventoryDigest: string; profileDigest: string;
}
export interface SuiteRunInput {
  [field: string]: unknown;
  suiteId?: string; suiteVersion?: number; suiteDigest?: string; appRevision?: number | string;
  environment?: Record<string, unknown> | string; sourceCommit?: string | null;
  deploymentEvidence?: BuildEvidence; sourceIntegrity?: SourceIntegrity;
  runId?: string; executionId?: string; selection?: { full: boolean; args: string[] };
  interrupted?: boolean; timedOut?: boolean; expectedTests?: TestIdentity[]; exitCode?: number | null;
  report?: RawReport; reportDigest?: string; performance?: PerformanceEvidence; quality?: QualityEvidence;
  receipt?: Receipt; receiptKey?: string; kind?: string; recordedAt?: string; aggregation?: ShardAggregation;
  ci?: { provider: string; repository?: string; runId?: string; runAttempt?: string; headSha?: string | null };
}
export interface Receipt extends SuiteRunInput { schemaVersion: number; signature: string; }
export interface VerifiedArtifact {
  source?: string; evidenceDigest?: string; headSha?: string; repository?: string; runId?: string;
  runAttempt?: string; artifactId?: string | number; workflowPath?: string; conclusion?: string;
}
export interface Provenance {
  status: string; reason?: string; source?: string; repository?: string; headSha?: string; runId?: string;
  recordedAt?: string; runAttempt?: string; artifactId?: string | number; workflowPath?: string; conclusion?: string;
}
export interface NormalizedTest extends TestIdentity {
  project: string; status: string; firstAttemptPassed: boolean;
  attempts: { retry: number; status: string; durationMs: number }[]; durationMs?: number; reason?: string;
}
export interface GatePolicy { allowFlaky?: boolean; allowSkipped?: boolean; requireVerifiedCI?: boolean; requireFullSuite?: boolean; }
export interface NormalizedRun {
  schemaVersion: number; suiteId: string; suiteVersion: number | null; suiteDigest: string; appRevision: string;
  environment: unknown; sourceCommit: string; deploymentEvidence: BuildEvidence; sourceIntegrity: SourceIntegrity;
  runId: string; selection: { full: boolean; args: string[] }; interrupted: boolean; timedOut: boolean;
  expectedTestsDigest: string; exitCode: number | null; reportDigest: string; performance?: PerformanceEvidence;
  executionId: string; expectedCount: number; tests: NormalizedTest[]; counts: Record<string, number>;
  reportErrors: number; reportError: string | null; complete: boolean; provenance: Provenance; runDigest: string;
}

export interface ClientConfiguration {
  webServer?: { command: string; url: string; timeout?: number; reuseExistingServer?: false };
  buildIdentity?: { header: string; expected: string };
  clock?: { fixedTime: string };
}
