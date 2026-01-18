// Script de Backup Automático
// Uso: node backup.js

const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const backupDir = './backups';

console.log('🔄 Iniciando backup...\n');

// Criar pasta de backups se não existir
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
  console.log('✓ Pasta de backups criada');
}

try {
  // Backup do banco de dados
  if (fs.existsSync('./agenda2.db')) {
    const dbBackupPath = path.join(backupDir, `agenda2_${timestamp}.db`);
    fs.copyFileSync('./agenda2.db', dbBackupPath);
    const stats = fs.statSync(dbBackupPath);
    console.log(`✓ Banco de dados: ${dbBackupPath} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log('⚠ agenda2.db não encontrado (normal em produção)');
  }

  // Backup da pasta uploads (se existir e tiver conteúdo)
  if (fs.existsSync('./uploads')) {
    const uploadsBackupPath = path.join(backupDir, `uploads_${timestamp}`);
    copyFolderSync('./uploads', uploadsBackupPath);
    console.log(`✓ Uploads: ${uploadsBackupPath}`);
  } else {
    console.log('⚠ Pasta uploads não encontrada');
  }

  // Limpar backups antigos (manter últimos 10)
  cleanOldBackups(backupDir, 10);

  console.log('\n✅ Backup concluído com sucesso!');
  console.log(`📁 Local: ${path.resolve(backupDir)}`);
  
} catch (error) {
  console.error('\n❌ Erro ao fazer backup:', error.message);
  process.exit(1);
}

// Função para copiar pasta recursivamente
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  
  const files = fs.readdirSync(from);
  files.forEach(file => {
    const fromPath = path.join(from, file);
    const toPath = path.join(to, file);
    
    const stat = fs.statSync(fromPath);
    if (stat.isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

// Função para limpar backups antigos
function cleanOldBackups(dir, keep) {
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('agenda2_') && f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: path.join(dir, f),
      time: fs.statSync(path.join(dir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > keep) {
    const toDelete = files.slice(keep);
    toDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑 Removido backup antigo: ${file.name}`);
    });
  }
}
