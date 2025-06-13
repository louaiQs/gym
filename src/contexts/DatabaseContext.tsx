import React, { createContext, useContext, useState, useEffect } from 'react';
import { Database } from 'sql.js';

interface DatabaseContextType {
  db: Database | null;
  isReady: boolean;
  initializeDatabase: () => Promise<void>;
  saveDatabase: () => void;
  exportDatabase: () => void;
  importDatabase: (file: File) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [isReady, setIsReady] = useState(false);

  const initializeDatabase = async () => {
    try {
      const initSqlJs = (await import('sql.js')).default;
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });

      let database: Database;

      // Try to load from IndexedDB first
      const savedDb = await loadFromIndexedDB();
      if (savedDb) {
        database = new SQL.Database(savedDb);
      } else {
        // Create new database with schema
        database = new SQL.Database();
        initializeSchema(database);
      }

      setDb(database);
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  const initializeSchema = (database: Database) => {
    database.exec(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gender TEXT NOT NULL DEFAULT 'male',
        age INTEGER,
        height REAL,
        weight REAL,
        bmi REAL,
        body_type TEXT,
        fitness_goal TEXT,
        custom_goal TEXT,
        phone TEXT,
        subscription_date TEXT NOT NULL,
        expiry_date TEXT NOT NULL,
        residence TEXT NOT NULL,
        price REAL NOT NULL,
        debt REAL DEFAULT 0,
        subscription_duration INTEGER DEFAULT 30,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        attendance TEXT DEFAULT '[]',
        shower INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    database.exec(`
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

    database.exec(`
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

    database.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    database.exec(`
      CREATE TABLE IF NOT EXISTS individual_classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        date TEXT NOT NULL,
        price REAL NOT NULL DEFAULT 200,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  };

  const saveDatabase = async () => {
    if (db) {
      const data = db.export();
      await saveToIndexedDB(data);
    }
  };

  const exportDatabase = () => {
    if (db) {
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
      const initSqlJs = (await import('sql.js')).default;
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const database = new SQL.Database(uint8Array);
      
      setDb(database);
      await saveDatabase();
    } catch (error) {
      console.error('Failed to import database:', error);
      throw error;
    }
  };

  // IndexedDB functions
  const saveToIndexedDB = async (data: Uint8Array): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GymDatabase', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('database')) {
          db.createObjectStore('database');
        }
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction('database', 'readwrite');
        const store = transaction.objectStore('database');
        store.put(data, 'gym_data');
        resolve();
      };
      
      request.onerror = (event) => {
        reject(new Error('Error saving to IndexedDB'));
      };
    });
  };

  const loadFromIndexedDB = async (): Promise<Uint8Array | null> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GymDatabase', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('database')) {
          db.createObjectStore('database');
        }
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction('database', 'readonly');
        const store = transaction.objectStore('database');
        const getRequest = store.get('gym_data');
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        
        getRequest.onerror = () => {
          resolve(null);
        };
      };
      
      request.onerror = (event) => {
        resolve(null);
      };
    });
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  useEffect(() => {
    if (isReady) {
      const interval = setInterval(saveDatabase, 30000);
      return () => clearInterval(interval);
    }
  }, [isReady, db]);

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