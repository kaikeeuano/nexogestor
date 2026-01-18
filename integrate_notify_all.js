#!/usr/bin/env node
/**
 * Script para integrar notify.js e substituir alert() em todos os HTMLs
 */

const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'dashboard.html',
    'admin.html',
    'reset-password.html',
    'pregacoes.html',
    'drivfotos.html',
    'drivdoc.html',
    'membros.html',
    'dashboard_membros.html',
    'configuracao.html',
    'agenda.html',
    'login.html',
    'financeiro.html',
    'projetos.html',
    'servicos.html',
    'contato.html',
    'sitem.html',
    'gestao.html',
    'relatorios.html',
    'sobre.html'
];

console.log('\n🚀 Integrando notify.js em todos os módulos...\n');

let totalFiles = 0;
let totalReplacements = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⏭️  ${file} - Não encontrado, pulando...`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let replacements = 0;
    
    // 1. Adicionar notify.js se não existir
    if (!content.includes('notify.js')) {
        // Adiciona antes do </head>
        if (content.includes('</head>')) {
            content = content.replace('</head>', '    <script src="notify.js"></script>\n</head>');
            console.log(`✅ ${file} - notify.js adicionado`);
        }
    }
    
    // 2. Substituir alert() de erro
    const errorPatterns = [
        { pattern: /alert\('Erro:([^']+)'\)/g, replace: `notify.error('$1', { title: 'Erro' })` },
        { pattern: /alert\("Erro:([^"]+)"\)/g, replace: `notify.error('$1', { title: 'Erro' })` },
        { pattern: /alert\('❌([^']+)'\)/g, replace: `notify.error('$1')` },
        { pattern: /alert\("❌([^"]+)"\)/g, replace: `notify.error('$1')` },
        { pattern: /alert\(\`Erro:([^\`]+)\`\)/g, replace: "notify.error(`$1`, { title: 'Erro' })" },
        { pattern: /alert\(\`❌([^\`]+)\`\)/g, replace: "notify.error(`$1`)" },
    ];
    
    errorPatterns.forEach(({ pattern, replace }) => {
        const before = content;
        content = content.replace(pattern, replace);
        if (content !== before) replacements++;
    });
    
    // 3. Substituir alert() de sucesso
    const successPatterns = [
        { pattern: /alert\('✅([^']+)'\)/g, replace: `notify.success('$1')` },
        { pattern: /alert\("✅([^"]+)"\)/g, replace: `notify.success('$1')` },
        { pattern: /alert\(\`✅([^\`]+)\`\)/g, replace: "notify.success(`$1`)" },
        { pattern: /alert\('([^']*sucesso[^']+)'\)/gi, replace: `notify.success('$1')` },
        { pattern: /alert\("([^"]*sucesso[^"]+)"\)/gi, replace: `notify.success('$1')` },
        { pattern: /alert\(\`([^\`]*sucesso[^\`]+)\`\)/gi, replace: "notify.success(`$1`)" },
    ];
    
    successPatterns.forEach(({ pattern, replace }) => {
        const before = content;
        content = content.replace(pattern, replace);
        if (content !== before) replacements++;
    });
    
    // 4. Substituir showAlert() por notify
    content = content.replace(/showAlert\(([^,]+),\s*'error'\)/g, 'notify.error($1)');
    content = content.replace(/showAlert\(([^,]+),\s*"error"\)/g, 'notify.error($1)');
    content = content.replace(/showAlert\(([^,]+),\s*'success'\)/g, 'notify.success($1)');
    content = content.replace(/showAlert\(([^,]+),\s*"success"\)/g, 'notify.success($1)');
    content = content.replace(/showAlert\(([^,]+),\s*'warning'\)/g, 'notify.warning($1)');
    content = content.replace(/showAlert\(([^,]+),\s*"warning"\)/g, 'notify.warning($1)');
    
    // 5. Alertas genéricos restantes
    const genericAlerts = content.match(/alert\([^)]+\)/g);
    if (genericAlerts) {
        genericAlerts.forEach(alertCall => {
            // Ignora se já foi substituído
            if (alertCall.includes('notify.')) return;
            
            // Substitui por notify.warning para alertas de validação
            if (alertCall.includes('Por favor') || alertCall.includes('Preencha') || alertCall.includes('digite')) {
                content = content.replace(alertCall, alertCall.replace('alert(', 'notify.warning('));
                replacements++;
            }
            // Outros por notify.info
            else if (!alertCall.includes('Erro') && !alertCall.includes('sucesso')) {
                content = content.replace(alertCall, alertCall.replace('alert(', 'notify.info('));
                replacements++;
            }
        });
    }
    
    // Salvar arquivo
    fs.writeFileSync(filePath, content, 'utf8');
    
    if (replacements > 0) {
        totalReplacements += replacements;
        console.log(`✅ ${file} - ${replacements} substituições`);
    }
    
    totalFiles++;
});

console.log(`\n🎉 Concluído!`);
console.log(`📊 ${totalFiles} arquivos processados`);
console.log(`🔄 ${totalReplacements} alert() substituídos por notify()\n`);
