@echo off
chcp 65001 > nul
cls
echo.
echo ╔════════════════════════════════════════════╗
echo ║   NEXO GESTOR - Deploy Rápido             ║
echo ╔════════════════════════════════════════════╝
echo.
echo [1/4] Mudando para diretório...
cd /d "d:\NEXO GESTOR"
echo      ✓ OK
echo.
echo [2/4] Adicionando arquivos ao Git...
git add drivdoc.html drivfotos.html membros.html projetos.html commit_and_deploy.bat integrate_notify.ps1 check_all_quotes.ps1 DIAGNOSTICO_RAPIDO.md
echo      ✓ OK
echo.
echo [3/4] Criando commit...
git commit -m "Fix: Corrigir aspas em fetch() - documentos, fotos, membros e projetos"
echo      ✓ OK
echo.
echo [4/4] Enviando para GitHub (deploy automático)...
git push origin main
echo      ✓ OK
echo.
echo ╔════════════════════════════════════════════╗
echo ║   ✅ DEPLOY CONCLUÍDO!                     ║
echo ╔════════════════════════════════════════════╝
echo.
echo Aguarde 2-3 minutos para o Hostinger processar.
echo.
echo 📋 TESTE AS SEGUINTES FUNCIONALIDADES:
echo    • Upload de documentos (drivdoc.html)
echo    • Upload de fotos (drivfotos.html)
echo    • Adicionar membro (membros.html)
echo    • Adicionar projeto (projetos.html)
echo    • Criar dashboard de pregações (dashboard.html)
echo.
pause
