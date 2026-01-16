const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

if (!process.env.SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.error('WARNING: SECRET_KEY is not set in environment variables. Set SECRET_KEY in production.');
}

// Email validation helper
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files
app.use('/uploads', express.static('uploads'));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Database setup
const db = new sqlite3.Database('./agenda2.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  if (process.env.NODE_ENV !== 'production') console.log('Connected to the SQLite database.');
});

// Create events table
db.run(`CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT
)`);

// Create members table
db.run(`CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  congregation TEXT NOT NULL,
  cargo TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  photo TEXT
)`);
db.run(`ALTER TABLE dashboards ADD COLUMN congregation TEXT;`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
db.run(`ALTER TABLE dashboards ADD COLUMN logo TEXT;`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
db.run(`ALTER TABLE dashboards ADD COLUMN parent_dashboard_id INTEGER;`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
db.run(`ALTER TABLE dashboards ADD COLUMN restricted_congregation TEXT;`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
db.run(`ALTER TABLE dashboards ADD COLUMN type TEXT DEFAULT 'default';`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
db.run(`ALTER TABLE dashboard_members ADD COLUMN role TEXT DEFAULT 'member';`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
db.run(`ALTER TABLE members ADD COLUMN status TEXT DEFAULT 'active';`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
db.run(`ALTER TABLE members ADD COLUMN created_at TEXT;`, (err) => { 
  if (err && !err.message.includes('duplicate column')) {
    console.error(err);
  } else if (!err) {
    // If column added successfully, update existing records with current date
    const today = new Date().toISOString().split('T')[0];
    db.run(`UPDATE members SET created_at = ? WHERE created_at IS NULL`, [today]);
  }
});
db.run(`ALTER TABLE members ADD COLUMN photo TEXT;`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

// Create congregations table
db.run(`CREATE TABLE IF NOT EXISTS congregations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  UNIQUE(dashboard_id, name)
)`);

// Create roles table
db.run(`CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  UNIQUE(dashboard_id, name)
)`);

// Create pregacoes table
db.run(`CREATE TABLE IF NOT EXISTS pregacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  livro_biblia TEXT,
  conteudo TEXT NOT NULL,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  modificado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dashboard_id) REFERENCES dashboards (id)
)`);
db.run(`ALTER TABLE pregacoes ADD COLUMN livro_biblia TEXT;`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

// Create files table
db.run(`CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  folder_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders (id)
)`);

// Create folders table (MUST be before files since files references it)
db.run(`CREATE TABLE IF NOT EXISTS folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// Create observations table
db.run(`CREATE TABLE IF NOT EXISTS observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  observation TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
)`);

// Create personal table
db.run(`CREATE TABLE IF NOT EXISTS personal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT
)`);

// Create projects table
db.run(`CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  start_date TEXT,
  end_date TEXT
)`);

// Migrate existing projects table to add date columns if they don't exist
db.all("PRAGMA table_info(projects)", [], (err, columns) => {
  if (err) {
    console.error('Error checking projects table:', err);
    return;
  }
  
  const hasStartDate = columns.some(col => col.name === 'start_date');
  const hasEndDate = columns.some(col => col.name === 'end_date');
  
  if (!hasStartDate) {
    db.run("ALTER TABLE projects ADD COLUMN start_date TEXT", (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding start_date column:', err);
      } else {
        console.log('✅ Added start_date column to projects table');
      }
    });
  }
  
  if (!hasEndDate) {
    db.run("ALTER TABLE projects ADD COLUMN end_date TEXT", (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding end_date column:', err);
      } else {
        console.log('✅ Added end_date column to projects table');
      }
    });
  }
});

// Create project observations table
db.run(`CREATE TABLE IF NOT EXISTS project_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  observation_date TEXT,
  user_id INTEGER,
  user_name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id)
)`);

// Migrate project_observations table to add missing columns
db.all("PRAGMA table_info(project_observations)", [], (err, columns) => {
  if (err) {
    console.error('Error checking project_observations table:', err);
    return;
  }
  
  const hasObservationDate = columns.some(col => col.name === 'observation_date');
  const hasUserId = columns.some(col => col.name === 'user_id');
  const hasUserName = columns.some(col => col.name === 'user_name');
  
  if (!hasObservationDate) {
    db.run("ALTER TABLE project_observations ADD COLUMN observation_date TEXT", (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding observation_date column:', err);
      } else {
        console.log('✅ Added observation_date column to project_observations table');
      }
    });
  }
  
  if (!hasUserId) {
    db.run("ALTER TABLE project_observations ADD COLUMN user_id INTEGER", (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding user_id column:', err);
      } else {
        console.log('✅ Added user_id column to project_observations table');
      }
    });
  }
  
  if (!hasUserName) {
    db.run("ALTER TABLE project_observations ADD COLUMN user_name TEXT", (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding user_name column:', err);
      } else {
        console.log('✅ Added user_name column to project_observations table');
      }
    });
  }
});

// Create project files table
db.run(`CREATE TABLE IF NOT EXISTS project_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects (id)
)`);

// Create project notes table
db.run(`CREATE TABLE IF NOT EXISTS project_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  notes TEXT DEFAULT '',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id),
  FOREIGN KEY (project_id) REFERENCES projects (id)
)`);

// Create transactions table
db.run(`CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  category TEXT,
  attachment TEXT
)`);
db.run(`ALTER TABLE transactions ADD COLUMN attachment TEXT;`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_system_admin INTEGER DEFAULT 0
)`);
db.run(`ALTER TABLE users ADD COLUMN is_system_admin INTEGER DEFAULT 0;`, (err) => { 
  if (err && !err.message.includes('duplicate column')) console.error(err); 
});

// Create activation_keys table
db.run(`CREATE TABLE IF NOT EXISTS activation_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  dashboard_name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  used_at TEXT,
  used_by_user_id INTEGER,
  created_by_admin_id INTEGER NOT NULL,
  FOREIGN KEY (created_by_admin_id) REFERENCES users (id),
  FOREIGN KEY (used_by_user_id) REFERENCES users (id)
)`);

// Create password_resets table
db.run(`CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id)
)`);

// Add revoked_at column to activation_keys
db.run(`ALTER TABLE activation_keys ADD COLUMN revoked_at TEXT;`, (err) => { 
  if (err && !err.message.includes('duplicate column')) console.error(err); 
});

// Add activation columns to dashboards table
db.run(`ALTER TABLE dashboards ADD COLUMN activated_at TEXT;`, (err) => { 
  if (err && !err.message.includes('duplicate column')) console.error(err); 
});
db.run(`ALTER TABLE dashboards ADD COLUMN activated_by_key TEXT;`, (err) => { 
  if (err && !err.message.includes('duplicate column')) console.error(err); 
});
db.run(`ALTER TABLE activation_keys ADD COLUMN dashboard_id INTEGER;`, (err) => { 
  if (err && !err.message.includes('duplicate column')) console.error(err); 
});

// Create dashboards table
db.run(`CREATE TABLE IF NOT EXISTS dashboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  congregation TEXT,
  owner_id INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL
)`);

// Create dashboard_members table
db.run(`CREATE TABLE IF NOT EXISTS dashboard_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  role TEXT NOT NULL DEFAULT 'member'
)`);

