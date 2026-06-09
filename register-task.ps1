# 更新 AIToolsHub 定时任务 - 每天中午 12:00
# 右键此文件 -> 以管理员身份运行

$taskName = "AIToolsHub_AutoUpdate"
$workDir = "C:\Users\25441\WorkBuddy\2026-05-29-20-49-58\ai-tools-hub"
$batFile = "$workDir\auto-update.bat"
$logFile = "$workDir\auto-update.log"

Write-Host "正在更新定时任务: $taskName" -ForegroundColor Cyan

# 删除已有同名任务（如有）
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

$action = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument "/c cd /d `"$workDir`" && `"$batFile`" >> `"$logFile`" 2>&1" `
    -WorkingDirectory $workDir

$trigger = New-ScheduledTaskTrigger -Daily -At "12:00"

$settings = New-ScheduledTaskSettingsSet `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -DontStopIfGoingOnBatteries `
    -AllowStartIfOnBatteries

$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Highest

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Auto update AI Tools Hub website content and deploy to Cloudflare Pages" `
    -Force

# 验证
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task) {
    $info = Get-ScheduledTaskInfo -TaskName $taskName
    Write-Host "✅ 定时任务更新成功！" -ForegroundColor Green
    Write-Host "   任务名:   $($task.TaskName)"
    Write-Host "   状态:     $($task.State)"
    Write-Host "   执行时间: 每天 12:00:00"
    Write-Host "   下次运行: $($info.NextRunTime)"
} else {
    Write-Host "❌ 注册失败，请检查权限" -ForegroundColor Red
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
