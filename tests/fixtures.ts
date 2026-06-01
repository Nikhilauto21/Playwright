import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    await use(page);
    const video = page.video();
    if (video) {
      try {
        const path = await video.path();
        if (path) {
          await testInfo.attach('video', { path, contentType: 'video/webm' });
        }
      } catch {
        // video not yet available
      }
    }
  },
});

export { expect };
