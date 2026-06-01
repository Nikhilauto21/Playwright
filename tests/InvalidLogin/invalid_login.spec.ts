import { test, expect } from '../fixtures';

test('Invalid Login Scenario', async ({ page }) => {
  await page.goto('https://practicetestautomation.com/practice-test-login/');

  await page.locator('#username').fill('incorrectUser');
  await page.locator('#password').fill('incorrectPassword');
  await page.locator('#submit').click();

  const errorMessage = page.locator('#error');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText('Your username is invalid!');
});
