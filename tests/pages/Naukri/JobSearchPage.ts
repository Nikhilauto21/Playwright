import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface JobCard {
  title: string;
  href: string;
}

export interface DetailedJobCard {
  title: string;
  company: string;
  location: string;
  experience: string;
  posted: string;
  href: string;
}

export interface JobPreferences {
  title: string;
  experience: string;
  location: string;
  applyOnlyToday: boolean;
}

export class JobSearchPage extends BasePage {
  readonly jobCards: Locator;
  readonly jobTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.jobCards = page.locator('.cust-job-tuple');
    this.jobTitles = page.locator('.cust-job-tuple a.title');
  }

  async dismissPrivacyPolicy(): Promise<void> {
    const gotIt = this.page.getByRole('button', { name: 'Got it' });
    if (await gotIt.isVisible().catch(() => false)) {
      await gotIt.click();
    }
  }

  async open(keyword: string, location?: string): Promise<void> {
    const slug = keyword.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const locationSlug = location ? `-in-${location.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}` : '';
    await this.goto(`https://www.naukri.com/${slug}-jobs${locationSlug}`);
    await this.dismissPrivacyPolicy();
  }

  async getJobCards(): Promise<JobCard[]> {
    return await this.jobTitles.evaluateAll(links =>
      links.slice(0, 20).map(a => ({
        title: a.textContent?.trim() ?? '',
        href: (a as HTMLAnchorElement).href,
      }))
    );
  }

  async getDetailedJobCards(): Promise<DetailedJobCard[]> {
    return await this.jobCards.evaluateAll(nodes => {
      const out: DetailedJobCard[] = [];
      for (const node of nodes.slice(0, 30)) {
        const card = node as HTMLElement;
        const a = card.querySelector('a.title');
        const lines = (card.innerText ?? '').split('\n').map(l => l.trim()).filter(Boolean);
        const expIdx = lines.findIndex(l => /^\d+\s*-\s*\d+\s*Yrs?$/i.test(l));
        const text = lines.join(' ');
        const postedMatch = text.match(/(\d+)\+?\s*day[s]?\s*ago|today|just now/i);
        out.push({
          title: lines[0] ?? '',
          company: lines[1] ?? '',
          location: expIdx >= 0 ? (lines[expIdx + 1] ?? '') : '',
          experience: expIdx >= 0 ? lines[expIdx] : '',
          posted: postedMatch ? postedMatch[0] : '',
          href: (a as HTMLAnchorElement)?.href ?? '',
        });
      }
      return out;
    });
  }

  async getMatchingJobCards(prefs: JobPreferences): Promise<DetailedJobCard[]> {
    const cards = await this.getDetailedJobCards();
    const required = this.parseExperience(prefs.experience);
    const location = prefs.location.toLowerCase();
    return cards.filter(card => {
      if (!card.href || !card.title) return false;
      const exp = this.parseExperience(card.experience);
      const overlaps = exp.max >= required.min && exp.min <= required.max;
      if (!overlaps) return false;
      if (location && !card.location.toLowerCase().includes(location)) return false;
      if (prefs.applyOnlyToday && this.parsePostedDays(card.posted) > 1) return false;
      return true;
    });
  }

  async openJob(href: string): Promise<void> {
    await this.goto(href);
  }

  private parseExperience(range: string): { min: number; max: number } {
    const match = range.match(/(\d+)\s*-\s*(\d+)/);
    return match ? { min: Number(match[1]), max: Number(match[2]) } : { min: 0, max: 99 };
  }

  private parsePostedDays(posted: string): number {
    if (/today|just now/i.test(posted)) return 0;
    const match = posted.match(/(\d+)/);
    return match ? Number(match[1]) : 99;
  }
}
