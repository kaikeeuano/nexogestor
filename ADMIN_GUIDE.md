# Sistema de Administração - NEXO GESTOR

## 📋 Visão Geral

O sistema de administração permite que administradores do sistema gerenciem chaves de ativação para criação de novos dashboards.

## 🔑 Funcionalidades

### Para Administradores do Sistema

1. **Painel Administrativo** (`admin.html`)
   - Gerar chaves de ativação
   - Definir validade das chaves (7, 30, 60, 90, 180 dias ou sem expiração)
   - Visualizar todas as chaves (ativas, usadas e expiradas)
   - Excluir chaves não utilizadas
   - Copiar chaves para compartilhamento
   - Estatísticas em tempo real

2. **Endpoints API Administrativos**
   - `GET /admin/check` - Verifica se usuário é admin
   - `POST /admin/generate-key` - Gera nova chave de ativação
   - `GET /admin/activation-keys` - Lista todas as chaves
   - `DELETE /admin/activation-keys/:id` - Exclui uma chave

### Para Usuários Comuns

1. **Ativar Dashboard com Chave** (`dashboard.html`)
   - Botão "🎫 Ativar com Chave" na página de dashboards
   - Inserir chave fornecida pelo administrador
   - Dashboard criado automaticamente após validação

2. **Endpoint de Ativação**
   - `POST /activate-dashboard` - Ativa dashboard com chave válida

## 🚀 Como Usar

### 1. Definir um Administrador do Sistema

Para definir um usuário como administrador, execute:

```bash
node set_admin.js <username>
```

Exemplo:
```bash
node set_admin.js admin
```

### 2. Remover Privilégios de Admin (opcional)

```bash
node remove_admin.js <username>
```

### 3. Acessar o Painel Administrativo

1. Faça login com uma conta de administrador
2. Acesse `http://localhost:3000/admin.html`
3. O sistema verificará automaticamente se você tem permissões

### 4. Gerar Chave de Ativação

1. No painel admin, preencha:
   - **Nome do Dashboard** (opcional): Nome sugerido para o dashboard
   - **Validade da Chave**: Período de validade (padrão: 30 dias)

2. Clique em "✨ Gerar Chave"

3. Copie a chave gerada (formato: `NEXO-XXXXXXXX-XXXXXXXX`)

4. Compartilhe a chave com o usuário que criará o dashboard

### 5. Ativar Dashboard com Chave (Usuário Final)

1. Faça login no sistema
2. Na página de Dashboards, clique em "🎫 Ativar com Chave"
3. Cole a chave fornecida pelo administrador
4. Clique em "Ativar Dashboard"
5. O dashboard será criado automaticamente e você será redirecionado

## 📊 Estrutura do Banco de Dados

### Tabela: `users`
- `id` - ID do usuário
- `username` - Nome de usuário
- `password` - Senha criptografada
- `email` - Email
- `phone` - Telefone
- **`is_system_admin`** - Flag de administrador (0 = não, 1 = sim)

### Tabela: `activation_keys`
- `id` - ID da chave
- `key` - Chave de ativação única
- `dashboard_name` - Nome sugerido para o dashboard
- `created_at` - Data de criação
- `expires_at` - Data de expiração (NULL = sem expiração)
- `used_at` - Data de uso (NULL = não utilizada)
- `used_by_user_id` - ID do usuário que usou a chave
- `created_by_admin_id` - ID do admin que criou a chave

## 🔒 Segurança

- Apenas administradores do sistema podem acessar o painel admin
- Middleware `authenticateSystemAdmin` protege todas as rotas administrativas
- Chaves expiradas não podem ser utilizadas
- Chaves só podem ser usadas uma vez
- Histórico completo de criação e uso de chaves

## 📝 Status das Chaves

- **Ativa** 🟢 - Chave válida, não utilizada, não expirada
- **Utilizada** 🔵 - Chave já foi usada para criar um dashboard
- **Expirada** 🔴 - Chave passou da data de validade

## ⚙️ Configuração Inicial

1. Inicie o servidor:
```bash
npm start
```

2. Crie um usuário admin ou use um existente:
```bash
# Se ainda não tem usuário, registre-se em login.html primeiro
# Depois execute:
node set_admin.js seu_username
```

3. Acesse o painel admin:
```
http://localhost:3000/admin.html
```

## 🛠️ Scripts Úteis

- `set_admin.js` - Define um usuário como administrador
- `remove_admin.js` - Remove privilégios de administrador
- `debug_db.js` - Visualiza dados do banco (útil para debug)

## 📖 Exemplos de Uso

### Cenário 1: Criar chave para nova organização

```
1. Admin acessa admin.html
2. Preenche "Nome do Dashboard": "Região Norte"
3. Define validade: 30 dias
4. Gera a chave: NEXO-ABC12345-DEF67890
5. Envia a chave para o coordenador da região
6. Coordenador usa a chave e o dashboard é criado automaticamente
```

### Cenário 2: Gerenciar chaves existentes

```
1. Admin visualiza lista de chaves
2. Vê chaves ativas, usadas e expiradas
3. Pode copiar chaves ativas para compartilhar
4. Pode excluir chaves não utilizadas
5. Acompanha estatísticas em tempo real
```

## 🎯 Benefícios

- ✅ Controle centralizado de criação de dashboards
- ✅ Rastreabilidade completa (quem criou, quem usou, quando)
- ✅ Segurança através de chaves temporárias
- ✅ Interface intuitiva para administradores
- ✅ Processo simples para usuários finais
- ✅ Estatísticas e relatórios em tempo real

## 🆘 Suporte

Em caso de problemas:

1. Verifique se o servidor está rodando
2. Confirme que o usuário é administrador (`node set_admin.js <username>`)
3. Verifique os logs do servidor para erros
4. Consulte `debug_db.js` para verificar dados do banco

---

**Desenvolvido para NEXO GESTOR**
