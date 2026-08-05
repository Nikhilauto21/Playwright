import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly otpButton: Locator;
  readonly errorMessage: Locator;
  readonly homeLoginLink: Locator;
  readonly profileMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#usernameField');
    this.passwordInput = page.locator('#passwordField');
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.otpButton = page.locator('button.otpButton');
    this.errorMessage = page.getByText('Invalid details', { exact: false });
    this.homeLoginLink = page.getByRole('link', { name: 'Login', exact: true }).first();
    this.profileMenuButton = page.getByRole('button', { name: /profile menu/i });
  }

  async open(): Promise<void> {
    await this.goto('https://www.naukri.com/nlogin/login');
  }

  async openHome(): Promise<void> {
    await this.goto('https://www.naukri.com/');
    const gotIt = this.page.getByRole('button', { name: 'Got it' });
    if (await gotIt.isVisible().catch(() => false)) {
      await gotIt.click();
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isLoggedIn(): Promise<boolean> {
    await this.page.waitForTimeout(2000);
    return await this.profileMenuButton.isVisible().catch(() => false);
  }

  async openLoginModal(): Promise<void> {
    await this.homeLoginLink.click();
    await this.page.waitForSelector('#usernameField', { state: 'visible', timeout: 15000 });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isOnLoginPage(): Promise<boolean> {
    await this.waitForLoadState();
    return this.page.url().includes('/nlogin/login');
  }
}
