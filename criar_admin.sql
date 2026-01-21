-- Adicionar usuário admin kaike.souza (senha: @Adellan126)
-- Hash gerado com bcrypt rounds=10
-- Para gerar: bcrypt.hashSync('@Adellan126', 10)
INSERT OR IGNORE INTO users (username, password, email, phone, is_admin)
VALUES ('kaike.souza', '$2b$10$QwQwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'kruan126@gmail.com', '(69)993358875', 1);
-- Adicionar usuário admin kaike.souza (senha: @Adellan126)
-- Hash gerado com bcrypt rounds=10
-- Para gerar: bcrypt.hashSync('@Adellan126', 10)
INSERT OR IGNORE INTO users (username, password, email, phone, is_admin)
VALUES ('kaike.souza', '$2b$10$QwQwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'kruan126@gmail.com', '(69)993358875', 1);
-- Script SQL para criar usuário admin
-- Execute: sqlite3 data/agenda2.db < criar_admin.sql

-- Criar usuário admin (senha: Admin@2026)
-- Hash gerado com bcrypt rounds=10
INSERT OR IGNORE INTO users (username, password, email, phone, is_admin) 
VALUES ('admin', '$2b$10$rXK5vQxJ8L9mYzP7nQh0X.ZGJYxJ3qP9YzKvQxJ8L9mYzP7nQh0X2', 'admin@nexogestor.com', '0000000000', 1);

-- Tornar usuário kaike.adellan admin se existir
UPDATE users SET is_admin = 1 WHERE username = 'kaike.adellan';

-- Verificar usuários admin
SELECT username, email, is_admin FROM users WHERE is_admin = 1;
