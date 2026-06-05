import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';

test('Invalid Login Scenario', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login('incorrectUser', 'incorrectPassword');

  expect(await loginPage.isErrorMessageVisible()).toBe(true);
  expect(await loginPage.getErrorMessageText()).toContain('Your username is invalid!');
});
