import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly otpButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#usernameField');
    this.passwordInput = page.locator('#passwordField');
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.otpButton = page.locator('button.otpButton');
    this.errorMessage = page.getByText('Invalid details', { exact: false });
  }

  async open(): Promise<void> {
    await this.goto('https://www.naukri.com/nlogin/login');
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
