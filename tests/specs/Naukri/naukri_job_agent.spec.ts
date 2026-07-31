import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures';
import { JobSearchPage, JobPreferences, DetailedJobCard } from '../../pages/Naukri/JobSearchPage';
import { JobDetailPage } from '../../pages/Naukri/JobDetailPage';
import { JobTracker, JobRecord } from '../../utils/JobTracker';
import { ensureLoggedIn } from '../../utils/NaukriAuth';

interface NaukriConfig extends JobPreferences {
  maxApplications: number;
  autoApply: boolean;
  excelFile: string;
}

test.describe('Naukri Job Agent', () => {
  const username = process.env.NAUKRI_USERNAME ?? '';
  const password = process.env.NAUKRI_PASSWORD ?? '';
  const config: NaukriConfig = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'naukri/config.json'), 'utf-8')
  );

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'Set NAUKRI_USERNAME and NAUKRI_PASSWORD in .env to run');
  });

  test('Search latest jobs for preferences, apply and track in Excel', async ({ page }) => {
    const searchPage = new JobSearchPage(page);
    const detailPage = new JobDetailPage(page);

    await ensureLoggedIn(page, username, password);
    await expect(page).not.toHaveURL(/\/nlogin\/login/);

    await searchPage.open(config.title, config.location);
    await expect(searchPage.jobTitles.first()).toBeVisible();

    const matchingJobs = await searchPage.getMatchingJobCards(config);
    expect(matchingJobs.length).toBeGreaterThan(0);
    console.log(`Found ${matchingJobs.length} jobs for "${config.title}" in ${config.location} (${config.experience} yrs)`);

    const toRecord = (job: DetailedJobCard): Omit<JobRecord, 'applied' | 'appliedAt'> => ({
      title: job.title,
      company: job.company,
      location: job.location,
      experience: job.experience,
      posted: job.posted,
      link: job.href,
    });

    const toApply = config.autoApply ? matchingJobs.slice(0, config.maxApplications) : [];
    const appliedAt = new Date().toISOString();
    const records: JobRecord[] = [];

    for (const job of toApply) {
      let applied = false;
      try {
        await detailPage.open(job.href);
        if (await detailPage.isApplyButtonVisible()) {
          await detailPage.apply();
          applied = true;
          console.log(`Applied: ${job.title} (${job.company})`);
        } else {
          console.log(`Skipped (login wall): ${job.title}`);
        }
      } catch (error) {
        console.log(`Apply failed for "${job.title}": ${(error as Error).message}`);
      }
      records.push({ ...toRecord(job), applied, appliedAt: applied ? appliedAt : '' });
      await page.waitForTimeout(2000);
    }

    for (const job of matchingJobs) {
      if (records.some(r => r.link === job.href)) continue;
      records.push({ ...toRecord(job), applied: false, appliedAt: '' });
    }

    const excelPath = path.resolve(process.cwd(), config.excelFile);
    await JobTracker.update(excelPath, records);
    console.log(`Excel updated: ${excelPath}`);
  });
});
