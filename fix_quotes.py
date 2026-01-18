import os
import re
import glob

print("🔍 Verificando aspas misturadas em arquivos HTML...\n")

html_files = glob.glob("*.html")
erros_totais = 0
arquivos_corrigidos = []

for arquivo in html_files:
    with open(arquivo, 'r', encoding='utf-8') as f:
        conteudo = f.read()
    
    # Procurar padrões problemáticos
    problemas = []
    
    # Padrão 1: fetch(`${API_BASE}...', ou fetch(`${API_BASE}...",
    if re.search(r'fetch\(`\$\{API_BASE\}[^`]*?[\'"]', conteudo):
        problemas.append("fetch com aspas misturadas")
    
    # Padrão 2: method: `...'
    if re.search(r'method:\s*`[^`]*?\'', conteudo):
        problemas.append("method com aspas misturadas")
    
    if problemas:
        print(f"❌ {arquivo}:")
        for p in problemas:
            print(f"   - {p}")
        
        # Corrigir automaticamente
        conteudo_corrigido = conteudo
        
        # Fix 1: Substituir fetch(`...', por fetch(`...`,
        conteudo_corrigido = re.sub(
            r'(fetch\(`\$\{API_BASE\}[^`]*?)\',',
            r'\1`,',
            conteudo_corrigido
        )
        
        # Fix 2: Substituir fetch(`...", por fetch(`...`,
        conteudo_corrigido = re.sub(
            r'(fetch\(`\$\{API_BASE\}[^`]*?)\",',
            r'\1`,',
            conteudo_corrigido
        )
        
        # Fix 3: Substituir method: `...' por method: '...'
        conteudo_corrigido = re.sub(
            r'method:\s*`([^`]*?)\'',
            r"method: '\1'",
            conteudo_corrigido
        )
        
        if conteudo_corrigido != conteudo:
            with open(arquivo, 'w', encoding='utf-8', newline='') as f:
                f.write(conteudo_corrigido)
            print(f"   ✓ Corrigido automaticamente")
            arquivos_corrigidos.append(arquivo)
            erros_totais += len(problemas)
        print()

print(f"\n{'='*50}")
print(f"✓ {len(arquivos_corrigidos)} arquivos corrigidos")
print(f"✓ {erros_totais} erros corrigidos")

if arquivos_corrigidos:
    print(f"\nArquivos modificados:")
    for arq in arquivos_corrigidos:
        print(f"  - {arq}")
else:
    print("\n✓ Nenhum erro encontrado!")
