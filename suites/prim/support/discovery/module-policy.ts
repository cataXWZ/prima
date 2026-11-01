import ts from 'typescript';
import path from 'node:path';

export const TESTING_MODULE_ALIASES: Readonly<Record<string, string>> = {
  '@pages/': 'pages/', '@fixtures/': 'fixtures/', '@data/': 'data/',
  '@scripts/': 'scripts/', '@components/': 'components/', '@flows/': 'flows/',
  '@config/': 'config/', '@support/': 'support/',
};
export const testingModulePaths = Object.fromEntries(Object.entries(TESTING_MODULE_ALIASES).map(([alias, directory]) => [alias + '*', ['./' + directory + '*.ts']]));

/** Public aliases resolve real .ts sources; relative private/sibling modules keep .ts extensions. */
export function resolveTestingModule(specifier: string, file: string): string | null {
  const alias = Object.entries(TESTING_MODULE_ALIASES).find(([prefix]) => specifier.startsWith(prefix));
  if (alias) return alias[1] + specifier.slice(alias[0].length) + '.ts';
  return specifier.startsWith('.') ? path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier)) : null;
}

export interface ModulePolicyFinding { file: string; line: number; code: string; message: string }

/** Enforce real TypeScript ESM sources and stable public imports without executing source. */
export function inspectTypeScriptModules(content: string, file: string, availableFiles?: ReadonlySet<string>): ModulePolicyFinding[] {
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const findings: ModulePolicyFinding[] = [];
  const add = (node: ts.Node, code: string, message: string) => findings.push({ file, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, code, message });
  const isSpec = /^tests\//.test(file) || /\.(?:spec|test)\.ts$/.test(file);
  const internalGeneration = (value: string) => /(?:^|\/)support\/[a-f0-9]{12,}(?:\/|$)/i.test(value);
  const inspect = (node: ts.Node, specifier: string) => {
    const alias = Object.entries(TESTING_MODULE_ALIASES).find(([prefix]) => specifier.startsWith(prefix));
    if (!specifier.startsWith('.') && !alias) return;
    if (alias) {
      const tail = specifier.slice(alias[0].length);
      if (!tail || tail.split('/').some(part => !part || part === '.' || part === '..') || !/^[A-Za-z0-9_./-]+$/.test(tail)) { add(node, 'invalid-module-alias', 'Use a canonical public module alias without path traversal.'); return; }
      if (/\.(?:ts|mts|js|mjs|cjs|json)$/.test(tail)) { add(node, 'alias-source-extension', 'Public aliases are extensionless and resolve directly to .ts sources.'); return; }
    } else if (!specifier.endsWith('.ts') && !specifier.endsWith('.json')) {
      add(node, 'local-typescript-import', `Use a public alias or the explicit .ts source extension for private/sibling code imports: ${specifier}`);
    }
    const resolved = resolveTestingModule(specifier, file);
    if (!resolved) return;
    if (isSpec && internalGeneration(resolved)) add(node, 'private-generation-import', 'Specs must use stable public fixtures and Page Objects, not hashed generation paths.');
    if (!alias && specifier.endsWith('.ts') && !internalGeneration(resolved) && !internalGeneration(file)) {
      const publicRoot = Object.values(TESTING_MODULE_ALIASES).some(directory => resolved.startsWith(directory));
      if (publicRoot && (isSpec || file.split('/')[0] !== resolved.split('/')[0])) add(node, 'public-alias-import', 'Use the configured public module alias for cross-layer testing imports.');
    }
    if (availableFiles && !availableFiles.has(resolved)) add(node, 'unresolved-local-import', `The local TypeScript module source is missing: ${specifier}`);
  };
  const inspectDynamic = (node: ts.Node, target: ts.Expression): void => {
    if (ts.isStringLiteral(target) || ts.isNoSubstitutionTemplateLiteral(target)) inspect(node, target.text);
    else if (ts.isConditionalExpression(target)) { inspectDynamic(node, target.whenTrue); inspectDynamic(node, target.whenFalse); }
    else if (ts.isParenthesizedExpression(target) || ts.isAsExpression(target) || ts.isTypeAssertionExpression(target) || ts.isNonNullExpression(target) || ts.isSatisfiesExpression(target)) inspectDynamic(node, target.expression);
    else add(node, 'dynamic-module-import', 'Dynamic imports must name statically reviewable modules with explicit .ts local source paths.');
  };
  const visit = (node: ts.Node): void => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) inspect(node, node.moduleSpecifier.text);
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) inspect(node, node.argument.literal.text);
    if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0]) inspectDynamic(node, node.arguments[0]);
      if (ts.isIdentifier(node.expression) && node.expression.text === 'require') add(node, 'commonjs-import', 'Use ESM import/export in TypeScript testing sources.');
    }
    if (ts.isImportEqualsDeclaration(node)) add(node, 'commonjs-import', 'Use ESM import/export in TypeScript testing sources.');
    ts.forEachChild(node, visit);
  };
  visit(source);
  return findings;
}
