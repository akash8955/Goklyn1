# Stop any running Node.js processes
Get-Process | Where-Object { $_.ProcessName -eq 'node' } | Stop-Process -Force

# Start the backend server
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "./backend/server.js" -WorkingDirectory (Get-Location).Path

Write-Host "Backend server restarted successfully!"