// Auth routes
app.post('/register', async (req, res) => {
  const { username, password, email, phone } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios' });
  }
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  // Check if email already exists
  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)', [username, hashedPassword, email, phone], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
  });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Minimal logging for production; preserve detailed logs only in non-production
  if (process.env.NODE_ENV !== 'production') console.debug('Login attempt for:', username);
  
  // Aceita tanto username quanto email para login
  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
    if (err) {
      console.error('Database error during login for', username, err);
      res.status(500).json({ error: err.message });
      return;
    }
    if (!user) {
      if (process.env.NODE_ENV !== 'production') console.debug('Login failed: user not found for', username);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      if (process.env.NODE_ENV !== 'production') console.debug('Login failed: invalid password for', username);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
    if (process.env.NODE_ENV !== 'production') console.debug('Login successful for:', username);
    res.json({ token });
  });
});

// Verify reset token
app.post('/verify-reset-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token é obrigatório' });
  }
  
  db.get(
    `SELECT pr.*, u.username 
     FROM password_resets pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.token = ? AND pr.used_at IS NULL`,
    [token],
    (err, reset) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!reset) {
        return res.status(404).json({ error: 'Token inválido ou já utilizado' });
      }
      
      // Check if token expired
      const expiresAt = new Date(reset.expires_at);
      if (expiresAt < new Date()) {
        return res.status(400).json({ error: 'Token expirado' });
      }
      
      res.json({ 
        valid: true,
        username: reset.username 
      });
    }
  );
});

// Reset password using token
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
  }
  
  db.get(
    `SELECT pr.*, u.id as user_id 
     FROM password_resets pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.token = ? AND pr.used_at IS NULL`,
    [token],
    async (err, reset) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!reset) {
        return res.status(404).json({ error: 'Token inválido ou já utilizado' });
      }
      
      // Check if token expired
      const expiresAt = new Date(reset.expires_at);
      if (expiresAt < new Date()) {
        return res.status(400).json({ error: 'Token expirado' });
      }
      
      try {
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user password
        db.run(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, reset.user_id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            // Mark token as used
            db.run(
              'UPDATE password_resets SET used_at = ? WHERE id = ?',
              [new Date().toISOString(), reset.id],
              (err) => {
                if (err) {
                  console.error('Error marking token as used:', err);
                }
                
                res.json({ 
                  success: true,
                  message: 'Senha redefinida com sucesso' 
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Erro ao processar senha' });
      }
    }
  );
});

// Change password (user changes their own password)
app.post('/change-password', authenticateToken, async (req, res) => {
  const userId = req.user && req.user.id;
  const { current_password, new_password } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'current_password and new_password are required' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
    if (err) {
      console.error('DB error fetching user for change-password:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(current_password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    try {
      const hashed = await bcrypt.hash(new_password, 10);
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, userId], function(err) {
        if (err) {
          console.error('DB error updating password:', err);
          return res.status(500).json({ error: err.message });
        }
        // Optionally invalidate tokens here (not implemented)
        res.json({ message: 'Password updated successfully' });
      });
    } catch (err) {
      console.error('Error hashing new password:', err);
      res.status(500).json({ error: 'Failed to update password' });
    }
  });
});

