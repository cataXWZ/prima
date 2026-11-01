import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbAAboutUsWhoWeArePage {
  private readonly headingWhoWeAreLocator: Locator;
  private readonly headingTimelineLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingWhoWeAreLocator = this.page.getByRole('heading', { name: 'Who We Are', exact: true });
    this.headingTimelineLocator = this.page.getByRole('heading', { name: 'Timeline', exact: true });
  }

  get headingWhoWeAre(): Locator { return this.headingWhoWeAreLocator; }
  get headingTimeline(): Locator { return this.headingTimelineLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
