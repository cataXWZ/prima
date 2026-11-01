import { readFile, mkdir, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { evaluateDiscoveryDelivery } from './verdict.ts';
import type { DiscoveryManifest, DiscoveryProject, ProjectReceipt } from './verdict.ts';
import { validateAuthPolicy, resolveDiscoveryAuth } from './auth-runtime.ts';
import { assertDiscoveryMetadataPair } from './metadata.ts';
const root=process.cwd(), selection=process.argv[2] || 'all';
if (!['check','api','ui','ui-api','all'].includes(selection) || process.argv.length>3) throw new Error('Use check, api, ui, ui-api or all; runner selection overrides are not permitted.');
const group=process.env.SUITE_EXECUTION_GROUP || randomUUID();
if (!/^[A-Za-z0-9_-]{1,120}$/.test(group)) throw new Error('Invalid execution group.');
const out=path.join(root,'reports','discovery',group);
const {delivery}=assertDiscoveryMetadataPair(await readFile(path.join(root,'.studio/owners.json'),'utf8'),await readFile(path.join(root,'.studio/discovery-delivery.json'),'utf8'));
const manifest=delivery as unknown as DiscoveryManifest;
const projects:DiscoveryProject[]=selection==='all'||selection==='check'?(['api','ui','ui-api'] as DiscoveryProject[]).filter(name=>manifest.projects[name].required):[selection as DiscoveryProject];
const origins=JSON.parse(await readFile(path.join(root,'support/discovery/scope.json'),'utf8')) as {origin:string;apiOrigins:string[]};
const receipts:ProjectReceipt[]=[];
await mkdir(out,{recursive:true,mode:0o700});
const child = (script:string,args:string[],env:NodeJS.ProcessEnv=process.env) => new Promise<number|null>((resolve,reject)=>{const task=spawn(process.execPath,[script,...args],{cwd:root,env,stdio:'inherit'});task.once('error',reject);task.once('exit',code=>resolve(code));});
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
async function verifySources() {
  if (!manifest.sourceHashes || !Object.keys(manifest.sourceHashes).length) throw new Error('Generated source inventory is missing.');
  const contract={auth:manifest.auth || null,data:manifest.data || {mode:'read-only',parallelSafe:false},clock:manifest.clock || {mode:'live'},buildIdentity:manifest.buildIdentity || null,projects:manifest.projects,inventory:manifest.inventory,blockers:manifest.blockers || [],omittedInventory:manifest.omittedInventory || [],runtimeRequirements:manifest.runtimeRequirements || {},...(manifest.frameworkInputs ? {frameworkInputs:manifest.frameworkInputs} : {})};
  if (digest(JSON.stringify({sourceHashes:manifest.sourceHashes,contract}))!==manifest.sourceDigest) throw new Error('Reviewed execution policy or source digest changed.');
  for (const [file,expected] of Object.entries({...manifest.frameworkInputs?.sourceHashes,...manifest.sourceHashes})) {
    const parts=file.split('/');
    if (path.isAbsolute(file) || file.includes('\\') || parts.some(part=>!part || part==='.' || part==='..')) throw new Error('Invalid source inventory path.');
    let current=root;
    for (let index=0;index<parts.length;index++) {
      current=path.join(current,parts[index]!);
      const stat=await lstat(current);
      if (stat.isSymbolicLink() || (index===parts.length-1 ? !stat.isFile() : !stat.isDirectory())) throw new Error('Reviewed sources must remain regular files inside the suite.');
    }
    if (digest(await readFile(path.join(root,file),'utf8'))!==expected) throw new Error(`Reviewed source changed: ${file}. Regenerate and review before delivery.`);
  }
}
async function observedBuild() {
  const policy=manifest.buildIdentity;
  if (!policy) return null;
  const url=new URL(policy.url);
  if (![origins.origin,...origins.apiOrigins].includes(url.origin) || url.username || url.password || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(policy.header) || !/^[a-f0-9]{64}$/.test(policy.expected)) throw new Error('Invalid reviewed build identity policy.');
  const auth=await resolveDiscoveryAuth(validateAuthPolicy(manifest.auth,[origins.origin,...origins.apiOrigins]),{env:process.env});
  const response=await fetch(url,{headers:auth.headersFor(url.href),redirect:'manual',signal:AbortSignal.timeout(8000)});
  if (response.status!==200) throw new Error('Build identity endpoint rejected verification.');
  await response.body?.cancel();
  return response.headers.get(policy.header);
}
let sourceFindings:{code:string;file:string;line:number;message:string}[]=[];
try {
  await verifySources();
  const {inspectTestingProjectSources}=await import('./source-policy.ts');
  sourceFindings=inspectTestingProjectSources(root);
  if(sourceFindings.length) throw new Error(sourceFindings.map(item=>`${item.file}:${item.line} ${item.code}: ${item.message}`).join('\n'));
  const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')) as {dependencies?:Record<string,string>;devDependencies?:Record<string,string>};
  if(!manifest.runtimeRequirements || !['tsx','typescript','@types/node','@playwright/test'].every(name=>manifest.runtimeRequirements?.[name])) throw new Error('Pinned standalone runtime requirements are missing.');
  for(const [name,version] of Object.entries(manifest.runtimeRequirements)) {
    if((pkg.devDependencies?.[name] || pkg.dependencies?.[name])!==version) throw new Error('Client package dependency pins do not match the reviewed runtime.');
    const installed=JSON.parse(await readFile(path.join(root,'node_modules',name,'package.json'),'utf8')) as {version?:string};
    if(installed.version!==version) throw new Error('Installed runtime differs from the reviewed pinned dependency.');
  }
  if((manifest.blockers || []).some(blocker=>selection==='all' || selection==='check' || !blocker.project || projects.includes(blocker.project as DiscoveryProject)) || manifest.inventory.some(item=>projects.includes(item.project) && item.verification==='unverified-human-edit')) throw new Error('Reviewed coverage has unresolved generation blockers.');
  if(manifest.data?.mode==='retained') {
    const external=process.env[manifest.data.ledgerEnv || ''];
    if(!external || !path.isAbsolute(external) || path.resolve(external)===root || path.resolve(external).startsWith(root+path.sep)) throw new Error('Restore the reviewed external data ownership ledger.');
    const ledger=JSON.parse(await readFile(path.join(external,'retained-resources.json'),'utf8')) as {schemaVersion:number;scopeDigest:string;owner:string;resources:unknown[]};
    if(ledger.schemaVersion!==1 || ledger.scopeDigest!==digest(JSON.stringify(origins)) || ledger.owner!==manifest.data.owner || !Array.isArray(ledger.resources)) throw new Error('Ownership ledger does not match the reviewed target.');
  }
  if (!projects.length || projects.some(project=>!manifest.projects[project]?.ids.length)) throw new Error('Selected required project has no coverage.');
  if (await child(path.join(root,'node_modules/typescript/bin/tsc'),['--noEmit','--project','tsconfig.discovery.json'])!==0) throw new Error('Mandatory strict typecheck failed.');
  for (const project of projects) {
    const directory=path.join(out,project);await mkdir(directory,{mode:0o700});
    const env={...process.env,SUITE_EXECUTION_GROUP:group,STUDIO_DISCOVERY_REPORT_SCOPE:project,STUDIO_DISCOVERY_REPORT_DIR:directory};
    const cli=path.join(root,'node_modules/@playwright/test/cli.js');
    const listFile=path.join(directory,'inventory.json');
    const listEnv={...env,PLAYWRIGHT_JSON_OUTPUT_NAME:listFile};
    if (await child(cli,['test','--config','playwright.discovery.config.ts','--tsconfig','tsconfig.discovery.json',`--project=${project}`,'--list','--reporter=json'],listEnv)!==0) throw new Error('Mandatory inventory listing failed.');
    const listed=JSON.parse(await readFile(listFile,'utf8')) as ProjectReceipt['report'];
    // Reuse suite result validation against the manifest even before execution.
    const {discoverSuiteTests}=await import('./results.ts');
    const inventory=discoverSuiteTests(listed);
    const wanted=manifest.projects[project].ids;
    if (inventory.length!==wanted.length || inventory.some(test=>test.project!==project || !wanted.includes(test.id))) throw new Error('Listed tests do not match the reviewed inventory.');
    if (selection==='check') continue;
    const before=await observedBuild();
    const exitCode=await child(cli,['test','--config','playwright.discovery.config.ts','--tsconfig','tsconfig.discovery.json',`--project=${project}`],env);
    let report:ProjectReceipt['report'];
    try {report=JSON.parse(await readFile(path.join(directory,'results.json'),'utf8')) as ProjectReceipt['report'];}catch { /* Missing or malformed report is BLOCKED. */ }
    let after:string|null=null;try {after=await observedBuild();}catch { /* Build change cannot turn a failure green. */ }
    receipts.push({project,executionGroup:group,sourceDigest:manifest.sourceDigest,scopeDigest:manifest.scopeDigest,sourceRevision:manifest.sourceRevision,build:{status:manifest.buildIdentity?'observed':'unverified',expected:manifest.buildIdentity?.expected,before,after},exitCode,report});
    await writeFile(path.join(directory,'receipt.json'),JSON.stringify({...receipts.at(-1),report:undefined},null,2));
  }
  await verifySources();
  const verdict=selection==='check'?{status:'PASS',selection:'check',executionGroup:group,checks:['strict-typecheck','exact-inventory','source-integrity'],coverageClaim:'NOT_RUN'}:evaluateDiscoveryDelivery({manifest,executionGroup:group,selection:selection as 'all'|DiscoveryProject,receipts});
  const directory=selection==='all'||selection==='check'?out:path.join(out,selection);
  await writeFile(path.join(directory,'verdict.json'),JSON.stringify(verdict,null,2));
  console.log(JSON.stringify(verdict));process.exitCode=verdict.status==='PASS'?0:1;
} catch {
  if(sourceFindings.length) console.error(sourceFindings.map(item=>`${item.file}:${item.line} ${item.code}: ${item.message}`).join('\n'));
  const verdict={status:'BLOCKED',selection,executionGroup:group,sourceFindings,reason:'Mandatory source, auth, build or preflight check failed. Inspect local command diagnostics; credentials are excluded from this verdict.',hostedCI:'NOT_RUN'};
  await writeFile(path.join(out,'verdict.json'),JSON.stringify(verdict,null,2));
  console.error(JSON.stringify(verdict));process.exitCode=1;
}
