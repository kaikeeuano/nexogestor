# ✅ NEXO GESTOR - Pronto para Deploy na Hostinger

## 🎉 Arquivos Organizados com Sucesso!

A pasta `deploy_hostinger/` foi criada com **todos os arquivos necessários** para colocar seu site no ar.

---

## 📂 O que foi preparado:

### ✅ Estrutura Criada:
```
deploy_hostinger/
├── 📄 27 arquivos HTML (index, login, dashboard, etc.)
├── 🎨 staly.css
├── 📜 server.js (API backend)
├── 📦 package.json (dependências)
├── ⚙️ config/ (configurações)
├── 💾 data/ (banco de dados)
├── 📁 uploads/ (para arquivos)
├── 🔐 .env (variáveis de ambiente)
└── 📖 LEIA-ME_PRIMEIRO.txt
```

**Total:** ~600 KB (sem node_modules)

---

## 🚀 Próximos Passos (Simples):

### 1️⃣ CONFIGURAR CHAVE SECRETA (OBRIGATÓRIO!)

Abra o arquivo: `deploy_hostinger/.env`

Altere esta linha:
```env
SECRET_KEY=ALTERE_ESTA_CHAVE_SECRETA_FORTE_123456!@#$
```

**Dica:** Use uma chave única e forte, exemplo:
```env
SECRET_KEY=MinhaSuperChaveSecreta2026!NexoGestor#Hostinger$2026
```

---

### 2️⃣ FAZER UPLOAD PARA HOSTINGER

**Opção A - Via FileZilla (Mais Fácil):**

1. Baixe FileZilla: https://filezilla-project.org/
2. Conecte ao FTP:
   - **Host:** ftp.seudominio.com
   - **Usuário:** (do hPanel)
   - **Senha:** (do hPanel)
3. Arraste TODA a pasta `deploy_hostinger/` para `/public_html`

**Opção B - Via hPanel:**
1. Acesse hPanel → Gerenciador de Arquivos
2. Navegue até `/public_html`
3. Clique em "Upload" e envie todos os arquivos

---

### 3️⃣ CONFIGURAR NODE.JS NA HOSTINGER

1. Acesse **hPanel** → **Aplicações Node.js** → **Criar Aplicação**

2. Preencha:
   - **Versão:** Node.js 18.x
   - **Diretório:** `/public_html`
   - **Arquivo de inicialização:** `server.js`
   - **Modo:** Produção

3. Adicione as **Variáveis de Ambiente** (copie do arquivo `.env`):
   ```
   SECRET_KEY = SuaChaveForteAqui
   NODE_ENV = production
   PORT = 3000
   ```

---

### 4️⃣ INSTALAR DEPENDÊNCIAS

**Via SSH (se disponível):**
```bash
ssh usuario@seudominio.com
cd public_html
npm install
```

**Via Interface Hostinger:**
- Na tela da aplicação Node.js, clique em "Instalar Dependências"

---

### 5️⃣ INICIAR A APLICAÇÃO

Na interface Node.js, clique em **"Iniciar Aplicação"**

Aguarde até o status ficar **verde (Executando)**

---

## 🌐 Acessar Seu Site

Após concluir, acesse:

- **Página Inicial:** `https://seudominio.com`
- **Login:** `https://seudominio.com/login.html`
- **Dashboard:** `https://seudominio.com/dashboard.html`

---

## 📚 Documentação Disponível

Se precisar de ajuda detalhada:

| Documento | Descrição |
|-----------|-----------|
| [GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md) | Guia detalhado com troubleshooting |
| [DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md) | Guia rápido em 5 passos |
| [ESTRUTURA_PROJETO.md](ESTRUTURA_PROJETO.md) | Estrutura dos arquivos |
| `deploy_hostinger/LEIA-ME_PRIMEIRO.txt` | Instruções na pasta de deploy |

---

## 🔧 Solução de Problemas Rápida

### Aplicação não inicia?
- ✅ Verificou se instalou dependências? (`npm install`)
- ✅ Variáveis de ambiente estão configuradas?
- ✅ Arquivo `server.js` está no lugar certo?

### Erro 500?
- ✅ Verifique os logs no hPanel → Aplicações Node.js → Logs
- ✅ Confirme que o banco de dados foi enviado (`data/agenda2.db`)

### Upload não funciona?
- ✅ Pasta `uploads/` existe?
- ✅ Permissões: `chmod 755 uploads/`

---

## ✅ Checklist Final

Antes de colocar no ar:

- [ ] Arquivo `.env` configurado com SECRET_KEY forte
- [ ] Todos os arquivos enviados para `/public_html`
- [ ] Aplicação Node.js criada no hPanel
- [ ] Variáveis de ambiente adicionadas
- [ ] Dependências instaladas (`npm install`)
- [ ] Aplicação iniciada (status verde)
- [ ] SSL/HTTPS ativado (Let's Encrypt gratuito)
- [ ] Site acessível em `https://seudominio.com`

---

## 🎯 Resumo Ultra-Rápido

```bash
1. Edite: deploy_hostinger/.env (altere SECRET_KEY)
2. Upload: Envie deploy_hostinger/* para /public_html via FTP
3. hPanel: Crie aplicação Node.js apontando para server.js
4. SSH: npm install && npm start
5. Acesse: https://seudominio.com
```

---

## 💡 Dicas Importantes

1. **Backup:** Sempre faça backup do banco de dados antes de atualizações
2. **Segurança:** Nunca compartilhe sua SECRET_KEY
3. **SSL:** Ative SSL gratuito no hPanel para HTTPS
4. **Monitoramento:** Verifique logs regularmente no hPanel

---

## 📞 Precisa de Ajuda?

- 📖 Consulte [GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md)
- 💬 Suporte Hostinger: https://www.hostinger.com.br/contato
- 🔍 Logs da aplicação: hPanel → Aplicações Node.js → Logs

---

**🚀 Seu NEXO GESTOR está pronto para decolar!**

Boa sorte com o deploy! 🎉
