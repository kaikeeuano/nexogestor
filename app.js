#!/usr/bin/env node

// Configuração para Hostinger
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('===========================================');
console.log('NEXO GESTOR - Iniciando na Hostinger');
console.log('===========================================');
console.log(`Porta: ${PORT}`);
console.log(`Host: ${HOST}`);
console.log(`Node Version: ${process.version}`);
console.log(`Diretório: ${process.cwd()}`);
console.log('===========================================');

// Importar e iniciar o servidor
require('./server.js');
