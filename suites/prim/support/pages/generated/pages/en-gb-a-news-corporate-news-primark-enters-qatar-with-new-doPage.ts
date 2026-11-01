import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbANewsCorporateNewsPrimarkEntersQatarWithNewDoPage {
  private readonly headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator = this.page.getByRole('heading', { name: 'Primark enters Qatar with new Doha store opening in partnership with Alshaya', exact: true });
  }

  get headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshaya(): Locator { return this.headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
