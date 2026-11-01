import type { Locator, Page } from '@playwright/test';

export class GeneratedElementsSustainabilityPage {
  private readonly navAnchor1Level1Locator: Locator;
  private readonly navAnchor2Level2Locator: Locator;
  private readonly linkProductLocator: Locator;
  private readonly linkPlanetLocator: Locator;
  private readonly navAnchor3Level2Locator: Locator;
  private readonly linkPeopleLocator: Locator;
  private readonly navAnchor4Level2Locator: Locator;
  private readonly navAnchor5Level2Locator: Locator;
  private readonly linkThePrimarkCottonProjectLocator: Locator;
  private readonly navAnchor6Level2Locator: Locator;
  private readonly navAnchor7Level2Locator: Locator;
  private readonly linkWhoAreOurPartnersLocator: Locator;
  private readonly navAnchor8Level2Locator: Locator;
  private readonly navMenuLevel1Locator: Locator;
  private readonly navAnchor0Level2Locator: Locator;
  private readonly navAnchor1Level2Locator: Locator;

  constructor(private readonly page: Page) {
    this.navAnchor1Level1Locator = this.page.locator('#nav-anchor-1-level-1');
    this.navAnchor2Level2Locator = this.page.locator('#nav-anchor-2-level-2');
    this.linkProductLocator = this.page.getByRole('link', { name: 'Product', exact: true });
    this.linkPlanetLocator = this.page.getByRole('link', { name: 'Planet', exact: true });
    this.navAnchor3Level2Locator = this.page.locator('#nav-anchor-3-level-2');
    this.linkPeopleLocator = this.page.getByRole('link', { name: 'People', exact: true });
    this.navAnchor4Level2Locator = this.page.locator('#nav-anchor-4-level-2');
    this.navAnchor5Level2Locator = this.page.locator('#nav-anchor-5-level-2');
    this.linkThePrimarkCottonProjectLocator = this.page.getByRole('link', { name: 'The Primark Cotton Project', exact: true });
    this.navAnchor6Level2Locator = this.page.locator('#nav-anchor-6-level-2');
    this.navAnchor7Level2Locator = this.page.locator('#nav-anchor-7-level-2');
    this.linkWhoAreOurPartnersLocator = this.page.getByRole('link', { name: 'Who Are Our Partners', exact: true });
    this.navAnchor8Level2Locator = this.page.locator('#nav-anchor-8-level-2');
    this.navMenuLevel1Locator = this.page.locator('#nav-menu-level-1');
    this.navAnchor0Level2Locator = this.page.locator('#nav-anchor-0-level-2');
    this.navAnchor1Level2Locator = this.page.locator('#nav-anchor-1-level-2');
  }

  get navAnchor1Level1(): Locator { return this.navAnchor1Level1Locator; }
  get navAnchor2Level2(): Locator { return this.navAnchor2Level2Locator; }
  get linkProduct(): Locator { return this.linkProductLocator; }
  get linkPlanet(): Locator { return this.linkPlanetLocator; }
  get navAnchor3Level2(): Locator { return this.navAnchor3Level2Locator; }
  get linkPeople(): Locator { return this.linkPeopleLocator; }
  get navAnchor4Level2(): Locator { return this.navAnchor4Level2Locator; }
  get navAnchor5Level2(): Locator { return this.navAnchor5Level2Locator; }
  get linkThePrimarkCottonProject(): Locator { return this.linkThePrimarkCottonProjectLocator; }
  get navAnchor6Level2(): Locator { return this.navAnchor6Level2Locator; }
  get navAnchor7Level2(): Locator { return this.navAnchor7Level2Locator; }
  get linkWhoAreOurPartners(): Locator { return this.linkWhoAreOurPartnersLocator; }
  get navAnchor8Level2(): Locator { return this.navAnchor8Level2Locator; }
  get navMenuLevel1(): Locator { return this.navMenuLevel1Locator; }
  get navAnchor0Level2(): Locator { return this.navAnchor0Level2Locator; }
  get navAnchor1Level2(): Locator { return this.navAnchor1Level2Locator; }

  async clickNavAnchor1Level1(...args: Parameters<Locator['click']>): Promise<void> { await this.navAnchor1Level1Locator.click(...args); }

  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
