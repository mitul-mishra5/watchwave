@echo off
setlocal
cd /d "%~dp0"
if not exist .env copy .env.example .env
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20.9+ is required. Install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and npm logs.
    pause
    exit /b 1
  )
)
call npm run dev
