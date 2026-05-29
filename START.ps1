Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Mountain Travel Pro" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "D:\profiles-vscode\travel"

Write-Host "[Step 1/4] Checking Node.js..." -ForegroundColor Yellow
if (Test-Path "D:\node.exe") {
    Write-Host "OK: Node.js found" -ForegroundColor Green
} else {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "[Step 2/4] Installing dependencies..." -ForegroundColor Yellow

$npmCli = "D:\node_modules\npm\bin\npm-cli.js"
if (Test-Path $npmCli) {
    & D:\node.exe $npmCli install --no-audit --no-fund
} else {
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
}

if (Test-Path "node_modules") {
    Write-Host "OK: Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[Step 3/4] Initializing database..." -ForegroundColor Yellow
& D:\node.exe "D:\profiles-vscode\travel\init-db.js"
Write-Host "OK: Database initialized" -ForegroundColor Green

Write-Host ""
Write-Host "[Step 4/4] Starting server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Server started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "User App: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Admin Panel: http://localhost:8080/admin.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin account:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin2024" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

& D:\node.exe "D:\profiles-vscode\travel\server.js"
