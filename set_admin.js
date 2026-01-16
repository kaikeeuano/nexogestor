// Script para definir um usuário como administrador do sistema
// Uso: node set_admin.js <username>

const sqlite3 = require('sqlite3').verbose();

if (process.argv.length < 3) {
  console.error('❌ Uso: node set_admin.js <username>');
  console.error('   Exemplo: node set_admin.js admin');
  process.exit(1);
}

const username = process.argv[2];

const db = new sqlite3.Database('./agenda2.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados.');
});

db.serialize(() => {
  // Primeiro, verifica se o usuário existe
  db.get('SELECT id, username, is_system_admin FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('❌ Erro ao buscar usuário:', err.message);
      db.close();
      process.exit(1);
    }

    if (!user) {
      console.error(`❌ Usuário "${username}" não encontrado.`);
      console.log('\n📋 Lista de usuários disponíveis:');
      
      db.all('SELECT id, username, is_system_admin FROM users', [], (err, users) => {
        if (err) {
          console.error('❌ Erro ao listar usuários:', err.message);
        } else {
          users.forEach(u => {
            const adminStatus = u.is_system_admin ? '✅ ADMIN' : '👤 User';
            console.log(`   ${adminStatus} - ${u.username} (ID: ${u.id})`);
          });
        }
        db.close();
      });
      return;
    }

    if (user.is_system_admin) {
      console.log(`ℹ️  O usuário "${username}" já é um administrador do sistema.`);
      db.close();
      return;
    }

    // Define o usuário como administrador
    db.run('UPDATE users SET is_system_admin = 1 WHERE id = ?', [user.id], function(err) {
      if (err) {
        console.error('❌ Erro ao atualizar usuário:', err.message);
        db.close();
        process.exit(1);
      }

      console.log(`✅ Usuário "${username}" (ID: ${user.id}) agora é administrador do sistema!`);
      console.log(`\n📌 O usuário pode acessar o painel admin em: http://localhost:3000/admin.html`);
      
      db.close();
    });
  });
});
