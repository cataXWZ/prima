import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbMediaAllMediaPage {
  private readonly headingMediaLibraryLocator: Locator;
  private readonly headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator: Locator;
  private readonly headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator: Locator;
  private readonly headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator: Locator;
  private readonly headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator: Locator;
  private readonly headingMEDIAENQUIRIESLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingMediaLibraryLocator = this.page.getByRole('heading', { name: 'Media Library', exact: true });
    this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator = this.page.getByRole('heading', { name: 'Primark launches new Breast Cancer Awareness collection, offering specialist post-surgery products at affordable prices', exact: true });
    this.headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator = this.page.getByRole('heading', { name: 'Primark enters Qatar with new Doha store opening in partnership with Alshaya', exact: true });
    this.headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator = this.page.getByRole('heading', { name: 'Emmett J. Scanlan fronts Primark Man for Christmas 2026', exact: true });
    this.headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator = this.page.getByRole('heading', { name: 'Circ and Primark announce long-term partnership to scale the use of textile-to-textile recycled fibres', exact: true });
    this.headingMEDIAENQUIRIESLocator = this.page.getByRole('heading', { name: 'MEDIA ENQUIRIES', exact: true });
  }

  get headingMediaLibrary(): Locator { return this.headingMediaLibraryLocator; }
  get headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProdu(): Locator { return this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator; }
  get headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshaya(): Locator { return this.headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator; }
  get headingEmmettJScanlanFrontsPrimarkManForChristmas2026(): Locator { return this.headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator; }
  get headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFib(): Locator { return this.headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator; }
  get headingMEDIAENQUIRIES(): Locator { return this.headingMEDIAENQUIRIESLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
