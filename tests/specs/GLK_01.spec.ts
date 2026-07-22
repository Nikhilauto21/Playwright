import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/GLK/LoginPage';
import { GlossaryPage } from '../pages/GLK/GlossaryPage';
//Comments
test.describe('GLK Glossary Alphabetical Order', () => {
  test('Verify letter list is alphabetical and highlights on click', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const glossaryPage = new GlossaryPage(page);

    await page.goto('https://qa-glknowledge.transperfect.com/');
    await loginPage.login('glkuserone@gmail.com', 'Password1!');

    await glossaryPage.navigateToGlossary();
    await page.waitForTimeout(2000);

    const letters = await glossaryPage.getLetterTexts();
    const filtered = letters.map(l => l.trim()).filter(l => l.length > 0);
    const sorted = [...filtered].sort();

    expect(filtered).toEqual(sorted);

    const targetLetter = filtered[0];
    await glossaryPage.clickLetter(targetLetter);
    await page.waitForTimeout(1000);

    const isActive = await glossaryPage.isLetterActive(targetLetter);
    expect(isActive).toBe(true);
  });
});
