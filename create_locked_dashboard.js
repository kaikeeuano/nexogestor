// Script para criar um dashboard bloqueado de demonstração
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./agenda2.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

// Buscar o primeiro usuário
db.get('SELECT id FROM users LIMIT 1', (err, user) => {
  if (err || !user) {
    console.error('❌ Erro: Nenhum usuário encontrado');
    db.close();
    process.exit(1);
  }
  
  const userId = user.id;
  const code = 'DEMO' + Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Criar dashboard bloqueado
  db.run(
    `INSERT INTO dashboards (name, owner_id, code, activated_at, activated_by_key) 
     VALUES (?, ?, ?, NULL, NULL)`,
    ['Dashboard Bloqueado - DEMO', userId, code],
    function(err) {
      if (err) {
        console.error('❌ Erro ao criar dashboard:', err.message);
        db.close();
        process.exit(1);
      }
      
      const dashboardId = this.lastID;
      
      // Adicionar usuário como membro
      db.run(
        `INSERT INTO dashboard_members (dashboard_id, user_id, status, role) 
         VALUES (?, ?, 'owner', 'owner')`,
        [dashboardId, userId],
        function(err) {
          if (err) {
            console.error('❌ Erro ao adicionar membro:', err.message);
          } else {
            console.log('✅ Dashboard bloqueado criado com sucesso!');
            console.log(`📊 ID: ${dashboardId}`);
            console.log(`🔑 Código: ${code}`);
            console.log(`👤 Owner ID: ${userId}`);
            console.log('\n🔒 Este dashboard está BLOQUEADO e requer chave de ativação');
          }
          
          db.close();
        }
      );
    }
  );
});
