import { discoverSuiteTests, normalizeSuiteRun } from './results.ts';
import type { RawReport } from './contracts.ts';
export type DiscoveryProject = 'api' | 'ui' | 'ui-api';
export interface DiscoveryIdentity { id: string; project: DiscoveryProject; path?: string; assertionTier?: string; verification?:string; }
export interface DiscoveryManifest {
  schemaVersion?: string; sourceDigest: string; scopeDigest: string | null; sourceRevision: string | null;
  frameworkInputs?: {schemaVersion: string; sourceRevision: string; sourceHashes: Record<string,string>};
  runtimeRequirements?:Record<string,string>; sourceHashes?: Record<string,string>; inventory: DiscoveryIdentity[];
  projects: Record<DiscoveryProject,{required:boolean;ids:string[]}>;
  blockers?:{code:string;project?:string|null;reason?:string;id?:string}[]; omittedInventory?:DiscoveryIdentity[]; auth?: unknown; clock?:unknown; data?: {mode:string;parallelSafe?:boolean;ledgerEnv?:string;owner?:string}; buildIdentity?: {url:string;header:string;expected:string} | null;
}
export interface ProjectReceipt {
  project: DiscoveryProject; executionGroup: string; sourceDigest: string; scopeDigest: string | null; sourceRevision: string | null;
  build: {status:string;expected?:string;before?:string|null;after?:string|null}; exitCode:number|null; report?:RawReport;
}
const names: DiscoveryProject[] = ['api','ui','ui-api'];
/** Projects have disjoint inventories. This is deliberately NOT the suite shard aggregator. */
export function evaluateDiscoveryDelivery({manifest,executionGroup,selection,receipts}:{manifest:DiscoveryManifest;executionGroup:string;selection:'all'|DiscoveryProject;receipts:ProjectReceipt[]}) {
  const selected = selection === 'all' ? names.filter(name=>manifest.projects[name].required) : [selection];
  const reasons: string[] = [], tests: {id:string;project:string;status:string}[] = [];
  let failed=false,verifiedBuilds=0;
  for(const blocker of manifest.blockers || []) if(selection==='all' || !blocker.project || selected.includes(blocker.project as DiscoveryProject))reasons.push(`generation_blocked:${blocker.code}`);
  if(manifest.inventory.some(item=>selected.includes(item.project) && item.verification==='unverified-human-edit')) reasons.push('unverified_human_edit');
  if (names.some(name=>!manifest.projects[name].required && manifest.inventory.some(item=>item.project===name))) reasons.push('required_project_omitted');
  if (!selected.length || !executionGroup) reasons.push('required_selection_empty');
  for (const project of selected) {
    const expected=manifest.inventory.filter(test=>test.project===project);
    if (manifest.projects[project].ids.length!==expected.length || expected.some(item=>!manifest.projects[project].ids.includes(item.id))) reasons.push(`${project}:manifest_inventory_mismatch`);
    if (!expected.length || new Set(expected.map(test=>test.id)).size!==expected.length) { reasons.push(`${project}:invalid_required_inventory`);continue; }
    const matches=receipts.filter(receipt=>receipt.project===project);
    if (matches.length!==1) {reasons.push(`${project}:missing_or_duplicate_report`);continue;}
    const receipt=matches[0]!;
    if (receipt.executionGroup!==executionGroup || receipt.sourceDigest!==manifest.sourceDigest || receipt.scopeDigest!==manifest.scopeDigest || receipt.sourceRevision!==manifest.sourceRevision) {reasons.push(`${project}:stale_report_binding`);continue;}
    if (receipt.build.status!=='observed' || !manifest.buildIdentity?.expected || receipt.build.expected!==manifest.buildIdentity.expected || receipt.build.before!==manifest.buildIdentity.expected || receipt.build.after!==manifest.buildIdentity.expected) reasons.push(`${project}:build_identity_unverified_or_changed`);
    else verifiedBuilds++;
    const metadata=(receipt.report as RawReport & {config?:{metadata?:{discovery?:{executionGroup?:string;sourceDigest?:string;scopeDigest?:string|null;sourceRevision?:string|null}}}})?.config?.metadata?.discovery;
    if (!metadata || metadata.executionGroup!==executionGroup || metadata.sourceDigest!==manifest.sourceDigest || metadata.scopeDigest!==manifest.scopeDigest || metadata.sourceRevision!==manifest.sourceRevision) {reasons.push(`${project}:raw_report_binding_mismatch`);continue;}
    try {
      const observed=discoverSuiteTests(receipt.report);
      if (observed.length!==expected.length || observed.some(item=>item.project!==project || !expected.some(wanted=>wanted.id===item.id))) {reasons.push(`${project}:inventory_mismatch`);continue;}
      const run=normalizeSuiteRun({report:receipt.report,expectedTests:expected,exitCode:receipt.exitCode});
      tests.push(...run.tests.map(test=>({id:test.id,project:test.project,status:test.status})));
      if (run.reportErrors || run.reportError || receipt.exitCode!==0 || run.tests.some(test=>test.status!=='passed' || !test.firstAttemptPassed)) {failed=true;reasons.push(`${project}:test_or_setup_failure`);}
    } catch { reasons.push(`${project}:malformed_or_duplicate_results`); }
  }
  if (receipts.some(receipt=>!selected.includes(receipt.project))) reasons.push('unexpected_project_receipt');
  return {schemaVersion:'discovery-verdict/v1',status:failed?'FAIL':reasons.length?'BLOCKED':'PASS',selection,executionGroup,sourceDigest:manifest.sourceDigest,scopeDigest:manifest.scopeDigest,sourceRevision:manifest.sourceRevision,buildVerified:verifiedBuilds===selected.length && selected.length>0,reasons,tests,counts:{expected:selected.reduce((n,name)=>n+manifest.projects[name].ids.length,0),observed:tests.length},coverageClaim:selection==='all'?'composed-reviewed-inventory':'selected-project-only',hostedCI:'NOT_RUN'};
}
