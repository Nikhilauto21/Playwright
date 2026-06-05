import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoggedInSuccessPage extends BasePage {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('.post-title');
  }

  async getHeadingText(): Promise<string> {
    return await this.heading.textContent() ?? '';
  }
}
