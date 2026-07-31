import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProfilePage extends BasePage {
  async open(): Promise<void> {
    await this.goto('https://www.naukri.com/mnjuser/profile');
  }

  async getProfileText(): Promise<string> {
    await this.page.waitForLoadState();
    await this.page.waitForTimeout(2000);
    return await this.page.locator('body').innerText();
  }
}
