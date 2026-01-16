# 🔐 Sistema de Bloqueio de Dashboard com Chave de Ativação

## Como Funciona

### Para Usuários:

1. **Dashboard Bloqueado**: Quando você tentar acessar um dashboard que não está ativado, verá uma tela de bloqueio
2. **Inserir Chave**: Digite a chave de ativação fornecida pelo administrador
3. **Desbloquear**: Clique em "Desbloquear Dashboard" ou pressione Enter
4. **Acesso Liberado**: O dashboard será desbloqueado permanentemente para todos os membros

### Para Administradores:

1. Acesse o **Painel Admin** (http://localhost:3000/admin.html)
2. Clique em "Gerar Nova Chave de Ativação"
3. Defina o nome do dashboard (opcional) e a validade
4. Copie a chave gerada (formato: NEXO-XXXXXXXX-XXXXXXXX)
5. Envie a chave para o usuário que precisa ativar o dashboard

## Endpoints da API

### Verificar Status de Ativação
```
GET /dashboards/:dashboardId/activation-status
Headers: Authorization: Bearer <token>

Response:
{
  "isActivated": true/false,
  "activatedAt": "2026-01-16T...",
  "activatedByKey": "NEXO-XXXXXXXX-XXXXXXXX"
}
```

### Ativar Dashboard Existente
```
POST /activate-dashboard
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "activationKey": "NEXO-XXXXXXXX-XXXXXXXX",
  "dashboardId": 5
}

Response:
{
  "success": true,
  "message": "Dashboard ativado com sucesso!",
  "dashboardId": 5
}
```

### Criar Novo Dashboard (via chave)
```
POST /activate-dashboard
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "activationKey": "NEXO-XXXXXXXX-XXXXXXXX"
}

Response:
{
  "success": true,
  "message": "Dashboard criado e ativado com sucesso!",
  "dashboard": {
    "id": 6,
    "name": "Nome do Dashboard",
    "code": "abc123"
  }
}
```

## Estrutura do Banco de Dados

### Tabela: dashboards
- `activated_at`: Data/hora da ativação (NULL = bloqueado)
- `activated_by_key`: Chave usada para ativação

### Tabela: activation_keys
- `dashboard_id`: ID do dashboard ativado (se aplicável)
- `used_at`: Data/hora de uso da chave
- `used_by_user_id`: ID do usuário que usou a chave

## Scripts Utilitários

### Ativar Dashboards Existentes
```bash
node activate_existing_dashboards.js
```
Marca todos os dashboards existentes como ativados automaticamente.

### Criar Dashboard Bloqueado (Demo)
```bash
node create_locked_dashboard.js
```
Cria um dashboard de demonstração que está bloqueado.

## Comportamento do Sistema

- ✅ **Dashboards ativados**: Carregam normalmente
- 🔒 **Dashboards bloqueados**: Mostram modal de ativação
- 🔑 **Uma vez ativado**: O dashboard fica desbloqueado permanentemente
- 👥 **Todos os membros**: Podem usar a mesma chave para desbloquear
- ⏱️ **Chaves expiradas**: Não podem ser usadas
- ♻️ **Chaves usadas**: Podem ser reutilizadas no mesmo dashboard

## Visual do Modal de Bloqueio

- 🔒 Ícone de cadeado animado
- 📝 Instruções claras
- ⌨️ Input com formatação automática
- ✅ Mensagens de sucesso/erro
- 🎨 Design moderno com blur no background
