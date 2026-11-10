# PayGuard AI - Complete Windows Development Startup Script
$Host.UI.RawUI.WindowTitle = "PayGuard AI Master Controller"

Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "             [PayGuard AI] Launching Complete System Stack                 " -ForegroundColor Cyan
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Function to test if a local port is listening
function Test-PortOpen([int]$port) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

# -----------------------------------------------------------------------------
# 0. Clean Up Stale Locks
# -----------------------------------------------------------------------------
Write-Host "[0/6] Checking for stale locks..." -ForegroundColor Gray

# Stale PostgreSQL postmaster.pid
$pgPidFile = "C:\Program Files\PostgreSQL\18\data\postmaster.pid"
if (Test-Path $pgPidFile) {
    try {
        $firstLine = (Get-Content $pgPidFile | Select-Object -First 1) -as [int]
        $pgProc = Get-Process -Id $firstLine -ErrorAction SilentlyContinue
        if (-not $pgProc) {
            Write-Host "  Removing stale postmaster.pid (PID $firstLine is dead)" -ForegroundColor Yellow
            Remove-Item $pgPidFile -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}

# Stale Next.js dev lock
$nextLock = Join-Path $root "frontend\.next\dev\lock"
if (Test-Path $nextLock) {
    Remove-Item $nextLock -Force -ErrorAction SilentlyContinue
}

# -----------------------------------------------------------------------------
# 1. Start PostgreSQL 18 (Port 5432)
# -----------------------------------------------------------------------------
Write-Host "[1/6] Starting PostgreSQL 18 on port 5432..." -ForegroundColor Yellow
$pgCtl = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$pgData = "C:\Program Files\PostgreSQL\18\data"

if (Test-PortOpen 5432) {
    Write-Host "  [OK] PostgreSQL 18 is already listening on port 5432" -ForegroundColor Green
} elseif (Test-Path $pgCtl) {
    Start-Process -FilePath $pgCtl -ArgumentList "-D `"$pgData`" start" -WindowStyle Minimized
    for ($i = 0; $i -lt 10; $i++) {
        Start-Sleep -Milliseconds 500
        if (Test-PortOpen 5432) { break }
    }
    if (Test-PortOpen 5432) {
        Write-Host "  [OK] PostgreSQL 18 started and listening on port 5432" -ForegroundColor Green
    } else {
        Write-Host "  [INFO] PostgreSQL launched (port 5432)" -ForegroundColor Green
    }
} else {
    Write-Host "  [WARN] PostgreSQL pg_ctl not found at $pgCtl" -ForegroundColor Red
}

# -----------------------------------------------------------------------------
# 2. Start Redis (Port 6379)
# -----------------------------------------------------------------------------
Write-Host "[2/6] Starting Redis on port 6379..." -ForegroundColor Yellow
$redisExe = "C:\Program Files\Redis\redis-server.exe"
$redisConf = "C:\Program Files\Redis\redis.windows.conf"

if (Test-PortOpen 6379) {
    Write-Host "  [OK] Redis is already listening on port 6379" -ForegroundColor Green
} elseif (Test-Path $redisExe) {
    Start-Process -FilePath $redisExe -ArgumentList "`"$redisConf`"" -WindowStyle Minimized
    Start-Sleep -Milliseconds 800
    Write-Host "  [OK] Redis launched on port 6379" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Redis executable not found at $redisExe" -ForegroundColor Red
}

# -----------------------------------------------------------------------------
# 3. Start Elasticsearch (Port 9200 - Optional)
# -----------------------------------------------------------------------------
Write-Host "[3/6] Checking Elasticsearch on port 9200..." -ForegroundColor Yellow
$esBat = "D:\setups\elasticsearch-9.5.6-windows-x86_64\elasticsearch-9.5.6\bin\elasticsearch.bat"

if (Test-PortOpen 9200) {
    Write-Host "  [OK] Elasticsearch is already running on port 9200" -ForegroundColor Green
} elseif (Test-Path $esBat) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$esBat`"" -WindowStyle Minimized
    Write-Host "  [OK] Elasticsearch 9.5.6 launching in background" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Elasticsearch bat not found, skipping (optional)" -ForegroundColor Gray
}

# -----------------------------------------------------------------------------
# 4. Start Python FastAPI ML Service (Port 8000)
# -----------------------------------------------------------------------------
Write-Host "[4/6] Starting ML Fraud Intelligence Service on port 8000..." -ForegroundColor Yellow
if (Test-PortOpen 8000) {
    Write-Host "  [OK] ML Service is already running on port 8000" -ForegroundColor Green
} else {
    $mlDir = Join-Path $root "ml\src\api"
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'PayGuard AI - ML Service (port 8000)'; cd '$mlDir'; python -m uvicorn main:app --port 8000"
    Write-Host "  [OK] ML Service launched in dedicated window (http://localhost:8000)" -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# 5. Start Fastify Backend API (Port 3001)
# -----------------------------------------------------------------------------
Write-Host "[5/6] Starting Backend Fastify API on port 3001..." -ForegroundColor Yellow
if (Test-PortOpen 3001) {
    Write-Host "  [OK] Backend API is already running on port 3001" -ForegroundColor Green
} else {
    $backendDir = Join-Path $root "backend"
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'PayGuard AI - Backend API (port 3001)'; cd '$backendDir'; npm run dev"
    Write-Host "  [OK] Backend API launched in dedicated window (http://localhost:3001)" -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# 6. Start Next.js Frontend Dashboard (Port 3000)
# -----------------------------------------------------------------------------
Write-Host "[6/6] Starting Next.js Web Dashboard on port 3000..." -ForegroundColor Yellow
if (Test-PortOpen 3000) {
    Write-Host "  [OK] Frontend Dashboard is already running on port 3000" -ForegroundColor Green
} else {
    $frontendDir = Join-Path $root "frontend"
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'PayGuard AI - Frontend Web (port 3000)'; cd '$frontendDir'; npm run dev"
    Write-Host "  [OK] Frontend Web launched in dedicated window (http://localhost:3000)" -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# Verification & Browser Launch
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "Waiting for web console to become ready..." -ForegroundColor Yellow

for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    if (Test-PortOpen 3000) { break }
}

Write-Host ""
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "               ALL PAYGUARD AI SERVICES ARE ACTIVE!                        " -ForegroundColor Green
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Web Console:         http://localhost:3000" -ForegroundColor White
Write-Host "  1-Click Login:       http://localhost:3000/login" -ForegroundColor White
Write-Host "  Fastify API:         http://localhost:3001" -ForegroundColor White
Write-Host "  ML Swagger Docs:     http://localhost:8000/docs" -ForegroundColor White
Write-Host "  PostgreSQL:          localhost:5432 (payguard_dev)" -ForegroundColor White
Write-Host "  Redis Cache:         localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "  Demo Login Credentials:" -ForegroundColor Yellow
Write-Host "     Demo Store:          demo@payguard.ai / Demo123!" -ForegroundColor Gray
Write-Host "     Luxury Palace:       fashion@luxurypalace.com / Luxury123!" -ForegroundColor Gray
Write-Host "     GameVault Digital:   support@gamingvouchers.io / Gaming123!" -ForegroundColor Gray
Write-Host "     EcoBean Coffee:      orders@ecocoffee.co / Coffee123!" -ForegroundColor Gray
Write-Host ""
Write-Host "===========================================================================" -ForegroundColor Cyan

# Open default browser directly to the site
Start-Process "http://localhost:3000/login"

Write-Host "Opening http://localhost:3000/login in your browser..." -ForegroundColor Green
Write-Host "To stop all services anytime, run: .\stop-all.bat" -ForegroundColor Cyan
