// Script para bloquear TODOS os dashboards (remover ativação)
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./agenda2.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

// Remover ativação de todos os dashboards
db.run(
  `UPDATE dashboards 
   SET activated_at = NULL, 
       activated_by_key = NULL`,
  function(err) {
    if (err) {
      console.error('❌ Erro ao bloquear dashboards:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log(`🔒 ${this.changes} dashboard(s) bloqueado(s) - agora requerem chave de ativação`);
    
    // Mostrar status
    db.all('SELECT id, name, code, activated_at FROM dashboards', (err, rows) => {
      if (err) {
        console.error('❌ Erro ao listar dashboards:', err.message);
      } else {
        console.log('\n📊 Status dos dashboards:');
        console.table(rows);
        console.log('\n⚠️  TODOS os dashboards agora estão BLOQUEADOS!');
        console.log('💡 Gere chaves de ativação no painel admin para desbloqueá-los.');
      }
      
      db.close();
    });
  }
);
