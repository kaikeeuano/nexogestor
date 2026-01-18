#!/bin/bash
# Script para tornar usuário kaike.adellan admin

cd ~/public_html

echo "Tornando kaike.adellan administrador..."

if command -v sqlite3 &> /dev/null; then
    sqlite3 data/agenda2.db "UPDATE users SET is_admin = 1 WHERE username = 'kaike.adellan';"
    echo "✅ Usuário kaike.adellan promovido a admin!"
    sqlite3 data/agenda2.db "SELECT username, email, is_admin FROM users WHERE username = 'kaike.adellan';"
else
    echo "❌ sqlite3 não encontrado. Use a interface web para criar o admin."
fi
