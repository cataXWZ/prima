/** Runtime-only authentication. Never serialize the resolved state or headers into evidence. */
import { open, realpath } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

interface TokenReference { readonly env: string; readonly origin: string; readonly scheme: 'Bearer'; }
export interface AuthPolicy {
  readonly schemaVersion: 1;
  readonly profileName: string;
  readonly role: string;
  readonly identity: { readonly url: string; readonly roleField: string };
  readonly storageStateEnv?: string;
  readonly tokens: readonly TokenReference[];
  readonly origins: readonly string[];
}
// Browser cookies are host/path scoped, including across ports; retain the network guard.
interface AuthCookie {
  name: string; value: string; domain: string; path: string; expires: number;
  httpOnly: boolean; secure: boolean; sameSite: 'Strict' | 'Lax' | 'None';
}
export interface DiscoveryStorageState { cookies: AuthCookie[]; origins: { origin: string; localStorage: { name: string; value: string }[] }[]; }
export interface ResolvedDiscoveryAuth {
  storageState?: DiscoveryStorageState;
  headersFor(url: string | URL): Record<string, string>;
}
interface ResolveOptions { sourceRoot?: string; env?: Readonly<Record<string, string | undefined>>; fetch?: typeof globalThis.fetch; }
const LIMIT = 64 * 1024;
const TIMEOUT = 8000;
const error = (): Error => new Error('Discovery authentication is blocked: invalid policy, unavailable credentials or identity verification failed.');
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 200 && !/[\u0000-\u001f\u007f]/.test(value);
const envName = (value: unknown): value is string => typeof value === 'string' && /^[A-Z_][A-Z0-9_]{0,127}$/.test(value);
function keys(value: Record<string, unknown>, allowed: readonly string[]): void { if (Object.keys(value).some(key => !allowed.includes(key))) throw error(); }
function safeUrl(value: unknown): URL {
  if (typeof value !== 'string' || value.length > 2048) throw error();
  let url: URL;
  try { url = new URL(value); } catch { throw error(); }
  if (url.username || url.password || url.hash || !(url.protocol === 'https:' || url.protocol === 'http:' && ['127.0.0.1', '[::1]'].includes(url.hostname))) throw error();
  return url;
}

/** Only non-secret, reviewed references are accepted. AuthProfile names and roles remain explicit. */
export function validateAuthPolicy(raw: unknown, origins: readonly string[]): AuthPolicy | null {
  if (raw === undefined || raw === null) return null;
  try {
    const approvedOrigins = [...new Set(origins.map(origin => { const parsed = safeUrl(origin); if (parsed.origin !== origin) throw error(); return origin; }))];
    if (!object(raw)) throw error();
    keys(raw, ['schemaVersion', 'profileName', 'role', 'identity', 'storageStateEnv', 'token', 'tokens']);
    if (raw.schemaVersion !== 1 || !text(raw.profileName) || !text(raw.role) || !object(raw.identity)) throw error();
    keys(raw.identity, ['url', 'roleField']);
    const identityUrl = safeUrl(raw.identity.url);
    if (!approvedOrigins.includes(identityUrl.origin) || identityUrl.search) throw error();
    const roleField = raw.identity.roleField ?? 'role';
    if (typeof roleField !== 'string' || !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(roleField)) throw error();
    if (raw.storageStateEnv !== undefined && !envName(raw.storageStateEnv)) throw error();
    if (raw.token !== undefined && raw.tokens !== undefined) throw error();
    const tokenInput = raw.tokens ?? (raw.token === undefined ? [] : [raw.token]);
    if (!Array.isArray(tokenInput) || tokenInput.length > 16) throw error();
    const tokens: TokenReference[] = tokenInput.map((token: unknown) => {
      if (!object(token)) throw error();
      keys(token, ['env', 'origin', 'scheme']);
      if (!envName(token.env) || typeof token.origin !== 'string' || !approvedOrigins.includes(token.origin) || token.scheme !== undefined && token.scheme !== 'Bearer') throw error();
      return Object.freeze({ env: token.env, origin: token.origin, scheme: 'Bearer' as const });
    });
    if (new Set(tokens.map(token => token.origin)).size !== tokens.length || !tokens.length && raw.storageStateEnv === undefined) throw error();
    return Object.freeze({ schemaVersion: 1 as const, profileName: raw.profileName, role: raw.role,
      identity: Object.freeze({ url: identityUrl.href, roleField }), ...(raw.storageStateEnv === undefined ? {} : { storageStateEnv: raw.storageStateEnv }),
      tokens: Object.freeze(tokens), origins: Object.freeze(approvedOrigins) });
  } catch { throw error(); }
}

