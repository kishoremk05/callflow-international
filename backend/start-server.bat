@echo off
echo ========================================
echo  Starting Backend Server
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "server-single.js" (
    echo ERROR: server-single.js not found!
    echo Please run this script from the backend folder
    echo.
    echo Current directory: %CD%
    echo.
    pause
    exit /b 1
)

echo Starting server on port 5000...
echo.
echo Keep this window open!
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

node server-single.js

pause
