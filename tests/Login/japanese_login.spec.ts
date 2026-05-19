import { test, expect } from '@playwright/test';

test('Amazon Japanese Login Validation', async ({ page }) => {
  // Use a context with Japanese language headers to prompt Amazon to serve Japanese text
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ja-JP,ja;q=0.9'
  });

  // Navigate to standard Amazon login page
  await page.goto('https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0');
  
  // Wait for the email input field
  await page.waitForSelector('input[name="email"]');
  
  // Enter dummy email
  await page.fill('input[name="email"]', 'invalid_japanese_user_123456789@example.com');
  await page.click('input#continue');
  
  // Verify error message for invalid email appears
  const errorBox = page.locator('#auth-error-message-box');
  await expect(errorBox).toBeVisible({ timeout: 10000 });
});