function validateStorageState(raw: unknown, origins: readonly string[]): DiscoveryStorageState {
  if (!object(raw)) throw error();
  keys(raw, ['cookies', 'origins']);
  if (!Array.isArray(raw.cookies) || raw.cookies.length > 200 || !Array.isArray(raw.origins) || raw.origins.length > 16) throw error();
  const hosts = origins.map(origin => new URL(origin).hostname);
  const cookies: AuthCookie[] = raw.cookies.map((input: unknown) => {
    if (!object(input)) throw error();
    keys(input, ['name', 'value', 'domain', 'path', 'expires', 'httpOnly', 'secure', 'sameSite']);
    if (typeof input.name !== 'string' || !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]{1,200}$/.test(input.name) || typeof input.value !== 'string' || input.value.length > 8192 || /[\u0000-\u0020\u007f;,]/.test(input.value) || typeof input.domain !== 'string' || !hosts.includes(input.domain) || typeof input.path !== 'string' || !input.path.startsWith('/') || /[\u0000-\u0020\u007f;]/.test(input.path) || typeof input.expires !== 'number' || !Number.isFinite(input.expires) || input.expires < -1 || typeof input.httpOnly !== 'boolean' || typeof input.secure !== 'boolean' || !['Strict', 'Lax', 'None'].includes(String(input.sameSite))) throw error();
    return { name: input.name, value: input.value, domain: input.domain, path: input.path, expires: input.expires, httpOnly: input.httpOnly, secure: input.secure, sameSite: input.sameSite as AuthCookie['sameSite'] };
  });
  // This adapter supports cookie state; local/session-storage token adapters need separate review.
  const stateOrigins = raw.origins.map((entry: unknown) => {
    if (!object(entry)) throw error();
    keys(entry, ['origin', 'localStorage']);
    if (typeof entry.origin !== 'string' || !origins.includes(entry.origin) || !Array.isArray(entry.localStorage) || entry.localStorage.length) throw error();
    return { origin: entry.origin, localStorage: [] };
  });
  return { cookies, origins: stateOrigins };
}

async function readPrivateState(filename: string, origins: readonly string[], exportSourceRoot: string): Promise<DiscoveryStorageState> {
  if (!path.isAbsolute(filename)) throw error();
  const [sourceRoot, resolved] = await Promise.all([realpath(exportSourceRoot), realpath(filename)]);
  const relative = path.relative(sourceRoot, resolved);
  if (!relative || !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)) throw error();
  // O_NOFOLLOW and a descriptor-based read avoid switching a checked path to a symlink.
  const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > LIMIT || stat.nlink !== 1 || (stat.mode & 0o077) !== 0 || typeof process.getuid === 'function' && stat.uid !== process.getuid()) throw error();
    const buffer = Buffer.alloc(LIMIT + 1);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead > LIMIT) throw error();
    return validateStorageState(JSON.parse(buffer.subarray(0, bytesRead).toString('utf8')), origins);
  } finally { await handle.close(); }
}

async function identityBody(response: Response): Promise<unknown> {
  const length = response.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > LIMIT)) throw error();
  if (!response.body) throw error();
  const reader = response.body.getReader();
  try {
    const chunks: Uint8Array[] = []; let count = 0;
    for (;;) { const part = await reader.read(); if (part.done) break; count += part.value.byteLength; if (count > LIMIT) throw error(); chunks.push(part.value); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { void reader.cancel().catch(() => {}); reader.releaseLock(); }
}

/** Resolve credentials once per run/role and verify an actual protected server identity before coverage. */
export async function resolveDiscoveryAuth(policy: AuthPolicy | null, options: ResolveOptions = {}): Promise<ResolvedDiscoveryAuth> {
  if (policy === null) return { headersFor: () => ({}) };
  try {
    const env = options.env ?? process.env;
    const tokens = new Map<string, string>();
    for (const reference of policy.tokens) {
      const value = env[reference.env];
      if (!value || value.length > 8192 || !/^[A-Za-z0-9\-._~+/]+=*$/.test(value)) throw error();
      tokens.set(reference.origin, `Bearer ${value}`);
    }
    const statePath = policy.storageStateEnv ? env[policy.storageStateEnv] : undefined;
    if (policy.storageStateEnv && !statePath) throw error();
    const state = statePath ? await readPrivateState(statePath, policy.origins, options.sourceRoot ?? process.cwd()) : undefined;
    const headersFor = (target: string | URL): Record<string, string> => {
      const url = safeUrl(String(target));
      if (!policy.origins.includes(url.origin)) throw error();
      const headers: Record<string, string> = {};
      const token = tokens.get(url.origin); if (token) headers.authorization = token;
      const cookies = state?.cookies.filter(cookie => cookie.domain === url.hostname && (!cookie.secure || url.protocol === 'https:') && (cookie.expires === -1 || cookie.expires > Date.now() / 1000) && (url.pathname === cookie.path || url.pathname.startsWith(cookie.path.endsWith('/') ? cookie.path : `${cookie.path}/`))).sort((a, b) => b.path.length - a.path.length);
      if (cookies?.length) headers.cookie = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
      return headers;
    };
    const identityHeaders = headersFor(policy.identity.url);
    if (!identityHeaders.authorization && !identityHeaders.cookie) throw error();
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => { timer = setTimeout(() => { controller.abort(); reject(error()); }, TIMEOUT); });
    try {
      await Promise.race([timeout, (async () => {
        const response = await (options.fetch ?? globalThis.fetch)(policy.identity.url, { method: 'GET', headers: identityHeaders, redirect: 'manual', signal: controller.signal });
        if (response.status !== 200) { void response.body?.cancel().catch(() => {}); throw error(); }
        const body = await identityBody(response);
        if (!object(body) || !Object.hasOwn(body, policy.identity.roleField) || body[policy.identity.roleField] !== policy.role) throw error();
      })()]);
    } finally { clearTimeout(timer); controller.abort(); }
    // Keep the header closure's credentials private from consumers mutating browser state.
    return { ...(state ? { storageState: structuredClone(state) } : {}), headersFor };
  } catch { throw error(); }
}
