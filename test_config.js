
async function testConfig() {
    const baseUrl = 'http://localhost:3000';
    
    try {
        // 1. Registrar um usuário novo para garantir sucesso
        const username = 'testuser_' + Date.now();
        const password = 'password123';
        
        console.log(`Registrando usuário ${username}...`);
        const regRes = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email: 'test@test.com', phone: '123' })
        });
        
        if (!regRes.ok) {
            console.error('Falha no registro:', await regRes.text());
            // Tenta login com admin/admin se registro falhar
        }

        // 2. Login
        console.log('Tentando login...');
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!loginRes.ok) throw new Error('Falha no login');
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login OK.');

        // 3. Criar Dashboard
        console.log('Criando dashboard...');
        const dashRes = await fetch(`${baseUrl}/dashboards`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Test Dashboard' })
        });
        
        if (!dashRes.ok) throw new Error('Falha ao criar dashboard: ' + await dashRes.text());
        const dashData = await dashRes.json();
        const dashboardId = dashData.id;
        console.log('Dashboard criado ID:', dashboardId);

        // 4. Testar Adicionar Congregação
        console.log('Tentando adicionar congregação...');
        const congRes = await fetch(`${baseUrl}/config/congregations`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'dashboard-id': dashboardId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Nova Congregação Teste' })
        });
        
        console.log('Status Adicionar Congregação:', congRes.status);
        const congData = await congRes.json();
        console.log('Resposta:', congData);

        // 5. Testar Adicionar Cargo
        console.log('Tentando adicionar cargo...');
        const roleRes = await fetch(`${baseUrl}/config/roles`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'dashboard-id': dashboardId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Novo Cargo Teste' })
        });
        
        console.log('Status Adicionar Cargo:', roleRes.status);
        const roleData = await roleRes.json();
        console.log('Resposta:', roleData);

    } catch (error) {
        console.error('Erro no teste:', error);
    }
}

testConfig();
