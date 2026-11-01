import type { Locator, Page } from '@playwright/test';

export class GeneratedElementsNavigationPage {
  private readonly navAnchor0Level1Locator: Locator;
  private readonly navAnchor0Level2Locator: Locator;
  private readonly linkAboutUsLocator: Locator;
  private readonly headingTimelineLocator: Locator;
  private readonly linkAllNewsLocator: Locator;
  private readonly headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator: Locator;
  private readonly navAnchor3Level1Locator: Locator;
  private readonly linkMediaLibraryLocator: Locator;
  private readonly headingCONTACTUSLocator: Locator;
  private readonly navAnchor2Level1Locator: Locator;
  private readonly navAnchor1Level2Locator: Locator;
  private readonly navAnchor1Level1Locator: Locator;
  private readonly navAnchor2Level2Locator: Locator;
  private readonly navAnchor4Level1Locator: Locator;
  private readonly navMenuLevel1Locator: Locator;
  private readonly linkOurPeopleLocator: Locator;
  private readonly headingPrimarkOpensInParmaPromenadeNew8MStoreBringsTheBrandToTheEmiliaRomagnaRegionForASecLocator: Locator;
  private readonly headingPrimarkOpensItsFirstStoreInTheMoravianSilesianRegionFollowing9MillionInvestmentLocator: Locator;
  private readonly headingPrimarkAnnouncesOpeningDatesForBahrainAndQatarMarketsAsRegionalExpansionContinuesLocator: Locator;
  private readonly linkPrimarkOfficiallyOpensInCremonaWithA6MillionInvestmentCremonaIsPrimarkS21stStoreInItalLocator: Locator;
  private readonly buttonDownloadPrimarkLogoBlackLocator: Locator;

  constructor(private readonly page: Page) {
    this.navAnchor0Level1Locator = this.page.locator('#nav-anchor-0-level-1');
    this.navAnchor0Level2Locator = this.page.locator('#nav-anchor-0-level-2');
    this.linkAboutUsLocator = this.page.getByRole('link', { name: 'About Us', exact: true });
    this.headingTimelineLocator = this.page.getByRole('heading', { name: 'Timeline', exact: true });
    this.linkAllNewsLocator = this.page.getByRole('link', { name: 'All News', exact: true });
    this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator = this.page.getByRole('heading', { name: 'Primark launches new Breast Cancer Awareness collection, offering specialist post-surgery products at affordable prices', exact: true });
    this.navAnchor3Level1Locator = this.page.locator('#nav-anchor-3-level-1');
    this.linkMediaLibraryLocator = this.page.getByRole('link', { name: 'Media Library', exact: true });
    this.headingCONTACTUSLocator = this.page.getByRole('heading', { name: 'CONTACT US', exact: true });
    this.navAnchor2Level1Locator = this.page.locator('#nav-anchor-2-level-1');
    this.navAnchor1Level2Locator = this.page.locator('#nav-anchor-1-level-2');
    this.navAnchor1Level1Locator = this.page.locator('#nav-anchor-1-level-1');
    this.navAnchor2Level2Locator = this.page.locator('#nav-anchor-2-level-2');
    this.navAnchor4Level1Locator = this.page.locator('#nav-anchor-4-level-1');
    this.navMenuLevel1Locator = this.page.locator('#nav-menu-level-1');
    this.linkOurPeopleLocator = this.page.getByRole('link', { name: 'Our People', exact: true });
    this.headingPrimarkOpensInParmaPromenadeNew8MStoreBringsTheBrandToTheEmiliaRomagnaRegionForASecLocator = this.page.getByRole('heading', { name: 'Primark opens in Parma Promenade: new €8M store brings the brand to the Emilia-Romagna region for a second time!', exact: true });
    this.headingPrimarkOpensItsFirstStoreInTheMoravianSilesianRegionFollowing9MillionInvestmentLocator = this.page.getByRole('heading', { name: 'Primark opens its first store in the Moravian-Silesian Region following €9 million investment', exact: true });
    this.headingPrimarkAnnouncesOpeningDatesForBahrainAndQatarMarketsAsRegionalExpansionContinuesLocator = this.page.getByRole('heading', { name: 'Primark announces opening dates for Bahrain and Qatar markets as regional expansion continues', exact: true });
    this.linkPrimarkOfficiallyOpensInCremonaWithA6MillionInvestmentCremonaIsPrimarkS21stStoreInItalLocator = this.page.getByRole('link', { name: 'Primark officially opens in Cremona with a €6 million investment Cremona is Primark’s 21st store in Italy and the 5th in the Lombardy region.', exact: true });
    this.buttonDownloadPrimarkLogoBlackLocator = this.page.getByRole('button', { name: 'Download Primark Logo Black', exact: true });
  }

