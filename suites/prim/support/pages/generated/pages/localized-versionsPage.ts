import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesLocalizedVersionsPage {
  private readonly htmlLocator: Locator;
  private readonly headingBreastCancerAwarenessCollectionLocator: Locator;
  private readonly headingGivingClothesALongerLifeLocator: Locator;
  private readonly headingProtectingLifeOnThePlanetLocator: Locator;
  private readonly headingImprovingPeoplesLivesLocator: Locator;
  private readonly headingPrimarkCaresTermsExplainedLocator: Locator;
  private readonly headingLatestNewsLocator: Locator;
  private readonly headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenimLocator: Locator;
  private readonly headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator: Locator;
  private readonly headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator: Locator;
  private readonly headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator: Locator;
  private readonly headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator: Locator;
  private readonly headingCareersLocator: Locator;
  private readonly headingExploreLocator: Locator;
  private readonly headingPrimarkCaresMapaStrNekLocator: Locator;
  private readonly headingPrimarkCaresSitemapLocator: Locator;
  private readonly headingMapaDelSitioPrimarkCaresLocator: Locator;
  private readonly headingPlanDuSitePrimarkCaresLocator: Locator;
  private readonly headingPrimarkCaresOldaltRkPLocator: Locator;
  private readonly headingMappaDelSitoPrimarkCaresLocator: Locator;
  private readonly headingPrimarkCaresMapaStronyLocator: Locator;
  private readonly headingMapaDoSitePrimarkCaresLocator: Locator;
  private readonly headingPrimarkCaresHartaSiteUluiLocator: Locator;
  private readonly headingMapaLokalityPrimarkCaresLocator: Locator;
  private readonly headingKdoSmoLocator: Locator;

  constructor(private readonly page: Page) {
    this.htmlLocator = this.page.locator('html');
    this.headingBreastCancerAwarenessCollectionLocator = this.page.getByRole('heading', { name: 'Breast Cancer Awareness collection', level: 2, exact: true });
    this.headingGivingClothesALongerLifeLocator = this.page.getByRole('heading', { name: 'Giving Clothes a Longer Life', level: 4, exact: true });
    this.headingProtectingLifeOnThePlanetLocator = this.page.getByRole('heading', { name: 'Protecting Life on the Planet', level: 4, exact: true });
    this.headingImprovingPeoplesLivesLocator = this.page.getByRole('heading', { name: 'Improving peoples lives', level: 4, exact: true });
    this.headingPrimarkCaresTermsExplainedLocator = this.page.getByRole('heading', { name: 'Primark Cares Terms Explained', level: 4, exact: true });
    this.headingLatestNewsLocator = this.page.getByRole('heading', { name: 'Latest News', level: 2, exact: true });
    this.headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenimLocator = this.page.getByRole('heading', { name: 'Primark joins the Denim Deal to help scale circularity in denim', level: 3, exact: true });
    this.headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator = this.page.getByRole('heading', { name: 'Primark enters Qatar with new Doha store opening in partnership with Alshaya', level: 3, exact: true });
    this.headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator = this.page.getByRole('heading', { name: 'Emmett J. Scanlan fronts Primark Man for Christmas 2026', level: 3, exact: true });
    this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator = this.page.getByRole('heading', { name: 'Primark launches new Breast Cancer Awareness collection, offering specialist post-surgery products at affordable prices', level: 3, exact: true });
    this.headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator = this.page.getByRole('heading', { name: 'Circ and Primark announce long-term partnership to scale the use of textile-to-textile recycled fibres', level: 3, exact: true });
    this.headingCareersLocator = this.page.getByRole('heading', { name: 'Careers', level: 2, exact: true });
    this.headingExploreLocator = this.page.getByRole('heading', { name: 'Explore', level: 3, exact: true });
    this.headingPrimarkCaresMapaStrNekLocator = this.page.getByRole('heading', { name: 'Primark Cares – mapa stránek', level: 1, exact: true });
    this.headingPrimarkCaresSitemapLocator = this.page.getByRole('heading', { name: 'Primark Cares Sitemap', level: 1, exact: true });
    this.headingMapaDelSitioPrimarkCaresLocator = this.page.getByRole('heading', { name: 'Mapa del sitio Primark Cares', level: 1, exact: true });
    this.headingPlanDuSitePrimarkCaresLocator = this.page.getByRole('heading', { name: 'Plan du site Primark Cares', level: 1, exact: true });
    this.headingPrimarkCaresOldaltRkPLocator = this.page.getByRole('heading', { name: 'Primark Cares oldaltérkép', level: 1, exact: true });
    this.headingMappaDelSitoPrimarkCaresLocator = this.page.getByRole('heading', { name: 'Mappa del sito Primark Cares', level: 1, exact: true });
    this.headingPrimarkCaresMapaStronyLocator = this.page.getByRole('heading', { name: 'Primark Cares: mapa strony', level: 1, exact: true });
    this.headingMapaDoSitePrimarkCaresLocator = this.page.getByRole('heading', { name: 'Mapa do site Primark Cares', level: 1, exact: true });
    this.headingPrimarkCaresHartaSiteUluiLocator = this.page.getByRole('heading', { name: 'Primark Cares Harta site-ului', level: 1, exact: true });
    this.headingMapaLokalityPrimarkCaresLocator = this.page.getByRole('heading', { name: 'Mapa lokality Primark Cares', level: 1, exact: true });
    this.headingKdoSmoLocator = this.page.getByRole('heading', { name: 'Kdo smo', level: 1, exact: true });
  }

  get html(): Locator { return this.htmlLocator; }
  get headingBreastCancerAwarenessCollection(): Locator { return this.headingBreastCancerAwarenessCollectionLocator; }
  get headingGivingClothesALongerLife(): Locator { return this.headingGivingClothesALongerLifeLocator; }
  get headingProtectingLifeOnThePlanet(): Locator { return this.headingProtectingLifeOnThePlanetLocator; }
  get headingImprovingPeoplesLives(): Locator { return this.headingImprovingPeoplesLivesLocator; }
  get headingPrimarkCaresTermsExplained(): Locator { return this.headingPrimarkCaresTermsExplainedLocator; }
  get headingLatestNews(): Locator { return this.headingLatestNewsLocator; }
  get headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenim(): Locator { return this.headingPrimarkJoinsTheDenimDealToHelpScaleCircularityInDenimLocator; }
  get headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshaya(): Locator { return this.headingPrimarkEntersQatarWithNewDohaStoreOpeningInPartnershipWithAlshayaLocator; }
  get headingEmmettJScanlanFrontsPrimarkManForChristmas2026(): Locator { return this.headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator; }
  get headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProdu(): Locator { return this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator; }
  get headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFib(): Locator { return this.headingCircAndPrimarkAnnounceLongTermPartnershipToScaleTheUseOfTextileToTextileRecycledFibLocator; }
  get headingCareers(): Locator { return this.headingCareersLocator; }
  get headingExplore(): Locator { return this.headingExploreLocator; }
  get headingPrimarkCaresMapaStrNek(): Locator { return this.headingPrimarkCaresMapaStrNekLocator; }
  get headingPrimarkCaresSitemap(): Locator { return this.headingPrimarkCaresSitemapLocator; }
  get headingMapaDelSitioPrimarkCares(): Locator { return this.headingMapaDelSitioPrimarkCaresLocator; }
  get headingPlanDuSitePrimarkCares(): Locator { return this.headingPlanDuSitePrimarkCaresLocator; }
  get headingPrimarkCaresOldaltRkP(): Locator { return this.headingPrimarkCaresOldaltRkPLocator; }
  get headingMappaDelSitoPrimarkCares(): Locator { return this.headingMappaDelSitoPrimarkCaresLocator; }
  get headingPrimarkCaresMapaStrony(): Locator { return this.headingPrimarkCaresMapaStronyLocator; }
  get headingMapaDoSitePrimarkCares(): Locator { return this.headingMapaDoSitePrimarkCaresLocator; }
  get headingPrimarkCaresHartaSiteUlui(): Locator { return this.headingPrimarkCaresHartaSiteUluiLocator; }
  get headingMapaLokalityPrimarkCares(): Locator { return this.headingMapaLokalityPrimarkCaresLocator; }
  get headingKdoSmo(): Locator { return this.headingKdoSmoLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