// Password recovery - Request reset (sends email - for now just generates token)
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }
  
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  db.get('SELECT id, username FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'Se o email existir, um código de recuperação será enviado' });
    }
    
    // Generate a simple reset token (in production, use proper token with expiration)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store token (in production, use separate table with expiration)
    db.run('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', 
      [resetToken, Date.now() + 3600000, user.id], // 1 hour expiration
      function(err) {
        if (err) {
          console.error('Error storing reset token:', err);
          return res.status(500).json({ error: 'Erro ao gerar token' });
        }
        
        // TODO: Send email with reset link
        // For now, return the token (REMOVE IN PRODUCTION)
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Reset token for ${email}: ${resetToken}`);
        }
        
        res.json({ 
          message: 'Se o email existir, um código de recuperação será enviado',
          // ONLY FOR DEVELOPMENT - REMOVE IN PRODUCTION:
          dev_token: process.env.NODE_ENV !== 'production' ? resetToken : undefined
        });
      });
  });
});

// Password recovery - Reset with token
app.post('/reset-password', async (req, res) => {
  const { email, token, new_password } = req.body;
  
  if (!email || !token || !new_password) {
    return res.status(400).json({ error: 'Email, token e nova senha são obrigatórios' });
  }
  
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  
  db.get('SELECT * FROM users WHERE email = ? AND reset_token = ?', [email, token], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    
    // Check if token is expired
    if (user.reset_token_expires && user.reset_token_expires < Date.now()) {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    try {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      db.run('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', 
        [hashedPassword, user.id], 
        function(err) {
          if (err) {
            console.error('Error resetting password:', err);
            return res.status(500).json({ error: 'Erro ao resetar senha' });
          }
          res.json({ message: 'Senha resetada com sucesso' });
        });
    } catch (err) {
      console.error('Error hashing password:', err);
      res.status(500).json({ error: 'Erro ao processar nova senha' });
    }
  });
});

// Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware to verify system admin
function authenticateSystemAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    
    // Check if user is system admin
    db.get('SELECT is_system_admin FROM users WHERE id = ?', [user.id], (err, row) => {
      if (err) {
        console.error('Error checking admin status:', err);
        return res.sendStatus(500);
      }
      if (!row || !row.is_system_admin) {
        return res.status(403).json({ error: 'Access denied. System admin privileges required.' });
      }
      req.user = user;
      next();
    });
  });
}

// Get user role in current dashboard
app.get('/user-role', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const dashboardId = req.headers['dashboard-id'];
  
  if (!dashboardId) {
    return res.status(400).json({ error: 'dashboard-id header required' });
  }
  
  db.get('SELECT status, role FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?', 
    [dashboardId, userId], 
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'User not member of this dashboard' });
      }
      res.json({ 
        status: row.status, 
        role: row.role || 'member',
        isOwner: row.status === 'owner'
      });
    });
});

// Get dashboard members for management (owner only)
app.get('/config/members', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;

  if (!dashboardId) {
    return res.status(400).json({ error: 'dashboard-id header required' });
  }

  // Check if user is owner
  db.get('SELECT status FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?', 
    [dashboardId, userId], 
    (err, userMember) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!userMember || userMember.status !== 'owner') {
        return res.status(403).json({ error: 'Only owner can manage members' });
      }

      // Get all members in dashboard
      const query = `
        SELECT 
          dm.id,
          dm.status,
          dm.role,
          u.id as user_id,
          u.username,
          u.email
        FROM dashboard_members dm
        JOIN users u ON dm.user_id = u.id
        WHERE dm.dashboard_id = ?
        ORDER BY CASE WHEN dm.status = 'owner' THEN 0 ELSE 1 END, u.username
      `;
      
      db.all(query, [dashboardId], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
      });
    });
});

// Update member role (owner only)
app.put('/config/members/:memberId/role', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const memberId = req.params.memberId;
  const { role } = req.body;

  if (!dashboardId || !role) {
    return res.status(400).json({ error: 'dashboard-id header and role are required' });
  }

  // Check if user is owner
  db.get('SELECT status FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?', 
    [dashboardId, userId], 
    (err, userMember) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!userMember || userMember.status !== 'owner') {
        return res.status(403).json({ error: 'Only owner can change member roles' });
      }

      // Update member role
      db.run('UPDATE dashboard_members SET role = ? WHERE id = ? AND dashboard_id = ?', 
        [role, memberId, dashboardId], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Member not found' });
          }
          res.json({ updated: true });
        });
    });
});

// Accept pending member (owner only)
app.post('/config/members/:memberId/accept', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const memberId = req.params.memberId;

  if (!dashboardId) {
    return res.status(400).json({ error: 'dashboard-id header required' });
  }

  // Check if user is owner
  db.get('SELECT status FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?', 
    [dashboardId, userId], 
    (err, userMember) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!userMember || userMember.status !== 'owner') {
        return res.status(403).json({ error: 'Only owner can accept members' });
      }

      db.run('UPDATE dashboard_members SET status = ? WHERE id = ? AND dashboard_id = ?', 
        ['member', memberId, dashboardId], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ updated: true });
        });
    });
});

// Reject/remove member (owner only)
app.delete('/config/members/:memberId', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const memberId = req.params.memberId;

  if (!dashboardId) {
    return res.status(400).json({ error: 'dashboard-id header required' });
  }

  // Check if user is owner
  db.get('SELECT status FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?', 
    [dashboardId, userId], 
    (err, userMember) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!userMember || userMember.status !== 'owner') {
        return res.status(403).json({ error: 'Only owner can remove members' });
      }

      db.run('DELETE FROM dashboard_members WHERE id = ? AND dashboard_id = ?', 
        [memberId, dashboardId], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ deleted: true });
        });
    });
});

// GET /dashboards - Listar dashboards do usuário
app.get('/dashboards', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  // Buscar todos os dashboards onde o usuário é membro (owner, admin ou member aprovado)
  db.all(`
    SELECT d.id, d.name, d.code, dm.status, dm.role 
    FROM dashboards d
    INNER JOIN dashboard_members dm ON d.id = dm.dashboard_id
    WHERE dm.user_id = ? AND dm.status IN ('owner', 'admin', 'member')
    ORDER BY d.id DESC
  `, [userId], (err, dashboards) => {
    if (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error loading dashboards:', err);
      }
      return res.status(500).json({ error: err.message });
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`User ${userId} has ${dashboards.length} dashboards`);
    }
    
    res.json(dashboards);
  });
});

// Endpoint desabilitado - Use /activate-dashboard com chave de ativação
// app.post('/dashboards', authenticateToken, (req, res) => {
//   return res.status(403).json({ 
//     error: 'Criação direta de dashboard desabilitada. Use uma chave de ativação fornecida pelo administrador.',
//     info: 'Clique em "Ativar com Chave" e use a chave fornecida pelo administrador do sistema.'
//   });
// });

app.post('/dashboards/join', authenticateToken, (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;
  db.get('SELECT id FROM dashboards WHERE code = ?', [code], (err, dashboard) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!dashboard) {
      res.status(404).json({ error: 'Dashboard not found' });
      return;
    }
    db.run('INSERT INTO dashboard_members (dashboard_id, user_id, status, role) VALUES (?, ?, ?, ?)', [dashboard.id, userId, 'pending', 'member'], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Join request sent' });
    });
  });
});

// Deletar dashboard (apenas owner)
app.delete('/dashboards/:id', authenticateToken, (req, res) => {
  const dashboardId = req.params.id;
  const userId = req.user.id;
  
  // Verifica se o usuário é o dono
  db.get(
    'SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?',
    [dashboardId, userId, 'owner'],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!member) {
        return res.status(403).json({ error: 'Apenas o dono pode excluir o dashboard' });
      }
      
      // Deleta membros do dashboard
      db.run('DELETE FROM dashboard_members WHERE dashboard_id = ?', [dashboardId], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Deleta pregações do dashboard
        db.run('DELETE FROM pregacoes WHERE dashboard_id = ?', [dashboardId], (err) => {
          if (err) {
            console.error('Erro ao deletar pregações:', err);
          }
          
          // Deleta o dashboard
          db.run('DELETE FROM dashboards WHERE id = ?', [dashboardId], function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            res.json({ 
              success: true,
              message: 'Dashboard excluído com sucesso' 
            });
          });
        });
      });
    }
  );
});

app.get('/dashboards/:id/requests', authenticateToken, (req, res) => {
  const dashboardId = req.params.id;
  const userId = req.user.id;
  // Check if user is owner
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', [dashboardId, userId, 'owner'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    const query = `
      SELECT dm.id, u.username
      FROM dashboard_members dm
      JOIN users u ON dm.user_id = u.id
      WHERE dm.dashboard_id = ? AND dm.status = 'pending'
    `;
    db.all(query, [dashboardId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });
});

app.post('/dashboards/:id/accept', authenticateToken, (req, res) => {
  const dashboardId = req.params.id;
  const { requestId } = req.body;
  const userId = req.user.id;
  // Check if user is owner
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', [dashboardId, userId, 'owner'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    db.run('UPDATE dashboard_members SET status = ? WHERE id = ?', ['member', requestId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'User accepted' });
    });
  });
});

// Configuration routes
app.get('/config', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  
  if (process.env.NODE_ENV !== 'production') console.debug('GET /config - dashboardId:', dashboardId, 'userId:', userId);
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      console.error('Database error in GET /config:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (process.env.NODE_ENV !== 'production') console.debug('Member found:', member);
    
    if (!member) {
      if (process.env.NODE_ENV !== 'production') console.debug('User not authorized for dashboard', dashboardId);
      // Try alternative query for backward compatibility
      db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
        [dashboardId, userId, 'owner'], (err, ownerMember) => {
        if (err) {
          console.error('Database error in fallback query:', err);
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (!ownerMember) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        
        // Get dashboard info
        db.get('SELECT name, congregation FROM dashboards WHERE id = ?', [dashboardId], (err, dashboard) => {
          if (err) {
            console.error('Database error getting dashboard:', err);
            res.status(500).json({ error: err.message });
            return;
          }
          
          if (process.env.NODE_ENV !== 'production') console.debug('Dashboard config (fallback):', dashboard);
          res.json(dashboard);
        });
      });
      return;
    }
    
    // Get dashboard info
    db.get('SELECT id, name, congregation, logo, parent_dashboard_id, restricted_congregation FROM dashboards WHERE id = ?', [dashboardId], (err, dashboard) => {
      if (err) {
        console.error('Database error getting dashboard:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!dashboard) {
        if (process.env.NODE_ENV !== 'production') console.debug('Dashboard not found:', dashboardId);
        res.status(404).json({ error: 'Dashboard not found' });
        return;
      }
      
      if (process.env.NODE_ENV !== 'production') console.debug('Dashboard config:', dashboard);
      res.json({
        name: dashboard.name || '',
        congregation: dashboard.congregation || '',
        logo: dashboard.logo || '',
        isSubDashboard: !!dashboard.parent_dashboard_id,
        restrictedCongregation: dashboard.restricted_congregation || null,
        code: dashboard.code || ''
      });
    });
  });
});

// Get dashboard info (for all users)
app.get('/dashboard/info', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  
  db.get('SELECT id, name, congregation, logo, parent_dashboard_id, restricted_congregation FROM dashboards WHERE id = ?', 
    [dashboardId], (err, dashboard) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!dashboard) {
      res.status(404).json({ error: 'Dashboard not found' });
      return;
    }
    
    res.json({
      name: dashboard.name || '',
      congregation: dashboard.congregation || '',
      logo: dashboard.logo || '',
      isSubDashboard: !!dashboard.parent_dashboard_id,
      restrictedCongregation: dashboard.restricted_congregation || null
    });
  });
});

app.post('/config/logo', authenticateToken, upload.single('logo'), (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Check if user is owner
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
    [dashboardId, userId, 'owner'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const logo = req.file.filename;
    db.run('UPDATE dashboards SET logo = ? WHERE id = ?', [logo, dashboardId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Logo updated', logo });
    });
  });
});

app.put('/config', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const { name, congregation, type } = req.body;
  
  // Check if user is owner
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
    [dashboardId, userId, 'owner'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    // Monta query dinamicamente baseado nos campos fornecidos
    let updateFields = [];
    let updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (congregation !== undefined) {
      updateFields.push('congregation = ?');
      updateValues.push(congregation);
    }
    if (type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(type);
    }
    
    if (updateFields.length === 0) {
      return res.json({ message: 'No fields to update' });
    }
    
    updateValues.push(dashboardId);
    const query = `UPDATE dashboards SET ${updateFields.join(', ')} WHERE id = ?`;
    
    db.run(query, updateValues, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Configuration updated' });
    });
  });
});

// Congregations management
app.get('/config/congregations', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      // Try alternative query for backward compatibility
      db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
        [dashboardId, userId, 'owner'], (err, ownerMember) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (!ownerMember) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        getCongregations();
      });
      return;
    }
    
    function getCongregations() {
      db.all('SELECT id, name FROM congregations WHERE dashboard_id = ? ORDER BY name', [dashboardId], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    }
    getCongregations();
  });
});

app.post('/config/congregations', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const { name } = req.body;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      // Try alternative query for backward compatibility
      db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
        [dashboardId, userId, 'owner'], (err, ownerMember) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (!ownerMember) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        addCongregation();
      });
      return;
    }
    
    function addCongregation() {
      db.run('INSERT INTO congregations (dashboard_id, name) VALUES (?, ?)', [dashboardId, name], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, name });
      });
    }
    addCongregation();
  });
});

app.delete('/config/congregations/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const congregationId = req.params.id;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      // Try alternative query for backward compatibility
      db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
        [dashboardId, userId, 'owner'], (err, ownerMember) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (!ownerMember) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        deleteCongregation();
      });
      return;
    }
    
    function deleteCongregation() {
      db.run('DELETE FROM congregations WHERE id = ? AND dashboard_id = ?', [congregationId, dashboardId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Congregation deleted' });
      });
    }
    deleteCongregation();
  });
});

// Roles management
app.get('/config/roles', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      // Try alternative query for backward compatibility
      db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
        [dashboardId, userId, 'owner'], (err, ownerMember) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (!ownerMember) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        getRoles();
      });
      return;
    }
    
    function getRoles() {
      db.all('SELECT id, name FROM roles WHERE dashboard_id = ? ORDER BY name', [dashboardId], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    }
    getRoles();
  });
});

app.post('/config/roles', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const { name } = req.body;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      // Try alternative query for backward compatibility
      db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
        [dashboardId, userId, 'owner'], (err, ownerMember) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (!ownerMember) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        addRole();
      });
      return;
    }
    
    function addRole() {
      db.run('INSERT INTO roles (dashboard_id, name) VALUES (?, ?)', [dashboardId, name], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, name });
      });
    }
    addRole();
  });
});

app.delete('/config/roles/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const roleId = req.params.id;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      // Try alternative query for backward compatibility
      db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
        [dashboardId, userId, 'owner'], (err, ownerMember) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (!ownerMember) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        deleteRole();
      });
      return;
    }
    
    function deleteRole() {
      db.run('DELETE FROM roles WHERE id = ? AND dashboard_id = ?', [roleId, dashboardId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Role deleted' });
      });
    }
    deleteRole();
  });
});

// Sub-dashboard management
app.get('/config/subdashboards', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    db.all(`SELECT d.id, d.name, d.code, d.restricted_congregation, d.owner_id, u.username as owner_name 
            FROM dashboards d
            LEFT JOIN users u ON d.owner_id = u.id
            WHERE d.parent_dashboard_id = ? 
            ORDER BY d.name`, [dashboardId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });
});

app.post('/config/subdashboards', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const { name, congregation } = req.body;
  
  if (!name || !congregation) {
    return res.status(400).json({ error: 'Nome e congregação são obrigatórios' });
  }
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const code = Math.random().toString(36).substring(2, 15);
    db.run('INSERT INTO dashboards (name, owner_id, code, parent_dashboard_id, restricted_congregation) VALUES (?, ?, ?, ?, ?)', 
      [name, userId, code, dashboardId, congregation], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const subDashboardId = this.lastID;
      
      // Add creator as owner
      db.run('INSERT INTO dashboard_members (dashboard_id, user_id, status, role) VALUES (?, ?, ?, ?)', 
        [subDashboardId, userId, 'owner', 'owner'], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: subDashboardId, code, name, congregation });
      });
    });
  });
});

// Create sub-dashboard with activation key
app.post('/config/subdashboards/with-key', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const { activationKey, name, congregation } = req.body;
  
  if (!activationKey || !name || !congregation) {
    return res.status(400).json({ error: 'Chave de ativação, nome e congregação são obrigatórios' });
  }
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!member) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    
    // Validate activation key
    db.get('SELECT * FROM activation_keys WHERE key = ?', [activationKey.toUpperCase()], (err, keyData) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!keyData) {
        return res.status(404).json({ error: 'Chave de ativação inválida' });
      }
      
      if (keyData.revoked_at) {
        return res.status(400).json({ error: 'Esta chave foi bloqueada/revogada pelo administrador' });
      }
      
      if (keyData.used_at) {
        return res.status(400).json({ error: 'Esta chave já foi utilizada' });
      }
      
      // Check if expired
      if (keyData.expires_at) {
        const expireDate = new Date(keyData.expires_at);
        if (expireDate < new Date()) {
          return res.status(400).json({ error: 'Chave de ativação expirada' });
        }
      }
      
      // Create sub-dashboard
      const code = Math.random().toString(36).substring(2, 15);
      db.run(
        'INSERT INTO dashboards (name, owner_id, code, parent_dashboard_id, restricted_congregation, activated_at, activated_by_key) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [name, userId, code, dashboardId, congregation, new Date().toISOString(), activationKey.toUpperCase()], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          const subDashboardId = this.lastID;
          
          // Add creator as owner
          db.run(
            'INSERT INTO dashboard_members (dashboard_id, user_id, status, role) VALUES (?, ?, ?, ?)', 
            [subDashboardId, userId, 'owner', 'owner'], 
            function(err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              
              // Mark key as used
              db.run(
                'UPDATE activation_keys SET used_at = ?, used_by_user_id = ?, dashboard_id = ? WHERE id = ?',
                [new Date().toISOString(), userId, subDashboardId, keyData.id],
                function(err) {
                  if (err) {
                    console.error('Error marking key as used:', err);
                  }
                  
                  res.json({ 
                    id: subDashboardId, 
                    code, 
                    name, 
                    congregation,
                    activated: true
                  });
                }
              );
            }
          );
        }
      );
    });
  });
});

app.delete('/config/subdashboards/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const subDashboardId = req.params.id;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    // Verify sub-dashboard belongs to parent dashboard
    db.get('SELECT id FROM dashboards WHERE id = ? AND parent_dashboard_id = ?', 
      [subDashboardId, dashboardId], (err, subDashboard) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!subDashboard) {
        res.status(404).json({ error: 'Sub-dashboard not found' });
        return;
      }
      
      // Delete sub-dashboard and related data
      db.run('DELETE FROM dashboard_members WHERE dashboard_id = ?', [subDashboardId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        db.run('DELETE FROM dashboards WHERE id = ?', [subDashboardId], function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: 'Sub-dashboard deleted' });
        });
      });
    });
  });
});

// Get pending member requests from all sub-dashboards
app.get('/config/subdashboards/requests', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    // Get all pending requests from sub-dashboards
    const query = `
      SELECT 
        dm.id as request_id,
        dm.dashboard_id,
        d.name as dashboard_name,
        d.restricted_congregation as congregation,
        u.username,
        u.email
      FROM dashboard_members dm
      JOIN dashboards d ON dm.dashboard_id = d.id
      JOIN users u ON dm.user_id = u.id
      WHERE d.parent_dashboard_id = ?
        AND dm.status = 'pending'
      ORDER BY d.name, u.username
    `;
    
    db.all(query, [dashboardId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows || []);
    });
  });
});

// Approve member request in sub-dashboard
app.post('/config/subdashboards/:subDashboardId/accept', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const subDashboardId = req.params.subDashboardId;
  const { requestId } = req.body;
  
  // Check if user is owner or admin of parent dashboard
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    // Verify sub-dashboard belongs to parent
    db.get('SELECT id FROM dashboards WHERE id = ? AND parent_dashboard_id = ?', 
      [subDashboardId, dashboardId], (err, subDashboard) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!subDashboard) {
        res.status(404).json({ error: 'Sub-dashboard not found' });
        return;
      }
      
      // Accept the request
      db.run('UPDATE dashboard_members SET status = ? WHERE id = ? AND dashboard_id = ?', 
        ['member', requestId, subDashboardId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Member accepted' });
      });
    });
  });
});

// Reject member request in sub-dashboard
app.post('/config/subdashboards/:subDashboardId/reject', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const subDashboardId = req.params.subDashboardId;
  const { requestId } = req.body;
  
  // Check if user is owner or admin of parent dashboard
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    // Verify sub-dashboard belongs to parent
    db.get('SELECT id FROM dashboards WHERE id = ? AND parent_dashboard_id = ?', 
      [subDashboardId, dashboardId], (err, subDashboard) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!subDashboard) {
        res.status(404).json({ error: 'Sub-dashboard not found' });
        return;
      }
      
      // Reject the request (delete)
      db.run('DELETE FROM dashboard_members WHERE id = ? AND dashboard_id = ?', 
        [requestId, subDashboardId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Request rejected' });
      });
    });
  });
});

app.get('/config/members', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    const query = `
      SELECT dm.id, u.username, u.email, dm.status, dm.role
      FROM dashboard_members dm
      JOIN users u ON dm.user_id = u.id
      WHERE dm.dashboard_id = ?
      ORDER BY dm.status DESC, u.username
    `;
    db.all(query, [dashboardId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });
});

app.post('/config/members/:id/reject', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const memberId = req.params.id;
  
  // Check if user is owner or admin
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND (status = ? OR role = ?)', 
    [dashboardId, userId, 'owner', 'admin'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    db.run('DELETE FROM dashboard_members WHERE id = ? AND dashboard_id = ?', [memberId, dashboardId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Member request rejected' });
    });
  });
});

app.put('/config/members/:id/role', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id;
  const memberId = req.params.id;
  const { role } = req.body;
  
  // Check if user is owner
  db.get('SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ? AND status = ?', 
    [dashboardId, userId, 'owner'], (err, member) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!member) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    
    db.run('UPDATE dashboard_members SET role = ? WHERE id = ? AND dashboard_id = ?', [role, memberId, dashboardId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Member role updated' });
    });
  });
});

// Routes
app.get('/events', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  db.all('SELECT * FROM events WHERE dashboard_id = ? ORDER BY date', [dashboardId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/events', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const { date, title, description } = req.body;
  db.run('INSERT INTO events (dashboard_id, date, title, description) VALUES (?, ?, ?, ?)', [dashboardId, date, title, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.delete('/events/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;
  db.run('DELETE FROM events WHERE id = ? AND dashboard_id = ?', [id, dashboardId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Members routes
app.get('/members', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  
  // Check if this is a sub-dashboard with congregation restriction
  db.get('SELECT parent_dashboard_id, restricted_congregation FROM dashboards WHERE id = ?', [dashboardId], (err, dashboard) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Determine which dashboard to query members from
    const sourceDashboardId = dashboard && dashboard.parent_dashboard_id ? dashboard.parent_dashboard_id : dashboardId;
    
    let query = 'SELECT * FROM members WHERE dashboard_id = ?';
    let params = [sourceDashboardId];
    
    // If sub-dashboard with restricted congregation, filter by it
    if (dashboard && dashboard.restricted_congregation) {
      query += ' AND congregation = ?';
      params.push(dashboard.restricted_congregation);
    }
    
    query += ' ORDER BY name';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });
});

app.post('/members', authenticateToken, upload.single('photo'), (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const { name, congregation, cargo, birth_date, status, created_at } = req.body;
  const photo = req.file ? req.file.filename : null;
  
  // Check if this is a sub-dashboard with congregation restriction
  db.get('SELECT parent_dashboard_id, restricted_congregation FROM dashboards WHERE id = ?', [dashboardId], (err, dashboard) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // If sub-dashboard with restricted congregation, validate the congregation matches
    if (dashboard && dashboard.restricted_congregation) {
      if (congregation !== dashboard.restricted_congregation) {
        return res.status(403).json({ 
          error: `Este dashboard só permite membros da congregação: ${dashboard.restricted_congregation}` 
        });
      }
    }
    
    // Determine which dashboard to add member to (parent if sub-dashboard)
    const targetDashboardId = dashboard && dashboard.parent_dashboard_id ? dashboard.parent_dashboard_id : dashboardId;
    
    // Default values if not provided
    const memberStatus = status || 'active';
    const memberCreatedAt = created_at || new Date().toISOString().split('T')[0];

    db.run('INSERT INTO members (dashboard_id, name, congregation, cargo, birth_date, photo, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [targetDashboardId, name, congregation, cargo, birth_date, photo, memberStatus, memberCreatedAt], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
  });
});

app.put('/members/:id', authenticateToken, upload.single('photo'), (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;
  const { name, congregation, cargo, birth_date, status, created_at } = req.body;
  const photo = req.file ? req.file.filename : null;
  
  // Check if this is a sub-dashboard with congregation restriction
  db.get('SELECT parent_dashboard_id, restricted_congregation FROM dashboards WHERE id = ?', [dashboardId], (err, dashboard) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // If sub-dashboard with restricted congregation, validate the congregation matches
    if (dashboard && dashboard.restricted_congregation) {
      if (congregation !== dashboard.restricted_congregation) {
        return res.status(403).json({ 
          error: `Este dashboard só permite membros da congregação: ${dashboard.restricted_congregation}` 
        });
      }
    }
    
    // Determine which dashboard the member belongs to (parent if sub-dashboard)
    const targetDashboardId = dashboard && dashboard.parent_dashboard_id ? dashboard.parent_dashboard_id : dashboardId;
  
    let query = 'UPDATE members SET name = ?, congregation = ?, cargo = ?, birth_date = ?';
    let params = [name, congregation, cargo, birth_date];
    
    if (status) {
      query += ', status = ?';
      params.push(status);
    }
    
    if (created_at) {
      query += ', created_at = ?';
      params.push(created_at);
    }

    if (photo) {
      query += ', photo = ?';
      params.push(photo);
    }
    
    query += ' WHERE id = ? AND dashboard_id = ?';
    params.push(id, targetDashboardId);
    
    db.run(query, params, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ updated: this.changes });
    });
  });
});

app.delete('/members/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;
  
  // Check if this is a sub-dashboard
  db.get('SELECT parent_dashboard_id FROM dashboards WHERE id = ?', [dashboardId], (err, dashboard) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Determine which dashboard the member belongs to (parent if sub-dashboard)
    const targetDashboardId = dashboard && dashboard.parent_dashboard_id ? dashboard.parent_dashboard_id : dashboardId;
    
    db.run('DELETE FROM members WHERE id = ? AND dashboard_id = ?', [id, targetDashboardId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deleted: this.changes });
    });
  });
});

// Folders routes
app.get('/folders', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const type = req.query.type;
  db.all('SELECT * FROM folders WHERE dashboard_id = ? AND type = ? ORDER BY name', [dashboardId, type], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/folders', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const { name, type } = req.body;
  db.run('INSERT INTO folders (dashboard_id, name, type) VALUES (?, ?, ?)', [dashboardId, name, type], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.put('/folders/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome da pasta é obrigatório' });
  }
  
  db.run('UPDATE folders SET name = ? WHERE id = ? AND dashboard_id = ?', [name, id, dashboardId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Pasta não encontrada' });
      return;
    }
    res.json({ updated: this.changes });
  });
});

app.delete('/folders/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;
  
  // First delete all files in this folder
  db.run('DELETE FROM files WHERE folder_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Then delete the folder
    db.run('DELETE FROM folders WHERE id = ? AND dashboard_id = ?', [id, dashboardId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deleted: this.changes });
    });
  });
});

// Files routes
app.get('/files', authenticateToken, (req, res) => {
  const folderId = req.query.folder_id;
  db.all('SELECT * FROM files WHERE folder_id = ? ORDER BY uploaded_at DESC', [folderId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/files', authenticateToken, upload.single('file'), (req, res) => {
  const folderId = req.body.folder_id;
  const name = req.body.name || req.file.originalname;
  const filename = req.file.filename;
  db.run('INSERT INTO files (folder_id, name, filename) VALUES (?, ?, ?)', [folderId, name, filename], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.delete('/files/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  // First get filename to delete file
  db.get('SELECT filename FROM files WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      const fs = require('fs');
      const path = require('path');
      fs.unlink(path.join('uploads', row.filename), (err) => {
        if (err) console.error(err);
      });
    }
    db.run('DELETE FROM files WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ deleted: this.changes });
    });
  });
});

// Observations routes
app.get('/observations/:eventId', authenticateToken, (req, res) => {
  const eventId = req.params.eventId;
  db.all('SELECT o.*, u.email FROM observations o JOIN users u ON o.user_id = u.id WHERE o.event_id = ? ORDER BY o.created_at DESC', [eventId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/observations', authenticateToken, (req, res) => {
  const { event_id, observation } = req.body;
  const userId = req.user.id;
  db.run('INSERT INTO observations (event_id, user_id, observation) VALUES (?, ?, ?)', [event_id, userId, observation], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.delete('/observations/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  db.run('DELETE FROM observations WHERE id = ? AND user_id = ?', [id, userId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Personal routes
app.get('/personal', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.get('SELECT * FROM personal WHERE user_id = ?', [userId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || {});
  });
});

app.post('/personal', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { name, email, phone, address } = req.body;
  db.run('INSERT OR REPLACE INTO personal (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)', [userId, name, email, phone, address], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Projects routes
app.get('/projects', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  db.all('SELECT * FROM projects WHERE dashboard_id = ? ORDER BY title', [dashboardId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/projects', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const { title, description, status, startDate, endDate } = req.body;
  db.run('INSERT INTO projects (dashboard_id, title, description, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)', [dashboardId, title, description, status, startDate, endDate], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.put('/projects/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;
  const { title, description, status, startDate, endDate } = req.body;
  
  db.run('UPDATE projects SET title = ?, description = ?, status = ?, start_date = ?, end_date = ? WHERE id = ? AND dashboard_id = ?', 
    [title, description, status, startDate, endDate, id, dashboardId], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Projeto não encontrado' });
        return;
      }
      res.json({ updated: this.changes });
    });
});

app.delete('/projects/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;
  db.run('DELETE FROM projects WHERE id = ? AND dashboard_id = ?', [id, dashboardId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Transactions routes
app.get('/transactions', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const { month, year } = req.query;
  
  let query = 'SELECT * FROM transactions WHERE dashboard_id = ?';
  let params = [dashboardId];
  
  if (month && year) {
    // SQLite date format is YYYY-MM-DD
    // Filter by month string matching YYYY-MM
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    query += ' AND strftime("%Y-%m", date) = ?';
    params.push(monthStr);
  }
  
  query += ' ORDER BY date DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/transactions', authenticateToken, upload.single('attachment'), (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const { type, description, amount, date, category } = req.body;
  const attachment = req.file ? req.file.filename : null;
  
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  db.run('INSERT INTO transactions (dashboard_id, type, description, amount, date, category, attachment) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [dashboardId, type, description, amount, date, category, attachment], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.delete('/transactions/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;
  db.run('DELETE FROM transactions WHERE id = ? AND dashboard_id = ?', [id, dashboardId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Project Observations routes (dedicated path to avoid conflict with event observations)
app.get('/project-observations', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const projectId = req.query.project_id;

  if (!dashboardId) return res.status(400).json({ error: 'dashboard-id header is required' });
  if (!projectId) return res.status(400).json({ error: 'project_id is required' });

  db.all(`
    SELECT po.*
    FROM project_observations po
    JOIN projects p ON po.project_id = p.id
    WHERE po.project_id = ? AND p.dashboard_id = ?
    ORDER BY po.created_at DESC
  `, [projectId, dashboardId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

app.post('/project-observations', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const userId = req.user.id; // De authenticateToken
  const { project_id, text, observation_date } = req.body;

  if (!dashboardId) return res.status(400).json({ error: 'dashboard-id header is required' });
  if (!project_id || !text) return res.status(400).json({ error: 'project_id and text are required' });

  // Buscar username do usuário
  db.get('SELECT username FROM users WHERE id = ?', [userId], (getUserErr, userRow) => {
    if (getUserErr) {
      return res.status(500).json({ error: getUserErr.message });
    }

    const userName = userRow ? userRow.username : 'Usuário Desconhecido';

    // Ensure project belongs to dashboard
    db.get('SELECT 1 FROM projects WHERE id = ? AND dashboard_id = ?', [project_id, dashboardId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Projeto não encontrado no dashboard informado' });
      }

      db.run('INSERT INTO project_observations (project_id, text, observation_date, user_id, user_name) VALUES (?, ?, ?, ?, ?)', 
        [project_id, text, observation_date || null, userId, userName], 
        function(insertErr) {
          if (insertErr) {
            res.status(500).json({ error: insertErr.message });
            return;
          }
          res.json({ id: this.lastID, user_name: userName });
        });
    });
  });
});

app.delete('/project-observations/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;

  if (!dashboardId) return res.status(400).json({ error: 'dashboard-id header is required' });

  db.run(`
    DELETE FROM project_observations
    WHERE id = ?
      AND project_id IN (SELECT id FROM projects WHERE dashboard_id = ?)
  `, [id, dashboardId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

app.put('/project-observations/:id', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  const id = req.params.id;
  const { text, observation_date } = req.body;

  if (!dashboardId) return res.status(400).json({ error: 'dashboard-id header is required' });
  if (!text) return res.status(400).json({ error: 'text is required' });

  db.run(`
    UPDATE project_observations
    SET text = ?, observation_date = ?
    WHERE id = ?
      AND project_id IN (SELECT id FROM projects WHERE dashboard_id = ?)
  `, [text, observation_date || null, id, dashboardId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Observação não encontrada' });
      return;
    }
    res.json({ updated: this.changes });
  });
});

// Get observations with scheduled dates to show in agenda
app.get('/scheduled-observations', authenticateToken, (req, res) => {
  const dashboardId = req.headers['dashboard-id'];
  db.all(`SELECT 
    po.id, 
    po.text as title, 
    po.observation_date as date,
    'Observação de Projeto' as description
    FROM project_observations po
    WHERE po.observation_date IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = po.project_id AND p.dashboard_id = ?
    )
    ORDER BY po.observation_date`, [dashboardId], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows || []);
    });
});

// Project Files routes
app.get('/project-files', authenticateToken, (req, res) => {
  const projectId = req.query.project_id;
  db.all('SELECT * FROM project_files WHERE project_id = ? ORDER BY uploaded_at DESC', [projectId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

app.post('/project-files', authenticateToken, upload.single('file'), (req, res) => {
  const projectId = req.body.project_id;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  
  db.run('INSERT INTO project_files (project_id, name, filename) VALUES (?, ?, ?)', 
    [projectId, file.originalname, file.filename], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
});

app.delete('/project-files/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM project_files WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Project Notes routes
app.get('/project-notes', authenticateToken, (req, res) => {
  const projectId = req.query.project_id;
  db.get('SELECT * FROM project_notes WHERE project_id = ?', [projectId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { notes: '' });
  });
});

app.post('/project-notes', authenticateToken, (req, res) => {
  const { project_id, notes } = req.body;
  const now = new Date().toISOString();
  
  db.run('INSERT OR REPLACE INTO project_notes (project_id, notes, updated_at) VALUES (?, ?, ?)', 
    [project_id, notes, now], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ updated: true });
    });
});

// ==================== ADMIN ROUTES ====================

// Check if user is system admin
app.get('/admin/check', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.get('SELECT is_system_admin FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ isAdmin: !!(row && row.is_system_admin) });
  });
});

// Generate activation key (admin only)
app.post('/admin/generate-key', authenticateSystemAdmin, (req, res) => {
  const { dashboard_name, expires_in_days } = req.body;
  const adminId = req.user.id;
  
  // Generate unique key
  const key = `NEXO-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  let expires_at = null;
  if (expires_in_days && expires_in_days > 0) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + parseInt(expires_in_days));
    expires_at = expireDate.toISOString();
  }
  
  db.run(
    'INSERT INTO activation_keys (key, dashboard_name, created_by_admin_id, expires_at) VALUES (?, ?, ?, ?)',
    [key, dashboard_name || null, adminId, expires_at],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID,
        key,
        dashboard_name,
        expires_at,
        created_at: new Date().toISOString()
      });
    }
  );
});

