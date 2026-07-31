param(
  [switch]$Headless
)

# Naukri Job Agent - headless launcher
# Usage:
#   powershell -ExecutionPolicy Bypass -File run-agent.ps1            # headless (default)
#   powershell -ExecutionPolicy Bypass -File run-agent.ps1 -Headless  # opened browser for OTP/captcha

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

if ($Headless) {
  $env:HEADLESS = "false"
  Write-Host "Launching Naukri agent (browser will open so you can complete OTP/captcha)..." -ForegroundColor Green
} else {
  Write-Host "Launching Naukri agent (headless, no browser window)..." -ForegroundColor Green
}

npx playwright test tests/specs/Naukri/naukri_job_agent.spec.ts --project=chromium --reporter=line
