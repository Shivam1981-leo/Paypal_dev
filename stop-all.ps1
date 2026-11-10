# PayGuard AI - Windows Stop All Services Script

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PayGuard AI - Stopping All Services & Ports            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

function Stop-PortProcess([int]$port, [string]$name) {
    try {
        $lines = netstat -ano | Select-String ":$port\s+.*LISTENING"
        if ($lines) {
            foreach ($line in $lines) {
                $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
                $pidVal = $parts[-1]
                if ($pidVal -match '^\d+$' -and [int]$pidVal -gt 0) {
                    Write-Host "🛑 Stopping $name on port $port (PID: $pidVal)..." -ForegroundColor Yellow
                    Stop-Process -Id ([int]$pidVal) -Force -ErrorAction SilentlyContinue
                }
            }
            Write-Host "✅ Port $port cleared ($name)" -ForegroundColor Green
        } else {
            Write-Host "ℹ️ Port $port is already clear ($name)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️ Could not inspect port $port" -ForegroundColor Red
    }
}

# 1. Stop Frontend (port 3000)
Stop-PortProcess 3000 "Frontend (Next.js)"

# 2. Stop Backend (port 3001)
Stop-PortProcess 3001 "Backend API (Fastify)"

# 3. Stop ML Service (port 8000)
Stop-PortProcess 8000 "ML Fraud Service (FastAPI)"

# 4. Stop Elasticsearch (port 9200)
Stop-PortProcess 9200 "Elasticsearch"

# 5. Stop Redis
$redisProcesses = Get-Process -Name "*redis*" -ErrorAction SilentlyContinue
if ($redisProcesses) {
    Write-Host "🛑 Stopping Redis..." -ForegroundColor Yellow
    $redisProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Redis stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Redis is not running" -ForegroundColor Gray
}

# 6. Stop PostgreSQL
$pgCtl = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$pgData = "C:\Program Files\PostgreSQL\18\data"
if (Test-Path $pgCtl) {
    Write-Host "🛑 Stopping PostgreSQL 18..." -ForegroundColor Yellow
    & $pgCtl stop -D $pgData -m fast | Out-Null
    Write-Host "✅ PostgreSQL 18 stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "All PayGuard AI processes and ports have been cleanly stopped." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

