@echo off
chcp 65001 > nul
echo.
echo ========================================
echo    山河旅图Pro - 智能旅游社交平台
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 检查Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装！
    echo 请先下载安装：https://nodejs.org/zh-cn/download/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

echo.
echo [2/4] 安装依赖（可能需要几分钟）...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败！
    echo 请尝试手动运行：npm install
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo [3/4] 初始化数据库...
call npm run init-db
echo ✅ 数据库初始化完成

echo.
echo [4/4] 启动服务器...
echo.
echo ========================================
echo  🚀 服务器启动成功！
echo ========================================
echo.
echo 👤 用户端： http://localhost:8080
echo 🔐 管理员： http://localhost:8080/admin.html
echo.
echo 管理员账户：admin / admin2024
echo.
echo 按 Ctrl+C 停止服务器
echo.
echo ========================================
echo.

npm start
