import { test, expect } from '../fixtures';

test('SUB_02 - Practice Test Automation - Course Navigation and Udemy Redirect', async ({ page }) => {
  await page.goto('https://practicetestautomation.com');

  await page.getByRole('link', { name: 'Practice', exact: true }).click();
  await expect(page).toHaveURL(/.*practicetestautomation\.com\/practice\/?$/);

  await page.getByRole('link', { name: 'Test Login Page' }).click();
  await expect(page).toHaveURL(/.*practice-test-login/);

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page).toHaveURL(/.*logged-in-successfully/);
  await expect(page.locator('.post-title')).toContainText('Logged In Successfully');

  await page.getByRole('link', { name: 'Courses', exact: true }).click();
  await expect(page).toHaveURL(/.*practicetestautomation\.com\/courses\/?$/);
  await expect(page.locator('h1:has-text("Courses")')).toBeVisible();

  const seleniumLink = page.getByRole('link', { name: 'Selenium WebDriver:' }).first();
  await expect(seleniumLink).toBeVisible();

  const [newPage] = await Promise.all([
    page.waitForEvent('popup'),
    seleniumLink.click(),
  ]);

  await newPage.waitForLoadState();
  await expect(newPage).toHaveURL(/.*udemy\.com\/course\/.*/);
});
