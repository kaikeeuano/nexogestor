@echo off
cd /d "d:\NEXO GESTOR"
git add .
git commit -m "Fix: Corrigir aspas em dashboard_membros - gerenciamento de usuarios e relatorios"
git push origin main
echo.
echo ========================================
echo   DEPLOY CONCLUIDO!
echo ========================================
echo.
echo Aguarde 2-3 minutos para deploy no Hostinger.
echo.
echo CORRECOES APLICADAS:
echo - Dashboard Membros: loadConfig e loadMembers
echo - Gerenciamento de usuarios do dashboard
echo - Sistema de relatorios e graficos
echo.
pause
