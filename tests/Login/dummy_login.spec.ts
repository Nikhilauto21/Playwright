import { test, expect } from '@playwright/test';

test('Amazon Dummy Login Validation (English)', async ({ page }) => {
  // Navigate to standard Amazon login page
  await page.goto('https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0');
  
  // Wait for the email input field
  await page.waitForSelector('input[name="email"]');
  
  // Verify default text (English) - usually "Sign in"
  await expect(page.locator('h1').first()).toContainText('Sign in', { ignoreCase: true });
  
  // Enter dummy email
  await page.fill('input[name="email"]', 'invalid_dummy_user_123456789@example.com');
  await page.click('input#continue');
  
  // Verify error message for invalid email appears
  const errorBox = page.locator('#auth-error-message-box');
  await expect(errorBox).toBeVisible({ timeout: 10000 });
});
