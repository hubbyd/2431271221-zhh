@echo off
chcp 65001 > nul
echo.
echo ========================================
echo    AI助手配置向导
echo ========================================
echo.
echo 请选择AI服务提供商：
echo.
echo 1. Groq (推荐 - 完全免费，速度快)
echo 2. 硅基流动 (国内可用，有免费额度)
echo 3. 稍后手动配置
echo.
set /p choice=请输入选项 (1-3):

if "%choice%"=="1" (
    echo.
    echo 您选择了 Groq (完全免费)
    echo.
    echo 请访问 https://console.groq.com/ 注册并获取API密钥
    echo.
    set /p API_KEY=请输入API密钥 (gsk_开头):
    
    set AI_PROVIDER=groq
    set AI_API_KEY=%API_KEY%
    
    echo.
    echo 配置完成，正在启动服务器...
    echo.
    npm start
)

if "%choice%"=="2" (
    echo.
    echo 您选择了 硅基流动 (国内可用)
    echo.
    echo 请访问 https://www.siliconflow.cn/ 注册并获取API密钥
    echo.
    set /p API_KEY=请输入API密钥 (sk-开头):
    
    set AI_PROVIDER=siliconflow
    set AI_API_KEY=%API_KEY%
    
    echo.
    echo 配置完成，正在启动服务器...
    echo.
    npm start
)

if "%choice%"=="3" (
    echo.
    echo 跳过AI配置，以本地模式启动
    echo.
    echo 如需配置AI，请查看 AI-FREE-SETUP.md 文件
    echo.
    npm start
)
