@echo off
title Link 2 Download - Local Development
echo ========================================================
echo   Starting Link 2 Download (Local Mode)
echo ========================================================
echo.
echo 1. Starting FastAPI Backend on http://localhost:8000 ...
start "Link2Download Backend (Port 8000)" cmd /k "cd backend && .\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"

echo 2. Starting Frontend on http://localhost:3000 ...
start "Link2Download Frontend (Port 3000)" cmd /k "npm run dev"

echo.
echo Both servers are starting up:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:8000
echo   - API Docs:  http://localhost:8000/docs
echo.
echo Press any key to exit this launcher window (servers stay running)...
pause >nul
