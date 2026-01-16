const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./agenda2.db', (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  console.log('--- Dashboards ---');
  db.all('SELECT * FROM dashboards', [], (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
  });

  console.log('--- Dashboard Members ---');
  db.all('SELECT * FROM dashboard_members', [], (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
  });
  
  console.log('--- Users ---');
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
  });
});

// Close database only after everything is done? 
// In serialize, operations are sequential, but the callbacks are async. 
// However, sqlite3 serialize ensures they are scheduled in order. 
// But close() might run before they complete if put outside.
// Actually, with sqlite3, close() waits for pending queries.
// But let's wrap it in a setTimeout just to be safe or put it in the last callback.

setTimeout(() => {
    db.close((err) => {
      if (err) console.error(err.message);
      console.log('Close the database connection.');
    });
}, 1000);
