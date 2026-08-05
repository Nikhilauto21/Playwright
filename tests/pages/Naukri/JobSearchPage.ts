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
  skills: string[];
  href: string;
}

export interface JobPreferences {
  title: string;
  experience: string;
  location: string;
  applyOnlyToday: boolean;
  includeHybridRemote?: boolean;
}

export interface JobFilters {
  workMode: string[];
  postedBy: string[];
  freshnessDays: number;
  location: string;
}

export class JobSearchPage extends BasePage {
  readonly jobCards: Locator;
  readonly jobTitles: Locator;
  readonly nextPageLink: Locator;

  constructor(page: Page) {
    super(page);
    this.jobCards = page.locator('.cust-job-tuple');
    this.jobTitles = page.locator('.cust-job-tuple a.title');
    this.nextPageLink = page.locator('[class*="styles_pagination__"] a', { hasText: 'Next' }).first();
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
      for (const node of nodes.slice(0, 100)) {
        const card = node as HTMLElement;
        const titleEl = card.querySelector<HTMLAnchorElement>('a.title');
        const companyEl = card.querySelector<HTMLElement>('a.comp-name');
        const expEl = card.querySelector<HTMLElement>('span.exp-wrap');
        const locEl = card.querySelector<HTMLElement>('span.loc-wrap');
        const postedEl = card.querySelector<HTMLElement>('span.job-post-day');
        const skillEls = Array.from(card.querySelectorAll<HTMLElement>('ul.tags-gt li.tag-li'));
        out.push({
          title: titleEl?.textContent?.trim() ?? '',
          company: companyEl?.textContent?.trim() ?? '',
          location: locEl?.textContent?.trim() ?? '',
          experience: expEl?.textContent?.trim() ?? '',
          posted: postedEl?.textContent?.trim() ?? '',
          skills: skillEls.map(s => s.textContent?.trim() ?? '').filter(Boolean).slice(0, 12),
          href: titleEl?.href ?? '',
        });
      }
      return out;
    });
  }

  async getMatchingJobCards(prefs: JobPreferences, cards?: DetailedJobCard[]): Promise<DetailedJobCard[]> {
    const source = cards ?? (await this.getDetailedJobCards());
    const required = this.parseExperience(prefs.experience);
    const target = (prefs.location ?? '').toLowerCase();
    return source.filter(card => {
      if (!card.href || !card.title) return false;
      const exp = this.parseExperience(card.experience);
      const overlaps = exp.max >= required.min && exp.min <= required.max;
      if (!overlaps) return false;
      const loc = card.location.toLowerCase();
      const locOk =
        !target ||
        loc.includes(target) ||
        (!!prefs.includeHybridRemote && (loc.includes('hybrid') || loc.includes('remote')));
      if (!locOk) return false;
      if (prefs.applyOnlyToday && this.parsePostedDays(card.posted) > 1) return false;
      return true;
    });
  }

  async applyFilters(filters: JobFilters): Promise<void> {
    await this.page.waitForSelector('[class*="styles_filterHeading"]', { timeout: 15000 });
    if (filters.workMode?.length) {
      for (const label of filters.workMode) await this.clickCheckboxFilter('Work mode', label);
    }
    if (filters.postedBy?.length) {
      for (const label of filters.postedBy) await this.clickCheckboxFilter('Posted by', label);
    }
    if (filters.freshnessDays) {
      await this.selectFreshness(`Last ${filters.freshnessDays} days`);
    }
    if (filters.location) {
      await this.clickCheckboxFilter('Location', filters.location);
    }
  }

  async clickNext(): Promise<void> {
    await this.nextPageLink.click();
  }

  private async clickCheckboxFilter(section: string, label: string): Promise<void> {
    const urlBefore = this.page.url();
    const heading = this.page.locator('[class*="styles_filterHeading"]', { hasText: section }).first();
    const option = heading
      .locator('xpath=..')
      .locator('[class*="styles_chckBoxCont"]', { hasText: label })
      .first();
    const input = option.locator('input');
    if (await input.isChecked().catch(() => false)) return;
    await option.locator('label').click();
    await this.page.waitForURL(u => u.href !== urlBefore, { timeout: 20000 }).catch(() => undefined);
    await this.page.waitForTimeout(300);
  }

  private async selectFreshness(label: string): Promise<void> {
    const urlBefore = this.page.url();
    const heading = this.page.locator('[class*="styles_filterHeading"]', { hasText: 'Freshness' }).first();
    const container = heading.locator('xpath=..');
    await container.locator('button[class*="styles_ss__menu-btn"]').click();
    const menuItem = this.page.locator('ul[class*="styles_ss__menu"] li', { hasText: label }).first();
    await menuItem.click();
    await this.page.waitForURL(u => u.href !== urlBefore, { timeout: 20000 }).catch(() => undefined);
    await this.page.waitForTimeout(300);
  }

  async getNextPageHref(): Promise<string> {
    return await this.page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>('[class*="styles_pagination__"]');
      if (!bar) return '';
      const next = Array.from(bar.querySelectorAll<HTMLAnchorElement>('a')).find(
        a => (a.textContent || '').trim() === 'Next'
      );
      return next?.href ?? '';
    });
  }

  async getTotalResults(): Promise<number> {
    return await this.page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('div, span'));
      for (const el of candidates) {
        const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
        const m = text.match(/^[\d,\s-]+\s+of\s+(\d[\d,]*)$/i);
        if (m) return Number(m[1].replace(/,/g, ''));
      }
      return 0;
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
