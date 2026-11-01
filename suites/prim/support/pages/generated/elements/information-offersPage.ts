import type { Locator, Page } from '@playwright/test';

export class GeneratedElementsInformationOffersPage {
  private readonly headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator: Locator;
  private readonly headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator: Locator;
  private readonly headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator: Locator;
  private readonly headingPrimarkCelebratesFifthMiddleEastStoreWithDebutInBahrainInPartnershipWithAlshayaGrouLocator: Locator;
  private readonly headingPrimarkAndElPuertoDeLiverpoolAnnounceStrategicPartnershipToBringPrimarkToMexicoLocator: Locator;
  private readonly headingPrimarkToOpenInTheKingdomOfSaudiArabiaInPartnershipWithAlshayaGroupLocator: Locator;
  private readonly linkPrimarkStatementOnNewsToOfferHomeDeliveryInGreatBritainLocator: Locator;
  private readonly headingPrimarkStatementOnNewsToOfferHomeDeliveryInGreatBritainLocator: Locator;
  private readonly headingAlwaysBeOnTopFormPrimarkStepsUpActivewearOfferWithTheLaunchOfPrimarkFormLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator = this.page.getByRole('heading', { name: 'Primark enters Qatar with new Doha store opening in partnership with Alshaya', exact: true });
    this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator = this.page.getByRole('heading', { name: 'Primark launches new Breast Cancer Awareness collection, offering specialist post-surgery products at affordable prices', exact: true });
    this.headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator = this.page.getByRole('heading', { name: 'Circ and Primark announce long-term partnership to scale the use of textile-to-textile recycled fibres', exact: true });
    this.headingPrimarkCelebratesFifthMiddleEastStoreWithDebutInBahrainInPartnershipWithAlshayaGrouLocator = this.page.getByRole('heading', { name: 'Primark celebrates fifth Middle East store with debut in Bahrain in partnership with Alshaya Group', exact: true });
    this.headingPrimarkAndElPuertoDeLiverpoolAnnounceStrategicPartnershipToBringPrimarkToMexicoLocator = this.page.getByRole('heading', { name: 'Primark and El Puerto de Liverpool announce strategic partnership to bring Primark to Mexico', exact: true });
    this.headingPrimarkToOpenInTheKingdomOfSaudiArabiaInPartnershipWithAlshayaGroupLocator = this.page.getByRole('heading', { name: 'Primark to open in the Kingdom of Saudi Arabia in partnership with Alshaya Group', exact: true });
    this.linkPrimarkStatementOnNewsToOfferHomeDeliveryInGreatBritainLocator = this.page.getByRole('link', { name: 'Primark statement on news to offer Home Delivery in Great Britain', exact: true });
    this.headingPrimarkStatementOnNewsToOfferHomeDeliveryInGreatBritainLocator = this.page.getByRole('heading', { name: 'Primark statement on news to offer Home Delivery in Great Britain', exact: true });
    this.headingAlwaysBeOnTopFormPrimarkStepsUpActivewearOfferWithTheLaunchOfPrimarkFormLocator = this.page.getByRole('heading', { name: 'Always be on top form: Primark steps up activewear offer with the launch of Primark Form', exact: true });
  }

  get headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshaya(): Locator { return this.headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator; }
  get headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProdu(): Locator { return this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator; }
  get headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFib(): Locator { return this.headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator; }
  get headingPrimarkCelebratesFifthMiddleEastStoreWithDebutInBahrainInPartnershipWithAlshayaGrou(): Locator { return this.headingPrimarkCelebratesFifthMiddleEastStoreWithDebutInBahrainInPartnershipWithAlshayaGrouLocator; }
  get headingPrimarkAndElPuertoDeLiverpoolAnnounceStrategicPartnershipToBringPrimarkToMexico(): Locator { return this.headingPrimarkAndElPuertoDeLiverpoolAnnounceStrategicPartnershipToBringPrimarkToMexicoLocator; }
  get headingPrimarkToOpenInTheKingdomOfSaudiArabiaInPartnershipWithAlshayaGroup(): Locator { return this.headingPrimarkToOpenInTheKingdomOfSaudiArabiaInPartnershipWithAlshayaGroupLocator; }
  get linkPrimarkStatementOnNewsToOfferHomeDeliveryInGreatBritain(): Locator { return this.linkPrimarkStatementOnNewsToOfferHomeDeliveryInGreatBritainLocator; }
  get headingPrimarkStatementOnNewsToOfferHomeDeliveryInGreatBritain(): Locator { return this.headingPrimarkStatementOnNewsToOfferHomeDeliveryInGreatBritainLocator; }
  get headingAlwaysBeOnTopFormPrimarkStepsUpActivewearOfferWithTheLaunchOfPrimarkForm(): Locator { return this.headingAlwaysBeOnTopFormPrimarkStepsUpActivewearOfferWithTheLaunchOfPrimarkFormLocator; }

  async clickHeadingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshaya(...args: Parameters<Locator['click']>): Promise<void> { await this.headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator.click(...args); }

  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
