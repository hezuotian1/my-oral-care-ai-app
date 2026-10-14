@echo off
chcp 65001 >nul

echo ============================================
echo   Oral Care AI  -  DEV MODE (hot reload)
echo   opens two windows: backend 3000 + vite 5173
echo ============================================
echo.

start "oral-care-backend" cmd /k "cd /d %~dp0server && npm run dev"
start "oral-care-frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Backend : http://localhost:3000
echo Frontend: http://localhost:5173   (open this one in dev mode)
echo.
echo Close the two new windows to stop.
pause