// List all activation keys (admin only)
app.get('/admin/activation-keys', authenticateSystemAdmin, (req, res) => {
  const query = `
    SELECT 
      ak.*,
      u_created.username as created_by_username,
      u_used.username as used_by_username
    FROM activation_keys ak
    LEFT JOIN users u_created ON ak.created_by_admin_id = u_created.id
    LEFT JOIN users u_used ON ak.used_by_user_id = u_used.id
    ORDER BY ak.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Delete activation key (admin only)
app.delete('/admin/activation-keys/:id', authenticateSystemAdmin, (req, res) => {
  const keyId = req.params.id;
  
  db.run('DELETE FROM activation_keys WHERE id = ?', [keyId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Activation key not found' });
    }
    res.json({ deleted: true });
  });
});

// Revoke/Block activation key (admin only)
app.post('/admin/activation-keys/:id/revoke', authenticateSystemAdmin, (req, res) => {
  const keyId = req.params.id;
  
  // First, get the key data to find associated dashboards
  db.get('SELECT key, dashboard_id FROM activation_keys WHERE id = ?', [keyId], (err, keyData) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!keyData) {
      return res.status(404).json({ error: 'Activation key not found' });
    }
    
    // Revoke the key
    db.run(
      'UPDATE activation_keys SET revoked_at = ? WHERE id = ?',
      [new Date().toISOString(), keyId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Deactivate all dashboards that were activated with this key
        db.run(
          'UPDATE dashboards SET activated_at = NULL WHERE activated_by_key = ?',
          [keyData.key],
          function(err) {
            if (err) {
              console.error('Error deactivating dashboards:', err);
            }
            
            const dashboardsDeactivated = this.changes;
            res.json({ 
              success: true,
              message: `Chave revogada com sucesso${dashboardsDeactivated > 0 ? ` e ${dashboardsDeactivated} dashboard(s) desativado(s)` : ''}` 
            });
          }
        );
      }
    );
  });
});

// Restore/Unblock activation key (admin only)
app.post('/admin/activation-keys/:id/restore', authenticateSystemAdmin, (req, res) => {
  const keyId = req.params.id;
  
  // First, get the key data
  db.get('SELECT key FROM activation_keys WHERE id = ?', [keyId], (err, keyData) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!keyData) {
      return res.status(404).json({ error: 'Activation key not found' });
    }
    
    // Restore the key
    db.run(
      'UPDATE activation_keys SET revoked_at = NULL WHERE id = ?',
      [keyId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Reactivate dashboards that were activated with this key
        db.run(
          'UPDATE dashboards SET activated_at = ? WHERE activated_by_key = ? AND activated_at IS NULL',
          [new Date().toISOString(), keyData.key],
          function(err) {
            if (err) {
              console.error('Error reactivating dashboards:', err);
            }
            
            const dashboardsReactivated = this.changes;
            res.json({ 
              success: true,
              message: `Chave restaurada com sucesso${dashboardsReactivated > 0 ? ` e ${dashboardsReactivated} dashboard(s) reativado(s)` : ''}` 
            });
          }
        );
      }
    );
  });
});

// Get all users (admin only)
app.get('/admin/users', authenticateSystemAdmin, (req, res) => {
  db.all(
    `SELECT id, username, email, created_at, is_system_admin 
     FROM users 
     ORDER BY is_system_admin DESC, username ASC`,
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(users);
    }
  );
});

// Grant admin access to user (admin only)
app.post('/admin/grant-access', authenticateSystemAdmin, (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Nome de usuário é obrigatório' });
  }
  
  // Check if user exists
  db.get('SELECT id, username, is_system_admin FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    if (user.is_system_admin === 1) {
      return res.status(400).json({ error: 'Usuário já é administrador' });
    }
    
    // Grant admin access
    db.run(
      'UPDATE users SET is_system_admin = 1 WHERE id = ?',
      [user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({ 
          success: true, 
          message: `${username} agora tem acesso de administrador` 
        });
      }
    );
  });
});

// Revoke admin access from user (admin only)
app.post('/admin/revoke-access', authenticateSystemAdmin, (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Nome de usuário é obrigatório' });
  }
  
  // Prevent removing admin access from yourself
  if (username === req.user.username) {
    return res.status(400).json({ error: 'Você não pode remover seu próprio acesso de administrador' });
  }
  
  // Check if user exists
  db.get('SELECT id, username, is_system_admin FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    if (user.is_system_admin !== 1) {
      return res.status(400).json({ error: 'Usuário não é administrador' });
    }
    
    // Revoke admin access
    db.run(
      'UPDATE users SET is_system_admin = 0 WHERE id = ?',
      [user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({ 
          success: true, 
          message: `Acesso de administrador removido de ${username}` 
        });
      }
    );
  });
});

// Generate password reset link (admin only)
app.post('/admin/reset-password-link', authenticateSystemAdmin, (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Nome de usuário é obrigatório' });
  }
  
  // Check if user exists
  db.get('SELECT id, username FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    
    // Store reset token in database
    db.run(
      `INSERT INTO password_resets (user_id, token, expires_at) 
       VALUES (?, ?, ?)`,
      [user.id, resetToken, expiresAt],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Generate reset link
        const resetLink = `http://localhost:3000/reset-password.html?token=${resetToken}`;
        
        res.json({ 
          success: true,
          resetLink: resetLink,
          expiresIn: '1 hora'
        });
      }
    );
  });
});

