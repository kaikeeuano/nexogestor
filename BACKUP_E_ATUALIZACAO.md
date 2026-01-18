# 📦 Guia de Backup e Atualização Sem Perder Dados

## 🎯 Resumo
Seus dados estão **seguros** e **persistem automaticamente** entre atualizações porque:
- ✅ Banco de dados SQLite em arquivo (`agenda2.db`)
- ✅ Uploads de arquivos em pasta (`uploads/`)
- ✅ GitHub não sobrescreve esses arquivos no deploy

---

## 📂 Onde estão seus dados?

### 1. **Banco de Dados** (CRÍTICO)
```
📁 agenda2.db (raiz do projeto)
```
**Contém:**
- Usuários e senhas
- Eventos da agenda
- Membros
- Projetos
- Transações financeiras
- Dashboards e sub-dashboards
- Chaves de ativação
- Configurações

### 2. **Arquivos de Upload** (IMPORTANTE)
```
📁 uploads/
  ├── logos/
  ├── documentos/
  └── fotos/
```
**Contém:**
- Logos das congregações
- Documentos anexados
- Fotos e imagens

---

## 🔄 Como Funciona o Deploy Automático

### Hostinger + GitHub
```
1. Você faz: git push
2. Hostinger detecta mudanças
3. Baixa APENAS código atualizado
4. NÃO toca em agenda2.db
5. NÃO toca em uploads/
```

**Por quê?**
- `.gitignore` exclui `agenda2.db` e `uploads/`
- Hostinger mantém arquivos existentes que não estão no Git

---

## ✅ Procedimento de Atualização Segura

### 1. **Atualização Simples (Código apenas)**
```bash
# No seu computador local
git add .
git commit -m "Descrição da atualização"
git push
```
**Resultado:** Código atualizado, dados intactos ✓

### 2. **Atualização com Nova Coluna no Banco**
Se você adicionar uma nova coluna, use `ALTER TABLE`:

```javascript
// No server.js
db.run(`ALTER TABLE users ADD COLUMN nova_coluna TEXT DEFAULT '';`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error(err);
  }
});
```

**Importante:** SQLite ignora se a coluna já existe!

### 3. **Atualização com Nova Tabela**
```javascript
// Sempre use CREATE TABLE IF NOT EXISTS
db.run(`CREATE TABLE IF NOT EXISTS nova_tabela (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campo TEXT
)`);
```

---

## 💾 Fazer Backup (Recomendado)

### Opção 1: Via FileZilla (Manual)
```
1. Conectar via SFTP (FileZilla)
   Host: sftp://147.93.37.46:65002
   User: u175345975
   Pass: Adellan.1

2. Baixar arquivos:
   - /public_html/agenda2.db
   - /public_html/uploads/ (pasta inteira)

3. Salvar em local seguro com data:
   backup_2026-01-18_agenda2.db
```

### Opção 2: Via SSH (Avançado)
```bash
# Conectar via SSH
ssh u175345975@147.93.37.46 -p 65002

# Criar backup
cd public_html
tar -czf backup_$(date +%Y%m%d).tar.gz agenda2.db uploads/

# Baixar com FileZilla ou SFTP
```

### Opção 3: Script Automático (Criar no futuro)
```javascript
// backup.js
const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().split('T')[0];
const backupDir = './backups';

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Copiar banco de dados
fs.copyFileSync(
  './agenda2.db',
  path.join(backupDir, `agenda2_${timestamp}.db`)
);

console.log(`✓ Backup criado: agenda2_${timestamp}.db`);
```

---

## 🚨 Situações de Emergência

### Problema: "Perdi meus dados!"
**Solução:**
1. Verifique se `agenda2.db` existe no servidor via FileZilla
2. Se existe, provavelmente é problema de código, não de dados
3. Restaure código anterior: `git revert HEAD`

### Problema: "Banco corrompido"
**Solução:**
```bash
# Verificar integridade
sqlite3 agenda2.db "PRAGMA integrity_check;"

# Se corrompido, restaurar backup
# Via FileZilla, substituir agenda2.db pelo backup
```

