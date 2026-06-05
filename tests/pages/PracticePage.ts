import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PracticePage extends BasePage {
  readonly pageHeading: Locator;
  readonly testLoginPageLink: Locator;
  readonly testExceptionsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('h1:has-text("Practice")');
    this.testLoginPageLink = page.getByRole('link', { name: 'Test Login Page' });
    this.testExceptionsLink = page.locator('a:has-text("Test Exceptions")');
  }

  async open(): Promise<void> {
    await this.goto('https://practicetestautomation.com/practice/');
  }

  async clickTestLoginPage(): Promise<void> {
    await this.testLoginPageLink.click();
  }

  async clickTestExceptions(): Promise<void> {
    await this.testExceptionsLink.click();
  }
}
