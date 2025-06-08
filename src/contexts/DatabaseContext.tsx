import React, { createContext, useContext, useState, useEffect } from 'react';

interface DatabaseContextType {
  db: any;
  isReady: boolean;
  initializeDatabase: () => Promise<void>;
  saveDatabase: () => void;
  exportDatabase: () => void;
  importDatabase: (file: File) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Check if we're running in Electron
const isElectron = typeof window !== 'undefined' && window.require;

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  const initializeDatabase = async () => {
    try {
      if (isElectron) {
        // Electron environment - use Node.js fs and sqlite3
        const { ipcRenderer } = window.require('electron');
        
        // Initialize database through IPC
        const dbInitialized = await ipcRenderer.invoke('init-database');
        if (dbInitialized) {
          setDb({ type: 'electron' });
          setIsReady(true);
        }
      } else {
        // Browser environment - use sql.js as fallback
        const initSqlJs = (await import('sql.js')).default;
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`
        });

        // Try to load existing database from localStorage
        const savedDb = localStorage.getItem('gym_database');
        let database;

        if (savedDb) {
          const uint8Array = new Uint8Array(JSON.parse(savedDb));
          database = new SQL.Database(uint8Array);
        } else {
          database = new SQL.Database();
          
          // Create tables
          database.run(`
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

          database.run(`
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

          database.run(`
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
        }

        setDb(database);
        setIsReady(true);
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  const saveDatabase = () => {
    if (isElectron && db) {
      // In Electron, database is automatically saved to disk
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.invoke('save-database');
    } else if (db && db.export) {
      // Browser fallback - save to localStorage
      const data = db.export();
      const buffer = Array.from(data);
      localStorage.setItem('gym_database', JSON.stringify(buffer));
    }
  };

  const exportDatabase = () => {
    if (isElectron) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.invoke('export-database');
    } else if (db && db.export) {
      const data = db.export();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gym_database_${new Date().toISOString().split('T')[0]}.sqlite`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const importDatabase = async (file: File): Promise<void> => {
    try {
      if (isElectron) {
        const { ipcRenderer } = window.require('electron');
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await ipcRenderer.invoke('import-database', Array.from(uint8Array));
      } else {
        const initSqlJs = (await import('sql.js')).default;
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`
        });

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const database = new SQL.Database(uint8Array);
        
        setDb(database);
        saveDatabase();
      }
    } catch (error) {
      console.error('Failed to import database:', error);
      throw error;
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isReady) {
      const interval = setInterval(saveDatabase, 30000);
      return () => clearInterval(interval);
    }
  }, [isReady, db]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDatabase();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [db]);

  return (
    <DatabaseContext.Provider value={{ 
      db, 
      isReady, 
      initializeDatabase, 
      saveDatabase, 
      exportDatabase, 
      importDatabase 
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseContext');
  }
  return context;
}