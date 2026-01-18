# ✅ CHECKLIST DE DEPLOY - NEXO GESTOR

Use este checklist para garantir que tudo está pronto antes de colocar no ar.

---

## 📋 ANTES DO DEPLOY

### Preparação Local

- [ ] **Executei o script de deploy**
  - Windows: `deploy_hostinger.bat`
  - Linux/Mac: `./deploy_hostinger.sh`
  
- [ ] **Pasta `deploy_hostinger/` foi criada com sucesso**
  - Contém 27 arquivos HTML
  - Contém `server.js` e `package.json`
  - Contém pasta `data/` com banco de dados
  - Contém pasta `uploads/`
  - Contém arquivo `.env`

- [ ] **Configurei a SECRET_KEY no arquivo `.env`**
  - Abri: `deploy_hostinger/.env`
  - Alterei: `SECRET_KEY=MinhaChaveSegura123!@#`
  - Usei chave forte e única
  - **Dica:** Use `npm run generate:key` para gerar uma chave

- [ ] **Revisei as configurações no `.env`**
  ```env
  NODE_ENV=production
  PORT=3000
  SECRET_KEY=SuaChaveAqui
  ```

---

## 📤 UPLOAD PARA HOSTINGER

### Conexão FTP

- [ ] **Tenho as credenciais FTP da Hostinger**
  - Host: `ftp.meudominio.com`
  - Usuário: `_______________________`
  - Senha: `_______________________`

- [ ] **FileZilla instalado** (ou outro cliente FTP)
  - Download: https://filezilla-project.org/

### Fazendo Upload

- [ ] **Conectei ao servidor via FTP**
- [ ] **Naveguei até `/public_html`**
- [ ] **Limpei arquivos antigos** (se houver)
- [ ] **Enviei TODOS os arquivos de `deploy_hostinger/`**
  - Tempo estimado: 5-10 minutos
  - Total: ~600 KB

- [ ] **Upload completo confirmado**
  - Todos os `.html` estão no servidor
  - `server.js` está no servidor
  - Pasta `data/` está no servidor
  - Pasta `uploads/` está no servidor

---

## ⚙️ CONFIGURAÇÃO NO hPANEL

### Criar Aplicação Node.js

- [ ] **Acessei hPanel → Aplicações Node.js**
- [ ] **Cliquei em "Criar Aplicação"**

### Configurações da Aplicação

- [ ] **Versão do Node.js:** 18.x ou superior
- [ ] **Modo da Aplicação:** Produção
- [ ] **Diretório da Aplicação:** `/public_html`
- [ ] **Arquivo de Inicialização:** `server.js`
- [ ] **Porta:** (automático ou 3000)

### Variáveis de Ambiente

- [ ] **Adicionei todas as variáveis do arquivo `.env`:**
  - `SECRET_KEY` = (minha chave forte)
  - `NODE_ENV` = production
  - `PORT` = 3000

---

## 🚀 INSTALAÇÃO E INICIALIZAÇÃO

### Instalar Dependências

Escolha UMA opção:

**Opção A - Via Interface (se disponível):**
- [ ] Cliquei em "Instalar Dependências" no hPanel

**Opção B - Via SSH:**
- [ ] Conectei via SSH: `ssh usuario@meudominio.com`
- [ ] Naveguei: `cd public_html`
- [ ] Executei: `npm install`
- [ ] Instalação concluída sem erros

### Iniciar Aplicação

- [ ] **Cliquei em "Iniciar Aplicação" no hPanel**
- [ ] **Status mudou para "Executando" (verde)**
- [ ] **Sem mensagens de erro nos logs**

---

## 🌐 DOMÍNIO E SSL

### Configurar Domínio

- [ ] **Acessei hPanel → Domínios**
- [ ] **Configurei domínio para apontar para a aplicação**
- [ ] **Domínio está ativo e propagado**

### Ativar SSL (HTTPS)

- [ ] **Acessei hPanel → SSL**
- [ ] **Ativei Let's Encrypt (gratuito)**
- [ ] **Certificado SSL instalado**
- [ ] **Site redireciona HTTP → HTTPS**

---

## ✅ TESTES FINAIS

### Acessibilidade

- [ ] **Página inicial carrega:** `https://meudominio.com`
- [ ] **Login acessível:** `https://meudominio.com/login.html`
- [ ] **Dashboard acessível:** `https://meudominio.com/dashboard.html`

