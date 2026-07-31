import { test, expect } from '../../fixtures';
import { JobSearchPage } from '../../pages/Naukri/JobSearchPage';
import { JobDetailPage } from '../../pages/Naukri/JobDetailPage';
import { ProfilePage } from '../../pages/Naukri/ProfilePage';
import { MatchScorer } from '../../utils/MatchScorer';
import { ensureLoggedIn } from '../../utils/NaukriAuth';

test.describe('Naukri Agent Flow', () => {
  const username = process.env.NAUKRI_USERNAME ?? '';
  const password = process.env.NAUKRI_PASSWORD ?? '';
  const keyword = process.env.NAUKRI_KEYWORD ?? 'qa automation';
  const shouldApply = process.env.NAUKRI_APPLY === 'true';

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'Set NAUKRI_USERNAME and NAUKRI_PASSWORD in .env to run');
  });

  test('Search today\'s jobs, read JD and score against profile', async ({ page }) => {
    const searchPage = new JobSearchPage(page);
    const detailPage = new JobDetailPage(page);
    const profilePage = new ProfilePage(page);

    await ensureLoggedIn(page, username, password);
    await expect(page).not.toHaveURL(/\/nlogin\/login/);

    await searchPage.open(keyword);
    await expect(searchPage.jobTitles.first()).toBeVisible();

    const todayJobs = await searchPage.getMatchingJobCards({
      title: keyword,
      experience: '0-30',
      location: '',
      applyOnlyToday: true,
    });
    expect(todayJobs.length).toBeGreaterThan(0);

    await profilePage.open();
    const profileText = await profilePage.getProfileText();

    const firstJob = todayJobs[0];
    await detailPage.open(firstJob.href);
    const jdText = await detailPage.getJobDescription();
    const result = MatchScorer.score(profileText, jdText);

    console.log(`Job: ${firstJob.title}`);
    console.log(`Match score: ${result.score}%`);
    console.log(`Matched: ${result.matched.join(', ')}`);
    console.log(`Missing: ${result.missing.slice(0, 20).join(', ')}`);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('Apply to job after approval', async ({ page }) => {
    test.skip(!shouldApply, 'Set NAUKRI_APPLY=true to enable the apply step');

    const searchPage = new JobSearchPage(page);
    const detailPage = new JobDetailPage(page);

    await ensureLoggedIn(page, username, password);
    await expect(page).not.toHaveURL(/\/nlogin\/login/);

    await searchPage.open(keyword);
    const todayJobs = await searchPage.getMatchingJobCards({
      title: keyword,
      experience: '0-30',
      location: '',
      applyOnlyToday: true,
    });
    expect(todayJobs.length).toBeGreaterThan(0);

    await detailPage.open(todayJobs[0].href);
    await expect(detailPage.applyButton).toBeVisible();
    await detailPage.apply();
    await expect(detailPage.applyButton).toBeHidden();
  });
});
