const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;
let db;

// Database file path in user data directory
const dbPath = path.join(app.getPath('userData'), 'gym_database.sqlite');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }
}

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Ensure the user data directory exists
    const userDataDir = app.getPath('userData');
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }

      console.log('Connected to SQLite database at:', dbPath);

      // Create tables if they don't exist
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS subscribers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            gender TEXT NOT NULL DEFAULT 'male',
            phone TEXT,
            subscription_date TEXT NOT NULL,
            expiry_date TEXT NOT NULL,
            residence TEXT NOT NULL,
            price REAL NOT NULL,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            attendance TEXT DEFAULT '[]',
            shower INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            purchase_price REAL NOT NULL DEFAULT 0,
            selling_price REAL NOT NULL DEFAULT 0,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS sales (
            id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL,
            product_name TEXT NOT NULL,
            quantity_sold INTEGER NOT NULL,
            purchase_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            profit REAL NOT NULL,
            sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products (id)
          )
        `);

        resolve(true);
      });
    });
  });
}

// IPC handlers
ipcMain.handle('init-database', async () => {
  try {
    await initializeDatabase();
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
});

ipcMain.handle('execute-query', async (event, query, params = []) => {
  return new Promise((resolve, reject) => {
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Query error:', err);
          reject(err);
        } else {
          // Convert rows to array format for compatibility
          const result = rows.map(row => Object.values(row));
          resolve(result);
        }
      });
    } else {
      db.run(query, params, function(err) {
        if (err) {
          console.error('Query error:', err);
          reject(err);
        } else {
          resolve({ changes: this.changes, lastID: this.lastID });
        }
      });
    }
  });
});

ipcMain.handle('save-database', async () => {
  // Database is automatically saved to disk with sqlite3
  return true;
});

ipcMain.handle('export-database', async () => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: `gym_database_${new Date().toISOString().split('T')[0]}.sqlite`,
      filters: [
        { name: 'SQLite Database', extensions: ['sqlite', 'db'] }
      ]
    });

    if (filePath) {
      // Copy the database file to the selected location
      fs.copyFileSync(dbPath, filePath);
      return { success: true, path: filePath };
    }
    
    return { success: false, message: 'Export cancelled' };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('import-database', async (event, uint8Array) => {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      filters: [
        { name: 'SQLite Database', extensions: ['sqlite', 'db'] }
      ],
      properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
      const importPath = filePaths[0];
      
      // Close current database
      if (db) {
        db.close();
      }

      // Copy the imported file to replace the current database
      fs.copyFileSync(importPath, dbPath);

      // Reinitialize database
      await initializeDatabase();
      
      return { success: true };
    }
    
    return { success: false, message: 'Import cancelled' };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, message: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed.');
      }
    });
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app termination
app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});