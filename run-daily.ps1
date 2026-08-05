param(
  [switch]$Headless
)

# Naukri DAILY Job Agent - launcher for the daily report
# Naukri's bot protection (Akamai) blocks headless Chromium, so the browser
# opens briefly during each run. The saved session (auth/naukri.json) means it
# usually closes quickly without any login.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File run-daily.ps1            # headed (default)
#   powershell -ExecutionPolicy Bypass -File run-daily.ps1 -Headless  # forced headless (may be blocked by Naukri)

$envFile = Join-Path $PSScriptRoot ".env"
$content = Get-Content $envFile -ErrorAction SilentlyContinue

$hasUser = $content -match "^\s*NAUKRI_USERNAME\s*=\s*\S+"
$hasPass = $content -match "^\s*NAUKRI_PASSWORD\s*=\s*\S+"

if (-not ($hasUser -and $hasPass)) {
  Write-Host ""
  Write-Host "  Add your Naukri credentials to .env first:" -ForegroundColor Yellow
  Write-Host '    NAUKRI_USERNAME=your_email@example.com'
  Write-Host '    NAUKRI_PASSWORD=your_password'
  Write-Host ""
  exit 1
}

if (-not $Headless) {
  $env:HEADLESS = "false"
  Write-Host "Launching Naukri DAILY agent (headed, browser will open briefly)..." -ForegroundColor Green
} else {
  Write-Host "Launching Naukri DAILY agent (headless - Naukri may block this)..." -ForegroundColor Yellow
}

npx playwright test tests/specs/Naukri/naukri_daily_agent.spec.ts --project=chromium --reporter=line

Write-Host ""
Write-Host "Daily report saved to: naukri/reports/qa-automation-pune_YYYY-MM-DD.xlsx" -ForegroundColor Cyan
