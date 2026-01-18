#!/usr/bin/env node
/**
 * Script para compactar e limpar o banco de dados
 */

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./agenda2.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

console.log('\n🧹 Iniciando limpeza e compactação...\n');

// Estatísticas antes
db.get("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()", [], (err, before) => {
  if (err) {
    console.error('❌ Erro ao obter tamanho:', err.message);
    return;
  }

  const beforeMB = (before.size / 1024 / 1024).toFixed(2);
  console.log(`📦 Tamanho antes: ${beforeMB} MB`);
  console.log('⏳ Executando VACUUM (pode demorar alguns segundos)...');

  // Executar VACUUM
  db.run('VACUUM', (err) => {
    if (err) {
      console.error('❌ Erro no VACUUM:', err.message);
      db.close();
      return;
    }

    console.log('✅ VACUUM concluído');
    
    // Estatísticas depois
    db.get("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()", [], (err, after) => {
      if (!err && after) {
        const afterMB = (after.size / 1024 / 1024).toFixed(2);
        const saved = (beforeMB - afterMB).toFixed(2);
        
        console.log(`📦 Tamanho depois: ${afterMB} MB`);
        console.log(`💾 Espaço economizado: ${saved} MB`);
      }

      console.log('\n🎉 Compactação concluída!');
      console.log('✨ Reinicie o servidor para melhor performance.\n');
      
      db.close();
    });
  });
});
