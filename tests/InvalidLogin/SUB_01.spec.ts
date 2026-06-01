import { test, expect } from '../fixtures';

test('SUB_01 - Practice Test Exceptions - Add Row', async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');

  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  await expect(page).toHaveURL(/.*logged-in-successfully/);
  await expect(page.locator('.post-title')).toContainText('Logged In Successfully');

  await page.getByRole('link', { name: 'Practice', exact: true }).click();
  await expect(page).toHaveURL(/.*practicetestautomation\.com\/practice\/?$/);
  await expect(page.locator('h1:has-text("Practice")')).toBeVisible();

  await page.locator('a:has-text("Test Exceptions")').click();
  await expect(page).toHaveTitle('Test Exceptions | Practice Test Automation');

  await expect(page.locator('#add_btn')).toBeVisible();
  await expect(page.locator('#edit_btn')).toBeVisible();

  await page.locator('#add_btn').click();
  await expect(page.locator('#row2')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#row2 input.input-field')).toBeVisible();
});
