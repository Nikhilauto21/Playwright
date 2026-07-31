# Naukri Job Application Agent

This agent automates the Naukri.com job application workflow using the Playwright MCP browser tools. It runs in Antigravity with the Playwright MCP server configured (see `mcp-config.json`).

## Environment

- MCP server: `@playwright/mcp@latest` (standard Antigravity config in `mcp-config.json`)
- Browser: headed Chrome/Chromium by default. Login state persists in the MCP persistent profile, so the user logs in once and it stays logged in across sessions.
- Naukri.com detects bots. If an OTP, captcha, or login verification appears, STOP and ask the user to complete it manually, then continue.

## Workflow

Follow these steps in order. NEVER skip the approval gate in Step 6.

### Step 1 - Login

1. Navigate to `https://www.naukri.com/nlogin/login`.
2. If already logged in (dashboard/profile visible), skip to Step 2.
3. Otherwise, fill `#usernameField` and `#passwordField` with credentials from the user. Do not invent credentials; ask the user for them.
4. Click the login button (`button[type="submit"]`).
5. If OTP/captcha appears, ask the user to complete it manually.
6. Wait for the dashboard to load and verify login succeeded (e.g. profile name visible in header).

### Step 2 - Search today's jobs

1. Navigate to `https://www.naukri.com/`.
2. Enter the role/technology keywords in the search box (ask the user for the search string if not provided).
3. Run the search.
4. Apply the "Date Posted" filter -> "Last 24 hours" (today's jobs only).
5. Collect the list of matching job cards: title, company, location, experience, and link.

### Step 3 - Read the job description

1. Open each candidate job card (one at a time).
2. Extract the full JD text: responsibilities, requirements, skills, qualifications, about the role.
3. If the JD is behind a "view full JD" action, expand it first.

### Step 4 - AI match score (keyword/rule based)

Compare the user's Naukri profile (resume summary + skills + experience) against each JD. Scoring rules:

1. Build the JD skill set: tokenize the JD (skills, technologies, tools, keywords, soft skills).
2. Build the profile skill set: same tokenization from the user's profile summary and skills section.
3. Score = (matching keywords / JD keywords) x 100, rounded to an integer.
4. Apply context weight: if a "must have" keyword is missing, cap the score at 50.
5. Output for each job: title, company, match score, matched keywords, missing must-haves, and a short recommendation (Apply / Customize / Skip).

Present the score table to the user.

### Step 5 - Customize resume

1. For jobs the user wants to pursue, open the user's profile page and draft a customized profile summary that inserts the missing-but-relevant keywords from each JD naturally.
2. Do NOT edit the profile yet. Output the proposed customized summary in the chat for review.
3. Update Naukri profile only after the user approves the text.

### Step 6 - Wait for approval

STOP after customization. Ask the user explicitly:

- Which jobs to apply to (by title/company from the score table)?
- Is the customized summary approved for each?

Do not proceed to Step 7 until the user explicitly approves each application.

### Step 7 - Apply

1. For each approved job, open the job page.
2. Verify the active resume and summary shown are the approved versions.
3. Click the Apply button.
4. Handle any follow-up form (choose the approved resume, confirm).
5. After applying, report the application confirmation/message to the user.

## Human-in-the-loop rules

- Ask for credentials, search keywords, and target jobs; never guess.
- Pause for manual OTP/captcha.
- The user approves every apply action - the agent must never submit an application without approval.
- If the page layout changes or a selector cannot be found, take a snapshot and re-locate the element instead of guessing.

## Scripted agent (config-driven, Excel tracking)

A separate Playwright script implements the same flow automatically from `naukri/config.json` preferences:

```json
{
  "title": "qa automation",
  "experience": "3-8",
  "location": "pune",
  "applyOnlyToday": true,
  "autoApply": true,
  "maxApplications": 5,
  "excelFile": "naukri/job_tracker.xlsx"
}
```

- `title` + `location` build the search URL (`{title}-jobs-in-{location}`).
- `experience` filters jobs whose years overlap the range (card text parse).
- `applyOnlyToday` keeps only jobs posted within 1 day.
- `autoApply` controls whether the agent clicks Apply; `maxApplications` caps how many.
- Every matched job is written to `excelFile` (created if missing) with columns: Date, Title, Company, Location, Experience, Posted, Link, Applied (Yes/No), AppliedAt. Re-runs update existing rows by job link instead of duplicating.

Run it:

```
npx playwright test tests/specs/Naukri/naukri_job_agent.spec.ts --project=chromium --reporter=line,allure-playwright
```

## Launch (headless, ready to run)

1. **Give your credentials** in the root `.env` file (already created, gitignored):
   ```
   NAUKRI_USERNAME=your_email@example.com
   NAUKRI_PASSWORD=your_password
   ```
   Then edit `naukri/config.json` for title / experience / location preferences.

2. **First run** — complete OTP/captcha once in an opened browser, so the session is saved:
   ```
   powershell -ExecutionPolicy Bypass -File run-agent.ps1 -Headless
   ```
   Login state is stored in `auth/naukri.json`.

3. **All later runs** — fully headless, no browser opens:
   ```
   powershell -ExecutionPolicy Bypass -File run-agent.ps1
   ```
   or
   ```
   npm run naukri:agent
   ```

4. Results land in `naukri/job_tracker.xlsx` (which jobs the agent applied to, with Yes/No and timestamps).

Notes:
- The browser is **headless by default**. To watch it live, set `HEADLESS=false` (or use the `-Headless` switch for OTP).
- If Naukri invalidates the session, delete `auth/naukri.json` and do the first-run step again.
- If you ever want to stop applying but keep searching/logging, set `"autoApply": false` in `config.json`.

Credentials come from `.env` (`NAUKRI_USERNAME`, `NAUKRI_PASSWORD`). If an OTP/captcha blocks login, complete it in the headed browser manually.
