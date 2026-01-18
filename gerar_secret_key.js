#!/usr/bin/env node

/**
 * Gerador de SECRET_KEY para NEXO GESTOR
 * Execute: node gerar_secret_key.js
 */

const crypto = require('crypto');

console.log('\n==============================================');
console.log('  NEXO GESTOR - Gerador de SECRET_KEY');
console.log('==============================================\n');

// Gerar 3 opções de chaves
console.log('Escolha uma das chaves abaixo para usar no .env:\n');

for (let i = 1; i <= 3; i++) {
  const key = crypto.randomBytes(32).toString('hex');
  console.log(`Opção ${i}:`);
  console.log(`SECRET_KEY=${key}\n`);
}

console.log('==============================================');
console.log('Como usar:');
console.log('1. Copie uma das chaves acima');
console.log('2. Abra o arquivo deploy_hostinger/.env');
console.log('3. Cole a chave substituindo a existente');
console.log('==============================================\n');
