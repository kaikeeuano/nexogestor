# 🎯 NEXO GESTOR - Sistema de Gestão Completo

Sistema web completo para gestão de eventos, membros, projetos, finanças e muito mais.

## 📋 Funcionalidades

- ✅ **Agenda**: Gestão completa de eventos
- ✅ **Membros**: Cadastro e controle de membros
- ✅ **Projetos**: Gerenciamento de projetos
- ✅ **Financeiro**: Controle financeiro
- ✅ **Dashboard**: Painéis personalizados multi-usuário
- ✅ **Relatórios**: Sistema de relatórios
- ✅ **Admin**: Painel administrativo completo
- ✅ **Autenticação**: Sistema de login seguro com JWT

## 🚀 Deploy para Hostinger (Recomendado)

### Deploy em 3 Comandos:

```bash
# 1. Preparar arquivos
.\deploy_hostinger.bat

# 2. Gerar chave secreta
npm run generate:key

# 3. Editar .env e fazer upload
# Veja: PRONTO_PARA_DEPLOY.md
```

### 📚 Documentação de Deploy:

| Documento | Quando Usar |
|-----------|-------------|
| **[PRONTO_PARA_DEPLOY.md](PRONTO_PARA_DEPLOY.md)** | ⭐ **Comece aqui** - Resumo completo |
| [GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md) | Guia detalhado com troubleshooting |
| [DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md) | Guia rápido em 5 passos |
| [ESTRUTURA_PROJETO.md](ESTRUTURA_PROJETO.md) | Entenda a estrutura do projeto |

## 💻 Desenvolvimento Local

### Pré-requisitos:
- Node.js 18.x ou superior
- NPM

### Instalação:

```bash
# 1. Clonar o repositório
git clone <seu-repo>
cd NEXO\ GESTOR

# 2. Instalar dependências
npm install

# 3. Iniciar servidor
npm start
```

### Acessar:
- **URL:** http://localhost:3000
- **Login:** http://localhost:3000/login.html
- **Dashboard:** http://localhost:3000/dashboard.html

## 🛠️ Scripts Disponíveis

```bash
npm start              # Inicia servidor em modo desenvolvimento
npm run start:prod     # Inicia em modo produção
npm run generate:key   # Gera SECRET_KEY segura
npm run release        # Cria release ZIP
```

## 📦 Estrutura do Projeto

```
NEXO GESTOR/
├── *.html              # Páginas do sistema
├── server.js           # API Backend (Express + SQLite)
├── staly.css           # Estilos principais
├── notifications.js    # Sistema de notificações
├── permissions.js      # Sistema de permissões
├── config/            # Configurações
├── data/              # Banco de dados SQLite
└── uploads/           # Arquivos enviados
```

Veja [ESTRUTURA_PROJETO.md](ESTRUTURA_PROJETO.md) para detalhes completos.

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Senhas criptografadas com bcrypt
- ✅ CORS configurável
- ✅ Validação de dados
- ✅ Sistema de permissões

## 🗄️ Banco de Dados

- **SQLite3**: Banco de dados local
- **Localização**: `data/agenda2.db`
- **Backup**: Recomendado fazer backup regularmente

## 📄 Páginas Disponíveis

| Página | Descrição |
|--------|-----------|
| `index.html` | Página inicial |
| `login.html` | Autenticação |
| `dashboard.html` | Dashboard principal |
| `agenda.html` | Gestão de eventos |
| `membros.html` | Cadastro de membros |
| `projetos.html` | Gestão de projetos |
| `financeiro.html` | Controle financeiro |
| `servicos.html` | Gestão de serviços |
| `pregacoes.html` | Gestão de pregações |
| `relatorios.html` | Relatórios |
| `admin.html` | Painel administrativo |
| `configuracao.html` | Configurações do sistema |

## 🌐 Deploy em Produção

### Hostinger (Recomendado)

**Veja documentação completa em [PRONTO_PARA_DEPLOY.md](PRONTO_PARA_DEPLOY.md)**

Resumo:

Resumo:

```bash
# 1. Executar script de deploy
.\deploy_hostinger.bat

# 2. Editar .env (alterar SECRET_KEY)
# 3. Upload via FTP para /public_html
# 4. Configurar Node.js no hPanel
# 5. npm install && npm start
```

### Outros Servidores

Para outros servidores VPS/Cloud:

```bash
# 1. Copiar .env.example para .env e configurar
cp .env.production .env

# 2. Instalar dependências
npm install --production

# 3. Iniciar com PM2 (recomendado)
pm2 start server.js --name nexo-gestor

# 4. Configurar para iniciar no boot
pm2 startup
pm2 save
```

## 🐛 Troubleshooting

### Aplicação não inicia?
- Verifique se `npm install` foi executado
- Confirme que as variáveis de ambiente estão configuradas
- Veja os logs: `npm start` (local) ou hPanel → Logs (Hostinger)

### Erro de banco de dados?
- Verifique se `data/agenda2.db` existe
- Confirme permissões: `chmod 755 data/`

### Upload não funciona?
- Verifique permissões: `chmod 755 uploads/`
- Confirme que a pasta existe

## 📚 Documentação Adicional

- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Guia do administrador
- [SISTEMA_BLOQUEIO_CHAVES.md](SISTEMA_BLOQUEIO_CHAVES.md) - Sistema de bloqueio
- [SUB_DASHBOARD_GUIA.md](SUB_DASHBOARD_GUIA.md) - Guia de sub-dashboards
- [DASHBOARD_ACTIVATION_GUIDE.md](DASHBOARD_ACTIVATION_GUIDE.md) - Ativação de dashboards

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 👥 Suporte

Para dúvidas sobre deploy na Hostinger:
- 📖 [PRONTO_PARA_DEPLOY.md](PRONTO_PARA_DEPLOY.md)
- 📖 [GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md)
- 💬 Suporte Hostinger: https://www.hostinger.com.br/contato

---

**Desenvolvido com ❤️ para gestão eficiente**

### Systemd (opcional)
Crie `/etc/systemd/system/nexo-gestor.service` com conteúdo:

```
[Unit]
Description=NEXO GESTOR Node App
After=network.target

[Service]
Environment=NODE_ENV=production
EnvironmentFile=/caminho/para/.env
Type=simple
User=www-data
WorkingDirectory=/caminho/para/app
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Depois execute:

```
sudo systemctl daemon-reload
sudo systemctl enable nexo-gestor
sudo systemctl start nexo-gestor
```

---

Se quiser, posso também preparar uma imagem Docker em vez do ZIP.
