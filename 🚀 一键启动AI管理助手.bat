@echo off






chcp 65001 >nul
title AI����������������������
echo ���ڼ�鱾�ط�����״̬...

netstat -ano | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo �������Ѿ��������ˣ�ֱ��Ϊ������ҳ...
    start http://localhost:3001/
) else (
    echo ������δ����������������...
    start "Vite Dev Server" cmd /k "cd /d %~dp0 && npm run dev"
    echo �ȴ�����������...
    timeout /t 3 /nobreak >nul
    start http://localhost:3001/
)

echo ��ɣ�
timeout /t 2 /nobreak >nul
exit



