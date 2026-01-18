# Sistema de Permissões - NEXO GESTOR

## Níveis de Acesso

### 1. **OWNER (Criador do Dashboard)** 👑
**Acesso: TOTAL - SEM RESTRIÇÕES**

O criador do dashboard tem:
- ✅ Acesso completo a TODOS os módulos
- ✅ Gerenciar membros (adicionar, remover, alterar funções)
- ✅ Acessar configurações do dashboard
- ✅ Criar e gerenciar sub-dashboards
- ✅ Todas as permissões de admin + controle total

**Identificação:**
```javascript
// No banco de dados
status = 'owner' em dashboard_members

// No frontend
isOwner = true
localStorage.getItem('isOwner') === 'true'
```

---

### 2. **ADMIN (Administrador)** ⚙️
**Acesso: TOTAL EM TODOS OS MÓDULOS**

Permissões:
- ✅ Financeiro (criar, editar, deletar)
- ✅ Documentos (upload, editar, deletar)
- ✅ Fotos (upload, editar, deletar)
- ✅ Membros (gerenciar cadastros)
- ✅ Gestão (controle total)
- ✅ Agenda (criar, editar, deletar)
- ✅ Projetos (criar, editar, deletar)
- ✅ Relatórios (acesso completo)
- ✅ Configurações (junto com owner)
- ❌ **Não pode:** Gerenciar membros do dashboard (adicionar/remover/alterar funções - apenas owner)

---

### 3. **TESOUREIRO** 💰
**Acesso: Financeiro e Documentos**

Permissões:
- ✅ Financeiro (criar, editar, deletar transações)
- ✅ Documentos (upload, editar, deletar)
- ❌ Outros módulos: apenas visualização

---

### 4. **SECRETÁRIO** 📋
**Acesso: Membros, Fotos e Documentos**

Permissões:
- ✅ Membros (adicionar, editar cadastros - NÃO gerencia funções do dashboard)
- ✅ Fotos (upload, editar, deletar)
- ✅ Documentos (upload, editar, deletar)
- ❌ Outros módulos: apenas visualização

---

### 5. **MÍDIA** 📸
**Acesso: Fotos**

Permissões:
- ✅ Fotos (upload, editar, deletar)
- ❌ Outros módulos: apenas visualização

---

### 6. **MEMBER (Membro)** 👤
**Acesso: APENAS VISUALIZAÇÃO**

Permissões:
- ❌ Não pode editar NENHUM módulo
- ✅ Pode visualizar todos os módulos que tem acesso

---

## Implementação Técnica

### PermissionManager (permissions.js)

```javascript
class PermissionManager {
    canEdit(module) {
        // OWNER TEM ACESSO TOTAL - PRIORIDADE MÁXIMA
        if (this.isOwner) return true;
        
        // ADMIN TEM ACESSO TOTAL A TODOS OS MÓDULOS
        if (this.userRole === 'admin') return true;

        const permissions = {
            'member': [],
            'tesoureiro': ['financeiro', 'drivdoc'],
            'secretario': ['membros', 'drivdoc', 'drivfotos'],
            'midia': ['drivfotos']
        };

        const userPermissions = permissions[this.userRole] || [];
        return userPermissions.includes(module);
    }
}
```

### Proteção de Rotas

**Exemplo: Configurações (apenas Owner + Admin)**
```javascript
async function checkUserPermissions() {
    const permissionManager = new PermissionManager();
    await permissionManager.loadUserRole();
    
    const isOwner = localStorage.getItem('isOwner') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    // OWNER SEMPRE TEM ACESSO
    if (!isOwner && userRole !== 'admin') {
        notify.warning('Apenas administradores podem acessar esta página.');
        setTimeout(() => window.location.href = 'sitem.html', 2000);
        return false;
    }
    
    return true;
}
```

### Backend (server.js)

```javascript
// Verificar se usuário é owner do dashboard
app.get('/dashboard-members', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const dashboardId = req.headers['dashboard-id'];
    
    // Verificar se é owner
    db.get(
        `SELECT * FROM dashboard_members 
         WHERE dashboard_id = ? AND user_id = ?`,
        [dashboardId, userId],
        (err, userMember) => {
            if (!userMember || userMember.status !== 'owner') {
                return res.status(403).json({ 
                    error: 'Only owner can manage members' 
                });
            }
            // Continuar...
        }
    );
});
```

---

## Páginas Protegidas

### Acesso Apenas Owner + Admin
- ⚙️ **configuracao.html** - Configurações do dashboard

### Acesso Baseado em Função
Todas as páginas aplicam restrições via:
```javascript
window.permissionManager.loadUserRole().then(() => {
    window.permissionManager.applyRestrictions('modulo');
});
```

Quando usuário não tem permissão:
- 🔒 Botões de criar/editar/deletar ficam **desabilitados**
- 👁️ Inputs e textareas ficam **readonly**
- ⚠️ Mensagem: "Modo Somente Leitura"

### Owner NUNCA vê essas restrições
```javascript
if (this.isOwner) return; // Pula todas as restrições
```

---

## Verificação de Owner

### Frontend
```javascript
const isOwner = localStorage.getItem('isOwner') === 'true';

if (isOwner) {
    // Usuário é o criador - acesso total
}
```

### Backend
```javascript
const data = await db.get(
    `SELECT status FROM dashboard_members 
     WHERE user_id = ? AND dashboard_id = ?`,
    [userId, dashboardId]
);

const isOwner = data.status === 'owner';
```

---

## Hierarquia de Permissões

```
OWNER (Criador)
  ↓ Acesso Total - Sem Restrições
  ├─ Gerenciar membros
  ├─ Todas as configurações
  └─ Todos os módulos

ADMIN
  ↓ Acesso Total - Exceto gerenciar membros do dashboard
  ├─ Configurações
  └─ Todos os módulos (edição completa)

TESOUREIRO
  ↓ Financeiro + Documentos
  └─ Visualização nos demais

SECRETÁRIO
  ↓ Membros + Fotos + Documentos
  └─ Visualização nos demais

MÍDIA
  ↓ Fotos
  └─ Visualização nos demais

MEMBER
  ↓ Apenas Visualização
  └─ Todos os módulos (readonly)
```

---

## Status de Implementação

✅ **Owner tem acesso total implementado**
✅ **Verificações em permissions.js**
✅ **Proteções de rota no backend**
✅ **UI adaptativa (desabilita botões para não-autorizados)**
✅ **Configurações protegidas (owner + admin apenas)**
✅ **Sistema de hierarquia funcionando**

---

## Resumo

**O CRIADOR DO DASHBOARD (OWNER) TEM ACESSO TOTAL E IRRESTRITO A TODAS AS FUNCIONALIDADES.**

Isso está implementado através da verificação prioritária:
```javascript
if (this.isOwner) return true; // SEMPRE permite
```

Nenhuma restrição se aplica ao owner em nenhum módulo ou funcionalidade do sistema.
