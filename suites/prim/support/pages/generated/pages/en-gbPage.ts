import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbPage {
  private readonly headingBreastCancerAwarenessCollectionLocator: Locator;
  private readonly headingLatestNewsLocator: Locator;
  private readonly headingCareersLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingBreastCancerAwarenessCollectionLocator = this.page.getByRole('heading', { name: 'Breast Cancer Awareness collection', exact: true });
    this.headingLatestNewsLocator = this.page.getByRole('heading', { name: 'Latest News', exact: true });
    this.headingCareersLocator = this.page.getByRole('heading', { name: 'Careers', exact: true });
  }

  get headingBreastCancerAwarenessCollection(): Locator { return this.headingBreastCancerAwarenessCollectionLocator; }
  get headingLatestNews(): Locator { return this.headingLatestNewsLocator; }
  get headingCareers(): Locator { return this.headingCareersLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
