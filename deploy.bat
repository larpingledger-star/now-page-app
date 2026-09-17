@echo off
setlocal enabledelayedexpansion
echo ==========================================
echo   Now Page - Cloudflare Deployment Script
echo ==========================================
echo.

echo [1/7] Checking wrangler login...
call npx wrangler whoami
if errorlevel 1 (
    echo You need to log in first. Running: npx wrangler login
    call npx wrangler login
)
echo.

echo [2/7] Creating D1 Database...
for /f "tokens=*" %%i in ('call npx wrangler d1 create now-page-db 2^>^&1') do (
    echo %%i
    echo %%i | findstr /C:"database_id" > nul
    if not errorlevel 1 (
        for /f "tokens=2 delims= " %%j in ("%%i") do set DB_ID=%%j
    )
)
echo Database ID: %DB_ID%
echo.

echo [3/7] Running database migrations...
call npx wrangler d1 execute now-page-db --file=worker/schema.sql --remote
echo.

echo [4/7] Creating R2 Bucket...
call npx wrangler r2 bucket create now-page-uploads 2>nul || echo Bucket may already exist
echo.

echo [5/7] Deploying Worker API...
call npx wrangler deploy
echo.

echo [6/7] Building frontend...
call npx vite build
echo.

echo [7/7] Deploying Frontend to Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=now-page
echo.

echo ==========================================
echo   Deployment Complete!
echo ==========================================
echo.
echo Your API Worker and frontend Pages site are deployed.
echo.
echo Next steps:
echo   1. Go to Cloudflare Dashboard ^> Pages ^> now-page ^> Settings
echo   2. Add environment variable: VITE_API_URL = https://now-page-api.YOUR_SUBDOMAIN.workers.dev
echo   3. Redeploy to pick up the env var
echo   4. Add your custom domain under Custom Domains
echo.
