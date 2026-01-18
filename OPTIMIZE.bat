@echo off
echo.
echo ========================================
echo   OTIMIZAR PERFORMANCE DO SITE
echo ========================================
echo.

cd /d "d:\NEXO GESTOR"

echo [1/4] Instalando pacote de compressao...
call npm install compression
echo      ✓ OK
echo.

echo [2/4] Criando indices no banco de dados...
node optimize_performance.js
echo      ✓ OK
echo.

echo [3/4] Compactando banco de dados...
node vacuum_db.js
echo      ✓ OK
echo.

echo [4/4] Fazendo commit e deploy...
git add .
git commit -m "Performance: Adicionar compressao gzip, cache e indices no banco"
git push origin main
echo      ✓ OK
echo.

echo ========================================
echo   ✅ OTIMIZACAO CONCLUIDA!
echo ========================================
echo.
echo MELHORIAS APLICADAS:
echo • Compressao gzip habilitada
echo • Cache de arquivos estaticos (1 dia)
echo • Cache de uploads (7 dias)
echo • 25+ indices no banco de dados
echo • Banco compactado com VACUUM
echo.
echo AGUARDE 2-3 MINUTOS PARA DEPLOY.
echo Depois reinicie o servidor no Hostinger.
echo.
pause
