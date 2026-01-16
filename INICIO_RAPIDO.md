# 🚀 INÍCIO RÁPIDO - Painel Administrativo

## Em 5 minutos, você terá o sistema funcionando!

### 1. Inicie o Servidor (se ainda não estiver rodando)
```bash
npm start
```

### 2. Crie um Usuário Admin

#### Opção A: Usar usuário existente
```bash
node set_admin.js seu_username_existente
```

#### Opção B: Criar novo usuário
1. Acesse: http://localhost:3000/login.html
2. Clique em "Criar Conta"
3. Preencha os dados e registre-se
4. Execute:
```bash
node set_admin.js seu_novo_username
```

### 3. Acesse o Painel Admin
1. Abra: http://localhost:3000/admin.html
2. Faça login com sua conta de admin
3. Pronto! Você está no painel administrativo

### 4. Gere sua Primeira Chave
1. Preencha:
   - Nome do Dashboard: "Meu Primeiro Dashboard"
   - Validade: 30 dias
2. Clique em "✨ Gerar Chave"
3. Copie a chave gerada

### 5. Teste a Ativação
1. Abra uma aba anônima ou use outro navegador
2. Acesse: http://localhost:3000/login.html
3. Crie uma nova conta de usuário comum
4. Vá para: http://localhost:3000/dashboard.html
5. Clique em "🎫 Ativar com Chave"
6. Cole a chave e clique em "Ativar Dashboard"
7. ✅ Dashboard criado!

## 🎯 Comandos Úteis

```bash
# Definir admin
node set_admin.js username

# Remover admin
node remove_admin.js username

# Testar sistema
node test_admin_system.js

# Ver dados do banco
node debug_db.js
```

## 📌 URLs Importantes

- Login: http://localhost:3000/login.html
- Painel Admin: http://localhost:3000/admin.html
- Dashboards: http://localhost:3000/dashboard.html

## 💡 Dicas

- Chaves têm formato: `NEXO-XXXXXXXX-XXXXXXXX`
- Cada chave só pode ser usada uma vez
- Chaves expiradas não podem ser usadas
- Admin pode ver todas as chaves e estatísticas

## ❓ Problemas?

1. **Não consigo acessar o painel admin**
   - Verifique se o usuário é admin: `node set_admin.js username`

2. **Chave inválida ao ativar**
   - Verifique se a chave não expirou
   - Confirme que a chave não foi usada
   - Cole a chave completa sem espaços

3. **Servidor não está rodando**
   - Execute: `npm start`
   - Acesse: http://localhost:3000

---

**É isso! Sistema pronto para uso! 🎉**
