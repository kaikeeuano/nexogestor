# 🔒 Sistema de Bloqueio de Chaves de Ativação

## 📋 Visão Geral

O sistema agora permite que administradores **bloqueiem (revoguem)** chaves de ativação mesmo depois de terem sido utilizadas, e também possam **restaurar** chaves bloqueadas.

## 🎯 Funcionalidades

### 1. **Bloquear Chave** 🔒
- Revoga uma chave de ativação, tornando-a inválida
- Funciona mesmo para chaves já utilizadas
- Impede que a chave seja usada para novos dashboards
- A chave permanece no sistema mas com status "Revogada"

### 2. **Restaurar Chave** ✅
- Reativa uma chave previamente bloqueada
- A chave volta a funcionar normalmente
- Pode ser usada novamente (se não tiver sido utilizada antes)

### 3. **Excluir Chave** 🗑️
- Remove permanentemente a chave do sistema
- Disponível apenas para chaves ativas (não utilizadas)
- **Ação irreversível**

## 🎨 Interface do Painel Admin

### Status das Chaves
As chaves agora podem ter 4 estados:

| Status | Badge | Descrição |
|--------|-------|-----------|
| **Ativa** | 🟢 Verde | Chave válida e disponível para uso |
| **Utilizada** | 🔵 Azul | Chave já foi usada para ativar um dashboard |
| **Expirada** | 🔴 Vermelho | Chave passou da data de validade |
| **Revogada** | 🔴 Vermelho | Chave foi bloqueada pelo administrador |

### Ações Disponíveis

#### Para Chaves Ativas:
- 📋 **Copiar** - Copia a chave para área de transferência
- 🔒 **Bloquear** - Revoga a chave
- 🗑️ **Excluir** - Remove permanentemente

#### Para Chaves Utilizadas:
- 📋 **Copiar** - Copia a chave
- 🔒 **Bloquear** - Revoga a chave

#### Para Chaves Revogadas:
- 📋 **Copiar** - Copia a chave
- ✅ **Restaurar** - Reativa a chave

## 💻 Como Usar

### Bloquear uma Chave

1. Acesse o painel admin: http://localhost:3000/admin.html
2. Role até "📋 Chaves de Ativação"
3. Encontre a chave que deseja bloquear
4. Clique no botão **🔒 Bloquear**
5. Confirme a ação
6. A chave será marcada como "Revogada"

### Restaurar uma Chave

1. No painel admin, encontre uma chave com status "Revogada"
2. Clique no botão **✅ Restaurar**
3. Confirme a ação
4. A chave voltará ao status anterior (Ativa ou Utilizada)

## 🔐 Segurança

### Validação no Backend
Ao tentar usar uma chave revogada:
```
❌ "Esta chave foi bloqueada/revogada pelo administrador"
```

### Proteção de Endpoints
- Apenas **administradores do sistema** podem:
  - Bloquear chaves
  - Restaurar chaves
  - Excluir chaves

## 📊 Banco de Dados

### Nova Coluna
```sql
ALTER TABLE activation_keys ADD COLUMN revoked_at TEXT;
```

- `revoked_at`: Data/hora em que a chave foi revogada (NULL = não revogada)

## 🚀 Casos de Uso

### Cenário 1: Chave Comprometida
Se uma chave foi compartilhada indevidamente:
1. Bloqueie a chave imediatamente
2. Gere uma nova chave
3. Distribua a nova chave apenas para usuários autorizados

### Cenário 2: Suspensão Temporária
Para suspender temporariamente o acesso:
1. Bloqueie a chave
2. Quando apropriado, restaure a chave

### Cenário 3: Controle de Licenças
Para controlar quantos dashboards podem ser criados:
1. Gere um número limitado de chaves
2. Bloqueie chaves de dashboards inativos
3. Reutilize chaves bloqueadas quando necessário

## 🎯 Endpoints API

### POST /admin/activation-keys/:id/revoke
Revoga uma chave de ativação

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Chave revogada com sucesso"
}
```

### POST /admin/activation-keys/:id/restore
Restaura uma chave revogada

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Chave restaurada com sucesso"
}
```

## ⚠️ Observações Importantes

1. **Chaves revogadas não podem ser usadas** - Mesmo que a chave tenha sido válida antes
2. **Dashboards já ativados continuam funcionando** - Revogar a chave não desativa dashboards já criados
3. **Bloqueio é reversível** - Diferente de excluir, você pode restaurar chaves bloqueadas
4. **Excluir é permanente** - Só é possível excluir chaves ativas não utilizadas

## 📝 Exemplo de Uso

```javascript
// Admin revoga chave
POST /admin/activation-keys/5/revoke

// Usuário tenta usar chave revogada
POST /activate-dashboard
{
  "activationKey": "NEXO-ABC123-XYZ789",
  "dashboardId": 3
}

// Resposta:
{
  "error": "Esta chave foi bloqueada/revogada pelo administrador"
}

// Admin restaura a chave
POST /admin/activation-keys/5/restore

// Agora a chave funciona novamente
```

## 🎉 Conclusão

O sistema de bloqueio de chaves oferece controle total sobre as ativações, permitindo gerenciar licenças, segurança e acesso aos dashboards de forma flexível e segura!
