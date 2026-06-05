import { Page, Locator, FrameLocator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  frameLocator(selector: string): FrameLocator {
    return this.page.frameLocator(selector);
  }

  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState();
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }
}
