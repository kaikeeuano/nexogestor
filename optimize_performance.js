#!/usr/bin/env node
/**
 * Script para aplicar otimizações de performance no banco de dados
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./agenda2.db', (err) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

// Ler arquivo SQL
const sqlFile = fs.readFileSync(path.join(__dirname, 'optimize_db.sql'), 'utf8');
const statements = sqlFile.split(';').filter(s => s.trim());

console.log('\n🚀 Iniciando otimização do banco de dados...\n');

let completed = 0;
const total = statements.length;

statements.forEach((statement, index) => {
  const trimmed = statement.trim();
  if (!trimmed || trimmed.startsWith('--')) {
    completed++;
    return;
  }

  db.run(trimmed, (err) => {
    completed++;
    
    if (err) {
      console.error(`❌ Erro no statement ${index + 1}:`, err.message);
    } else {
      // Extrai nome do índice ou ação
      const match = trimmed.match(/CREATE INDEX.*?(idx_\w+)|ANALYZE/);
      if (match) {
        console.log(`✅ ${match[1] || 'ANALYZE'}`);
      }
    }

    if (completed === total) {
      console.log('\n🎉 Otimização concluída!');
      console.log('\n📊 Verificando tamanho do banco...');
      
      db.get("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()", [], (err, row) => {
        if (!err && row) {
          const sizeMB = (row.size / 1024 / 1024).toFixed(2);
          console.log(`📦 Tamanho do banco: ${sizeMB} MB`);
        }
        
        console.log('\n✨ Recomendações:');
        console.log('   1. Reinicie o servidor Node.js');
        console.log('   2. Teste a velocidade do site');
        console.log('   3. Execute VACUUM se necessário (compacta DB)');
        console.log('\n💡 Para compactar: node vacuum_db.js\n');
        
        db.close();
      });
    }
  });
});
