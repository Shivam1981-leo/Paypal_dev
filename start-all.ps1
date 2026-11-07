# PayGuard AI - Complete Windows Development Startup Script

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PayGuard AI - Starting Local Services & Application    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start PostgreSQL
Write-Host "[1/6] Starting PostgreSQL 18 on port 5432..." -ForegroundColor Yellow
$pgCtl = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$pgData = "C:\Program Files\PostgreSQL\18\data"
$pgProcess = Get-Process -Name "*postgres*" -ErrorAction SilentlyContinue

if ($pgProcess) {
    Write-Host "✅ PostgreSQL 18 is already running (port 5432)" -ForegroundColor Green
} elseif (Test-Path $pgCtl) {
    Start-Process -FilePath $pgCtl -ArgumentList "-D `"$pgData`" start" -WindowStyle Minimized
    Write-Host "✅ PostgreSQL 18 launched (port 5432)" -ForegroundColor Green
} else {
    Write-Host "⚠️ PostgreSQL pg_ctl not found at $pgCtl" -ForegroundColor Red
}

# 2. Start Redis
Write-Host "[2/6] Starting Redis on port 6379..." -ForegroundColor Yellow
$redisExe = "C:\Program Files\Redis\redis-server.exe"
$redisConf = "C:\Program Files\Redis\redis.windows.conf"
$redisProcess = Get-Process -Name "*redis*" -ErrorAction SilentlyContinue

if ($redisProcess) {
    Write-Host "✅ Redis is already running (port 6379)" -ForegroundColor Green
} elseif (Test-Path $redisExe) {
    Start-Process -FilePath $redisExe -ArgumentList "`"$redisConf`"" -WindowStyle Minimized
    Write-Host "✅ Redis started in background (port 6379)" -ForegroundColor Green
} else {
    Write-Host "⚠️ Redis executable not found at $redisExe" -ForegroundColor Red
}

# 3. Start Elasticsearch
Write-Host "[3/6] Starting Elasticsearch 9.5.6 on port 9200..." -ForegroundColor Yellow
$esBat = "D:\setups\elasticsearch-9.5.6-windows-x86_64\elasticsearch-9.5.6\bin\elasticsearch.bat"

if (Test-Path $esBat) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$esBat`"" -WindowStyle Minimized
    Write-Host "✅ Elasticsearch 9.5.6 launched in background (port 9200)" -ForegroundColor Green
} else {
    Write-Host "⚠️ Elasticsearch bat not found at $esBat" -ForegroundColor Red
}

# 4. Start ML Service
Write-Host "[4/6] Starting ML Fraud Service on port 8000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd 'd:\paypal_dev\ml\src\api'; python -m uvicorn main:app --reload --port 8000"
Write-Host "✅ ML Service window opened (http://localhost:8000)" -ForegroundColor Green

# 5. Start Backend API
Write-Host "[5/6] Starting Backend Fastify API on port 3001..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd 'd:\paypal_dev\backend'; npm run dev"
Write-Host "✅ Backend API window opened (http://localhost:3001)" -ForegroundColor Green

# 6. Start Frontend Dashboard
Write-Host "[6/6] Starting Frontend Dashboard on port 3000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd 'd:\paypal_dev\frontend'; npm run dev"
Write-Host "✅ Frontend window opened (http://localhost:3000)" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "All services initiated! Check each window for logs." -ForegroundColor Cyan
Write-Host "Frontend App:     http://localhost:3000" -ForegroundColor White
Write-Host "Backend API:      http://localhost:3001" -ForegroundColor White
Write-Host "ML Service Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "PostgreSQL:       localhost:5432" -ForegroundColor White
Write-Host "Redis:            localhost:6379" -ForegroundColor White
Write-Host "Elasticsearch:    http://localhost:9200" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
