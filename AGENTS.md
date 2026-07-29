# Project Setup

## Allure Report with Video Attachment

- **Fixture**: `tests/fixtures.ts` re-exports `test` and `expect` from `@playwright/test` (no custom override needed)
- **Config**: `playwright.config.ts` has `video: 'on'` and `reporter: [['html'], ['allure-playwright']]`
- **allure-playwright v3.x** natively picks up the video from Playwright's `result.attachments` — no manual attachment code required
- All test scripts must import `{ test, expect }` from the fixtures file (e.g., `../../fixtures` or `../fixtures` based on depth)

### Run & Generate Report

```powershell
# Run tests
npx playwright test <path> --project=chromium --reporter=line,allure-playwright

# Generate and open report
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```
