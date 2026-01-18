# Script para integrar notify.js em todos os HTML
Write-Host "=== INTEGRANDO NOTIFY.JS ===" -ForegroundColor Cyan

$htmlFiles = Get-ChildItem "*.html" -Exclude "login.html"

foreach ($file in $htmlFiles) {
    Write-Host "`nProcessando $($file.Name)..." -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Verifica se já tem notify.js
    if ($content -match '<script src="notify\.js"></script>') {
        Write-Host "  ✓ Já possui notify.js" -ForegroundColor Green
        continue
    }
    
    # Verifica se tem notifications.js
    if ($content -match '<script src="notifications\.js"></script>') {
        # Substitui notifications.js por notify.js
        $content = $content -replace '<script src="notifications\.js"></script>', '<script src="notify.js"></script>'
        Write-Host "  ✓ Substituído notifications.js por notify.js" -ForegroundColor Green
    }
    else {
        # Adiciona notify.js antes do </head>
        if ($content -match '</head>') {
            $content = $content -replace '</head>', "    <script src=`"notify.js`"></script>`n</head>"
            Write-Host "  ✓ Adicionado notify.js no <head>" -ForegroundColor Green
        }
        else {
            Write-Host "  ✗ Não encontrou tag </head>" -ForegroundColor Red
            continue
        }
    }
    
    # Salva o arquivo
    Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
    Write-Host "  ✓ Arquivo salvo" -ForegroundColor Green
}

Write-Host "`n=== CONCLUÍDO ===" -ForegroundColor Cyan
Write-Host "notify.js integrado em todos os arquivos HTML!" -ForegroundColor Green

Read-Host "`nPressione Enter para sair"
