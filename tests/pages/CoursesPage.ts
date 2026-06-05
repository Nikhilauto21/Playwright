import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CoursesPage extends BasePage {
  readonly heading: Locator;
  readonly seleniumCourseLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1:has-text("Courses")');
    this.seleniumCourseLink = page.getByRole('link', { name: 'Selenium WebDriver:' }).first();
  }

  async open(): Promise<void> {
    await this.goto('https://practicetestautomation.com/courses/');
  }

  async isSeleniumCourseVisible(): Promise<boolean> {
    return await this.seleniumCourseLink.isVisible();
  }

  async clickSeleniumCourse(): Promise<void> {
    await this.seleniumCourseLink.click();
  }
}
