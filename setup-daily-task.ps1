param(
  [string]$Time = "09:00",
  [string]$TaskName = "NaukriDailyJobAgent"
)

# Registers a Windows Scheduled Task that runs the Naukri daily job agent
# every day at the given time (24h format, default 09:00).
#
# Usage (run once, as your user):
#   powershell -ExecutionPolicy Bypass -File setup-daily-task.ps1            # daily 09:00
#   powershell -ExecutionPolicy Bypass -File setup-daily-task.ps1 -Time 18:30 # daily 18:30

$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$launcher = Join-Path $projectRoot "run-daily.ps1"
$envFile = Join-Path $projectRoot ".env"

if (-not (Test-Path -LiteralPath $envFile)) {
  Write-Host "ERROR: .env not found. Create it with NAUKRI_USERNAME and NAUKRI_PASSWORD first." -ForegroundColor Red
  exit 1
}
if (-not (Test-Path -LiteralPath $launcher)) {
  Write-Host "ERROR: run-daily.ps1 not found in $projectRoot" -ForegroundColor Red
  exit 1
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$launcher`""
$trigger = New-ScheduledTaskTrigger -Daily -At $Time
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Naukri daily job search (QA automation in Pune) -> writes date-stamped Excel report to naukri/reports/ (browser window opens briefly)" -Force | Out-Null

Write-Host ""
Write-Host "Scheduled task '$TaskName' registered." -ForegroundColor Green
Write-Host "Runs every day at $Time via $launcher" -ForegroundColor Cyan
Write-Host "NOTE: Naukri blocks headless browsers, so a small browser window opens during each run. Keep your session active." -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  View:      Get-ScheduledTask -TaskName $TaskName"
Write-Host "  Run now:   Start-ScheduledTask -TaskName $TaskName"
Write-Host "  Disable:   Disable-ScheduledTask -TaskName $TaskName"
Write-Host "  Remove:    Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
