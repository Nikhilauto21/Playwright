import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { LoggedInSuccessPage } from '../../pages/LoggedInSuccessPage';
import { PracticePage } from '../../pages/PracticePage';
import { TestExceptionsPage } from '../../pages/TestExceptionsPage';

test('Test_01 - Practice Test Exceptions - Add Row', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const loggedInSuccessPage = new LoggedInSuccessPage(page);
  const practicePage = new PracticePage(page);
  const exceptionsPage = new TestExceptionsPage(page);

  await loginPage.open();
  await loginPage.login('student', 'Password123');
  await expect(loggedInSuccessPage.heading).toHaveText('Logged In Successfully');

  await page.getByRole('link', { name: 'Practice', exact: true }).click();
  await expect(page).toHaveURL(/.*practicetestautomation\.com\/practice\/?$/);
  await expect(practicePage.pageHeading).toBeVisible();

  await practicePage.clickTestExceptions();
  await expect(page).toHaveTitle('Test Exceptions | Practice Test Automation');

  await expect(exceptionsPage.addButton).toBeVisible();
  await expect(exceptionsPage.editButton).toBeVisible();

  await exceptionsPage.clickAddButton();
  await exceptionsPage.waitForRow2();
  await expect(exceptionsPage.row2Input).toBeVisible();
});
