@echo off
echo === COMMIT E PUSH AUTOMATICO ===
cd /d "d:\NEXO GESTOR"

echo.
echo [1/3] Git Add...
git add -A

echo.
echo [2/3] Git Commit...
git commit -m "Corrigir aspas misturadas em todos os fetch()"

echo.
echo [3/3] Git Push...
git push

echo.
echo === CONCLUIDO ===
echo Aguarde 2-3 minutos para o deploy automático
pause
