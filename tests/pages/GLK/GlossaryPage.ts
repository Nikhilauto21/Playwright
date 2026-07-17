import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class GlossaryPage extends BasePage {
  readonly enterpriseLink: Locator;
  readonly glossaryLink: Locator;
  readonly letterNav: Locator;

  constructor(page: Page) {
    super(page);
    this.enterpriseLink = page.locator('a[href="/globallink-enterprise/enterprise"]');
    this.glossaryLink = page.locator('a[href="/globallink-enterprise/enterprise/help-center/glossary"]');
    this.letterNav = page.locator('.views-glossary-list__nav');
  }

  async navigateToGlossary(): Promise<void> {
    await this.enterpriseLink.click();
    await this.glossaryLink.click();
  }

  async getLetterTexts(): Promise<string[]> {
    return await this.letterNav.locator('ul li a').allTextContents();
  }

  async clickLetter(letter: string): Promise<void> {
    await this.letterNav.locator(`ul li a[href="#glossary-letter-${letter}"]`).click();
  }

  async isLetterActive(letter: string): Promise<boolean> {
    return await this.letterNav
      .locator(`ul li.active a[href="#glossary-letter-${letter}"]`)
      .count()
      .then(count => count > 0);
  }
}
