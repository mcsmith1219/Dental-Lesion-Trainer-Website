@REM Starts the server on Windows.
@echo off
echo Starting IDentiFind Backend Server...
echo.
echo Prerequisites:
echo - PostgreSQL container running on localhost:5432
echo - Database initialized with: npm run init-db
echo.
echo Starting Node.js server on port 3000...
node server/server.js
pause
