@echo off
echo Stopping all PayGuard AI services...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-all.ps1"
pause

