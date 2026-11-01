import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbANewsSustainabilityAndEthicsNewsCircAndPrimarkPage {
  private readonly headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator = this.page.getByRole('heading', { name: 'Circ and Primark announce long-term partnership to scale the use of textile-to-textile recycled fibres', exact: true });
  }

  get headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFib(): Locator { return this.headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