// Check dashboard activation status
app.get('/dashboards/:dashboardId/activation-status', authenticateToken, (req, res) => {
  const dashboardId = req.params.dashboardId;
  
  db.get(
    'SELECT activated_at, activated_by_key FROM dashboards WHERE id = ?',
    [dashboardId],
    (err, dashboard) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }
      
      // Check if dashboard was activated with a key
      if (dashboard.activated_by_key) {
        // Check if the key has been revoked
        db.get(
          'SELECT revoked_at FROM activation_keys WHERE key = ?',
          [dashboard.activated_by_key],
          (err, keyData) => {
            if (err) {
              console.error('Error checking key status:', err);
            }
            
            // If key was revoked, dashboard should be deactivated
            const isActivated = dashboard.activated_at !== null && (!keyData || !keyData.revoked_at);
            
            res.json({
              isActivated: isActivated,
              activatedAt: dashboard.activated_at,
              activatedByKey: dashboard.activated_by_key,
              keyRevoked: keyData && keyData.revoked_at ? true : false
            });
          }
        );
      } else {
        res.json({
          isActivated: dashboard.activated_at !== null,
          activatedAt: dashboard.activated_at,
          activatedByKey: dashboard.activated_by_key
        });
      }
    }
  );
});

// Activate dashboard with key (any authenticated user)
app.post('/activate-dashboard', authenticateToken, (req, res) => {
  const { activationKey, dashboardId } = req.body;
  const userId = req.user.id;
  
  if (!activationKey) {
    return res.status(400).json({ error: 'Chave de ativação é obrigatória' });
  }
  
  // Check if key exists and is valid
  db.get('SELECT * FROM activation_keys WHERE key = ?', [activationKey.toUpperCase()], (err, keyData) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!keyData) {
      return res.status(404).json({ error: 'Chave de ativação inválida' });
    }
    
    // Check if key is revoked
    if (keyData.revoked_at) {
      return res.status(400).json({ error: 'Esta chave foi bloqueada/revogada pelo administrador' });
    }
    
    // Check if key was already used - block any reuse
    if (keyData.used_at) {
      return res.status(400).json({ error: 'Esta chave já foi utilizada e não pode ser reutilizada' });
    }
    
    // Check if expired
    if (keyData.expires_at) {
      const expireDate = new Date(keyData.expires_at);
      if (expireDate < new Date()) {
        return res.status(400).json({ error: 'Chave de ativação expirada' });
      }
    }
    
    // If dashboardId is provided, activate existing dashboard
    if (dashboardId) {
      // Verify user has access to this dashboard
      db.get(
        'SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?',
        [dashboardId, userId],
        (err, membership) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          if (!membership) {
            return res.status(403).json({ error: 'Você não tem acesso a este dashboard' });
          }
          
          // Update dashboard as activated
          db.run(
            'UPDATE dashboards SET activated_at = ?, activated_by_key = ? WHERE id = ?',
            [new Date().toISOString(), activationKey.toUpperCase(), dashboardId],
            function(err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              
              // Mark key as used (if not already)
              db.run(
                'UPDATE activation_keys SET used_at = ?, used_by_user_id = ?, dashboard_id = ? WHERE id = ?',
                [new Date().toISOString(), userId, dashboardId, keyData.id],
                function(err) {
                  if (err) {
                    console.error('Error marking key as used:', err);
                  }
                  
                  res.json({
                    success: true,
                    message: 'Dashboard ativado com sucesso!',
                    dashboardId: dashboardId
                  });
                }
              );
            }
          );
        }
      );
      return;
    }
    
    // Otherwise, create new dashboard (original behavior)
    const dashboardName = keyData.dashboard_name || 'Novo Dashboard';
    const code = Math.random().toString(36).substring(2, 15);
    
    db.run(
      'INSERT INTO dashboards (name, owner_id, code, activated_at, activated_by_key) VALUES (?, ?, ?, ?, ?)',
      [dashboardName, userId, code, new Date().toISOString(), activationKey.toUpperCase()],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const dashboardId = this.lastID;
        
        // Add user as owner
        db.run(
          'INSERT INTO dashboard_members (dashboard_id, user_id, status, role) VALUES (?, ?, ?, ?)',
          [dashboardId, userId, 'owner', 'owner'],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            
            // Mark key as used
            db.run(
              'UPDATE activation_keys SET used_at = ?, used_by_user_id = ?, dashboard_id = ? WHERE id = ?',
              [new Date().toISOString(), userId, dashboardId, keyData.id],
              function(err) {
                if (err) {
                  console.error('Error marking key as used:', err);
                }
                
                res.json({
                  success: true,
                  message: 'Dashboard criado e ativado com sucesso!',
                  dashboard: {
                    id: dashboardId,
                    name: dashboardName,
                    code: code
                  }
                });
              }
            );
          }
        );
      }
    );
  });
});

