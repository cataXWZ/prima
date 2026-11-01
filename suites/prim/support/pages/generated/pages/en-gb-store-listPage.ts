import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbStoreListPage {
  private readonly headingWhoWeAreLocator: Locator;
  private readonly headingBreastCancerAwarenessCollectionLocator: Locator;
  private readonly headingOurStoreListLocator: Locator;
  private readonly headingGivingClothesALongerLifeLocator: Locator;
  private readonly headingTimelineLocator: Locator;
  private readonly headingProtectingLifeOnThePlanetLocator: Locator;
  private readonly headingImprovingPeoplesLivesLocator: Locator;
  private readonly headingPrimarkCaresTermsExplainedLocator: Locator;
  private readonly headingLatestNewsLocator: Locator;
  private readonly headingCareersLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingWhoWeAreLocator = this.page.getByRole('heading', { name: 'Who We Are', exact: true });
    this.headingBreastCancerAwarenessCollectionLocator = this.page.getByRole('heading', { name: 'Breast Cancer Awareness collection', exact: true });
    this.headingOurStoreListLocator = this.page.getByRole('heading', { name: 'Our Store List', exact: true });
    this.headingGivingClothesALongerLifeLocator = this.page.getByRole('heading', { name: 'Giving Clothes a Longer Life', exact: true });
    this.headingTimelineLocator = this.page.getByRole('heading', { name: 'Timeline', exact: true });
    this.headingProtectingLifeOnThePlanetLocator = this.page.getByRole('heading', { name: 'Protecting Life on the Planet', exact: true });
    this.headingImprovingPeoplesLivesLocator = this.page.getByRole('heading', { name: 'Improving peoples lives', exact: true });
    this.headingPrimarkCaresTermsExplainedLocator = this.page.getByRole('heading', { name: 'Primark Cares Terms Explained', exact: true });
    this.headingLatestNewsLocator = this.page.getByRole('heading', { name: 'Latest News', exact: true });
    this.headingCareersLocator = this.page.getByRole('heading', { name: 'Careers', exact: true });
  }

  get headingWhoWeAre(): Locator { return this.headingWhoWeAreLocator; }
  get headingBreastCancerAwarenessCollection(): Locator { return this.headingBreastCancerAwarenessCollectionLocator; }
  get headingOurStoreList(): Locator { return this.headingOurStoreListLocator; }
  get headingGivingClothesALongerLife(): Locator { return this.headingGivingClothesALongerLifeLocator; }
  get headingTimeline(): Locator { return this.headingTimelineLocator; }
  get headingProtectingLifeOnThePlanet(): Locator { return this.headingProtectingLifeOnThePlanetLocator; }
  get headingImprovingPeoplesLives(): Locator { return this.headingImprovingPeoplesLivesLocator; }
  get headingPrimarkCaresTermsExplained(): Locator { return this.headingPrimarkCaresTermsExplainedLocator; }
  get headingLatestNews(): Locator { return this.headingLatestNewsLocator; }
  get headingCareers(): Locator { return this.headingCareersLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
