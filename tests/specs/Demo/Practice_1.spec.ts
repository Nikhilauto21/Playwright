import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { LoggedInSuccessPage } from '../../pages/LoggedInSuccessPage';
import { PracticePage } from '../../pages/PracticePage';
import { TestExceptionsPage } from '../../pages/TestExceptionsPage';

test.describe('Practice Test - Exceptions Flow', () => {

  test('Practice_01 - Login, Navigate to Practice, and Add Row in Exceptions', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const successPage = new LoggedInSuccessPage(page);
    const practicePage = new PracticePage(page);
    const exceptionsPage = new TestExceptionsPage(page);

    // Step 1: Open the Exceptions page
    await test.step('Open Practice Test Exceptions page', async () => {
      await exceptionsPage.open();
    });

    // Step 2: Login with valid credentials
    await test.step('Login with valid credentials', async () => {
      await loginPage.open();
      await loginPage.login('student', 'Password123');
    });

    // Step 3: Verify login successful message
    await test.step('Verify login successful message', async () => {
      await expect(page).toHaveURL(/.*logged-in-successfully/);
      expect(await successPage.getHeadingText()).toContain('Logged In Successfully');
    });

    // Step 4: Go to practice section
    await test.step('Navigate to Practice section', async () => {
      await page.getByRole('link', { name: 'Practice', exact: true }).click();
    });

    // Step 5: Verify land on practice page
    await test.step('Verify landed on Practice page', async () => {
      await expect(page).toHaveURL(/.*practicetestautomation\.com\/practice\/?$/);
      await expect(practicePage.pageHeading).toBeVisible();
    });

    // Step 6: Click on Test Exceptions
    await test.step('Click on Test Exceptions link', async () => {
      await practicePage.clickTestExceptions();
    });

    // Step 7: Verify Test Exceptions title
    await test.step('Verify Test Exceptions page title', async () => {
      await expect(page).toHaveTitle('Test Exceptions | Practice Test Automation');
    });

    // Step 8: Verify row add edit button
    await test.step('Verify Add and Edit buttons are visible', async () => {
      await expect(exceptionsPage.addButton).toBeVisible();
      await expect(exceptionsPage.editButton).toBeVisible();
    });

    // Step 9: Click on add button and verify
    await test.step('Click Add button and verify Row 2 is added', async () => {
      await exceptionsPage.clickAddButton();
      await exceptionsPage.waitForRow2();
    });

    // Step 10: Verify row 2 is added
    await test.step('Verify Row 2 input field is visible', async () => {
      await expect(exceptionsPage.row2Input).toBeVisible();
    });
  });

});
