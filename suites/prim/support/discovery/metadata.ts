import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

/** Data-only manifests have a separate budget; executable sources keep their own stricter limit. */
export const DISCOVERY_METADATA_MAX_BYTES = 8 * 1024 * 1024;
export type DiscoveryMetadataKind = 'delivery' | 'owners';
type Metadata = Record<string, unknown>;
const projects = ['api', 'ui', 'ui-api'] as const;
const digestPattern = /^[a-f0-9]{64}$/;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/;
const sha = (text: string) => createHash('sha256').update(text).digest('hex');
function requireValue(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`Invalid Discovery metadata: ${message}`);
}
function record(value: unknown, label: string): Metadata {
  requireValue(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object.`);
  return value as Metadata;
}
function safePath(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 240
    && /^[A-Za-z0-9_.@ /-]+$/.test(value) && !value.startsWith('/') && !value.startsWith('-')
    && !value.split('/').some(part => !part || ['.', '..', '.git', 'node_modules'].includes(part));
}
function sourceHashes(value: unknown, label: string): Record<string, string> {
  const hashes = record(value, label);
  requireValue(Object.keys(hashes).length <= 3000, `${label} exceeds the source file budget.`);
  for (const [name, digest] of Object.entries(hashes)) requireValue(safePath(name) && typeof digest === 'string' && digestPattern.test(digest), `${label} contains an invalid path or digest.`);
  return hashes as Record<string, string>;
}
function stringList(value: unknown, label: string): string[] {
  requireValue(Array.isArray(value) && value.every(item => typeof item === 'string') && new Set(value).size === value.length, `${label} must contain unique strings.`);
  return value as string[];
}
function deliveryShape(value: unknown): Metadata {
  const manifest = record(value, 'delivery');
  requireValue(manifest.schemaVersion === 'discovery-delivery/v1', 'unsupported delivery schema.');
  sourceHashes(manifest.sourceHashes, 'sourceHashes');
  requireValue(typeof manifest.sourceDigest === 'string' && digestPattern.test(manifest.sourceDigest), 'sourceDigest is missing.');
  requireValue(typeof manifest.contractDigest === 'string' && digestPattern.test(manifest.contractDigest), 'contractDigest is missing.');
  requireValue(Array.isArray(manifest.inventory) && Array.isArray(manifest.blockers), 'inventory and blockers must be arrays.');
  if (manifest.omittedInventory !== undefined) requireValue(Array.isArray(manifest.omittedInventory), 'omittedInventory must be an array.');
  const selections = record(manifest.projects, 'projects');
  requireValue(Object.keys(selections).length === projects.length, 'the three execution projects are required.');
  for (const name of projects) {
    const selected = record(selections[name], `projects.${name}`);
    requireValue(typeof selected.required === 'boolean', `projects.${name}.required must be a boolean.`);
    requireValue(stringList(selected.ids, `projects.${name}.ids`).every(id => idPattern.test(id)), 'invalid stable test ID.');
  }
  if (manifest.frameworkInputs !== undefined) {
    const inputs = record(manifest.frameworkInputs, 'frameworkInputs');
    requireValue(inputs.schemaVersion === 'discovery-framework-inputs/v1' && typeof inputs.sourceRevision === 'string' && /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/.test(inputs.sourceRevision), 'invalid framework input snapshot.');
    sourceHashes(inputs.sourceHashes, 'frameworkInputs.sourceHashes');
  }
  return manifest;
}
/** Bounds apply before parsing, including legacy manifests without an embedded delivery record. */
export function parseDiscoveryMetadata(text: string, kind?: DiscoveryMetadataKind): Metadata {
  requireValue(typeof text === 'string' && Buffer.byteLength(text, 'utf8') <= DISCOVERY_METADATA_MAX_BYTES, 'manifest exceeds 8 MiB.');
  let value: unknown;
  try { value = JSON.parse(text) as unknown; } catch { throw new Error('Invalid Discovery metadata: malformed JSON.'); }
  const metadata = record(value, 'manifest');
  const selected = kind ?? (metadata.schemaVersion === 'studio-owners/v1' ? 'owners' : 'delivery');
  if (selected === 'delivery') return deliveryShape(metadata);
  requireValue(metadata.schemaVersion === 'studio-owners/v1', 'unsupported ownership schema.');
  const files = record(metadata.files, 'files');
  requireValue(Object.keys(files).length <= 3000, 'ownership exceeds the source file budget.');
  for (const [name, value] of Object.entries(files)) {
    const entry = record(value, `owner ${name}`);
    requireValue(safePath(name) && typeof entry.sha256 === 'string' && digestPattern.test(entry.sha256), 'invalid owned path or digest.');
  }
  return metadata;
}
export function serializeDiscoveryMetadata(value: unknown): string {
  const text = `${JSON.stringify(value)}\n`;
  parseDiscoveryMetadata(text);
  return text;
}
/** A size allowance is not approval: require the exact active manifest/owner relationship and reviewed inventory. */
export function assertDiscoveryMetadataPair(ownersText: string, deliveryText: string): { owners: Metadata; delivery: Metadata } {
  const owners = parseDiscoveryMetadata(ownersText, 'owners'), delivery = parseDiscoveryMetadata(deliveryText, 'delivery');
  requireValue(isDeepStrictEqual(owners.delivery, delivery), 'embedded and separate delivery records disagree.');
  const files = record(owners.files, 'files'), hashes = sourceHashes(delivery.sourceHashes, 'sourceHashes');
  requireValue(Object.keys(hashes).length > 0, 'reviewed source hashes are required.');
  requireValue(record(files['.studio/discovery-delivery.json'], 'delivery owner').sha256 === sha(deliveryText), 'delivery owner checksum does not match.');
  for (const [name, digest] of Object.entries(hashes)) requireValue(record(files[name], `owner ${name}`).sha256 === digest, `owner and source digest disagree for ${name}.`);
  if (delivery.frameworkInputs) {
    for (const name of Object.keys(sourceHashes(record(delivery.frameworkInputs, 'frameworkInputs').sourceHashes, 'frameworkInputs.sourceHashes'))) requireValue(!Object.hasOwn(hashes, name) && !Object.hasOwn(files, name), `borrowed framework input was adopted: ${name}.`);
  }
  const selected = record(delivery.projects, 'projects');
  const paths = owners.discoveryProjects === undefined ? null : record(owners.discoveryProjects, 'discoveryProjects');
  if (paths) requireValue(Object.keys(paths).length === projects.length, 'ownership must record all execution projects.');
  const inventory = delivery.inventory as unknown[];
  const ids = new Set<string>();
  const observed = new Map<string, { ids: string[]; paths: Set<string> }>(projects.map(name => [name, { ids: [], paths: new Set<string>() }]));
  for (const value of inventory) {
    const item = record(value, 'inventory entry');
    requireValue(typeof item.id === 'string' && idPattern.test(item.id) && !ids.has(item.id), 'inventory contains an invalid or duplicate ID.');
    requireValue(typeof item.project === 'string' && observed.has(item.project) && safePath(item.path) && /^tests\/.+\.spec\.(?:ts|mjs)$/.test(item.path), 'invalid inventory project or path.');
    const project = item.path.startsWith('tests/api/') ? 'api' : item.path.startsWith('tests/ui-api/') ? 'ui-api' : 'ui';
    requireValue(item.project === project && item.sourceDigest === hashes[item.path] && typeof item.sourceDigest === 'string', 'inventory source is not bound to its project.');
    requireValue(typeof item.oracleDigest === 'string' && digestPattern.test(item.oracleDigest), 'inventory oracle digest is missing.');
    ids.add(item.id); observed.get(project)!.ids.push(item.id); observed.get(project)!.paths.add(item.path);
  }
  for (const name of projects) {
    const expected = observed.get(name)!, selection = record(selected[name], `projects.${name}`);
    const selectedIds = stringList(selection.ids, `projects.${name}.ids`);
    requireValue(selection.required === (expected.ids.length > 0) && selectedIds.length === expected.ids.length && expected.ids.every(id => selectedIds.includes(id)), `project ${name} inventory does not match.`);
    if (paths) {
      const ownedPaths = stringList(paths[name], `discoveryProjects.${name}`);
      requireValue(ownedPaths.length === expected.paths.size && ownedPaths.every(file => expected.paths.has(file)), `project ${name} owned selection does not match.`);
    }
  }
  const contract = { auth: delivery.auth || null, data: delivery.data || { mode: 'read-only', parallelSafe: false }, clock: delivery.clock || { mode: 'live' }, buildIdentity: delivery.buildIdentity || null, projects: delivery.projects, inventory: delivery.inventory, blockers: delivery.blockers || [], omittedInventory: delivery.omittedInventory || [], runtimeRequirements: delivery.runtimeRequirements || {}, ...(delivery.frameworkInputs ? { frameworkInputs: delivery.frameworkInputs } : {}) };
  requireValue(sha(JSON.stringify(contract)) === delivery.contractDigest, 'reviewed contract digest does not match.');
  requireValue(sha(JSON.stringify({ sourceHashes: hashes, contract })) === delivery.sourceDigest, 'reviewed source digest does not match.');
  return { owners, delivery };
}
