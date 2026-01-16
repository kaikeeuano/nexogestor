// Script para ativar automaticamente todos os dashboards existentes
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./agenda2.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

// Ativar todos os dashboards que ainda não têm activated_at
db.run(
  `UPDATE dashboards 
   SET activated_at = CURRENT_TIMESTAMP, 
       activated_by_key = 'SISTEMA-AUTO-ATIVADO' 
   WHERE activated_at IS NULL`,
  function(err) {
    if (err) {
      console.error('❌ Erro ao ativar dashboards:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log(`✅ ${this.changes} dashboard(s) ativado(s) automaticamente`);
    
    // Verificar quantos dashboards existem
    db.get('SELECT COUNT(*) as total FROM dashboards', (err, row) => {
      if (err) {
        console.error('❌ Erro ao contar dashboards:', err.message);
      } else {
        console.log(`📊 Total de dashboards no sistema: ${row.total}`);
      }
      
      db.close((err) => {
        if (err) {
          console.error('❌ Erro ao fechar banco de dados:', err.message);
        } else {
          console.log('✅ Operação concluída com sucesso!');
        }
      });
    });
  }
);
