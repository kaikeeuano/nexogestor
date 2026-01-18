const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/agenda2.db');

const username = 'kaike.adellan';

db.run('UPDATE users SET is_admin = 1 WHERE username = ?', [username], function(err) {
    if (err) {
        console.error('Erro:', err.message);
    } else {
        console.log('Usuario ' + username + ' promovido a admin com sucesso!');
        console.log('Linhas afetadas:', this.changes);
    }
    db.close();
});
