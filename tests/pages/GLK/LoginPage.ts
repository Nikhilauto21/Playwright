import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  readonly signInButton: Locator;
  readonly acceptAllButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signInButton = page.locator('input[value="Sign in"]');
    this.acceptAllButton = page.locator('input[value="Accept all"]');
    this.emailInput = page.locator('#Email');
    this.passwordInput = page.locator('#Password');
    this.continueButton = page.locator('#SubmitLogin');
  }

  async login(username: string, password: string): Promise<void> {
    await this.signInButton.click();

    if (this.page.url().includes('/Consent')) {
      await this.acceptAllButton.click();
    }

    await this.emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.emailInput.fill(username);
    await this.continueButton.click();

    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.fill(password);
    await this.continueButton.click();
  }
}
