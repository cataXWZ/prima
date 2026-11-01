import type { Locator, Page } from '@playwright/test';

export class GeneratedElementsEmmettJScanlanFrontsPrimarkManForChristmas2026Page {
  private readonly linkPrimarkComLocator: Locator;
  private readonly headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator: Locator;
  private readonly linkAboutUsLocator: Locator;
  private readonly linkCareersAtPrimarkLocator: Locator;
  private readonly linkSuppliersLocator: Locator;
  private readonly linkUKGenderPayReportLocator: Locator;
  private readonly linkModernSlaveryStatementLocator: Locator;
  private readonly linkCrueltyFreeInternationalLocator: Locator;
  private readonly linkAllNewsLocator: Locator;
  private readonly linkCorporateNewsLocator: Locator;
  private readonly linkFashionNewsLocator: Locator;
  private readonly linkPrimarkCaresNewsLocator: Locator;
  private readonly linkMediaLibraryLocator: Locator;
  private readonly linkMediaEnquiriesLocator: Locator;
  private readonly linkTermOfUseLocator: Locator;
  private readonly linkPrivacyPolicyLocator: Locator;
  private readonly linkCookiePolicyLocator: Locator;
  private readonly linkFranchiseScamLocator: Locator;
  private readonly linkStoreListLocator: Locator;
  private readonly linkCustomerServiceLocator: Locator;
  private readonly linkSitemapLocator: Locator;
  private readonly linkSpeakUpColleaguesLocator: Locator;
  private readonly linkTellUsSupplyChainWorkersThirdPartiesLocator: Locator;

  constructor(private readonly page: Page) {
    this.linkPrimarkComLocator = this.page.getByRole('link', { name: 'primark.com', exact: true });
    this.headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator = this.page.getByRole('heading', { name: 'Emmett J. Scanlan fronts Primark Man for Christmas 2026', exact: true });
    this.linkAboutUsLocator = this.page.getByRole('link', { name: 'About Us', exact: true });
    this.linkCareersAtPrimarkLocator = this.page.getByRole('link', { name: 'Careers at Primark', exact: true });
    this.linkSuppliersLocator = this.page.getByRole('link', { name: 'Suppliers', exact: true });
    this.linkUKGenderPayReportLocator = this.page.getByRole('link', { name: 'UK Gender Pay Report', exact: true });
    this.linkModernSlaveryStatementLocator = this.page.getByRole('link', { name: 'Modern Slavery Statement', exact: true });
    this.linkCrueltyFreeInternationalLocator = this.page.getByRole('link', { name: 'Cruelty Free International', exact: true });
    this.linkAllNewsLocator = this.page.getByRole('link', { name: 'All News', exact: true });
    this.linkCorporateNewsLocator = this.page.getByRole('link', { name: 'Corporate News', exact: true });
    this.linkFashionNewsLocator = this.page.getByRole('link', { name: 'Fashion News', exact: true });
    this.linkPrimarkCaresNewsLocator = this.page.getByRole('link', { name: 'Primark Cares News', exact: true });
    this.linkMediaLibraryLocator = this.page.getByRole('link', { name: 'Media Library', exact: true });
    this.linkMediaEnquiriesLocator = this.page.getByRole('link', { name: 'Media Enquiries', exact: true });
    this.linkTermOfUseLocator = this.page.getByRole('link', { name: 'Term of Use', exact: true });
    this.linkPrivacyPolicyLocator = this.page.getByRole('link', { name: 'Privacy Policy', exact: true });
    this.linkCookiePolicyLocator = this.page.getByRole('link', { name: 'Cookie Policy', exact: true });
    this.linkFranchiseScamLocator = this.page.getByRole('link', { name: 'Franchise Scam', exact: true });
    this.linkStoreListLocator = this.page.getByRole('link', { name: 'Store List', exact: true });
    this.linkCustomerServiceLocator = this.page.getByRole('link', { name: 'Customer Service', exact: true });
    this.linkSitemapLocator = this.page.getByRole('link', { name: 'Sitemap', exact: true });
    this.linkSpeakUpColleaguesLocator = this.page.getByRole('link', { name: 'Speak Up - Colleagues', exact: true });
    this.linkTellUsSupplyChainWorkersThirdPartiesLocator = this.page.getByRole('link', { name: 'Tell Us - Supply Chain Workers & Third Parties', exact: true });
  }

  get linkPrimarkCom(): Locator { return this.linkPrimarkComLocator; }
  get headingEmmettJScanlanFrontsPrimarkManForChristmas2026(): Locator { return this.headingEmmettJScanlanFrontsPrimarkManForChristmas2026Locator; }
  get linkAboutUs(): Locator { return this.linkAboutUsLocator; }
  get linkCareersAtPrimark(): Locator { return this.linkCareersAtPrimarkLocator; }
  get linkSuppliers(): Locator { return this.linkSuppliersLocator; }
  get linkUKGenderPayReport(): Locator { return this.linkUKGenderPayReportLocator; }
  get linkModernSlaveryStatement(): Locator { return this.linkModernSlaveryStatementLocator; }
  get linkCrueltyFreeInternational(): Locator { return this.linkCrueltyFreeInternationalLocator; }
  get linkAllNews(): Locator { return this.linkAllNewsLocator; }
  get linkCorporateNews(): Locator { return this.linkCorporateNewsLocator; }
  get linkFashionNews(): Locator { return this.linkFashionNewsLocator; }
  get linkPrimarkCaresNews(): Locator { return this.linkPrimarkCaresNewsLocator; }
  get linkMediaLibrary(): Locator { return this.linkMediaLibraryLocator; }
  get linkMediaEnquiries(): Locator { return this.linkMediaEnquiriesLocator; }
  get linkTermOfUse(): Locator { return this.linkTermOfUseLocator; }
  get linkPrivacyPolicy(): Locator { return this.linkPrivacyPolicyLocator; }
  get linkCookiePolicy(): Locator { return this.linkCookiePolicyLocator; }
  get linkFranchiseScam(): Locator { return this.linkFranchiseScamLocator; }
  get linkStoreList(): Locator { return this.linkStoreListLocator; }
  get linkCustomerService(): Locator { return this.linkCustomerServiceLocator; }
  get linkSitemap(): Locator { return this.linkSitemapLocator; }
  get linkSpeakUpColleagues(): Locator { return this.linkSpeakUpColleaguesLocator; }
  get linkTellUsSupplyChainWorkersThirdParties(): Locator { return this.linkTellUsSupplyChainWorkersThirdPartiesLocator; }



  open(...args: Parameters<Page['goto']>): ReturnType<Page['goto']> { return this.page.goto(...args); }
}
