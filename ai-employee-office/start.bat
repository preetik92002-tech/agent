@echo off
rem Starts a tiny local web server for AI Employee Office and opens your browser.
rem Close this window (or press Ctrl+C) to stop it.
cd /d "%~dp0"
echo.
echo  AI Employee Office is starting at http://localhost:8000
echo  Keep this window open while you use the app. Close it to stop.
echo.
start "" http://localhost:8000
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000 --bind 127.0.0.1
) else (
  python -m http.server 8000 --bind 127.0.0.1
)
pause
