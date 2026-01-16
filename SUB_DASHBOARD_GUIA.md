# Guia de Sub-Dashboards por Congregação

## O que é um Sub-Dashboard?

Um Sub-Dashboard é um dashboard limitado a uma única congregação específica. Ele permite criar áreas restritas onde apenas membros de uma congregação podem ser adicionados e gerenciados.

## Funcionalidades

### 1. Criação de Sub-Dashboard

**Onde:** Configurações > Sub-Dashboards por Congregação

**Como criar:**
1. Acesse a página de Configurações
2. Role até a seção "Sub-Dashboards por Congregação"
3. Digite o nome do sub-dashboard (ex: "Dashboard Congregação Central")
4. Selecione a congregação no dropdown
5. Clique em "Criar Sub-Dashboard"
6. Um código de acesso será gerado - compartilhe este código com membros dessa congregação

### 2. Restrições do Sub-Dashboard

Quando um sub-dashboard é criado:
- **Membros:** Só é possível adicionar/editar membros da congregação especificada
- **Filtro Automático:** A lista de membros mostra apenas os da congregação restrita
- **Campo Congregação:** Fica bloqueado na tela de adicionar/editar membros
- **Alerta Visual:** Uma mensagem amarela indica que o dashboard tem restrições

### 3. Gerenciamento

**Listar Sub-Dashboards:**
- Na página de Configurações, veja todos os sub-dashboards criados
- Cada item mostra: Nome, Congregação Restrita e Código de Acesso
- Clique no código para copiar para a área de transferência

**Excluir Sub-Dashboard:**
- Clique no botão "Excluir" ao lado do sub-dashboard
- Confirme a exclusão
- **ATENÇÃO:** Todos os dados associados serão perdidos

## Acesso ao Sub-Dashboard

1. Usuários podem entrar no sub-dashboard usando o código de acesso
2. Ao acessar a página de Membros, verão o alerta indicando a restrição
3. Só poderão trabalhar com membros da congregação específica

## Estrutura Técnica

### Banco de Dados
- **parent_dashboard_id:** ID do dashboard principal
- **restricted_congregation:** Nome da congregação restrita

### Endpoints da API
- `GET /config/subdashboards` - Lista sub-dashboards
- `POST /config/subdashboards` - Cria novo sub-dashboard
- `DELETE /config/subdashboards/:id` - Remove sub-dashboard
- `GET /dashboard/info` - Obtém informações incluindo restrições

### Validação
- Ao adicionar/editar membros, valida se a congregação corresponde à restrição
- Retorna erro 403 se tentar adicionar membro de outra congregação

## Casos de Uso

### Exemplo 1: Igreja com Múltiplas Congregações
Uma igreja tem 3 congregações: Central, Norte e Sul. O administrador pode:
- Criar um dashboard principal com todas as congregações
- Criar 3 sub-dashboards, um para cada congregação
- Dar acesso aos líderes de cada congregação apenas ao seu sub-dashboard

### Exemplo 2: Controle de Acesso
Permitir que secretários locais gerenciem apenas membros de sua congregação, sem acesso aos dados de outras congregações.

## Dicas

- Use nomes descritivos para os sub-dashboards (ex: "Gestão - Congregação Norte")
- Guarde os códigos de acesso em local seguro
- Configure as congregações antes de criar sub-dashboards
- Sub-dashboards herdam as configurações de cargos do dashboard principal

## Limitações Atuais

- Um sub-dashboard está vinculado a apenas UMA congregação
- Não é possível alterar a congregação após criar o sub-dashboard
- Membros só podem ser adicionados através do dashboard/sub-dashboard específico

## Suporte

Para dúvidas ou problemas, verifique:
1. Se as congregações foram criadas corretamente em Configurações
2. Se o servidor está rodando (`node server.js`)
3. Logs do console do navegador (F12) para mensagens de erro
