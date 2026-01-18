# 🔧 Guia de Diagnóstico Rápido - NEXO GESTOR

## ⚡ Problemas Reportados

### 1. ❌ Não está adicionando documentos
**Arquivo:** drivdoc.html  
**Diagnóstico:** Verificar console do navegador (F12)  
**Possível causa:** Aspas misturadas em fetch()

### 2. ❌ Não está adicionando fotos
**Arquivo:** drivfotos.html  
**Diagnóstico:** Verificar console do navegador (F12)  
**Possível causa:** Aspas misturadas em fetch()

### 3. ❌ Não está adicionando membro no dashboard
**Arquivo:** membros.html  
**Diagnóstico:** Verificar console do navegador (F12)  
**Possível causa:** Aspas misturadas em fetch()

### 4. ❌ Não está aparecendo os usuários em gerenciamento de membros
**Arquivo:** configuracao.html  
**Diagnóstico:** Logs já adicionados  
**Status:** EM INVESTIGAÇÃO

### 5. ❌ Não está adicionando projeto em projetos
**Arquivo:** projetos.html  
**Diagnóstico:** Verificar console do navegador (F12)  
**Possível causa:** Aspas misturadas em fetch()

### 6. ❌ Não está criando dashboard de pregação
**Arquivo:** dashboard.html  
**Diagnóstico:** Verificar console do navegador (F12)  
**Possível causa:** Botão não configurado corretamente

---

## 🔍 CAUSA RAIZ PROVÁVEL

**ASPAS MISTURADAS EM FETCH()**

```javascript
// ❌ ERRADO (causa TypeError e não envia requisição)
fetch(`${API_BASE}/members', {
  method: 'POST',
  // ...
})

// ✅ CORRETO
fetch(`${API_BASE}/members`, {
  method: 'POST',
  // ...
})
```

---

## 🚀 SOLUÇÃO RÁPIDA

### Passo 1: Execute o script de correção
```bash
cd "d:\NEXO GESTOR"
python fix_quotes.py
```

### Passo 2: Faça commit e deploy
```bash
.\deploy_now.bat
```

### Passo 3: Aguarde 2-3 minutos
Hostinger fará deploy automático

### Passo 4: Teste cada funcionalidade
Abra F12 → Console e veja se há erros

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Execute este comando para verificar todos os arquivos:

```powershell
Get-ChildItem *.html | ForEach-Object {
    $erros = Select-String -Path $_ -Pattern "fetch\(\`.*['\"],"
    if ($erros) {
        Write-Host "$($_.Name): $($erros.Count) erros"
    }
}
```

---

## 🎨 NOTIFICAÇÕES MODERNAS IMPLEMENTADAS

Agora todos os arquivos podem usar:

```javascript
notify.success('Membro adicionado com sucesso!');
notify.error('Erro ao salvar');
notify.warning('Atenção: verifique os campos');
notify.info('Processando...');

// Com opções
notify.success('Salvo!', {
    title: 'Sucesso',
    duration: 3000
});
```

---

## 📝 ARQUIVOS QUE PRECISAM INCLUIR notify.js

Adicione antes do `</body>` em TODOS os HTMLs:

```html
<script src="notify.js"></script>
<script>
    // Seu código aqui pode usar notify
</script>
```

---

## 🔧 COMO CORRIGIR MANUALMENTE

Se o script falhar, corrija manualmente:

1. Abra o arquivo HTML
2. Procure por `fetch(`
3. Verifique se termina com `` ` `` (crase) e não `'` ou `"`
4. Exemplo:
   ```javascript
   // Antes
   fetch(`${API_BASE}/members', {
   
   // Depois
   fetch(`${API_BASE}/members`, {
   ```

---

## 🆘 SE NADA FUNCIONAR

1. Abra F12 no navegador
2. Vá na aba Console
3. Tente realizar a ação
4. Copie o erro exato que aparece
5. Me envie o erro

---

## ✅ TESTES APÓS CORREÇÃO

- [ ] Adicionar documento em drivdoc
- [ ] Adicionar foto em drivfotos
- [ ] Adicionar membro em membros
- [ ] Ver usuários em configuração
- [ ] Adicionar projeto em projetos
- [ ] Criar dashboard de pregação
- [ ] Adicionar congregação
- [ ] Adicionar cargo

---

**Última atualização:** 18 de Janeiro de 2026
