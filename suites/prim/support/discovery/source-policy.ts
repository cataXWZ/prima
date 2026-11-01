import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const asyncMethods = new Set(['click','dblclick','fill','press','pressSequentially','selectOption','check','uncheck','setChecked','hover','focus','blur','goto','reload','waitFor','waitForURL','waitForResponse','waitForRequest','toBeVisible','toBeHidden','toHaveText','toContainText','toHaveValue','toHaveValues','toHaveCount','toHaveURL','toHaveTitle','toHaveAttribute','toHaveCSS','toBeChecked','toBeEnabled','toBeDisabled','toBeEditable','toBeFocused','toBeEmpty','toBeAttached','toMatchAriaSnapshot','toHaveScreenshot']);
/** AST checks intentionally cover common Playwright mistakes, not arbitrary JS semantics. */
export interface SourceFinding { code: string; file: string; line: number; message: string }
export function inspectPlaywrightSource(content: string, file = 'test.spec.ts', context?: { source: ts.SourceFile; checker: ts.TypeChecker }) {
  const source = context?.source || ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : /\.[cm]?ts$/.test(file) ? ts.ScriptKind.TS : file.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.JS);
  const findings: SourceFinding[] = [], warnings: SourceFinding[] = [];
  const text = (node: ts.Node | undefined) => node?.getText(source) || '';
  // The pinned TypeScript binder gives standalone inspection the same lexical
  // declaration identities used by the project checker, without resolving imports.
  if (!context) {
    const binder = ts as typeof ts & { bindSourceFile(source: ts.SourceFile, options: ts.CompilerOptions): void };
    if (typeof binder.bindSourceFile !== 'function') throw new Error('Required TypeScript source binder is unavailable.');
    binder.bindSourceFile(source, { strict: true });
  }
  const symbolIds = new Map<ts.Symbol, string>();
  function symbolKey(symbol: ts.Symbol): string {
    let key = symbolIds.get(symbol);
    if (!key) { key = 'binding:' + symbolIds.size; symbolIds.set(symbol, key); }
    return key;
  }
  function identifierKey(node: ts.Identifier): string {
    const symbol = context?.checker.getSymbolAtLocation(node);
    if (symbol) return symbolKey(symbol);
    for (let parent: ts.Node | undefined = node.parent; parent; parent = parent.parent) {
      const locals = (parent as ts.Node & { locals?: ts.SymbolTable }).locals;
      const binding = locals && [...locals.values()].find(local => local.getName() === node.text);
      if (binding) return symbolKey(binding);
    }
    return node.text;
  }
  function thisKey(node: ts.Node): string {
    for (let parent: ts.Node | undefined = node; parent; parent = parent.parent) {
      if (ts.isClassDeclaration(parent) || ts.isClassExpression(parent) || ts.isObjectLiteralExpression(parent)) return 'this:' + parent.pos;
    }
    return 'this';
  }
  const propertyKey = (node: ts.Node, name: ts.PropertyName) => thisKey(node) + '.' + (ts.isStringLiteralLike(name) ? name.text : text(name));
  const isSpec = /(?:^|\/)tests\//.test(file) || /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(file);
  const browser = new Set(['page', 'frame', 'document', 'window.document']);
  const pages = new Set(['page','frame']);
  const pageTypes = new Set<string>();
  const locators = new Set<string>();
  const literals = new Map<string, Set<string>>();
  const checkerLiterals = new WeakMap<ts.Node, ReadonlySet<string>>();
  function literalValues(node: ts.Node): ReadonlySet<string> {
    if (ts.isStringLiteralLike(node)) return new Set([node.text]);
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node)) return literalValues(node.expression);
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const values = new Set<string>();
      for (const left of literalValues(node.left)) for (const right of literalValues(node.right)) values.add(left + right);
      return values;
    }
    const local = literals.get(reference(node));
    if (local?.size) return local;
    if (context) {
      const cached = checkerLiterals.get(node);
      if (cached) return cached;
      const values = new Set<string>();
      const fromType = (type: ts.Type): void => {
        if (type.isStringLiteral()) values.add(type.value);
        else if (type.isUnionOrIntersection()) type.types.forEach(fromType);
      };
      fromType(context.checker.getTypeAtLocation(node));
      checkerLiterals.set(node, values);
      return values;
    }
    return new Set<string>();
  }
  function positionalSelector(selector: string): boolean {
    const xpath = /(?:^|>>\s*)xpath\s*=/.test(selector) || /^\s*\(*\s*(?:\/\/|\.\.)/.test(selector);
    let quote: string | null = null, unquoted = '';
    for (let index=0; index<selector.length; index++) {
      const character=selector[index]!;
      if (quote) {
        if (!xpath && character === '\\') { unquoted += '  '; index++; continue; }
        if (character === quote) quote=null;
        unquoted += ' '; continue;
      }
      if (character === '\'' || character === '"') { quote=character; unquoted += ' '; }
      else unquoted += character;
    }
    if (/:nth-(?:child|last-child|of-type|last-of-type|match)\s*\(|:(?:first-child|last-child|first-of-type|last-of-type)\b|(?:^|>>\s*)nth\s*=/.test(unquoted)) return true;
    if (!xpath) return false;
    if (/\[\s*\d+(?:\.\d+)?\s*\]/.test(unquoted)) return true;
    // XPath built-ins select by position only when used in a predicate. Quoted
    // attribute data has already been removed, including labels such as [2].
    let depth=0, predicates='';
    for (const character of unquoted) {
      if (character === '[') depth++;
      else if (character === ']') depth=Math.max(0,depth-1);
      predicates += depth>0 ? character : ' ';
    }
    return /(?:^|[^\w:-])(?:position|last)\s*\(/.test(predicates);
  }
  const literal = (node: ts.Node): string | undefined => literalValues(node).values().next().value;
  const locatorTypes = new Set<string>();
  const locatorNamespaces = new Set<string>();
  const locatorReturns = new Set<string>();
  function locatorType(node: ts.TypeNode | undefined): boolean {
    if (!node) return false;
    if (ts.isTypeReferenceNode(node)) return locatorTypes.has(ts.isIdentifier(node.typeName) ? identifierKey(node.typeName) : text(node.typeName)) || ts.isQualifiedName(node.typeName) && locatorNamespaces.has(ts.isIdentifier(node.typeName.left) ? identifierKey(node.typeName.left) : text(node.typeName.left)) && ['Locator','FrameLocator'].includes(node.typeName.right.text);
    if (ts.isParenthesizedTypeNode(node)) return locatorType(node.type);
    if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) return node.types.some(locatorType);
    return false;
  }
  function pageType(node: ts.TypeNode | undefined): boolean {
    if (!node) return false;
    if (ts.isTypeReferenceNode(node)) return pageTypes.has(ts.isIdentifier(node.typeName) ? identifierKey(node.typeName) : text(node.typeName)) || ts.isQualifiedName(node.typeName) && locatorNamespaces.has(ts.isIdentifier(node.typeName.left) ? identifierKey(node.typeName.left) : text(node.typeName.left)) && ['Page','Frame'].includes(node.typeName.right.text);
    if (ts.isParenthesizedTypeNode(node)) return pageType(node.type);
    if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) return node.types.some(pageType);
    return false;
  }
  function pageOrFrame(node: ts.Node): boolean {
    if (context) {
      const actualPage = (type: ts.Type): boolean => {
        if (type.isUnionOrIntersection()) return type.types.some(actualPage);
        const symbol=type.getSymbol();
        return !!symbol && ['Page','Frame'].includes(symbol.getName()) && !!symbol.declarations?.some(declaration => /(?:^|\/)node_modules\/(?:playwright-core|playwright|@playwright\/test)\//.test(declaration.getSourceFile().fileName.replaceAll('\\','/')));
      };
      const type=context.checker.getTypeAtLocation(node);
      if (actualPage(type)) return true;
      if (!(type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown))) return false;
    }
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node)) return pageOrFrame(node.expression);
    return pages.has(reference(node));
  }
  function reference(node: ts.Node): string {
    if (ts.isIdentifier(node)) return identifierKey(node);
    if (node.kind === ts.SyntaxKind.ThisKeyword) return thisKey(node);
    if (ts.isPropertyAccessExpression(node)) return reference(node.expression) + '.' + node.name.text;
    if (ts.isElementAccessExpression(node) && node.argumentExpression) { const name = literal(node.argumentExpression); if (name !== undefined) return reference(node.expression) + '.' + name; }
    return text(node);
  }
  function browserObject(node: ts.Node): boolean {
    if (context) {
      const type = context.checker.getTypeAtLocation(node), symbol = type.getSymbol();
      if (symbol && (['Page','Frame','Document'].includes(symbol.getName()) || /Element$/.test(symbol.getName())) && symbol.declarations?.some(declaration => /(?:node_modules\/(?:playwright-core|playwright|@playwright\/test)\/|typescript\/lib\/lib\.dom\.d\.ts)/.test(declaration.getSourceFile().fileName.replaceAll('\\','/')))) return true;
    }
    const name = reference(node);
    return browser.has(name) || [...browser].some(parent => name.startsWith(parent + '.'));
  }
  const factories = new Set(['locator', 'frameLocator', 'getByRole', 'getByText', 'getByTestId', 'getByLabel', 'getByPlaceholder', 'getByAltText', 'getByTitle']);
  const positions = new Set(['first', 'last', 'nth']);
  const pageSelectorMethods = new Set(['click','dblclick','tap','check','uncheck','setChecked','hover','focus','press','type','fill','selectOption','setInputFiles','waitForSelector','dispatchEvent','dragAndDrop','getAttribute','innerHTML','innerText','inputValue','isChecked','isDisabled','isEditable','isEnabled','isHidden','isVisible','textContent']);
  interface Member { name: string; names: readonly string[]; receiver: ts.Expression }
  const aliases = new Map<string, Member>();
  function member(node: ts.Node): Member | undefined {
    if (ts.isPropertyAccessExpression(node)) return { name: node.name.text, names:[node.name.text], receiver: node.expression };
    if (ts.isElementAccessExpression(node) && node.argumentExpression) { const names = [...literalValues(node.argumentExpression)]; if (names[0] !== undefined) return { name:names[0], names, receiver: node.expression }; }
    if (ts.isIdentifier(node)) return aliases.get(identifierKey(node));
    return undefined;
  }
  function locator(node: ts.Node, resolveType = false): boolean {
    if (context && resolveType) {
      const actualLocator = (type: ts.Type): boolean => {
        if (type.isUnionOrIntersection()) return type.types.some(actualLocator);
        const symbol = type.getSymbol();
        return !!symbol && ['Locator','FrameLocator'].includes(symbol.getName()) && !!symbol.declarations?.some(declaration => /(?:^|\/)node_modules\/(?:playwright-core|playwright|@playwright\/test)\//.test(declaration.getSourceFile().fileName.replaceAll('\\','/')));
      };
      const type = context.checker.getTypeAtLocation(node);
      if (actualLocator(type)) return true;
      if (!(type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown))) return false;
    }
    if (locators.has(reference(node))) return true;
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node)) return locator(node.expression, resolveType);
    if (ts.isCallExpression(node) && locatorReturns.has(reference(node.expression))) return true;
    if (ts.isCallExpression(node)) { const part = member(node.expression); return !!part && (part.names.some(name=>factories.has(name)) || part.names.some(name=>['filter','and','or','first','last','nth'].includes(name)) && locator(part.receiver, resolveType)); }
    return false;
  }
  function collect(node: ts.Node): void {
    if (ts.isParameter(node) && ts.isIdentifier(node.name) && ['page','frame'].includes(node.name.text) && (!node.type || pageType(node.type))) { browser.add(identifierKey(node.name)); pages.add(identifierKey(node.name)); }
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier) && ['@playwright/test','playwright','playwright-core'].includes(node.moduleSpecifier.text)) {
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) locatorNamespaces.add(identifierKey(bindings.name));
      if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) {
        const imported=item.propertyName?.text || item.name.text;
        if (['Locator','FrameLocator'].includes(imported)) locatorTypes.add(identifierKey(item.name));
        if (['Page','Frame'].includes(imported)) pageTypes.add(identifierKey(item.name));
      }
    }
    if (ts.isTypeAliasDeclaration(node) && locatorType(node.type)) locatorTypes.add(identifierKey(node.name));
    if (ts.isTypeAliasDeclaration(node) && pageType(node.type)) pageTypes.add(identifierKey(node.name));
    if ((ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node) || ts.isParameter(node)) && pageType(node.type)) {
      pages.add(ts.isPropertyDeclaration(node) ? propertyKey(node,node.name) : reference(node.name));
      if (ts.isParameter(node) && node.modifiers?.some(modifier=>[ts.SyntaxKind.PrivateKeyword,ts.SyntaxKind.PublicKeyword,ts.SyntaxKind.ProtectedKeyword,ts.SyntaxKind.ReadonlyKeyword].includes(modifier.kind))) pages.add(thisKey(node)+'.'+text(node.name));
    }
    if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) && node.name && locatorType(node.type)) locatorReturns.add(ts.isFunctionDeclaration(node) && ts.isIdentifier(node.name) ? identifierKey(node.name) : propertyKey(node, node.name));
    if ((ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node) || ts.isParameter(node)) && locatorType(node.type)) locators.add(ts.isPropertyDeclaration(node) ? propertyKey(node, node.name) : reference(node.name));
    const assignment = ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken ? { name: node.left, initializer: node.right } : ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node) ? node : undefined;
    if (assignment?.initializer) {
      const value = assignment.initializer, name = ts.isPropertyDeclaration(node) ? propertyKey(node, node.name) : reference(assignment.name);
      const stringValues = literalValues(value), knownValues = literals.get(name) || new Set<string>();
      for (const stringValue of stringValues) knownValues.add(stringValue);
      if (knownValues.size) literals.set(name, knownValues);
      if (locator(value)) locators.add(name);
      if (browserObject(value)) browser.add(name);
      if (pageOrFrame(value)) pages.add(name);
      if (ts.isObjectBindingPattern(assignment.name)) for (const item of assignment.name.elements) {
        const key = item.propertyName ? (ts.isComputedPropertyName(item.propertyName) ? literal(item.propertyName.expression) || text(item.propertyName) : literal(item.propertyName) || text(item.propertyName)) : text(item.name);
        aliases.set(reference(item.name), { name: key, names:[key], receiver: value });
        if (key === 'document' && reference(value) === 'window') browser.add(reference(item.name));
      } else { const part = member(value); if (part) aliases.set(name, part); }
    }
    ts.forEachChild(node, collect);
  }
  // Resolve ordinary forward and chained aliases without executing user code.
  for (let pass = 0; pass < 4; pass++) collect(source);
  // The pinned compiler records actual ignore/expect-error directives, including
  // closing-line block and JSDoc forms; ordinary documentation is not a directive.
  const directives = (source as ts.SourceFile & { commentDirectives?: readonly { range: { pos: number } }[] }).commentDirectives || [];
  const suppressionLines = new Set<number>();
  for (const directive of directives) {
    const line = source.getLineAndCharacterOfPosition(directive.range.pos).line + 1;
    suppressionLines.add(line);
    findings.push({ code: 'typescript-suppression', file, line, message: 'Remove TypeScript suppression directives and repair the typed boundary.' });
  }
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, content);
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token !== ts.SyntaxKind.SingleLineCommentTrivia && token !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
    const comment = scanner.getTokenText(), pos = scanner.getTokenPos();
    const report = (code: string, message: string) => findings.push({ code, file, line: source.getLineAndCharacterOfPosition(pos).line + 1, message });
    if (!suppressionLines.has(source.getLineAndCharacterOfPosition(pos).line + 1) && /^(?:\/\/|\/\*+)\s*@ts-(?:ignore|expect-error|nocheck)\b/.test(comment)) report('typescript-suppression', 'Remove TypeScript suppression directives and repair the typed boundary.');
  }
  const add = (code: string, node: ts.Node, message: string, warning = false) => (warning ? warnings : findings).push({ code, file, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1, message });
  function consumed(node: ts.Node): boolean {
    const parent = node.parent;
    if (!parent) return false;
    if (ts.isAwaitExpression(parent) || ts.isReturnStatement(parent) || ts.isArrowFunction(parent) && parent.body === node) return true;
    if (ts.isParenthesizedExpression(parent) || ts.isAsExpression(parent)) return consumed(parent);
    if (ts.isArrayLiteralExpression(parent) && ts.isCallExpression(parent.parent) && /^Promise\.(all|race|any)$/.test(text(parent.parent.expression))) return consumed(parent.parent);
    // expect.poll is asynchronous even though the assertion method may be a synchronous matcher.
    return false;
  }
  function visit(node: ts.Node): void {
    // JSDoc types are attached to declarations rather than visited by the normal
    // source-file child walk. Traverse their real type nodes, including tag kinds
    // such as property/prop/satisfies, while leaving prose and string types alone.
    for (const comment of (node as ts.Node & { jsDoc?: readonly ts.JSDoc[] }).jsDoc || []) ts.forEachChild(comment, visit);
    if (node.kind === ts.SyntaxKind.AnyKeyword) add('explicit-any', node, 'Use a concrete type or validate unknown at the boundary.');
    const access = member(node);
    if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node) || ts.isIdentifier(node) && aliases.has(identifierKey(node))) && access) {
      if (isSpec && access.names.some(name => factories.has(name) || pageSelectorMethods.has(name) && pageOrFrame(access.receiver) || ['goto','reload'].includes(name) && browserObject(access.receiver) || ['querySelector','querySelectorAll','getElementById','getElementsByClassName','getElementsByTagName','$','$$','$eval','$$eval'].includes(name) && (browserObject(access.receiver) || /document$/.test(reference(access.receiver))))) add('spec-locator-ownership', node, 'Page Objects must own browser locator construction and DOM queries; specs use actions and typed state reads.');
      if (access.names.some(name=>positions.has(name)) && locator(access.receiver, true)) add('positional-locator', node, 'Use a unique semantic locator or stable test ID.');
    }
    if (ts.isCallExpression(node)) {
      const callee = text(node.expression), callMember=member(node.expression), property = callMember?.name || '';
      const properties=callMember?.names || [];
      if (properties.some(name=>['locator','frameLocator'].includes(name)) && node.arguments.some(arg => [...literalValues(arg)].some(positionalSelector))) add('positional-locator', node, 'Positional selector syntax cannot establish a unique control identity.');
      if ((property === 'waitForLoadState' || property === 'goto' || property === 'reload') && node.arguments.some(arg=>/networkidle/.test(text(arg)))) add('networkidle-wait',node,'Synchronize with a response or visible application state instead of networkidle.');
      const assertion = /(?:^|\b)expect(?:\.poll)?\(/.test(callee);
      if (properties.some(name=>asyncMethods.has(name)) || assertion && /expect\.poll\(/.test(callee)) {
        if (!consumed(node)) add('unawaited-playwright-operation', node, 'Await or return this Playwright operation (including awaited Promise.all).');
      }
      if (property === 'waitForTimeout' || isSpec && (/^(?:globalThis\.)?(?:setTimeout|setInterval)$/.test(callee) || /^(?:sleep|delay)$/.test(callee))) add('hard-wait', node, 'Wait for an observable application condition instead of a fixed delay.');
      if (/^(?:test\.(?:skip|fixme|fail|only)|test\.describe\.(?:skip|fixme|only)|expect\.soft)$/.test(callee) || callee === 'expect.configure' && node.arguments.some(arg => /\bsoft\s*:\s*true\b/.test(text(arg)))) add('suppressed-test-or-assertion', node, 'Tests and business assertions must contribute to the delivery gate.');
      if (property === 'catch' && /\bexpect(?:\.poll)?\(/.test(callee)) add('swallowed-assertion', node, 'Do not catch and suppress a failed assertion.');
    }
    if (ts.isTryStatement(node) && node.catchClause && /\bexpect(?:\.|\()/.test(text(node.tryBlock))) {
      const statements = node.catchClause.block.statements;
      if (!statements.length || !ts.isThrowStatement(statements[statements.length - 1]!)) add('swallowed-assertion', node.catchClause, 'An assertion catch must rethrow; expected denials should assert their response.');
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return { findings, warnings };
}

export const TESTING_SOURCE_POLICY_VERSION = 'testing-source-policy/v1';

export interface TestingProjectInspection { files: string[]; findings: SourceFinding[]; warnings: SourceFinding[] }

/** Inspect owned testing roots, spec neighbors, and their local module dependency closure. */
export function inspectTestingProject(root = process.cwd()): TestingProjectInspection {
  const findings: SourceFinding[] = [], warnings: SourceFinding[] = [], sources: string[] = [], symlinks: string[] = [];
  const ownedRoots = new Set(['tests','pages','fixtures','support','scripts','components','flows','config','data','auth']);
  function walk(directory: string): void {
    for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['node_modules', 'reports', 'shard-evidence', 'test-results', 'playwright-report'].includes(entry.name)) continue;
      const file = path.posix.join(directory, entry.name);
      if (entry.isSymbolicLink()) { symlinks.push(file); continue; }
      if (entry.isDirectory()) walk(file);
      else if (/\.[cm]?[jt]sx?$/.test(file)) sources.push(file);
    }
  }
  walk('.');
  const specDirectories = sources.filter(file => /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(file)).map(file => path.posix.dirname(file));
  const isOwned = (file: string): boolean => {
    const directory = path.posix.dirname(file);
    return (directory === '.' && /\.[cm]?[jt]sx?$/.test(file)) || ownedRoots.has(file.split('/')[0]!) || specDirectories.some(parent => parent !== '.' && (directory === parent || directory.startsWith(parent + '/')));
  };
  for (const file of symlinks) if (isOwned(file)) findings.push({ code:'source-symlink', file, line:1, message:'Owned testing sources must not be symlinks.' });
  const owned = sources.filter(file => {
    const directory = path.posix.dirname(file);
    return directory === '.' || ownedRoots.has(file.split('/')[0]!) || specDirectories.some(parent => parent !== '.' && (directory === parent || directory.startsWith(parent + '/')));
  });
  const configFile = ['tsconfig.discovery.json','tsconfig.json'].map(file => path.join(root,file)).find(file => fs.existsSync(file));
  let options: ts.CompilerOptions = { strict:true, noEmit:true, allowJs:true, allowImportingTsExtensions:true, module:ts.ModuleKind.NodeNext, moduleResolution:ts.ModuleResolutionKind.NodeNext, target:ts.ScriptTarget.ES2022, skipLibCheck:true };
  if (configFile) {
    const config = ts.readConfigFile(configFile, ts.sys.readFile);
    if (config.error) throw new Error('Required source-policy TypeScript configuration cannot be read.');
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    if (parsed.errors.length) throw new Error('Required source-policy TypeScript configuration is invalid.');
    options = { ...options, ...parsed.options, allowJs:true, checkJs:false };
  }
  const program = ts.createProgram(owned.map(file => path.join(root,file)), options), checker = program.getTypeChecker();
  // Local modules imported by owned tests/helpers are part of the testing
  // dependency closure even when they live outside conventional directories.
  const inspected = new Set(owned);
  for (const source of program.getSourceFiles()) {
    const local = path.relative(root, source.fileName).replaceAll('\\','/');
    if (local && !local.startsWith('../') && !path.isAbsolute(local) && !/(?:^|\/)node_modules\//.test(local) && /\.[cm]?[jt]sx?$/.test(local)) inspected.add(local);
  }
  for (const file of inspected) {
    const source = program.getSourceFile(path.join(root,file));
    if (!source) throw new Error(`Required source-policy TypeScript source is unavailable: ${file}`);
    const analysis = inspectPlaywrightSource(source.text, file, { source, checker });
    findings.push(...analysis.findings); warnings.push(...analysis.warnings);
  }
  return { files: [...inspected].sort(), findings, warnings };
}
/** Findings-only compatibility entry point for existing execution gates. */
export function inspectTestingProjectSources(root = process.cwd()): SourceFinding[] {
  return inspectTestingProject(root).findings;
}
export function assertTestingProjectSources(root = process.cwd()): void {
  const findings = inspectTestingProjectSources(root);
  if (findings.length) throw new Error(findings.map(item => `${item.file}:${item.line} ${item.code}: ${item.message}`).join('\n'));
}
