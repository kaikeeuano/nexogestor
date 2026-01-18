# Deploy para Hostinger

## 1. Fazer Upload dos Arquivos

### Via FileZilla (FTP)
1. Baixe FileZilla: https://filezilla-project.org/
2. Conecte usando credenciais do hPanel
3. Envie todos os arquivos para `/public_html` ou pasta da aplicação

### Arquivos Necessários
- ✅ Todos os `.html`
- ✅ `server.js`
- ✅ `package.json`
- ✅ `staly.css`
- ✅ Pasta `nexo/` (com banco de dados)
- ✅ Pasta `uploads/`
- ✅ `notifications.js`
- ❌ **NÃO enviar:** `node_modules/` (será criado no servidor)

## 2. Configurar Node.js no hPanel

1. Acesse hPanel → **Avançado** → **Aplicações Node.js**
2. Clique em **Criar Aplicação**
3. Configure:
   - **Versão do Node.js**: 18.x ou superior
   - **Modo da Aplicação**: Produção
   - **Diretório da Aplicação**: `/public_html` (ou onde você enviou)
   - **Arquivo de Inicialização**: `server.js`
   - **Porta da Aplicação**: (automático)

## 3. Variáveis de Ambiente

No painel de configuração da aplicação Node.js, adicione:

```
SECRET_KEY=SuaChaveSecretaForteAqui123456!@#
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Gere uma SECRET_KEY forte e única!

## 4. Instalar Dependências via SSH

Se o seu plano tem SSH:

```bash
# Conectar via SSH
ssh usuario@seudominio.com

# Navegar até o diretório
cd public_html

# Instalar dependências
npm install

# Verificar se está tudo OK
npm list

# Iniciar aplicação (se não iniciar automaticamente)
npm start
```

## 5. Verificar Permissões

Certifique-se que as pastas têm permissões corretas:

```bash
chmod 755 nexo/
chmod 644 nexo/agenda2.db
chmod 755 uploads/
```

## 6. Apontar Domínio

No hPanel:
1. Vá em **Domínios**
2. Configure o domínio para apontar para a aplicação Node.js
3. Se necessário, configure SSL (Let's Encrypt gratuito)

## 7. Testar

Acesse: `https://seudominio.com`

### Endpoints para testar:
- `https://seudominio.com` → index.html
- `https://seudominio.com/login.html` → Página de login
- `https://seudominio.com/dashboard.html` → Dashboard

## 8. Logs e Debug

Para ver logs da aplicação:
1. hPanel → **Aplicações Node.js**
2. Clique na sua aplicação
3. Veja a seção **Logs**

## 9. Atualizar Código

Após fazer alterações:

```bash
# Via SSH
cd public_html
git pull origin main  # Se estiver usando Git
npm install          # Se adicionou dependências
pm2 restart all      # ou restart via hPanel
```

## Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Port already in use"
- A Hostinger gerencia as portas automaticamente
- Use `process.env.PORT` no código (já está configurado)

### Banco de dados não funciona
```bash
chmod 644 nexo/agenda2.db
chmod 755 nexo/
```

### Aplicação não inicia
1. Verifique logs no hPanel
2. Certifique-se que `package.json` tem `"start": "node server.js"`
3. Verifique variáveis de ambiente

## Suporte Hostinger

Chat: https://www.hostinger.com.br/contato
Tutoriais: https://support.hostinger.com/
