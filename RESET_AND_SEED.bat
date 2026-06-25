@echo off
title ShopSphere - Reset Database
color 0E

echo.
echo  ==========================================
echo   ShopSphere - Reset and Seed Database
echo  ==========================================
echo.
echo  WARNING: This will DELETE all current data
echo  and create fresh demo data.
echo.
set /p confirm="Type YES to continue: "
if /i not "%confirm%"=="YES" (
    echo  Cancelled.
    pause
    exit
)

cd /d "%~dp0"

echo.
echo  [1/4] Deleting old database...
if exist db.sqlite3 del /f /q db.sqlite3
echo        Done.

echo  [2/4] Running migrations...
python manage.py migrate >nul 2>&1
echo        Done.

echo  [3/4] Seeding demo data...
python manage.py seed_db
echo.

echo  [4/4] Creating fresh static files...
python manage.py collectstatic --noinput >nul 2>&1
echo        Done.

echo.
echo  ==========================================
echo   Database reset complete!
echo.
echo   Admin Login : admin / admin123
echo   Test Users  : user1 to user10 / pass1234
echo   Coupons     : WELCOME10, SAVE20, FLASH15,
echo                 FESTIVE25, STUDENT5
echo  ==========================================
echo.
pause
