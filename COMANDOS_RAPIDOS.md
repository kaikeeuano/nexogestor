# 🚀 Comandos Rápidos - Backup e Deploy

## 📦 Fazer Backup Local
```bash
node backup.js
```
Cria backup em `./backups/` com data no nome.

## 🔄 Atualizar Sistema (Deploy)
```bash
# 1. Adicionar mudanças
git add .

# 2. Criar commit
git commit -m "Descrição das mudanças"

# 3. Enviar para produção
git push
```

## 💾 Backup Manual (Hostinger)
Via FileZilla:
```
Host: sftp://147.93.37.46:65002
User: u175345975
Pass: Adellan.1

Baixar:
- /public_html/agenda2.db
- /public_html/uploads/
```

## 🆘 Reverter Atualização
```bash
git revert HEAD
git push
```

## 📋 Checklist Antes de Atualizar
- [ ] Testar localmente (npm start)
- [ ] Fazer backup (node backup.js)
- [ ] Commit e push
- [ ] Aguardar 2-3 min
- [ ] Testar em produção

---
**Lembre-se:** Seus dados (agenda2.db e uploads/) NÃO são afetados pelo deploy!
