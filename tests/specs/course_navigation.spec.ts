import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { PracticePage } from '../pages/PracticePage';
import { CoursesPage } from '../pages/CoursesPage';

test('SUB_02 - Practice Test Automation - Course Navigation and Udemy Redirect', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const practicePage = new PracticePage(page);
  const coursesPage = new CoursesPage(page);

  await page.goto('https://practicetestautomation.com');

  await page.getByRole('link', { name: 'Practice', exact: true }).click();
  await expect(page).toHaveURL(/.*practicetestautomation\.com\/practice\/?$/);

  await practicePage.clickTestLoginPage();
  await expect(page).toHaveURL(/.*practice-test-login/);

  await loginPage.login('student', 'Password123');
  await expect(page).toHaveURL(/.*logged-in-successfully/);

  await page.getByRole('link', { name: 'Courses', exact: true }).click();
  await expect(page).toHaveURL(/.*practicetestautomation\.com\/courses\/?$/);
  await expect(coursesPage.heading).toBeVisible();

  expect(await coursesPage.isSeleniumCourseVisible()).toBe(true);

  const [newPage] = await Promise.all([
    page.waitForEvent('popup'),
    coursesPage.clickSeleniumCourse(),
  ]);

  await newPage.waitForLoadState();
  await expect(newPage).toHaveURL(/.*udemy\.com\/course\/.*/);
});
