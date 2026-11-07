# PayGuard AI - PostgreSQL Database Setup Script (PowerShell)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Setting up PayGuard AI PostgreSQL Database & Tables   " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$pgBin = "C:\Program Files\PostgreSQL\18\bin"
$pgData = "C:\Program Files\PostgreSQL\18\data"

# 1. Start PostgreSQL
Write-Host "[1/4] Ensuring PostgreSQL is running..." -ForegroundColor Yellow
& "$pgBin\pg_ctl.exe" -D "$pgData" start
Start-Sleep -Seconds 2

# 2. Create User and Databases
Write-Host "[2/4] Creating database and user..." -ForegroundColor Yellow
& "$pgBin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -c "DO `$do`$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'payguard') THEN CREATE ROLE payguard WITH LOGIN SUPERUSER PASSWORD 'dev_password'; END IF; END `$do`$;"
& "$pgBin\createdb.exe" -U postgres -h 127.0.0.1 -p 5432 -O payguard payguard_dev 2>$null
& "$pgBin\createdb.exe" -U postgres -h 127.0.0.1 -p 5432 -O payguard payguard_test 2>$null

# 3. Run Migrations
Write-Host "[3/4] Running database migrations..." -ForegroundColor Yellow
Set-Location -Path "d:\paypal_dev\backend"
npm run db:migrate

# 4. Seed Data
Write-Host "[4/4] Seeding demo merchants and transactions..." -ForegroundColor Yellow
npm run db:seed

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "✅ Database setup complete! Demo account is ready:" -ForegroundColor Green
Write-Host "   Email:    demo@payguard.ai" -ForegroundColor White
Write-Host "   Password: Demo123!" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