### Problema: "Quero testar em local antes"
**Solução:**
```bash
# Baixar banco de produção via FileZilla
# Copiar para pasta local
# Renomear para agenda2.db

# Rodar localmente
npm start

# Testar mudanças
# Só fazer push quando tudo funcionar
```

---

## 📋 Checklist de Atualização Segura

### Antes de Atualizar:
- [ ] Código testado localmente
- [ ] Backup do banco feito (opcional mas recomendado)
- [ ] Commit com mensagem descritiva
- [ ] Verificar se .gitignore exclui agenda2.db e uploads/

### Durante Atualização:
- [ ] `git push` executado
- [ ] Aguardar 2-3 minutos para deploy
- [ ] Verificar logs no hPanel se houver erro

### Após Atualização:
- [ ] Testar login no site
- [ ] Verificar se dados aparecem (membros, eventos, etc)
- [ ] Testar novas funcionalidades
- [ ] Se houver problema, reverter: `git revert HEAD && git push`

---

## 🔐 Arquivos que NUNCA devem ir pro Git

Já configurado em `.gitignore`:
```
agenda2.db          # Banco de dados
agenda.db           # Banco antigo
uploads/*           # Arquivos enviados
node_modules/       # Dependências npm
.env                # Variáveis de ambiente
*.db                # Qualquer arquivo .db
```

---

## 🎓 Boas Práticas

### 1. **Backup Regular**
- Semanal: backup manual via FileZilla
- Antes de grandes mudanças: sempre fazer backup

### 2. **Migrações Seguras**
```javascript
// ✓ CORRETO - Adiciona coluna se não existir
db.run(`ALTER TABLE users ADD COLUMN email TEXT;`, (err) => {
  if (err && !err.message.includes('duplicate')) console.error(err);
});

// ✗ ERRADO - Pode dar erro se coluna existir
db.run(`ALTER TABLE users ADD COLUMN email TEXT;`);
```

### 3. **Testar Localmente Primeiro**
```bash
# Sempre teste no localhost antes de fazer push
npm start
# Testar todas as funcionalidades
# Só então: git push
```

### 4. **Commits Frequentes**
```bash
# Pequenas mudanças são mais fáceis de reverter
git add .
git commit -m "Adicionar validação de email"
git push

# Evite commits gigantes com muitas mudanças
```

---

## 🆘 Comandos Úteis de Emergência

### Reverter última atualização
```bash
git revert HEAD
git push
```

### Ver histórico de mudanças
```bash
git log --oneline
```

### Voltar para versão específica
```bash
git checkout <commit-hash>
git checkout -b fix-temporario
# Testar
# Se funcionar:
git checkout main
git merge fix-temporario
git push
```

### Baixar banco de produção
```bash
# Via FileZilla:
# 147.93.37.46:65002 → public_html/agenda2.db
# Baixar para sua máquina
```

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────┐
│  Seu Computador (desenvolvimento)      │
│  ├── server.js (código)                │
│  ├── *.html (código)                   │
│  ├── agenda2.db (dados LOCAL)          │
│  └── uploads/ (arquivos LOCAL)         │
└────────────┬────────────────────────────┘
             │ git push
             │ (só código!)
             ▼
┌─────────────────────────────────────────┐
│  GitHub (repositório)                   │
│  ├── server.js ✓                        │
│  ├── *.html ✓                           │
│  ├── agenda2.db ✗ (ignorado)            │
│  └── uploads/ ✗ (ignorado)              │
└────────────┬────────────────────────────┘
             │ deploy automático
             │ (só código!)
             ▼
┌─────────────────────────────────────────┐
│  Hostinger (produção)                   │
│  ├── server.js (ATUALIZADO)             │
│  ├── *.html (ATUALIZADO)                │
│  ├── agenda2.db (MANTIDO)               │
│  └── uploads/ (MANTIDO)                 │
└─────────────────────────────────────────┘
```

**Conclusão:** Seus dados estão seguros! 🎉

---

## 🔗 Links Úteis

- **FileZilla:** https://filezilla-project.org/
- **SQLite Browser:** https://sqlitebrowser.org/ (para ver banco localmente)
- **hPanel Hostinger:** https://hpanel.hostinger.com/

---

**Dúvidas?** Sempre faça backup antes de mudanças críticas! 💾
