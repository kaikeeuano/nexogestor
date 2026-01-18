# Script para verificar aspas misturadas em todos os arquivos HTML
Write-Host "=== VERIFICANDO ASPAS MISTURADAS ===" -ForegroundColor Cyan

$total_erros = 0
$arquivos_com_erro = @()

Get-ChildItem "*.html" | ForEach-Object {
    $arquivo = $_
    $conteudo = Get-Content $arquivo.FullName -Raw
    
    # Padrão: fetch(` ... '
    $pattern1 = 'fetch\(`[^`]*?[''"],'
    # Padrão: fetch(` ... "
    $pattern2 = 'fetch\(`[^`]*?",'
    
    $matches1 = [regex]::Matches($conteudo, $pattern1)
    $matches2 = [regex]::Matches($conteudo, $pattern2)
    
    $count = $matches1.Count + $matches2.Count
    
    if ($count -gt 0) {
        $total_erros += $count
        $arquivos_com_erro += $arquivo.Name
        Write-Host "$($arquivo.Name): $count erros" -ForegroundColor Red
        
        # Mostrar primeiros 3 exemplos
        $exemplos = $matches1 + $matches2 | Select-Object -First 3
        foreach ($exemplo in $exemplos) {
            Write-Host "  → $($exemplo.Value)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "$($arquivo.Name): OK ✓" -ForegroundColor Green
    }
}

Write-Host "`n=== RESUMO ===" -ForegroundColor Cyan
Write-Host "Total de erros: $total_erros" -ForegroundColor $(if ($total_erros -gt 0) { 'Red' } else { 'Green' })
Write-Host "Arquivos com erro: $($arquivos_com_erro.Count)" -ForegroundColor $(if ($arquivos_com_erro.Count -gt 0) { 'Red' } else { 'Green' })

if ($arquivos_com_erro.Count -gt 0) {
    Write-Host "`nArquivos para corrigir:" -ForegroundColor Yellow
    $arquivos_com_erro | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Yellow
    }
    
    Write-Host "`n💡 Execute: python fix_quotes.py" -ForegroundColor Cyan
    Write-Host "   Ou: .\deploy_now.bat" -ForegroundColor Cyan
} else {
    Write-Host "`n✅ Todos os arquivos estão corretos!" -ForegroundColor Green
}

Read-Host "`nPressione Enter para sair"
