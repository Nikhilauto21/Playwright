import { test, expect } from '@playwright/test';

test('Practice Test Automation Login and Logout', async ({ page }) => {
  // 1. Navigate to the login page
  await page.goto('https://practicetestautomation.com/practice-test-login/');
  
  // 2. Fill in the username
  await page.locator('#username').fill('student');
  
  // 3. Fill in the password
  await page.locator('#password').fill('Password123');
  
  // 4. Click the submit button
  await page.locator('#submit').click();
  
  // 5. Verify the login was successful (checking URL and success message)
  await expect(page).toHaveURL(/.*logged-in-successfully/);
  const successMessage = page.locator('.post-title'); // Often an h1 or class="post-title"
  await expect(successMessage).toContainText('Logged In Successfully');
  
  const congratulationsText = page.locator('.has-text-align-center').filter({ hasText: 'Congratulations student. You successfully logged in!' });
  await expect(congratulationsText).toBeVisible();

  // 6. Click the Logout button
  await page.locator('a.wp-block-button__link:has-text("Log out")').click();
  
  // 7. Verify logout was successful by checking the login elements are visible again
  await expect(page).toHaveURL(/.*practice-test-login/);
  await expect(page.locator('#username')).toBeVisible();
});