// ==================== ENDPOINTS PARA PREGAÇÕES ====================

// Obter todas as pregações de um dashboard
app.get('/dashboards/:id/pregacoes', authenticateToken, (req, res) => {
  const dashboardId = req.params.id;
  const userId = req.user.id;

  // Verifica se o usuário tem acesso ao dashboard
  db.get(
    'SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?',
    [dashboardId, userId],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!member) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Busca todas as pregações do dashboard
      db.all(
        'SELECT * FROM pregacoes WHERE dashboard_id = ? ORDER BY modificado_em DESC',
        [dashboardId],
        (err, pregacoes) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json(pregacoes);
        }
      );
    }
  );
});

// Criar nova pregação
app.post('/dashboards/:id/pregacoes', authenticateToken, (req, res) => {
  const dashboardId = req.params.id;
  const userId = req.user.id;
  const { titulo, conteudo, livro_biblia } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  // Verifica se o usuário tem acesso ao dashboard
  db.get(
    'SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?',
    [dashboardId, userId],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!member) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Cria a pregação
      const agora = new Date().toISOString();
      db.run(
        'INSERT INTO pregacoes (dashboard_id, titulo, livro_biblia, conteudo, criado_em, modificado_em) VALUES (?, ?, ?, ?, ?, ?)',
        [dashboardId, titulo, livro_biblia || null, conteudo, agora, agora],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({
            id: this.lastID,
            dashboard_id: dashboardId,
            titulo,
            livro_biblia,
            conteudo,
            criado_em: agora,
            modificado_em: agora
          });
        }
      );
    }
  );
});

