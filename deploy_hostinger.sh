#!/bin/bash
# Script de Deploy para Hostinger

echo "================================================"
echo "  NEXO GESTOR - Deploy para Hostinger"
echo "================================================"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Criar diretório de deploy
DEPLOY_DIR="deploy_hostinger"
echo -e "${YELLOW}Criando diretório de deploy...${NC}"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copiar arquivos HTML
echo -e "${YELLOW}Copiando arquivos HTML...${NC}"
cp *.html $DEPLOY_DIR/

# Copiar CSS
echo -e "${YELLOW}Copiando CSS...${NC}"
cp *.css $DEPLOY_DIR/

# Copiar JavaScript do cliente
echo -e "${YELLOW}Copiando JavaScript...${NC}"
cp notifications.js $DEPLOY_DIR/
cp permissions.js $DEPLOY_DIR/

# Copiar servidor
echo -e "${YELLOW}Copiando servidor...${NC}"
cp server.js $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/

# Copiar configurações
echo -e "${YELLOW}Copiando configurações...${NC}"
mkdir -p $DEPLOY_DIR/config
cp -r config/* $DEPLOY_DIR/config/ 2>/dev/null || true
cp .env.production $DEPLOY_DIR/.env

# Copiar pasta nexo (banco de dados)
echo -e "${YELLOW}Copiando banco de dados...${NC}"
mkdir -p $DEPLOY_DIR/data
cp -r nexo/* $DEPLOY_DIR/data/ 2>/dev/null || true
cp agenda2.db $DEPLOY_DIR/data/ 2>/dev/null || true

# Criar pasta uploads
echo -e "${YELLOW}Criando pasta uploads...${NC}"
mkdir -p $DEPLOY_DIR/uploads
touch $DEPLOY_DIR/uploads/.gitkeep

# Copiar documentação
echo -e "${YELLOW}Copiando documentação...${NC}"
cp README.md $DEPLOY_DIR/ 2>/dev/null || true
cp DEPLOY_HOSTINGER.md $DEPLOY_DIR/INSTRUCOES_DEPLOY.md 2>/dev/null || true

# Criar arquivo de instruções
cat > $DEPLOY_DIR/LEIA-ME_PRIMEIRO.txt << 'EOF'
==============================================
  NEXO GESTOR - Instruções de Deploy
==============================================

ANTES DE FAZER UPLOAD:

1. Edite o arquivo .env e altere SECRET_KEY
2. Se tiver um domínio específico, configure CORS_ORIGIN

PASSOS PARA HOSTINGER:

1. Acesse hPanel → FileZilla ou Gerenciador de Arquivos
2. Faça upload de TODOS os arquivos desta pasta para /public_html
3. Acesse hPanel → Aplicações Node.js → Criar Aplicação
4. Configure:
   - Versão: Node.js 18.x ou superior
   - Diretório: /public_html
   - Arquivo de inicialização: server.js
   - Modo: Produção
5. Adicione as variáveis de ambiente do arquivo .env
6. Conecte via SSH e execute:
   npm install
   npm start

Pronto! Seu site estará no ar.

Para mais detalhes, veja INSTRUCOES_DEPLOY.md
EOF

# Listar arquivos
echo ""
echo -e "${GREEN}Arquivos prontos para deploy em: $DEPLOY_DIR/${NC}"
echo ""
echo "Conteúdo:"
ls -lah $DEPLOY_DIR/
echo ""
echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}  PRÓXIMOS PASSOS:${NC}"
echo -e "${YELLOW}================================================${NC}"
echo "1. Revise o arquivo $DEPLOY_DIR/.env"
echo "2. Altere SECRET_KEY para uma chave forte"
echo "3. Faça upload da pasta $DEPLOY_DIR para Hostinger"
echo ""
echo -e "${GREEN}Deploy preparado com sucesso!${NC}"
