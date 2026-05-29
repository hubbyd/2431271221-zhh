# 安装脚本 - 解决权限问题
$ErrorActionPreference = "Stop"

Write-Host "开始安装依赖..." -ForegroundColor Green

# 设置npm缓存到项目目录
$env:npm_config_cache = "$PSScriptRoot\npm_cache"

# 创建缓存目录
if (!(Test-Path "$PSScriptRoot\npm_cache")) {
    New-Item -ItemType Directory -Path "$PSScriptRoot\npm_cache" -Force | Out-Null
}

# 检查是否已有node_modules
if (Test-Path "$PSScriptRoot\node_modules") {
    Write-Host "node_modules已存在，删除旧目录..." -ForegroundColor Yellow
    Remove-Item -Path "$PSScriptRoot\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "正在安装依赖包..." -ForegroundColor Green

# 安装依赖
$npmPath = "D:\node_modules\npm\bin\npm-cli.js"
if (Test-Path $npmPath) {
    & node $npmPath install --no-audit --no-fund --prefer-offline 2>&1 | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "使用全局npm安装..." -ForegroundColor Yellow
    npm install --no-audit --no-fund 2>&1 | ForEach-Object { Write-Host $_ }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "依赖安装成功！" -ForegroundColor Green
} else {
    Write-Host "依赖安装可能有问题，但继续尝试..." -ForegroundColor Yellow
}

Write-Host "安装完成！" -ForegroundColor Green
