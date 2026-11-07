@echo off
echo Starting PostgreSQL 18 Server on port 5432...
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" start
echo PostgreSQL started!
pause
