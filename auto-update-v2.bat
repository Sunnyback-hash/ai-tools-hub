@echo off
setlocal EnableDelayedExpansion
chcp 65001 > nul

echo ===== AI Tools Hub Full Auto Update =====
echo Start: %date% %time%
echo.

REM Load .env credentials
if exist .env (
  for /f "tokens=1,* delims==" %%a in (.env) do (
    if not "%%a"=="" if not "%%a:~0,1"=="#" (
      set "%%a=%%b"
    )
  )
  echo [OK] Credentials loaded from .env
) else (
  echo [ERR] .env not found, exiting
  exit /b 1
)

REM Step 1: Discover new tools from web
echo.
echo [1/6] Discovering new AI tools from web...
node scripts/discover-tools-v2.js
if errorlevel 1 (
  echo [WARN] Discovery failed, continuing with existing tools
)

REM Step 2: Import new tools into database
echo.
echo [2/6] Importing new tools...
node scripts/import-tools.js
if errorlevel 1 (
  echo [WARN] Import failed, continuing
)

REM Step 3: Generate articles
echo.
echo [3/6] Generating SEO articles...
node scripts/generate-articles.js --count 5
if errorlevel 1 (
  echo [WARN] Article generation failed
)
node scripts/generate-blog-index.js
echo.

REM Step 4: Build site
echo [4/6] Building site...
node build.js
if errorlevel 1 (
  echo [ERR] Build failed, exiting
  goto :error
)
echo.

REM Step 5: Add version stamp to force CDN update
echo [5/6] Adding version stamp...
for /f %%i in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set BUILD_TS=%%i
echo <!-- Build: %BUILD_TS% --> >> dist\index.html
echo Version stamp: %BUILD_TS%
echo.

REM Step 6: Deploy to Cloudflare Pages
echo [6/6] Deploying to Cloudflare Pages...
npx --yes wrangler pages deploy dist --project-name aitoolshub --branch main --commit-dirty=true
if errorlevel 1 (
  echo [ERR] Deploy failed, exiting
  goto :error
)

echo.
echo ===== DONE =====
echo End: %date% %time%
endlocal
exit /b 0

:error
echo.
echo [ERR] Process terminated with error
endlocal
exit /b 1
