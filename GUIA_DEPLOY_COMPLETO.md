# 🚀 Guia Completo de Deploy - NEXO GESTOR na Hostinger

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Preparação Local](#preparação-local)
3. [Upload dos Arquivos](#upload-dos-arquivos)
4. [Configuração na Hostinger](#configuração-na-hostinger)
5. [Finalização e Testes](#finalização-e-testes)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- [x] Conta ativa na Hostinger com plano compatível com Node.js
- [x] Acesso ao hPanel da Hostinger
- [x] Cliente FTP (FileZilla) ou acesso SSH
- [x] Domínio configurado (opcional, pode usar subdomínio da Hostinger)

---

## 💻 Preparação Local

### Passo 1: Executar o Script de Deploy

**No Windows:**
```bash
deploy_hostinger.bat
```

**No Linux/Mac:**
```bash
chmod +x deploy_hostinger.sh
./deploy_hostinger.sh
```

Isso criará uma pasta `deploy_hostinger/` com todos os arquivos necessários.

### Passo 2: Configurar Variáveis de Ambiente

1. Abra o arquivo `deploy_hostinger/.env`
2. **IMPORTANTE:** Altere a `SECRET_KEY` para uma chave forte e única:

```env
NODE_ENV=production
PORT=3000
SECRET_KEY=SuaChaveSeguraEUnica123!@#$%^&*()
```

**Dica:** Gere uma chave forte com:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 3: Revisar os Arquivos

Verifique se a pasta `deploy_hostinger/` contém:
- ✅ Todos os arquivos HTML
- ✅ server.js
- ✅ package.json
- ✅ staly.css
- ✅ pasta `data/` (com banco de dados)
- ✅ pasta `uploads/`
- ✅ pasta `config/`
- ✅ .env
- ❌ **NÃO deve ter:** node_modules/

---

## 📤 Upload dos Arquivos

### Opção A: Via FileZilla (Recomendado)

1. **Baixe e instale o FileZilla:**
   - https://filezilla-project.org/

2. **Conecte ao servidor:**
   - Acesse hPanel → **Arquivos** → **Gerenciador de Arquivos FTP**
   - Copie as credenciais FTP (Host, Usuário, Senha)
   - No FileZilla:
     - Host: `ftp.seudominio.com`
     - Usuário: (do hPanel)
     - Senha: (do hPanel)
     - Porta: 21

3. **Faça o upload:**
   - Navegue até `/public_html` no servidor
   - Arraste todos os arquivos de `deploy_hostinger/` para lá
   - Aguarde o upload completo (pode levar alguns minutos)

### Opção B: Via Gerenciador de Arquivos do hPanel

1. Acesse hPanel → **Arquivos** → **Gerenciador de Arquivos**
2. Navegue até `/public_html`
3. Clique em **Upload de Arquivos**
4. Selecione todos os arquivos da pasta `deploy_hostinger/`
5. Aguarde o upload

### Opção C: Via SSH (Para usuários avançados)

```bash
# Conectar via SSH
ssh usuario@seudominio.com

# Navegar até public_html
cd public_html

# Fazer upload via SCP (do seu computador local)
scp -r deploy_hostinger/* usuario@seudominio.com:public_html/
```

---

## ⚙️ Configuração na Hostinger

### Passo 1: Criar Aplicação Node.js

1. Acesse o hPanel
2. Vá em **Avançado** → **Aplicações Node.js**
3. Clique em **Criar Aplicação**

### Passo 2: Configurar a Aplicação

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Versão do Node.js** | 18.x ou superior |
| **Modo da Aplicação** | Produção |
| **Diretório da Aplicação** | `/public_html` |
| **Arquivo de Inicialização** | `server.js` |
| **Porta da Aplicação** | (deixe automático ou use 3000) |

### Passo 3: Adicionar Variáveis de Ambiente

Na mesma tela de configuração:

1. Clique em **Adicionar Variável de Ambiente**
2. Adicione cada variável do arquivo `.env`:

```
SECRET_KEY = SuaChaveSeguraEUnica123!@#$%^&*()
NODE_ENV = production
PORT = 3000
```

### Passo 4: Instalar Dependências

**Via Interface (se disponível):**
- Clique em **Instalar Dependências** na interface Node.js

**Via SSH:**
```bash
# Conectar via SSH
ssh usuario@seudominio.com

# Navegar até o diretório
cd public_html

# Instalar dependências
npm install

# Verificar instalação
npm list
```

### Passo 5: Iniciar a Aplicação

1. Na interface Node.js, clique em **Iniciar Aplicação**
2. Aguarde alguns segundos
3. Verifique se o status está **Executando** (verde)

---

## 🌐 Finalização e Testes

### Configurar Domínio

1. Acesse hPanel → **Domínios**
2. Selecione seu domínio
3. Configure para apontar para a aplicação Node.js
4. **Ativar SSL:** Vá em **SSL** → **Let's Encrypt** (gratuito)

### Testar a Aplicação

Acesse as seguintes URLs:

| URL | Descrição |
|-----|-----------|
| `https://seudominio.com` | Página inicial |
| `https://seudominio.com/login.html` | Página de login |
| `https://seudominio.com/dashboard.html` | Dashboard |
| `https://seudominio.com/agenda.html` | Agenda |

### Verificar Logs

Para debug:
1. hPanel → **Aplicações Node.js**
2. Clique na sua aplicação
3. Veja a seção **Logs da Aplicação**

---

## 🔧 Troubleshooting

### Problema: Aplicação não inicia

**Solução:**
```bash
# Via SSH, verificar logs
cd public_html
npm start
# Ver erros no console
```

**Verificar:**
- ✅ Todas as dependências foram instaladas?
- ✅ O arquivo `server.js` está no diretório correto?
- ✅ As variáveis de ambiente estão configuradas?

### Problema: Erro 500 / Internal Server Error

**Solução:**
1. Verificar logs da aplicação no hPanel
2. Conferir se o banco de dados existe em `data/agenda2.db`
3. Verificar permissões das pastas:

```bash
chmod 755 data/
chmod 644 data/agenda2.db
chmod 755 uploads/
```

### Problema: Banco de dados não funciona

**Solução:**
1. Verificar se o arquivo `agenda2.db` foi enviado
2. Criar banco vazio se necessário:

```bash
cd public_html
sqlite3 data/agenda2.db ".databases"
```

### Problema: Upload de arquivos não funciona

**Solução:**
1. Verificar permissões da pasta `uploads/`:

```bash
chmod 755 uploads/
```

2. Verificar se a pasta existe no servidor

### Problema: Erro de CORS

**Solução:**
Adicionar variável de ambiente:
```
CORS_ORIGIN = https://seudominio.com
```

---

## 📝 Atualização do Código

Para atualizar a aplicação após mudanças:

```bash
# Via SSH
cd public_html

# Fazer backup do banco de dados
cp data/agenda2.db data/agenda2.db.backup

# Atualizar código (via FTP ou Git)
# ...

# Reinstalar dependências se package.json mudou
npm install

# Reiniciar aplicação
npm restart
```

**Via hPanel:**
1. Aplicações Node.js → Sua Aplicação
2. Clique em **Parar**
3. Faça upload dos novos arquivos
4. Clique em **Iniciar**

---

## 📊 Monitoramento

### Verificar Status
- hPanel → Aplicações Node.js → Sua Aplicação
- Status: **Executando** (verde) = OK

### Ver Logs em Tempo Real
```bash
# Via SSH
cd public_html
tail -f logs/app.log
```

### Verificar Uso de Recursos
- hPanel → **Estatísticas** → Ver uso de CPU/RAM

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] SECRET_KEY alterada e forte
- [ ] SSL/HTTPS ativado
- [ ] Banco de dados não acessível publicamente
- [ ] Pasta `node_modules/` não enviada
- [ ] Arquivo `.env` não versionado no Git
- [ ] Senhas de admin alteradas
- [ ] Backup do banco de dados configurado

---

## 📞 Suporte

**Problemas com Hostinger:**
- Suporte: https://www.hostinger.com.br/contato
- Chat ao vivo no hPanel

**Problemas com a Aplicação:**
- Verificar logs da aplicação
- Consultar documentação do projeto
- Revisar este guia

---

## ✅ Checklist Final

Antes de considerar o deploy concluído:

- [ ] Aplicação rodando (status verde)
- [ ] Domínio apontando corretamente
- [ ] SSL/HTTPS funcionando
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Banco de dados persistindo dados
- [ ] Upload de arquivos funciona
- [ ] Sem erros nos logs
- [ ] Backup do banco de dados feito

---

**🎉 Parabéns! Seu NEXO GESTOR está no ar!**

Acesse: `https://seudominio.com`
