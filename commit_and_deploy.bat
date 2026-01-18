@echo off
echo ========================================
echo    NEXO GESTOR - Commit e Deploy
echo ========================================
echo.

cd /d "d:\NEXO GESTOR"

echo [1/4] Adicionando arquivos...
git add -A

echo.
echo [2/4] Criando commit...
git commit -m "Corrigir aspas misturadas em fetch() - drivdoc, drivfotos, membros e projetos"

echo.
echo [3/4] Enviando para GitHub...
git push origin main

echo.
echo [4/4] Aguardando deploy no Hostinger...
echo Por favor, aguarde 2-3 minutos para o deploy automatico.
echo.
echo ✅ Processo concluido!
echo.
echo Teste as seguintes funcionalidades:
echo - Upload de documentos (drivdoc.html)
echo - Upload de fotos (drivfotos.html)
echo - Adicionar membro (membros.html)
echo - Adicionar projeto (projetos.html)
echo - Criar dashboard de pregacoes (dashboard.html)
echo.
pause
