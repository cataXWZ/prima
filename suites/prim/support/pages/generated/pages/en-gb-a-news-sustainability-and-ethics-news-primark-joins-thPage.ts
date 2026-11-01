import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbANewsSustainabilityAndEthicsNewsPrimarkJoinsThPage {
  private readonly headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenimLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenimLocator = this.page.getByRole('heading', { name: 'Primark joins the Denim Deal to help scale circularity in denim', exact: true });
  }

  get headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenim(): Locator { return this.headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenimLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
