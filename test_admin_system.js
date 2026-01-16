// Script de teste para o sistema de administração
// Este script demonstra como testar todas as funcionalidades

const baseUrl = 'http://localhost:3000';

async function testAdminSystem() {
    console.log('🧪 Iniciando testes do sistema de administração...\n');

    try {
        // 1. Registrar usuário de teste
        console.log('1️⃣ Registrando usuário de teste...');
        const username = 'testadmin_' + Date.now();
        const password = 'admin123';
        
        const regRes = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                password, 
                email: 'admin@test.com', 
                phone: '123456789' 
            })
        });
        
        if (!regRes.ok) {
            throw new Error('Falha ao registrar usuário');
        }
        console.log(`✅ Usuário registrado: ${username}`);
        
        // 2. Fazer login
        console.log('\n2️⃣ Fazendo login...');
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!loginRes.ok) {
            throw new Error('Falha no login');
        }
        
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login realizado com sucesso');
        
        // 3. Verificar status de admin (deve ser false inicialmente)
        console.log('\n3️⃣ Verificando status de admin...');
        const checkRes = await fetch(`${baseUrl}/admin/check`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const checkData = await checkRes.json();
        console.log(`   Status: ${checkData.isAdmin ? 'Admin' : 'Usuário comum'}`);
        
        if (checkData.isAdmin) {
            console.log('⚠️  Usuário já é admin!');
        } else {
            console.log('ℹ️  Para tornar este usuário admin, execute:');
            console.log(`   node set_admin.js ${username}`);
        }
        
        // 4. Tentar gerar chave sem privilégios (deve falhar)
        console.log('\n4️⃣ Tentando gerar chave sem privilégios admin...');
        const genRes = await fetch(`${baseUrl}/admin/generate-key`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                dashboard_name: 'Dashboard Teste',
                expires_in_days: 30
            })
        });
        
        if (genRes.status === 403) {
            console.log('✅ Acesso negado conforme esperado (usuário não é admin)');
        } else {
            console.log('⚠️  Esperado status 403, recebido:', genRes.status);
        }
        
        console.log('\n📝 PRÓXIMOS PASSOS:');
        console.log('   1. Execute: node set_admin.js ' + username);
        console.log('   2. Acesse: http://localhost:3000/admin.html');
        console.log('   3. Faça login com as credenciais:');
        console.log(`      Username: ${username}`);
        console.log(`      Password: ${password}`);
        console.log('   4. Teste a geração de chaves no painel admin');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
    }
}

// Verificar se o servidor está rodando
fetch('http://localhost:3000/dashboards', { 
    headers: { 'Authorization': 'Bearer invalid' } 
})
.then(() => {
    console.log('✅ Servidor está rodando\n');
    testAdminSystem();
})
.catch(() => {
    console.error('❌ Servidor não está rodando!');
    console.error('   Execute "npm start" antes de rodar este teste.');
    process.exit(1);
});
