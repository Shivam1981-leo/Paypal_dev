# PayGuard AI - Database & Infrastructure Setup Script

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PayGuard AI - Database Services Setup (Windows)        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker status
Write-Host "[1/3] Checking Docker..." -ForegroundColor Yellow
$dockerProcess = Get-Process -Name "*docker*" -ErrorAction SilentlyContinue

if ($dockerProcess) {
    Write-Host " Docker Desktop is running! Starting containers via docker-compose..." -ForegroundColor Green
    docker compose up -d
    Write-Host " Containers started:" -ForegroundColor Green
    docker ps
} else {
    Write-Host " Docker Desktop is not currently running." -ForegroundColor Gray
    Write-Host " If you want to use Docker (Recommended):" -ForegroundColor White
    Write-Host "   1. Open 'Docker Desktop' from your Windows Start Menu" -ForegroundColor White
    Write-Host "   2. Run: docker compose up -d" -ForegroundColor White
}

Write-Host ""
Write-Host "[2/3] Local Standalone Installers & Binaries:" -ForegroundColor Yellow

# Check PostgreSQL installer
$pgInstaller = "d:\paypal_dev\downloads\postgresql-17.2-1-windows-x64.exe"
if (Test-Path $pgInstaller) {
    Write-Host " PostgreSQL 17 Installer is ready in downloads folder:" -ForegroundColor Green
    Write-Host "   Path: $pgInstaller" -ForegroundColor White
    Write-Host "   To install, run the installer and use:" -ForegroundColor Gray
    Write-Host "     - Port: 5432" -ForegroundColor Gray
    Write-Host "     - Password: dev_password" -ForegroundColor Gray
    Write-Host "     - Database: payguard_dev" -ForegroundColor Gray
} else {
    Write-Host " PostgreSQL installer is being downloaded." -ForegroundColor Gray
}

# Check Redis folder
$redisExe = "d:\paypal_dev\services\redis\redis-server.exe"
if (Test-Path $redisExe) {
    Write-Host " Redis for Windows is ready:" -ForegroundColor Green
    Write-Host "   Path: d:\paypal_dev\services\redis\" -ForegroundColor White
    Write-Host "   To run standalone Redis: Start-Process $redisExe" -ForegroundColor White
}

# Check Elasticsearch zip
$esZip = "d:\paypal_dev\downloads\elasticsearch-8.16.0-windows-x86_64.zip"
if (Test-Path $esZip) {
    Write-Host " Elasticsearch 8.16.0 ZIP is downloaded:" -ForegroundColor Green
    Write-Host "   Path: $esZip" -ForegroundColor White
} else {
    Write-Host " Elasticsearch zip is downloading in background." -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Setup options overview displayed." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

