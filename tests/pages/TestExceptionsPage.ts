import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TestExceptionsPage extends BasePage {
  readonly addButton: Locator;
  readonly editButton: Locator;
  readonly row2: Locator;
  readonly row2Input: Locator;

  constructor(page: Page) {
    super(page);
    this.addButton = page.locator('#add_btn');
    this.editButton = page.locator('#edit_btn');
    this.row2 = page.locator('#row2');
    this.row2Input = page.locator('#row2 input.input-field');
  }

  async open(): Promise<void> {
    await this.goto('https://practicetestautomation.com/practice-test-exceptions/');
  }

  async clickAddButton(): Promise<void> {
    await this.addButton.click();
  }

  async waitForRow2(timeout = 10000): Promise<void> {
    await this.row2.waitFor({ state: 'visible', timeout });
  }
}
