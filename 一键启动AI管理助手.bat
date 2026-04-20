@echo off
chcp 65001 >nul
title AI管理能力提升助手启动器
echo 正在检查本地服务器状态...

netstat -ano | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo 服务器已经在运行了，直接为您打开网页...
    start http://localhost:3001/
) else (
    echo 服务器未启动，正在启动中...
    start "Vite Dev Server" cmd /k "cd /d %~dp0 && npm run dev"
    echo 等待服务器就绪...
    timeout /t 3 /nobreak >nul
    start http://localhost:3001/
)

echo 完成！
timeout /t 2 /nobreak >nul
exit
