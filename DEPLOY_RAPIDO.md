# NEXO GESTOR - Quick Deploy Guide

## 🚀 Deploy Rápido (5 Passos)

### 1️⃣ Preparar Arquivos
```bash
# Windows
deploy_hostinger.bat

# Linux/Mac
chmod +x deploy_hostinger.sh && ./deploy_hostinger.sh
```

### 2️⃣ Configurar .env
Abra `deploy_hostinger/.env` e altere:
```env
SECRET_KEY=SuaChaveForteAqui123!@#
```

### 3️⃣ Upload
- FileZilla → Conecte ao FTP da Hostinger
- Envie tudo de `deploy_hostinger/` para `/public_html`

### 4️⃣ Configurar na Hostinger
- hPanel → Aplicações Node.js → Criar
- Versão: Node 18.x
- Diretório: `/public_html`
- Arquivo: `server.js`
- Adicione variáveis do .env

### 5️⃣ Instalar e Iniciar
```bash
ssh usuario@seudominio.com
cd public_html
npm install
npm start
```

**Pronto!** Acesse: `https://seudominio.com`

---

Para guia detalhado, veja [GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md)
