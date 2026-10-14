@echo off
chcp 65001 >nul
title Oral Care AI - Server (port 3000)
cd /d "%~dp0server"

echo ============================================
echo   Oral Care AI  -  single port 3000
echo   Backend + built frontend
echo ============================================
echo.
echo Opening http://localhost:3000 in a few seconds...
start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"
echo.
echo Press Ctrl+C to stop the server.
echo.

call npm start
pause
