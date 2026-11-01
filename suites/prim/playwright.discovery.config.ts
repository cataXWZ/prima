import { defineConfig } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { inspectTypeScriptModules } from '@support/discovery/module-policy';
import { assertTestingProjectSources } from '@support/discovery/source-policy';
import { fileURLToPath } from 'node:url';
assertTestingProjectSources(fileURLToPath(new URL('.', import.meta.url)));
const generatedTypeScriptFiles: string[] = [
  "support/discovery/fixtures.ts",
  "support/discovery/lifecycle.ts",
  "support/discovery/auth-runtime.ts",
  "support/discovery/api-fixtures.ts",
  "support/discovery/network-guard.ts",
  "support/discovery/data.ts",
  "support/discovery/module-policy.ts",
  "support/discovery/source-policy.ts",
  "tests/elements/primark-corporate-uk.spec.ts",
  "support/pages/generated/elements/primark-corporate-ukPage.ts",
  "tests/elements/information-offers.spec.ts",
  "support/pages/generated/elements/information-offersPage.ts",
  "tests/elements/newsroom.spec.ts",
  "support/pages/generated/elements/newsroomPage.ts",
  "tests/elements/navigation.spec.ts",
  "support/pages/generated/elements/navigationPage.ts",
  "tests/elements/primark-launches-new-breast-cancer-awareness-collection-off.spec.ts",
  "support/pages/generated/elements/primark-launches-new-breast-cancer-awareness-collection-offPage.ts",
  "tests/elements/sustainability.spec.ts",
  "support/pages/generated/elements/sustainabilityPage.ts",
  "tests/elements/primark-joins-the-denim-deal-to-help-scale-circularity-in-de.spec.ts",
  "support/pages/generated/elements/primark-joins-the-denim-deal-to-help-scale-circularity-in-dePage.ts",
  "tests/elements/primark-enters-qatar-with-new-doha-store-opening-in-partners.spec.ts",
  "support/pages/generated/elements/primark-enters-qatar-with-new-doha-store-opening-in-partnersPage.ts",
  "tests/elements/circ-and-primark-announce-long-term-partnership-to-scale-the.spec.ts",
  "support/pages/generated/elements/circ-and-primark-announce-long-term-partnership-to-scale-thePage.ts",
  "tests/elements/about-us.spec.ts",
  "support/pages/generated/elements/about-usPage.ts",
  "tests/elements/help.spec.ts",
  "support/pages/generated/elements/helpPage.ts",
  "tests/elements/emmett-j-scanlan-fronts-primark-man-for-christmas-2026.spec.ts",
  "support/pages/generated/elements/emmett-j-scanlan-fronts-primark-man-for-christmas-2026Page.ts",
  "tests/pages/en-gb.spec.ts",
  "support/pages/generated/pages/en-gbPage.ts",
  "tests/pages/en-gb-a-news-corporate-news-primark-launches-new-breast-canc.spec.ts",
  "support/pages/generated/pages/en-gb-a-news-corporate-news-primark-launches-new-breast-cancPage.ts",
  "tests/pages/en-gb-e-news-all-news.spec.ts",
  "support/pages/generated/pages/en-gb-e-news-all-newsPage.ts",
  "tests/pages/en-gb-a-news-sustainability-and-ethics-news-primark-joins-th.spec.ts",
  "support/pages/generated/pages/en-gb-a-news-sustainability-and-ethics-news-primark-joins-thPage.ts",
  "tests/pages/en-gb-a-news-corporate-news-primark-enters-qatar-with-new-do.spec.ts",
  "support/pages/generated/pages/en-gb-a-news-corporate-news-primark-enters-qatar-with-new-doPage.ts",
  "tests/pages/en-gb-a-news-corporate-news-emmett-j-scanlan-fronts-primark.spec.ts",
  "support/pages/generated/pages/en-gb-a-news-corporate-news-emmett-j-scanlan-fronts-primarkPage.ts",
  "tests/pages/en-gb-a-news-sustainability-and-ethics-news-circ-and-primark.spec.ts",
  "support/pages/generated/pages/en-gb-a-news-sustainability-and-ethics-news-circ-and-primarkPage.ts",
  "tests/pages/en-gb-a-about-us-who-we-are.spec.ts",
  "support/pages/generated/pages/en-gb-a-about-us-who-we-arePage.ts",
  "tests/pages/en-gb-store-list.spec.ts",
  "support/pages/generated/pages/en-gb-store-listPage.ts",
  "tests/pages/en-gb-media-all-media.spec.ts",
  "support/pages/generated/pages/en-gb-media-all-mediaPage.ts",
  "tests/pages/localized-versions.spec.ts",
  "support/pages/generated/pages/localized-versionsPage.ts",
  "support/discovery/locale-data.ts",
  "support/discovery/runner.ts",
  "support/discovery/verdict.ts",
  "support/discovery/metadata.ts",
  "support/discovery/results.ts",
  "support/discovery/contracts.ts"
]
;
const moduleFindings = generatedTypeScriptFiles.flatMap(file => inspectTypeScriptModules(readFileSync(new URL(file, import.meta.url), 'utf8'), file));
if (moduleFindings.length) throw new Error(moduleFindings.map(finding => finding.file + ':' + finding.line + ' ' + finding.message).join('\n'));
// Standalone discovery configuration. Existing package and Playwright config stay unchanged.
const reportDirectory = process.env.STUDIO_DISCOVERY_REPORT_DIR;
const reportScope = ['api', 'ui', 'ui-api'].includes(process.env.STUDIO_DISCOVERY_REPORT_SCOPE || '') ? process.env.STUDIO_DISCOVERY_REPORT_SCOPE : 'all';
import { devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const playwrightBoilerplate = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

const delivery = JSON.parse(readFileSync(new URL('./.studio/discovery-delivery.json',import.meta.url),'utf8')) as {sourceDigest:string;scopeDigest:string|null;sourceRevision:string|null};
export default defineConfig({
  ...playwrightBoilerplate,
  metadata:{discovery:{executionGroup:process.env.SUITE_EXECUTION_GROUP || null,sourceDigest:delivery.sourceDigest,scopeDigest:delivery.scopeDigest,sourceRevision:delivery.sourceRevision}},
  testDir: '.', tsconfig: './tsconfig.discovery.json', fullyParallel: false, workers: 1, retries: 0,
  use: {...playwrightBoilerplate.use,screenshot:'only-on-failure',trace:"retain-on-failure"},
  reporter: [['list'], ['json', { outputFile: reportDirectory ? reportDirectory + '/results.json' : 'reports/discovery/' + reportScope + '/results.json' }], ['html', { outputFolder: reportDirectory ? reportDirectory + '/html' : 'reports/discovery/' + reportScope + '/html', open: 'never' }]],
  projects: [
  {
    "name": "api",
    "testDir": ".",
    "testMatch": [
      "**/.studio/no-generated-tests"
    ],
    "dependencies": [],
    "outputDir": "test-results/discovery/api",
    "use": {
      "baseURL": "https://corporate.primark.com"
    }
  },
  {
    "name": "ui",
    "testDir": ".",
    "testMatch": [
      "**/tests/elements/about-us.spec.ts",
      "**/tests/elements/circ-and-primark-announce-long-term-partnership-to-scale-the.spec.ts",
      "**/tests/elements/emmett-j-scanlan-fronts-primark-man-for-christmas-2026.spec.ts",
      "**/tests/elements/help.spec.ts",
      "**/tests/elements/information-offers.spec.ts",
      "**/tests/elements/navigation.spec.ts",
      "**/tests/elements/newsroom.spec.ts",
      "**/tests/elements/primark-corporate-uk.spec.ts",
      "**/tests/elements/primark-enters-qatar-with-new-doha-store-opening-in-partners.spec.ts",
      "**/tests/elements/primark-joins-the-denim-deal-to-help-scale-circularity-in-de.spec.ts",
      "**/tests/elements/primark-launches-new-breast-cancer-awareness-collection-off.spec.ts",
      "**/tests/elements/sustainability.spec.ts",
      "**/tests/pages/en-gb-a-about-us-who-we-are.spec.ts",
      "**/tests/pages/en-gb-a-news-corporate-news-emmett-j-scanlan-fronts-primark.spec.ts",
      "**/tests/pages/en-gb-a-news-corporate-news-primark-enters-qatar-with-new-do.spec.ts",
      "**/tests/pages/en-gb-a-news-corporate-news-primark-launches-new-breast-canc.spec.ts",
      "**/tests/pages/en-gb-a-news-sustainability-and-ethics-news-circ-and-primark.spec.ts",
      "**/tests/pages/en-gb-a-news-sustainability-and-ethics-news-primark-joins-th.spec.ts",
      "**/tests/pages/en-gb-e-news-all-news.spec.ts",
      "**/tests/pages/en-gb-media-all-media.spec.ts",
      "**/tests/pages/en-gb-store-list.spec.ts",
      "**/tests/pages/en-gb.spec.ts",
      "**/tests/pages/localized-versions.spec.ts"
    ],
    "dependencies": [],
    "outputDir": "test-results/discovery/ui",
    "use": {
      "baseURL": "https://corporate.primark.com",
      "browserName": "chromium",
      "serviceWorkers": "block"
    }
  },
  {
    "name": "ui-api",
    "testDir": ".",
    "testMatch": [
      "**/.studio/no-generated-tests"
    ],
    "dependencies": [],
    "outputDir": "test-results/discovery/ui-api",
    "use": {
      "baseURL": "https://corporate.primark.com",
      "browserName": "chromium",
      "serviceWorkers": "block"
    }
  }
],
});
