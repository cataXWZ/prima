import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbANewsCorporateNewsEmmettJScanlanFrontsPrimarkPage {
  private readonly headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator: Locator;

  constructor(private readonly page: Page) {
    this.headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator = this.page.getByRole('heading', { name: 'Emmett J. Scanlan fronts Primark Man for Christmas 2026', exact: true });
  }

  get headingEmmettJScanlanFrontsPrimarkManForChristmas2026(): Locator { return this.headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
