import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures';
import { JobSearchPage, JobPreferences } from '../../pages/Naukri/JobSearchPage';
import { JobTracker, JobRecord } from '../../utils/JobTracker';
import { MatchScorer } from '../../utils/MatchScorer';
import { ensureLoggedIn } from '../../utils/NaukriAuth';

interface DailyNaukriConfig extends JobPreferences {
  maxApplications: number;
  autoApply: boolean;
  excelFile: string;
  dailyExcelDir: string;
  profileKeywords: string;
}

test.describe('Naukri Daily Job Agent', () => {
  const username = process.env.NAUKRI_USERNAME ?? '';
  const password = process.env.NAUKRI_PASSWORD ?? '';
  const config: DailyNaukriConfig = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'naukri/config.json'), 'utf-8')
  );

  test.beforeEach(async ({ page }) => {
    test.skip(!username || !password, 'Set NAUKRI_USERNAME and NAUKRI_PASSWORD in .env to run');
  });

  test('Daily: search QA automation in Pune and write a date-stamped Excel report', async ({ page }) => {
    const searchPage = new JobSearchPage(page);

    await ensureLoggedIn(page, username, password);
    await expect(page).not.toHaveURL(/\/nlogin\/login/);

    await searchPage.open(config.title, config.location);
    await expect(searchPage.jobTitles.first()).toBeVisible();

    const matchingJobs = await searchPage.getMatchingJobCards({
      ...config,
      applyOnlyToday: false,
    });

    const profileKeywords = config.profileKeywords
      .split(/[,;]+/)
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    const records: JobRecord[] = matchingJobs.map(job => {
      const profile = profileKeywords.join(' ');
      const jd = [job.title, job.skills.join(' ')].join(' ');
      const { score } = MatchScorer.score(profile, jd);
      return {
        title: job.title,
        company: job.company,
        location: job.location,
        experience: job.experience,
        posted: job.posted,
        link: job.href,
        skills: job.skills.join(', '),
        score,
        applied: false,
        appliedAt: '',
      };
    });

    const date = new Date().toISOString().slice(0, 10);
    const slug = `${config.title} ${config.location}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const reportDir = path.resolve(process.cwd(), config.dailyExcelDir);
    fs.mkdirSync(reportDir, { recursive: true });
    const excelPath = path.join(reportDir, `${slug}_${date}.xlsx`);

    await JobTracker.writeDaily(excelPath, records);
    console.log(`Daily report written: ${excelPath} (${records.length} jobs)`);

    expect(records.length).toBeGreaterThan(0);
    expect(fs.existsSync(excelPath)).toBe(true);
  });
});
