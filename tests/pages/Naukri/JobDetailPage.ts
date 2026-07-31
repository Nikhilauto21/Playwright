import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class JobDetailPage extends BasePage {
  readonly applyButton: Locator;

  constructor(page: Page) {
    super(page);
    this.applyButton = page.locator('button:has-text("Apply"), a:has-text("Apply")').first();
  }

  async open(href: string): Promise<void> {
    await this.goto(href);
  }

  async getJobDescription(): Promise<string> {
    await this.page.waitForLoadState();
    return await this.page.locator('body').innerText();
  }

  async getPostedInfo(): Promise<string> {
    const text = await this.page.locator('body').innerText();
    const match = text.match(/Posted:\s*([^\n|]+)/);
    return match ? match[1].trim() : '';
  }

  async isApplyButtonVisible(): Promise<boolean> {
    return await this.applyButton.isVisible().catch(() => false);
  }

  async apply(): Promise<void> {
    await this.applyButton.click();
  }
}
