@echo off
title ShopSphere - Starting Server
color 0A

echo.
echo  ==========================================
echo   ShopSphere - MCA Final Year Project
echo  ==========================================
echo.

cd /d "%~dp0"

echo  [1/3] Checking database migrations...
python manage.py migrate --run-syncdb >nul 2>&1
echo        Done.

echo  [2/3] Collecting static files...
python manage.py collectstatic --noinput >nul 2>&1
echo        Done.

echo  [3/3] Starting server...
echo.
echo  ==========================================
echo   Server running at: http://127.0.0.1:8000
echo   Admin Panel:       http://127.0.0.1:8000/admin
echo.
echo   Admin Login:  admin / admin123
echo   Test User:    user1 / pass1234
echo.
echo   Press CTRL+C to stop the server
echo  ==========================================
echo.

start "" "http://127.0.0.1:8000"
python manage.py runserver
pause
