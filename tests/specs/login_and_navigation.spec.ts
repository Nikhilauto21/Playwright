import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { LoggedInSuccessPage } from '../pages/LoggedInSuccessPage';

test('Login and verify success page', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const successPage = new LoggedInSuccessPage(page);

  await loginPage.open();
  await loginPage.login('student', 'Password123');

  await expect(page).toHaveURL(/.*logged-in-successfully/);
  expect(await successPage.getHeadingText()).toContain('Logged In Successfully');
});
