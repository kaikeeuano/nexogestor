# NEXO GESTOR Dashboard

Este é um projeto simples de dashboard para o sistema NEXO GESTOR.

## Estrutura do Projeto

- `index.html`: Página inicial com navegação principal.
- `sitem.html`: Página do dashboard com widgets para diferentes seções.
- `projetos.html`: Página de gestão de projetos com cadastro, filtros por título e status, e impressão.
- `drivfotos.html`: Página do drive de fotos com link para Google Drive e lista de fotos recentes.
- `dashboard.html`: Página de seleção de dashboards, com opções para criar novo, entrar em existente com código, e listar dashboards do usuário.
- `membros.html`: Página de cadastro de membros com campos para nome, congregação e cargo, conectada ao banco de dados.
- `staly.css`: Folhas de estilo para o layout.
- `server.js`: Servidor Node.js para a API da agenda.
- `package.json`: Dependências do projeto.

## Como Usar

1. Instale as dependências: `npm install`
2. Inicie o servidor: `npm start`
3. Abra `http://localhost:3000/agenda.html` em um navegador para acessar a agenda.

## Funcionalidades

- Navegação lateral com links para diferentes seções.
- Widgets no dashboard representando cada seção com botões para ações.
- Agenda: Adicionar eventos com data, título e descrição; visualizar lista de eventos; excluir eventos. Dados armazenados em banco de dados SQLite.
- Projetos: Cadastrar projetos com título, descrição e status; visualizar lista; excluir projetos; filtrar por título e status; botão para imprimir.
- Drive Fotos: Link para Google Drive e lista de fotos recentes.
- Dashboard: Sistema multi-usuário com dashboards separados; criação de dashboards, convite por código, aprovação de membros pelo dono.

## Desenvolvimento

Para modificar o dashboard, edite `sitem.html` para adicionar/remover widgets e `staly.css` para estilos.
Para a agenda, edite `agenda.html` para o frontend e `server.js` para o backend.

---

## Deploy (Produção)

1. Copie `.env.example` para `.env` e preencha os valores (ex.: `SECRET_KEY`, `PORT`, `DATABASE_PATH`).
2. No servidor: instale dependências com `npm install --production`.
3. Inicie a aplicação em modo produção:
   - `npm run start:prod` (define `NODE_ENV=production`).
4. Recomendado: use um gerenciador de processos como PM2 para manter a aplicação rodando:
   - `pm2 start server.js --name nexo-gestor --env production`

### Release ZIP
O artefato de release é gerado em `releases/` (arquivo zip). Transfira o zip para o servidor, extraia, configure `.env` e rode os passos acima.

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