  get navAnchor0Level1(): Locator { return this.navAnchor0Level1Locator; }
  get navAnchor0Level2(): Locator { return this.navAnchor0Level2Locator; }
  get linkAboutUs(): Locator { return this.linkAboutUsLocator; }
  get headingTimeline(): Locator { return this.headingTimelineLocator; }
  get linkAllNews(): Locator { return this.linkAllNewsLocator; }
  get headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProdu(): Locator { return this.headingPrimarkLaunchesNewBreastCancerAwarenessCollectionOfferingSpecialistPostSurgeryProduLocator; }
  get navAnchor3Level1(): Locator { return this.navAnchor3Level1Locator; }
  get linkMediaLibrary(): Locator { return this.linkMediaLibraryLocator; }
  get headingCONTACTUS(): Locator { return this.headingCONTACTUSLocator; }
  get navAnchor2Level1(): Locator { return this.navAnchor2Level1Locator; }
  get navAnchor1Level2(): Locator { return this.navAnchor1Level2Locator; }
  get navAnchor1Level1(): Locator { return this.navAnchor1Level1Locator; }
  get navAnchor2Level2(): Locator { return this.navAnchor2Level2Locator; }
  get navAnchor4Level1(): Locator { return this.navAnchor4Level1Locator; }
  get navMenuLevel1(): Locator { return this.navMenuLevel1Locator; }
  get linkOurPeople(): Locator { return this.linkOurPeopleLocator; }
  get headingPrimarkOpensInParmaPromenadeNew8MStoreBringsTheBrandToTheEmiliaRomagnaRegionForASec(): Locator { return this.headingPrimarkOpensInParmaPromenadeNew8MStoreBringsTheBrandToTheEmiliaRomagnaRegionForASecLocator; }
  get headingPrimarkOpensItsFirstStoreInTheMoravianSilesianRegionFollowing9MillionInvestment(): Locator { return this.headingPrimarkOpensItsFirstStoreInTheMoravianSilesianRegionFollowing9MillionInvestmentLocator; }
  get headingPrimarkAnnouncesOpeningDatesForBahrainAndQatarMarketsAsRegionalExpansionContinues(): Locator { return this.headingPrimarkAnnouncesOpeningDatesForBahrainAndQatarMarketsAsRegionalExpansionContinuesLocator; }
  get linkPrimarkOfficiallyOpensInCremonaWithA6MillionInvestmentCremonaIsPrimarkS21stStoreInItal(): Locator { return this.linkPrimarkOfficiallyOpensInCremonaWithA6MillionInvestmentCremonaIsPrimarkS21stStoreInItalLocator; }
  get buttonDownloadPrimarkLogoBlack(): Locator { return this.buttonDownloadPrimarkLogoBlackLocator; }

  async clickNavAnchor0Level1(...args: Parameters<Locator['click']>): Promise<void> { await this.navAnchor0Level1Locator.click(...args); }
  async clickLinkAboutUs(...args: Parameters<Locator['click']>): Promise<void> { await this.linkAboutUsLocator.click(...args); }
  async clickLinkAllNews(...args: Parameters<Locator['click']>): Promise<void> { await this.linkAllNewsLocator.click(...args); }
  async clickNavAnchor3Level1(...args: Parameters<Locator['click']>): Promise<void> { await this.navAnchor3Level1Locator.click(...args); }
  async clickLinkMediaLibrary(...args: Parameters<Locator['click']>): Promise<void> { await this.linkMediaLibraryLocator.click(...args); }
  async clickNavAnchor2Level1(...args: Parameters<Locator['click']>): Promise<void> { await this.navAnchor2Level1Locator.click(...args); }
  async clickNavAnchor1Level1(...args: Parameters<Locator['click']>): Promise<void> { await this.navAnchor1Level1Locator.click(...args); }

  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
