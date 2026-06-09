@echo off
setlocal EnableDelayedExpansion
chcp 65001 > nul
echo ===== AI Tools Hub 自动更新部署 =====
echo 开始时间: %date% %time%
echo.

REM 从 .env 文件读取凭证
if exist .env (
  for /f "tokens=1,* delims==" %%a in (.env) do (
    if not "%%a"=="" if not "%%a:~0,1"=="#" (
      set "%%a=%%b"
    )
  )
  echo [OK] 已从 .env 加载凭证
) else (
  echo [ERR] .env 文件不存在，退出
  exit /b 1
)

echo [1/4] 发现新工具...
node scripts/discover-tools.js
echo.

echo [2/4] 生成文章...
node scripts/generate-articles.js --count 5
if errorlevel 1 (
  echo [ERR] 生成文章失败，退出
  goto :error
)
node scripts/generate-blog-index.js
echo.

echo [3/4] 构建站点...
node build.js
if errorlevel 1 (
  echo [ERR] 构建失败，退出
  goto :error
)
echo.

echo [4/4] 部署到 Cloudflare Pages...
npx --yes wrangler pages deploy dist --project-name aitoolshub --branch main
if errorlevel 1 (
  echo [ERR] 部署失败，退出
  goto :error
)

echo.
echo ===== 完成！=====
echo 结束时间: %date% %time%
endlocal
exit /b 0

:error
echo.
echo [ERR] 流程异常终止，请查看日志
endlocal
exit /b 1
