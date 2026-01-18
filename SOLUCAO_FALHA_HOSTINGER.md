# 🔧 Solução: Falha na Configuração Node.js Hostinger

## ⚡ Solução Rápida - Configuração Manual

### Passo 1: Verificar Estrutura de Arquivos

Certifique-se que no servidor você tem:
```
/public_html/
├── server.js          ✅ (arquivo principal)
├── package.json       ✅
├── data/             ✅
│   └── agenda2.db
├── uploads/          ✅
└── (demais arquivos HTML, CSS, JS)
```

---

## 🎯 Configuração Correta no hPanel

### No hPanel → Aplicações Node.js → Criar Aplicação:

```
┌─────────────────────────────────────────┐
│ Versão do Node.js: 18.x                 │
│                                          │
│ Modo da aplicação: Produção             │
│                                          │
│ Diretório da aplicação: public_html     │
│ (NÃO use /home/u175345975/public_html)  │
│                                          │
│ Arquivo de aplicação: server.js         │
│ (ou app.js se usar o alternativo)       │
│                                          │
│ Porta da aplicação: (deixe vazio)       │
│                                          │
└─────────────────────────────────────────┘
```

**⚠️ IMPORTANTE:** 
- Use apenas `public_html` (não o caminho completo)
- Use `server.js` (não Server.js)

---

## 🔨 Solução Alternativa 1: Usar app.js

Se `server.js` falhar, use o arquivo `app.js` criado:

1. Copie `app.js` para o servidor junto com os outros arquivos
2. Na configuração do hPanel, use:
   - **Arquivo de aplicação:** `app.js`

---

## 🔨 Solução Alternativa 2: Via SSH (Mais Confiável)

Conecte via SSH e configure manualmente:

```bash
# Conectar
ssh u175345975@147.93.37.46 -p 65002

# Navegar
cd public_html

# Verificar arquivos
ls -la

# Limpar node_modules antigo
rm -rf node_modules package-lock.json

# Instalar dependências
npm install --production

# Testar se funciona
node server.js
```

Se funcionar, pressione `Ctrl+C` e use PM2:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name nexo-gestor

# Salvar configuração
pm2 save

# Ver status
pm2 status

# Ver logs
pm2 logs nexo-gestor
```

---

## 🔨 Solução Alternativa 3: Usar .npmrc

Crie arquivo `.npmrc` no servidor:

```bash
# Via SSH
cd public_html
echo "engine-strict=false" > .npmrc
echo "legacy-peer-deps=true" >> .npmrc

# Reinstalar
npm install
```

---

## 🔨 Solução Alternativa 4: Package.json Simplificado

Substitua o `package.json` atual por este (mais simples):

```json
{
  "name": "nexo-gestor",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5"
  }
}
```

---

## 🔍 Diagnóstico de Erros Comuns

### Erro: "Cannot find module"
**Solução:**
```bash
cd public_html
npm install
```

### Erro: "EACCES: permission denied"
**Solução:**
```bash
chmod -R 755 public_html/
chmod 644 public_html/*.js
```

### Erro: "Address already in use"
**Solução:**
```bash
# Matar processos Node antigos
pkill -f node
pm2 delete all
```

### Erro: "bcrypt" ou "sqlite3" compilation failed
**Solução:**
```bash
# Reinstalar com rebuild
npm rebuild bcrypt
npm rebuild sqlite3
# Ou
npm install bcrypt --build-from-source
npm install sqlite3 --build-from-source
```

---

## 📋 Checklist de Verificação

Antes de criar a aplicação no hPanel:

- [ ] Arquivo `server.js` existe em `/public_html`
- [ ] Arquivo `package.json` existe em `/public_html`
- [ ] Pasta `data/` existe com o banco `agenda2.db`
- [ ] Pasta `uploads/` existe
- [ ] Permissões: `chmod 755 public_html/`
- [ ] Variáveis de ambiente configuradas no hPanel:
  - `SECRET_KEY`
  - `NODE_ENV=production`
  - `PORT=3000`

---

## 🚀 Passo a Passo Completo (Do Zero)

### 1. Limpar e Preparar

```bash
# SSH
ssh u175345975@147.93.37.46 -p 65002

# Limpar
cd public_html
rm -rf node_modules package-lock.json

# Backup do banco (se existir)
cp -r data data_backup 2>/dev/null || true
```

### 2. Copiar package.json Simplificado

Use o `package_hostinger.json` criado (renomeie para `package.json`)

### 3. Instalar Dependências

```bash
npm cache clean --force
npm install --production --verbose
```

### 4. Testar Localmente no Servidor

```bash
# Teste rápido
node server.js
```

Se aparecer "Server running on...", está funcionando!

### 5. Usar PM2 (Recomendado)

```bash
pm2 start server.js --name nexo-gestor --watch
pm2 save
pm2 startup
```

### 6. Acessar

https://olive-dugong-260110.hostingersite.com

---

## 💡 Dicas Finais

1. **Sempre use SSH** para debug mais preciso
2. **PM2 é mais confiável** que a interface do hPanel
3. **Verifique logs:** `pm2 logs` ou no hPanel
4. **Backup:** Sempre faça backup do banco antes de mexer

---

## 📞 Ainda com Problemas?

**Cole aqui:**
1. Mensagem de erro exata do hPanel
2. Resultado de: `ls -la /public_html`
3. Resultado de: `cat /public_html/package.json`
4. Logs da aplicação

E vou ajudar com solução específica!