// Atualizar pregação
app.put('/dashboards/:dashboardId/pregacoes/:id', authenticateToken, (req, res) => {
  const dashboardId = req.params.dashboardId;
  const pregacaoId = req.params.id;
  const userId = req.user.id;
  const { titulo, conteudo, livro_biblia } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  // Verifica se o usuário tem acesso ao dashboard
  db.get(
    'SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?',
    [dashboardId, userId],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!member) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Atualiza a pregação
      const agora = new Date().toISOString();
      db.run(
        'UPDATE pregacoes SET titulo = ?, livro_biblia = ?, conteudo = ?, modificado_em = ? WHERE id = ? AND dashboard_id = ?',
        [titulo, livro_biblia || null, conteudo, agora, pregacaoId, dashboardId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Pregação não encontrada' });
          }
          res.json({ success: true, modificado_em: agora });
        }
      );
    }
  );
});

// Excluir pregação
app.delete('/dashboards/:dashboardId/pregacoes/:id', authenticateToken, (req, res) => {
  const dashboardId = req.params.dashboardId;
  const pregacaoId = req.params.id;
  const userId = req.user.id;

  // Verifica se o usuário tem acesso ao dashboard
  db.get(
    'SELECT * FROM dashboard_members WHERE dashboard_id = ? AND user_id = ?',
    [dashboardId, userId],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!member) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Exclui a pregação
      db.run(
        'DELETE FROM pregacoes WHERE id = ? AND dashboard_id = ?',
        [pregacaoId, dashboardId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Pregação não encontrada' });
          }
          res.json({ success: true });
        }
      );
    }
  );
});

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on http://localhost:${PORT}`);
  } else {
    console.log('Server running');
  }
});