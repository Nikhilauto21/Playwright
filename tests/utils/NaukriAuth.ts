import fs from 'fs';
import path from 'path';
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/Naukri/LoginPage';

const AUTH_FILE = path.resolve(process.cwd(), 'auth', 'naukri.json');

export async function ensureLoggedIn(page: Page, username: string, password: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.openHome();

  if (await loginPage.isLoggedIn()) {
    console.log('Naukri session is valid (auth/naukri.json) - skipping login');
    return;
  }

  await loginPage.openLoginModal();
  await loginPage.login(username, password);

  try {
    await page.waitForURL(url => url.href.includes('/mnjuser/'), { timeout: 30000 });
  } catch {
    if (await loginPage.errorMessage.isVisible().catch(() => false)) {
      throw new Error(
        `Naukri rejected the credentials in .env: "${await loginPage.errorMessage.textContent()}". ` +
          'Check NAUKRI_USERNAME / NAUKRI_PASSWORD in .env.'
      );
    }
    throw new Error(
      'Login did not complete within 30s. This may require an OTP/captcha - run once with -Headless (browser opens) to complete it, then re-run headless.'
    );
  }

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
  console.log('Logged in and saved session to auth/naukri.json');
}
