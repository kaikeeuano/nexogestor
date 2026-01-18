const fs = require('fs');
const path = require('path');

// Lista de arquivos HTML para adicionar o mobile-menu.js
const htmlFiles = [
    'index.html',
    'login.html',
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
    'financeiro.html',
    'projetos.html',
    'servicos.html',
    'contato.html',
    'sitem.html',
    'gestao.html',
    'relatorios.html',
    'sobre.html'
];

console.log('🔧 Integrando mobile-menu.js em todas as páginas...\n');

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

htmlFiles.forEach(filename => {
    const filePath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${filename} - Não encontrado`);
        errorCount++;
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar se já tem o mobile-menu.js
    if (content.includes('nexo/mobile-menu.js')) {
        console.log(`⏭️  ${filename} - Já tem mobile-menu.js`);
        skipCount++;
        return;
    }
    
    // Adicionar antes do </body>
    const mobileMenuScript = '    <script src="nexo/mobile-menu.js"></script>\n</body>';
    
    if (content.includes('</body>')) {
        content = content.replace('</body>', mobileMenuScript);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filename} - Mobile menu adicionado`);
        successCount++;
    } else {
        console.log(`⚠️  ${filename} - Tag </body> não encontrada`);
        errorCount++;
    }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ Sucesso: ${successCount} arquivos`);
console.log(`⏭️  Pulados: ${skipCount} arquivos`);
console.log(`❌ Erros: ${errorCount} arquivos`);
console.log('='.repeat(50));
console.log('\n✨ Integração concluída!\n');
