#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Script para fazer commit e push via Python"""

import subprocess
import os

os.chdir(r'd:\NEXO GESTOR')

print("=" * 50)
print("  NEXO GESTOR - Git Push")
print("=" * 50)
print()

# Git add
print("[1/3] Adicionando arquivos...")
result = subprocess.run(
    ["git", "add", "drivdoc.html", "drivfotos.html", "membros.html", "projetos.html", 
     "commit_and_deploy.bat", "integrate_notify.ps1", "check_all_quotes.ps1", 
     "DIAGNOSTICO_RAPIDO.md", "DEPLOY_AGORA.cmd", "notify.js", "git_push.py"],
    capture_output=True,
    text=True
)
print("✓ Arquivos adicionados")
print()

# Git commit
print("[2/3] Criando commit...")
result = subprocess.run(
    ["git", "commit", "-m", "Fix: Corrigir aspas em fetch() - uploads e adicoes"],
    capture_output=True,
    text=True
)
if result.returncode == 0:
    print("✓ Commit criado")
    print(result.stdout)
else:
    print("⚠ Commit:", result.stderr if result.stderr else "Nada para commitar")
print()

# Git push
print("[3/3] Enviando para GitHub...")
result = subprocess.run(
    ["git", "push", "origin", "main"],
    capture_output=True,
    text=True
)
if result.returncode == 0:
    print("✓ Push concluído!")
    print(result.stdout)
else:
    print("✗ Erro no push:")
    print(result.stderr)
print()

print("=" * 50)
print("✅ CONCLUÍDO!")
print("=" * 50)
print()
print("Aguarde 2-3 minutos para deploy no Hostinger.")
print()
input("Pressione Enter para sair...")
