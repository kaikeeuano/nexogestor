@echo off
REM Script de Deploy para Hostinger (Windows)

echo ================================================
echo   NEXO GESTOR - Deploy para Hostinger
echo ================================================
echo.

set DEPLOY_DIR=deploy_hostinger

REM Limpar e criar diretório de deploy
echo Criando diretorio de deploy...
if exist %DEPLOY_DIR% rmdir /s /q %DEPLOY_DIR%
mkdir %DEPLOY_DIR%

REM Copiar arquivos HTML
echo Copiando arquivos HTML...
xcopy /y *.html %DEPLOY_DIR%\ >nul

REM Copiar CSS
echo Copiando CSS...
xcopy /y *.css %DEPLOY_DIR%\ >nul

REM Copiar JavaScript do cliente
echo Copiando JavaScript...
xcopy /y notifications.js %DEPLOY_DIR%\ >nul
xcopy /y permissions.js %DEPLOY_DIR%\ >nul 2>nul

REM Copiar servidor
echo Copiando servidor...
xcopy /y server.js %DEPLOY_DIR%\ >nul
xcopy /y package.json %DEPLOY_DIR%\ >nul

REM Copiar configurações
echo Copiando configuracoes...
if exist config (
    mkdir %DEPLOY_DIR%\config
    xcopy /y /s config\* %DEPLOY_DIR%\config\ >nul
)
xcopy /y .env.production %DEPLOY_DIR%\.env >nul

REM Copiar banco de dados
echo Copiando banco de dados...
mkdir %DEPLOY_DIR%\data
if exist nexo xcopy /y /s nexo\* %DEPLOY_DIR%\data\ >nul
if exist agenda2.db xcopy /y agenda2.db %DEPLOY_DIR%\data\ >nul

REM Criar pasta uploads
echo Criando pasta uploads...
mkdir %DEPLOY_DIR%\uploads
type nul > %DEPLOY_DIR%\uploads\.gitkeep

REM Copiar documentação
echo Copiando documentacao...
if exist README.md xcopy /y README.md %DEPLOY_DIR%\ >nul
if exist DEPLOY_HOSTINGER.md xcopy /y DEPLOY_HOSTINGER.md %DEPLOY_DIR%\INSTRUCOES_DEPLOY.md >nul

REM Criar arquivo de instruções
echo Criando instrucoes de deploy...
(
echo ==============================================
echo   NEXO GESTOR - Instrucoes de Deploy
echo ==============================================
echo.
echo ANTES DE FAZER UPLOAD:
echo.
echo 1. Edite o arquivo .env e altere SECRET_KEY
echo 2. Se tiver um dominio especifico, configure CORS_ORIGIN
echo.
echo PASSOS PARA HOSTINGER:
echo.
echo 1. Acesse hPanel -^> FileZilla ou Gerenciador de Arquivos
echo 2. Faca upload de TODOS os arquivos desta pasta para /public_html
echo 3. Acesse hPanel -^> Aplicacoes Node.js -^> Criar Aplicacao
echo 4. Configure:
echo    - Versao: Node.js 18.x ou superior
echo    - Diretorio: /public_html
echo    - Arquivo de inicializacao: server.js
echo    - Modo: Producao
echo 5. Adicione as variaveis de ambiente do arquivo .env
echo 6. Conecte via SSH e execute:
echo    npm install
echo    npm start
echo.
echo Pronto! Seu site estara no ar.
echo.
echo Para mais detalhes, veja INSTRUCOES_DEPLOY.md
) > %DEPLOY_DIR%\LEIA-ME_PRIMEIRO.txt

echo.
echo ================================================
echo Arquivos prontos para deploy em: %DEPLOY_DIR%
echo ================================================
echo.
dir %DEPLOY_DIR%
echo.
echo ================================================
echo   PROXIMOS PASSOS:
echo ================================================
echo 1. Revise o arquivo %DEPLOY_DIR%\.env
echo 2. Altere SECRET_KEY para uma chave forte
echo 3. Faca upload da pasta %DEPLOY_DIR% para Hostinger
echo.
echo Deploy preparado com sucesso!
echo.
pause