### Funcionalidades

- [ ] **Login funciona corretamente**
  - Consigo criar conta
  - Consigo fazer login
  - Token JWT é gerado

- [ ] **Dashboard carrega dados**
  - Widgets aparecem
  - Dados do banco são exibidos

- [ ] **Agenda funciona**
  - Posso criar eventos
  - Eventos são salvos no banco
  - Posso editar/excluir eventos

- [ ] **Upload de arquivos funciona**
  - Posso fazer upload
  - Arquivos são salvos em `uploads/`

### Performance

- [ ] **Páginas carregam rápido** (< 2 segundos)
- [ ] **Sem erros no console do navegador** (F12)
- [ ] **Sem erros 500 ou 404**

---

## 🔍 VERIFICAÇÃO DE LOGS

- [ ] **Acessei hPanel → Aplicações Node.js → Logs**
- [ ] **Sem erros críticos nos logs**
- [ ] **Aplicação iniciou corretamente**

Mensagem esperada nos logs:
```
Connected to the SQLite database.
Server running on port 3000
```

---

## 🔒 SEGURANÇA

### Configurações de Segurança

- [ ] **SECRET_KEY é forte e única** (mínimo 32 caracteres)
- [ ] **Não usei a SECRET_KEY padrão**
- [ ] **Arquivo `.env` NÃO está versionado no Git**
- [ ] **SSL/HTTPS está ativo**

### Permissões

Via SSH, verificar:
```bash
chmod 755 data/
chmod 644 data/agenda2.db
chmod 755 uploads/
```

- [ ] **Permissões corretas configuradas**

---

## 💾 BACKUP

### Backup do Banco de Dados

- [ ] **Fiz backup do banco de dados**
  - Via FTP: baixei `data/agenda2.db`
  - Via SSH: `cp data/agenda2.db data/agenda2.db.backup`

- [ ] **Tenho backup salvo localmente**

### Agendamento de Backups

- [ ] **Configurei backup automático** (recomendado)
  - Hostinger oferece backup automático em alguns planos
  - Ou configurei script cron para backup diário

---

## 📊 MONITORAMENTO

### Configurações de Monitoramento

- [ ] **Favoritei o painel da aplicação no hPanel**
- [ ] **Configurei alertas** (se disponível)
- [ ] **Salvei credenciais de acesso em local seguro**

### Documentação

- [ ] **Li [GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md)**
- [ ] **Guardei este checklist para futuras atualizações**

---

## 🎉 DEPLOY CONCLUÍDO!

### Informações Importantes

**Anote suas informações:**

| Item | Valor |
|------|-------|
| **URL do Site** | https://__________________________ |
| **Usuário FTP** | __________________________ |
| **Usuário SSH** | __________________________ |
| **Email Admin** | __________________________ |
| **Data Deploy** | ____/____/________ |

### Compartilhar

- [ ] **Compartilhei URL com equipe**
- [ ] **Criei contas de usuário para administradores**
- [ ] **Documentei procedimentos de uso**

---

## 📞 PRÓXIMOS PASSOS

### Manutenção Regular

**Recomendado fazer:**

- **Semanalmente:**
  - [ ] Verificar logs de erro
  - [ ] Conferir backup automático

- **Mensalmente:**
  - [ ] Fazer backup manual do banco
  - [ ] Verificar atualizações de segurança
  - [ ] Analisar uso de recursos (CPU/RAM)

- **Quando houver atualização:**
  - [ ] Fazer backup antes de atualizar
  - [ ] Testar em ambiente local primeiro
  - [ ] Atualizar arquivos via FTP
  - [ ] Reiniciar aplicação no hPanel

---

## ❌ TROUBLESHOOTING

Se algo deu errado, consulte:

1. [GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md) - Seção Troubleshooting
2. Logs no hPanel → Aplicações Node.js → Logs
3. Console do navegador (F12)
4. Suporte Hostinger: https://www.hostinger.com.br/contato

---

**✅ Todos os itens marcados? Parabéns! Seu NEXO GESTOR está no ar! 🚀**

---

**Data de conclusão:** ____/____/________  
**Responsável:** ___________________________  
**Notas adicionais:**  
_________________________________________________  
_________________________________________________  
_________________________________________________
