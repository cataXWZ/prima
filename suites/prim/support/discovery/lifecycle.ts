import { readFile, mkdir, writeFile, open } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
export interface DiscoveryDataPolicy {mode:'read-only'|'retained';owner?:string;capacity?:number;expiresAfterMs?:number;disposalInstructions?:string;idField?:string;parallelSafe?:boolean;namespaceHeader?:string;ledgerEnv?:string;}
export interface DiscoveryDataOptions {directory:string;executionGroup:string;project:string;testId:string;repeat:number;retry:number;workers:number;shards:number;scopeDigest?:string;sourceRoot?:string;}
interface Resource {lease:string;namespace:string;owner:string;createdAt:string;expiresAt:string;state:'reserved'|'retained';id?:string;origin?:string;method?:string;path?:string;}
interface Ledger {schemaVersion:1;scopeDigest:string;owner:string;resources:Resource[];}
/** Retention is explicit. Expiry never silently frees capacity without evidence of backend disposal. */
export async function createDiscoveryData(policy:DiscoveryDataPolicy,options:DiscoveryDataOptions) {
  if (options.workers>1 || options.shards>1) throw new Error('Parallel workers/shards are blocked until the lifecycle adapter is reviewed as parallel safe.');
  const namespace='waw-'+createHash('sha256').update([options.executionGroup,options.project,options.testId,options.repeat,options.retry].join(':')).digest('hex').slice(0,28);
  const seed=createHash('sha256').update([options.testId,options.repeat].join(':')).digest('hex').slice(0,24);
  if(policy.mode==='retained' && (!path.isAbsolute(options.directory) || options.sourceRoot && (path.resolve(options.directory)===path.resolve(options.sourceRoot) || path.resolve(options.directory).startsWith(path.resolve(options.sourceRoot)+path.sep)))) throw new Error('Retained records require an external durable ownership ledger.');
  const file=path.join(options.directory,'retained-resources.json');
  async function mutate(action:(ledger:Ledger)=>void) {
    await mkdir(options.directory,{recursive:true,mode:0o700});
    // Fail closed on concurrent runners; never accept a lost capacity update.
    const lock=await open(file+'.lock','wx',0o600).catch(()=>{throw new Error('Data ownership ledger is locked by another run; use serial execution.');});
    try {
      let ledger:Ledger;
      try {ledger=JSON.parse(await readFile(file,'utf8')) as Ledger;}
      catch {throw new Error('Data ownership ledger is unavailable or malformed. Restore the reviewed target baseline before stateful execution.');}
      if(ledger.schemaVersion!==1 || ledger.scopeDigest!==options.scopeDigest || ledger.owner!==policy.owner || !Array.isArray(ledger.resources))throw new Error('Data ownership ledger is malformed.');
      action(ledger);await writeFile(file,JSON.stringify(ledger,null,2),{mode:0o600});
    } finally {await lock.close();const {unlink}=await import('node:fs/promises');await unlink(file+'.lock');}
  }
  async function reserve(resource?:{origin:string;method:string;path:string}):Promise<string> {
    if(policy.mode!=='retained' || !policy.owner || !policy.idField || !policy.capacity || !policy.expiresAfterMs || !policy.disposalInstructions)throw new Error('Stateful discovery requires a reviewed data lifecycle policy.');
    const lease=randomUUID();
    await mutate(ledger=>{
      // Count reservations, failed setup and expired records until disposal is explicitly reconciled.
      if(ledger.resources.length>=policy.capacity!)throw new Error('Retained resource capacity is exhausted; dispose and reconcile owned records before another run.');
      const now=Date.now();ledger.resources.push({lease,namespace,owner:policy.owner!,createdAt:new Date(now).toISOString(),expiresAt:new Date(now+policy.expiresAfterMs!).toISOString(),state:'reserved',...(resource || {})});
    });
    return lease;
  }
  async function record(lease:string,body:unknown):Promise<void> {
    const record=body && typeof body==='object'&&!Array.isArray(body)?body as Record<string,unknown>:{};
    let id:unknown=record;
    for(const field of (policy.idField || '').split('.')) id=id && typeof id==='object' && !Array.isArray(id) && Object.hasOwn(id,field) ? (id as Record<string,unknown>)[field] : undefined;
    if(typeof id!=='string' || !/^[A-Za-z0-9_-]{1,160}$/.test(id))throw new Error('Created resource lacks the reviewed safe identity; its capacity reservation is retained.');
    await mutate(ledger=>{const owned=ledger.resources.find(item=>item.lease===lease && item.namespace===namespace && item.owner===policy.owner);if(!owned)throw new Error('Resource ownership cannot be proven.');owned.id=id;owned.state='retained';});
  }
  async function assertOwned(body:unknown,bindings:Record<string,string>,identityTransforms:Record<string,('lower'|'upper'|'pad')[]>={}):Promise<void> {
    if(!body || typeof body!=='object' || Array.isArray(body))throw new Error('Owned update lacks a proven resource binding.');
    const keys=Object.entries(bindings).filter(([,source])=>source===policy.idField).map(([key])=>key);
    if(!keys.length)throw new Error('Owned update identity does not match the reviewed retention identity.');
    await mutate(ledger=>{if(!keys.every(key=>ledger.resources.some(resource=>resource.namespace===namespace && resource.owner===policy.owner && resource.state==='retained' && (resource.id===(body as Record<string,unknown>)[key] || typeof resource.id==='string' && (identityTransforms[key] || []).some(transform=>(transform==='lower'?resource.id!.toLowerCase():transform==='upper'?resource.id!.toUpperCase():`  ${resource.id}  `)===(body as Record<string,unknown>)[key])))))throw new Error('Owned update references a resource outside this test namespace.');});
  }
  return {namespace,seed,reserve,record,assertOwned,headers:policy.namespaceHeader ? {[policy.namespaceHeader]:namespace} : {}};
}
export type DiscoveryData = Awaited<ReturnType<typeof createDiscoveryData>>;
