# 🎯 NEXO GESTOR - INÍCIO RÁPIDO

## ⚡ Deploy em 5 Minutos

### Passo 1: Preparar Arquivos (1 minuto)

**Execute no terminal:**
```bash
.\deploy_hostinger.bat
```

✅ Isso cria a pasta `deploy_hostinger/` com tudo pronto!

---

### Passo 2: Gerar Chave Secreta (30 segundos)

**Execute:**
```bash
npm run generate:key
```

**Copie uma das chaves geradas**, exemplo:
```
SECRET_KEY=931bde481ae4f20a3c8bf79eb4a882a01edc24204e83b30a4c845f0532fa8c83
```

**Abra:** `deploy_hostinger\.env`

**Cole a chave** substituindo a linha:
```env
SECRET_KEY=ALTERE_ESTA_CHAVE_SECRETA_FORTE_123456!@#$
```

Por:
```env
SECRET_KEY=931bde481ae4f20a3c8bf79eb4a882a01edc24204e83b30a4c845f0532fa8c83
```

---

### Passo 3: Upload via FTP (2-3 minutos)

**Opção A - FileZilla (Mais Fácil):**

1. Baixe: https://filezilla-project.org/
2. Conecte:
   - **Host:** ftp.seudominio.com
   - **Usuário:** (do hPanel)
   - **Senha:** (do hPanel)
3. Arraste **todos os arquivos** de `deploy_hostinger\` para `/public_html`

**Opção B - hPanel:**

1. Acesse hPanel → Gerenciador de Arquivos
2. Vá em `/public_html`
3. Clique "Upload" e envie tudo de `deploy_hostinger\`

---

### Passo 4: Configurar Node.js (1 minuto)

**No hPanel:**

1. **Avançado** → **Aplicações Node.js** → **Criar Aplicação**

2. Preencha:
   ```
   Versão: Node.js 18.x
   Diretório: /public_html
   Arquivo: server.js
   Modo: Produção
   ```

3. **Adicione variáveis de ambiente** (copie do `.env`):
   ```
   SECRET_KEY = (sua chave gerada)
   NODE_ENV = production
   PORT = 3000
   ```

4. Clique **Criar**

---

### Passo 5: Instalar e Iniciar (30 segundos)

**Via Interface:**
- Clique em "Instalar Dependências"
- Clique em "Iniciar Aplicação"
- Aguarde status ficar **verde (Executando)**

**OU via SSH:**
```bash
ssh usuario@seudominio.com
cd public_html
npm install
```

---

## ✅ PRONTO!

Acesse: **https://seudominio.com**

---

## 🆘 Problemas?

### Aplicação não inicia?
👉 Veja os logs: hPanel → Aplicações Node.js → Logs

### Erro 500?
👉 Verifique se o banco de dados foi enviado: `/public_html/data/agenda2.db`

### Upload não funciona?
👉 Via SSH: `chmod 755 uploads/`

---

## 📚 Mais Informações

| Precisa de... | Veja |
|---------------|------|
| Guia completo detalhado | [GUIA_DEPLOY_COMPLETO.md](GUIA_DEPLOY_COMPLETO.md) |
| Checklist passo a passo | [CHECKLIST_DEPLOY.md](CHECKLIST_DEPLOY.md) |
| Resumo executivo | [PRONTO_PARA_DEPLOY.md](PRONTO_PARA_DEPLOY.md) |
| Guia ultra-rápido | [DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md) |

---

## 🎯 Comandos Úteis

```bash
# Preparar deploy
.\deploy_hostinger.bat

# Gerar chave secreta
npm run generate:key

# Desenvolvimento local
npm install
npm start

# Acessar local
http://localhost:3000
```

---

**🚀 Seu NEXO GESTOR no ar em 5 minutos!**
