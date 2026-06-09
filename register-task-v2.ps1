# Auto-update scheduled task for AI Tools Hub
# Run as Administrator in PowerShell to register

$TaskName = "AIToolsHub_AutoUpdate"
$ProjectDir = "C:\Users\25441\WorkBuddy\2026-05-29-20-49-58\ai-tools-hub"
$BatFile = "$ProjectDir\auto-update-v2.bat"

$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$BatFile`""
$Trigger = New-ScheduledTaskTrigger -Daily -At "12:00"
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -WakeToRun

# Unregister if exists
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Daily auto-update AI tools, generate articles, and deploy to Cloudflare Pages" -Force

Write-Host "Task '$TaskName' registered successfully!"
Write-Host "Runs daily at 12:00 PM"
Write-Host "Next run: $((Get-ScheduledTask -TaskName $TaskName).NextRunTime)"
