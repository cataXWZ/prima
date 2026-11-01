import type { Locator, Page } from '@playwright/test';

export class GeneratedPagesEnGbENewsAllNewsPage {
  private readonly headingTheNewsroomLocator: Locator;

  constructor(private readonly page: Page) {
    this.headingTheNewsroomLocator = this.page.getByRole('heading', { name: 'The Newsroom', exact: true });
  }

  get headingTheNewsroom(): Locator { return this.headingTheNewsroomLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
