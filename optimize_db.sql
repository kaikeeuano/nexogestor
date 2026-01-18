-- Script para otimizar o banco de dados com índices

-- Índices para tabela events (agenda)
CREATE INDEX IF NOT EXISTS idx_events_dashboard ON events(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- Índices para tabela members (membros)
CREATE INDEX IF NOT EXISTS idx_members_dashboard ON members(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_members_congregation ON members(congregation);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

-- Índices para tabela dashboard_members (usuários do dashboard)
CREATE INDEX IF NOT EXISTS idx_dashboard_members_dashboard ON dashboard_members(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_members_user ON dashboard_members(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_members_status ON dashboard_members(status);

-- Índices para tabela projects (projetos)
CREATE INDEX IF NOT EXISTS idx_projects_dashboard ON projects(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Índices para tabela project_observations
CREATE INDEX IF NOT EXISTS idx_project_obs_project ON project_observations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_obs_date ON project_observations(observation_date);

-- Índices para tabela project_files
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);

-- Índices para tabela files (documentos/fotos)
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_dashboard ON files(dashboard_id);

-- Índices para tabela folders
CREATE INDEX IF NOT EXISTS idx_folders_dashboard ON folders(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_folders_type ON folders(type);

-- Índices para tabela transactions (financeiro)
CREATE INDEX IF NOT EXISTS idx_transactions_dashboard ON transactions(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Índices para tabela pregacoes
CREATE INDEX IF NOT EXISTS idx_pregacoes_dashboard ON pregacoes(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_pregacoes_date ON pregacoes(date);

-- Índices para tabela congregations
CREATE INDEX IF NOT EXISTS idx_congregations_dashboard ON congregations(dashboard_id);

-- Índices para tabela roles
CREATE INDEX IF NOT EXISTS idx_roles_dashboard ON roles(dashboard_id);

-- Índices para tabela activation_keys
CREATE INDEX IF NOT EXISTS idx_activation_keys_key ON activation_keys(key);
CREATE INDEX IF NOT EXISTS idx_activation_keys_used ON activation_keys(used);
CREATE INDEX IF NOT EXISTS idx_activation_keys_dashboard ON activation_keys(dashboard_id);

-- Índices para tabela users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Analyze para atualizar estatísticas
ANALYZE;
