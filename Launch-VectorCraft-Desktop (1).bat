@echo off
:: ==============================================================
:: VectorCraft AI Logo Maker - Windows Desktop Studio
:: 100% OFFLINE LOCAL - Zero Google login or 403 Forbidden errors
:: ==============================================================
title VectorCraft Desktop Studio
cd /d "%~dp0"

echo.
echo ============================================================
echo   Starting VectorCraft Desktop Studio (100%% Offline Local)
echo ============================================================
echo.

set "HTML_FILE=%~dp0VectorCraft.html"

:: 1. Launch with Microsoft Edge in dedicated borderless App Mode
start msedge.exe --app="file:///%HTML_FILE:\=/%" --window-size=1440,900
if %errorlevel% == 0 (
  echo VectorCraft launched successfully in Edge App Mode!
  timeout /t 2 >nul
  exit
)

:: 2. Launch with Google Chrome in dedicated borderless App Mode
start chrome.exe --app="file:///%HTML_FILE:\=/%" --window-size=1440,900
if %errorlevel% == 0 (
  echo VectorCraft launched successfully in Chrome App Mode!
  timeout /t 2 >nul
  exit
)

:: 3. Fallback to default Windows web browser
start "" "%HTML_FILE%"
exit
