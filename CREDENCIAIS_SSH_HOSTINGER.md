# 🔐 Credenciais SSH - Hostinger NEXO GESTOR

## 📋 Informações do Seu Servidor

| Campo | Valor |
|-------|-------|
| **IP** | 147.93.37.46 |
| **Porta** | 65002 |
| **Usuário** | u175345975 |
| **Senha** | (clique em "Alterar" na Hostinger) |
| **Domínio** | olive-dugong-260110.hostingersite.com |

---

## 🚀 Como Conectar via SSH

### Opção 1: Via PowerShell (Windows)

```powershell
ssh u175345975@147.93.37.46 -p 65002
```

Quando solicitar a senha, digite a senha SSH configurada no hPanel.

### Opção 2: Via PuTTY (Windows)

1. Baixe PuTTY: https://www.putty.org/
2. Configure:
   - **Host Name:** 147.93.37.46
   - **Port:** 65002
   - **Connection Type:** SSH
3. Clique em "Open"
4. Login: `u175345975`
5. Digite a senha

---

## 📤 Upload de Arquivos via SSH/SCP

### Enviar pasta deploy_hostinger para o servidor:

```powershell
scp -P 65002 -r deploy_hostinger/* u175345975@147.93.37.46:public_html/
```

### Enviar arquivo específico:

```powershell
scp -P 65002 arquivo.txt u175345975@147.93.37.46:public_html/
```

---

## 🔧 Comandos Úteis Após Conectar

### Navegar até seu site:
```bash
cd public_html
```

### Listar arquivos:
```bash
ls -la
```

### Instalar dependências do Node.js:
```bash
npm install
```

### Iniciar aplicação:
```bash
npm start
```

### Ver logs:
```bash
tail -f logs/app.log
```

### Verificar espaço em disco:
```bash
df -h
```

### Verificar processos Node.js:
```bash
ps aux | grep node
```

---

## 📦 Deploy Completo via SSH

Conecte ao servidor e execute:

```bash
# 1. Conectar
ssh u175345975@147.93.37.46 -p 65002

# 2. Navegar até o diretório
cd public_html

# 3. Fazer backup do banco de dados (se existir)
cp data/agenda2.db data/agenda2.db.backup

# 4. Instalar dependências
npm install

# 5. Verificar instalação
npm list

# 6. Iniciar servidor
npm start
```

---

## 🌐 Acessar Seu Site

Após o deploy, acesse:

**URL Temporária Hostinger:**
- https://olive-dugong-260110.hostingersite.com

**Quando configurar domínio próprio:**
- https://seudominio.com

---

## 🔑 Gerenciar Senha SSH

Para alterar a senha SSH:

1. Acesse hPanel
2. Vá em **Sites** → **olive-dugong-260110.hostingersite.com**
3. Seção **Acesso SSH** → Clique em **"Alterar"**
4. Defina uma nova senha forte

---

## 📁 Estrutura de Diretórios no Servidor

```
/home/u175345975/
├── public_html/              ← Seus arquivos do site aqui
│   ├── index.html
│   ├── server.js
│   ├── package.json
│   ├── data/
│   ├── uploads/
│   └── ...
├── logs/
└── tmp/
```

---

## ⚡ Script Automatizado de Deploy

Salve este script como `deploy_ssh.bat`:

```batch
@echo off
echo Fazendo deploy para Hostinger via SCP...
scp -P 65002 -r deploy_hostinger/* u175345975@147.93.37.46:public_html/
echo.
echo Deploy concluido!
echo.
echo Agora conecte via SSH e execute:
echo ssh u175345975@147.93.37.46 -p 65002
echo cd public_html
echo npm install
pause
```

Execute: `deploy_ssh.bat`

---

## 🐛 Troubleshooting

### "Connection refused"
- Verifique se está usando a porta **65002** (não a padrão 22)
- Comando correto: `ssh u175345975@147.93.37.46 -p 65002`

### "Permission denied"
- Confirme usuário: `u175345975`
- Verifique senha no hPanel → Acesso SSH

### "Host key verification failed"
```bash
ssh-keygen -R [147.93.37.46]:65002
```

### Não consegue conectar
- Verifique se SSH está habilitado no hPanel
- Alguns planos Hostinger não incluem SSH

---

## 📝 Notas Importantes

⚠️ **Porta SSH:** 65002 (NÃO use a porta padrão 22!)

⚠️ **Caminho do site:** Sempre use `public_html/`

⚠️ **Permissões:** Após upload, configure:
```bash
chmod 755 public_html/
chmod 755 uploads/
chmod 644 data/agenda2.db
```

⚠️ **Node.js:** Certifique-se que a aplicação Node.js está configurada no hPanel

---

## ✅ Checklist de Deploy via SSH

- [ ] Tenho a senha SSH configurada
- [ ] Consigo conectar: `ssh u175345975@147.93.37.46 -p 65002`
- [ ] Arquivos enviados para `public_html/`
- [ ] Executei `npm install`
- [ ] Configurei Node.js no hPanel
- [ ] Site acessível em olive-dugong-260110.hostingersite.com

---

**🔗 URL do Site:** https://olive-dugong-260110.hostingersite.com

**📞 Suporte Hostinger:** https://www.hostinger.com.br/contato
