import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbANewsCorporateNewsPrimarkLaunchesNewBreastCancPage {
  private readonly headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator = this.page.getByRole('heading', { name: 'Primark launches new Breast Cancer Awareness collection, offering specialist post-surgery products at affordable prices', exact: true });
  }

  get headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProdu(): Locator { return this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
