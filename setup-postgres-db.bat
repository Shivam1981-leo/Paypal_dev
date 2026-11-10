@echo off
echo ========================================================
echo   Setting up PayGuard AI PostgreSQL Database & Tables
echo ========================================================
echo.

echo [1/4] Ensuring PostgreSQL is running...
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" -l "C:\Program Files\PostgreSQL\18\data\server.log" start
timeout /t 2 /nobreak >nul

echo [2/4] Creating database and user...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'payguard') THEN CREATE ROLE payguard WITH LOGIN SUPERUSER PASSWORD 'dev_password'; END IF; END $$;"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "SELECT 'CREATE DATABASE payguard_dev OWNER payguard' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'payguard_dev')\gexec"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "SELECT 'CREATE DATABASE payguard_test OWNER payguard' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'payguard_test')\gexec"

echo [3/4] Running database migrations...
cd /d "%~dp0backend"
call npm run db:migrate

echo [4/4] Seeding demo merchants and transactions...
call npm run db:seed

echo.
echo ========================================================
echo ✅ Database setup complete! Demo account is ready:
echo    Email: demo@payguard.ai
echo    Password: Demo123!
echo ========================================================
pause

