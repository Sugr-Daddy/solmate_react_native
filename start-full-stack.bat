@echo off
title Solmate Full Stack

echo.
echo 🚀 Starting Solmate Full Stack Application...
echo.

echo 📡 Starting API Server...
start "API Server" cmd /k "cd server && node index.js"

echo ⏳ Waiting for API server to start...
timeout /t 5 > nul

echo 📱 Starting React Native App...
start "React Native" cmd /k "npm start"

echo.
echo 🎉 Both services are starting up!
echo 📍 API Server: http://localhost:3001
echo 📍 React Native: http://localhost:8081
echo.
echo Press any key to open the web app...
pause > nul

start http://localhost:8081

echo.
echo Services are running in separate windows.
echo Close those windows to stop the services.
pause
