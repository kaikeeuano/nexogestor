# 📦 Estrutura do Projeto NEXO GESTOR

```
NEXO GESTOR/
├── 📄 Páginas HTML
│   ├── index.html              # Página inicial
│   ├── login.html              # Login
│   ├── dashboard.html          # Dashboard principal
│   ├── agenda.html             # Gestão de eventos
│   ├── membros.html            # Gestão de membros
│   ├── financeiro.html         # Controle financeiro
│   ├── projetos.html           # Gestão de projetos
│   ├── servicos.html           # Gestão de serviços
│   ├── pregacoes.html          # Gestão de pregações
│   ├── relatorios.html         # Relatórios
│   ├── admin.html              # Painel administrativo
│   └── configuracao.html       # Configurações
│
├── 🎨 Estilos
│   └── staly.css               # CSS principal
│
├── 📜 Scripts Cliente
│   ├── notifications.js         # Sistema de notificações
│   └── permissions.js          # Sistema de permissões
│
├── ⚙️ Servidor
│   └── server.js               # API Express + SQLite
│
├── 🔧 Configuração
│   ├── package.json            # Dependências Node.js
│   ├── config/
│   │   └── production.js       # Config de produção
│   ├── .env.production         # Variáveis de ambiente
│   └── .gitignore              # Arquivos ignorados
│
├── 💾 Dados
│   ├── data/                   # Banco de dados SQLite
│   └── uploads/                # Arquivos enviados
│
├── 🚀 Deploy
│   ├── deploy_hostinger.bat    # Script Windows
│   ├── deploy_hostinger.sh     # Script Linux/Mac
│   ├── GUIA_DEPLOY_COMPLETO.md # Guia detalhado
│   └── DEPLOY_RAPIDO.md        # Guia rápido
│
└── 📚 Documentação
    ├── README.md
    ├── ADMIN_GUIDE.md
    ├── SISTEMA_BLOQUEIO_CHAVES.md
    └── SUB_DASHBOARD_GUIA.md
```

## 🌐 Arquivos que vão para produção

Quando você executar o script de deploy (`deploy_hostinger.bat` ou `.sh`), 
apenas os arquivos necessários serão copiados para a pasta `deploy_hostinger/`:

✅ **Incluído:**
- Todos os arquivos `.html`
- `server.js`
- `package.json`
- `staly.css`
- `notifications.js`
- `permissions.js`
- `config/`
- `data/` (banco de dados)
- `uploads/`
- `.env`

❌ **Excluído:**
- `node_modules/` (será instalado no servidor)
- Arquivos de desenvolvimento
- Scripts de teste
- Documentação desnecessária
- `.git/`

## 📝 Notas

- A pasta `deploy_hostinger/` é criada automaticamente
- Nunca faça commit do arquivo `.env` no Git
- Sempre altere a `SECRET_KEY` antes do deploy
- Mantenha backups do banco de dados
