# PowerShell script to start both API server and React Native app

Write-Host "🚀 Starting Solmate Full Stack Application..." -ForegroundColor Blue

# Function to cleanup background processes
function Cleanup {
    Write-Host "`n⏹️  Stopping services..." -ForegroundColor Yellow
    # Stop background jobs
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    exit 0
}

# Handle Ctrl+C
$null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

try {
    # Start API Server
    Write-Host "📡 Starting API Server..." -ForegroundColor Green
    
    # Start server in background
    Start-Job -Name "APIServer" -ScriptBlock {
        Set-Location $using:PWD\server
        node index.js
    } | Out-Null
    
    # Wait for server to start
    Start-Sleep -Seconds 3
    
    # Check if API server is running
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5
        Write-Host "✅ API Server running on http://localhost:3001" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ API Server failed to start" -ForegroundColor Red
        Get-Job | Stop-Job
        Get-Job | Remove-Job
        exit 1
    }
    
    # Start React Native app
    Write-Host "📱 Starting React Native App..." -ForegroundColor Green
    Start-Job -Name "ReactNative" -ScriptBlock {
        Set-Location $using:PWD
        npm start
    } | Out-Null
    
    Write-Host "🎉 Both services are starting up!" -ForegroundColor Blue
    Write-Host "📍 API Server: http://localhost:3001" -ForegroundColor Yellow
    Write-Host "📍 React Native: http://localhost:8081" -ForegroundColor Yellow
    Write-Host "📍 Press Ctrl+C to stop all services" -ForegroundColor Yellow
    
    # Keep script running and show job output
    while ($true) {
        # Get job outputs
        Get-Job | Receive-Job
        Start-Sleep -Seconds 1
        
        # Check if jobs are still running
        $runningJobs = Get-Job | Where-Object { $_.State -eq "Running" }
        if ($runningJobs.Count -eq 0) {
            Write-Host "All services have stopped." -ForegroundColor Yellow
            break
        }
    }
}
finally {
    Cleanup
}
