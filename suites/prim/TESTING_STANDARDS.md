# Playwright TypeScript and module standard

This standard applies to every newly generated testing project and template: specs, Page Objects, fixtures, helpers, reporters, runners and configuration. It is also included in the exported project as `TESTING_STANDARDS.md`.

- Use TypeScript `.ts` source files and ESM (`"type": "module"`). Use `import`/`export`, with `import type` for type-only dependencies.
- Public testing modules use configured path aliases: `@pages/HomePage`, `@fixtures/app`, `@fixtures/control-state`, `@data/scenarios`, and `@scripts/helper`. These extensionless aliases resolve directly to real `.ts` source files through `tsconfig.json` paths.
- Relative imports are reserved for sibling/private implementation modules and explicitly name `.ts` sources. Cross-layer public imports use aliases, not `../../` paths. This includes dynamic imports and type imports. Dynamic targets must be statically reviewable literals or literal branches, not computed module paths. Do not emit `.js` remapping imports, `.mjs`, `.cjs`, extensionless relative imports or CommonJS `require` for owned test modules.
- Node builtins keep their `node:` specifiers. Installed dependencies keep their package names (for example `@playwright/test`). JSON is data, not a code module; load it explicitly or use the required JSON import attributes.
- Specs use stable public entry points: `@fixtures/app`, `@fixtures/control-state`, and `@pages/HomePage`. Specs must never import a hashed source-version directory such as `support/<digest>/...`.
- Internal generation namespaces may retain reviewed source versions. Public facades select the correct version, using a documented revision alias when multiple versions coexist. Test data and Page Objects must remain bound to the same reviewed generation.
- Configure `module` and `moduleResolution` as `NodeNext`, `strict: true`, `noEmit: true`, `allowImportingTsExtensions: true`, `verbatimModuleSyntax: true`, and `isolatedModules: true`. Configure public path mappings such as `"@pages/*": ["./pages/*.ts"]` and `"@fixtures/*": ["./fixtures/*.ts"]`; the shared mappings also cover data, scripts, components, flows, config and stable support. Playwright loads tests/configuration with those mappings; standalone TypeScript runners use the pinned `tsx` loader and the project tsconfig. Validate both compile-time and runtime alias resolution.
- Run strict `tsc --noEmit` and module-policy checks before execution or delivery. Do not hide errors with `any`, `@ts-ignore`, `@ts-nocheck`, skipped tests or relaxed expectations.
- Run the shared `source-policy.ts` gate as well as typechecking and module checks. The same canonical implementation applies during generation, config loading, standalone quality/preflight and composed execution. An unavailable required project check blocks readiness/execution; it may produce only an explicitly BLOCKED local review artifact or Draft PR.
- Every spec delegates browser locator construction, selector-based Page/Frame operations (such as `page.click(selector)`) and navigation to Page Objects, including setup/auth specs and specs outside `tests/`. This includes aliased, destructured and statically resolved computed access, and browser DOM queries. POMs own private `Page`/`Locator` fields and typed action methods. Specs retain business assertions; semantic typed Locator getters may remain assertion targets to preserve Playwright's web-first matcher behavior. Pure HTTP specs use API clients and require no artificial browser Page Object.
- Explicit TypeScript/JSDoc `any` and actual `@ts-ignore`, `@ts-expect-error` and `@ts-nocheck` directives are blocking in every owned testing module, including fixtures, helpers, POMs, configuration and runners. Strict typechecking handles implicit-any errors. Ordinary strings, prose and enabling `@ts-check` comments are not suppressions. This is not a claim that SDK-provided data has been independently runtime-validated.
- Positional Playwright locator methods (`first`, `last`, `nth`), method references/aliases and positional selector syntax (CSS, `nth=` and XPath predicates) are blocking, including inside POMs. Use a semantic unique selector instead. Ordinary data collections, array/string indexing and quoted semantic labels are not locator violations. Project type checking resolves Locators returned by imported Page Objects and statically known imported selector constants.
- Inspect the owned testing tree and its local imported dependency closure before any project/filter selection. Unreferenced application sources, third-party packages and historical evidence remain separately governed. Retained generated specs keep their reviewed POM dependencies; edited/missing retained companions block delivery rather than being silently replaced.
- Preserve existing test IDs, business assertions, input data, network boundaries, historical approval records and healing evidence when migrating a project. A source migration does not create an authenticated approval.

Examples:

```ts
import { test, expect } from '@fixtures/app';
import { HomePage } from '@pages/HomePage';
import type { Page } from '@playwright/test';
import fs from 'node:fs/promises';
```

The official create-playwright boilerplate is the baseline. Reviewed application scope, browser budgets, data isolation and evidence requirements override its defaults. Historical JavaScript projects remain historical source; they are not the default for newly generated testing code.
