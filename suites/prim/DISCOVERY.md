# Discovery tests

These files contain the confirmed tests from this discovery. Earlier tests remain selected only when unchanged and bound to the same reviewed application scope. Tests from another or unknown scope are excluded; the ownership manifest records the exact project selection. Run commands from this suite directory.

- API: HTTP requests only; no browser installation or repository browser fixtures are required.
- UI: journeys, element checks and page checks.
- UI–API: browser behavior checked against observed backend responses.

```sh
node --import tsx support/discovery/runner.ts check
node --import tsx support/discovery/runner.ts api
node --import tsx support/discovery/runner.ts ui
node --import tsx support/discovery/runner.ts ui-api
node --import tsx support/discovery/runner.ts all
```

Each command writes its own JSON/HTML report to `reports/discovery/<execution-group>/<project>/` and artifacts to `test-results/discovery/<project>/`. The canonical runner owns report selection and does not accept Playwright argument overrides.

Typecheck with `npx tsc --noEmit --project tsconfig.discovery.json` before execution. The repository must provide TypeScript, @types/node and @playwright/test as development dependencies.

List the exact selection with `npx playwright test --config playwright.discovery.config.ts --tsconfig tsconfig.discovery.json --list`. The dedicated configuration does not import the repository's main configuration or run its global setup. Existing package files and the main configuration are unchanged. Both workflows use the same Playwright/TypeScript project and installed dependencies. Discovery uses its own reviewed auth, data, clock and URL boundaries; it does not inherit the persistent suite's fixture hooks. Existing suite IDs, tests, requirement links and historical approvals stay intact. New Discovery cases are not automatically approved as part of the persistent suite. Current maintained configurations select registered suite paths and client tests/manual and tests/requirements cases. Older broad testMatch configurations need a reviewed selection migration before integrating these files; otherwise they can also select Discovery tests under the wrong suite contract. Use the dedicated Discovery command for its exact reviewed inventory. The current Discovery standard and executable policies live under support/discovery; an existing root TESTING_STANDARDS.md is preserved.

Reviewed frontend: https://corporate.primark.com. Reviewed backend origins: none. Origin checks are fixed to these reviewed targets when present. All redirects are refused, including redirects to another reviewed origin. Payment requests are blocked. For private CAs, use `NODE_EXTRA_CA_CERTS=/path/to/ca.pem`; TLS verification remains enabled.


Canonical commands require Node.js22.16+, the pinned tsx loader from the shared TypeScript scaffold, TypeScript, @types/node and @playwright/test in the client package/lock. Install missing dependencies through the client dependency review; Studio does not rewrite package files. GitHub exports include .studio/discovery.github-actions.yml as a workflow template: review and copy it into an unused .github/workflows filename at the repository root. Existing workflows are never overwritten; hosted CI is NOT_RUN. Cookie state must be provisioned into a private temporary file outside the checkout; the CI template requires a separate approved state provisioning step. Token secret environment names are declared without values. Authenticated profiles disable unredacted Playwright traces because network headers can contain credentials; failure screenshots, error context and JSON/HTML reports remain available.

Reports from the canonical runner live under reports/discovery/<execution-group>/<project>. A composed PASS requires every selected test and a verified build identity. Missing build policy remains BLOCKED. Default data execution is serial. Retained resource capacity includes failed setup reservations and expired entries until backend disposal is explicitly reconciled; restore the external directory named by dataPolicy.ledgerEnv across exports and CI. Its retained-resources.json must already contain the reviewed target scope digest, owner and reconciled owned resources. Missing/unmatched ledgers block writes; never initialize one without verifying the backend baseline. Local report directories are not durable capacity evidence. The persistent ledger is Discovery-specific because generic suite lifecycle hooks cannot establish retained-record capacity after a partial setup response is lost.
