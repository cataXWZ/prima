import type { Locator, Page } from '@playwright/test';

export class GeneratedElementsHelpPage {
  private readonly headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenimLocator: Locator;
  private readonly buttonCONTACTUSLocator: Locator;
  private readonly headingCONTACTUSLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenimLocator = this.page.getByRole('heading', { name: 'Primark joins the Denim Deal to help scale circularity in denim', exact: true });
    this.buttonCONTACTUSLocator = this.page.getByRole('button', { name: 'CONTACT US', exact: true });
    this.headingCONTACTUSLocator = this.page.getByRole('heading', { name: 'CONTACT US', exact: true });
  }

  get headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenim(): Locator { return this.headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenimLocator; }
  get buttonCONTACTUS(): Locator { return this.buttonCONTACTUSLocator; }
  get headingCONTACTUS(): Locator { return this.headingCONTACTUSLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
