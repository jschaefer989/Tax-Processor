# Start development servers for Tax Processor
# Usage: .\dev.ps1

Write-Host "Starting Tax Processor development environment..." -ForegroundColor Green
Write-Host ""

# Kill any existing processes on ports 5000-5175
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process dotnet -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "dotnet" } | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend API
Write-Host "Starting .NET backend on port 5000..." -ForegroundColor Cyan
$backendProcess = Start-Process -NoNewWindow -PassThru -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory "$PSScriptRoot\TaxProcessor.Api"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend dev server
Write-Host "Starting Vite frontend on port 5173..." -ForegroundColor Cyan
$frontendProcess = Start-Process -NoNewWindow -PassThru -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory "$PSScriptRoot"

Write-Host ""
Write-Host "[OK] Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green
Write-Host "[OK] Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "Development environment ready:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow

# Wait for either process to exit
while ($backendProcess.HasExited -eq $false -and $frontendProcess.HasExited -eq $false) {
    Start-Sleep -Seconds 1
}

# Cleanup if one process dies
if ($backendProcess.HasExited -eq $false) {
    Stop-Process -Id $backendProcess.Id -Force
}
if ($frontendProcess.HasExited -eq $false) {
    Stop-Process -Id $frontendProcess.Id -Force
}

Write-Host ""
Write-Host "Development environment stopped." -ForegroundColor Yellow
