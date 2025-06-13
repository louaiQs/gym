import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';

export interface Subscriber {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  bodyType?: string;
  fitnessGoal?: 'bulking' | 'cutting' | 'custom';
  customGoal?: string;
  phone?: string;
  subscriptionDate: string;
  expiryDate: string;
  residence: string;
  price: number;
  debt: number;
  subscriptionDuration: number;
  notes?: string;
  status: 'active' | 'expired' | 'frozen';
  attendance: AttendanceRecord[];
  shower: boolean;
}

export interface AttendanceRecord {
  date: string;
  trainingTypes: string[];
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  description?: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantitySold: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  saleDate: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: 'rent' | 'equipment' | 'salary' | 'utilities' | 'maintenance' | 'other';
  description?: string;
  date: string;
}

export interface IndividualClass {
  id: string;
  name: string;
  age?: number;
  date: string;
  price: number;
}

interface DataContextType {
  subscribers: Subscriber[];
  filteredSubscribers: Subscriber[];
  products: Product[];
  sales: Sale[];
  filteredSales: Sale[];
  expenses: Expense[];
  filteredExpenses: Expense[];
  individualClasses: IndividualClass[];
  filteredIndividualClasses: IndividualClass[];
  viewMode: 'cards' | 'list';
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  addSubscriber: (subscriber: Omit<Subscriber, 'id' | 'status' | 'attendance'>) => Promise<void>;
  updateSubscriber: (id: string, updates: Partial<Subscriber>) => void;
  deleteSubscriber: (id: string) => void;
  freezeSubscriber: (id: string) => void;
  unfreezeSubscriber: (id: string) => void;
  recordAttendance: (id: string, trainingTypes: string[]) => Promise<boolean>; 
  removeAttendance: (id: string, dateString: string) => Promise<boolean>;   
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  sellProduct: (id: string, quantity: number) => Promise<boolean>;      
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addIndividualClass: (individualClass: Omit<IndividualClass, 'id'>) => void;
  updateIndividualClass: (id: string, updates: Partial<IndividualClass>) => void;
  deleteIndividualClass: (id: string) => void;
  setViewMode: (mode: 'cards' | 'list') => void;
  loadData: () => void;
  searchSubscribers: (term: string) => Subscriber[];
  calculateBMI: (height: number, weight: number) => { bmi: number; bodyType: string };
  getDefaultFitnessGoal: (bmi: number) => 'bulking' | 'cutting';
  checkExistingSubscriber: (name: string) => { exists: boolean; subscriber?: Subscriber };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { db, isReady, saveDatabase } = useDatabase();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [individualClasses, setIndividualClasses] = useState<IndividualClass[]>([]);
  const [filteredIndividualClasses, setFilteredIndividualClasses] = useState<IndividualClass[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const executeQuery = (query: string, params: any[] = []): any => {
    if (!db || !isReady) return null;

    try {
      if (query.startsWith('SELECT')) {
        const result = db.exec(query, params);
        return result.length > 0 ? result[0].values : [];
      } else {
        db.run(query, params);
        saveDatabase(); // تأكد من حفظ التغييرات
        return true;
      }
    } catch (error) {
      console.error('Query error:', error);
      return null;
    }
  };

  const calculateBMI = (height: number, weight: number): { bmi: number; bodyType: string } => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let bodyType = '';
    if (bmi < 18.5) bodyType = 'نحيف';
    else if (bmi < 25) bodyType = 'طبيعي';
    else if (bmi < 30) bodyType = 'زيادة وزن';
    else bodyType = 'سمنة';
    
    return { bmi: Math.round(bmi * 10) / 10, bodyType };
  };

  const getDefaultFitnessGoal = (bmi: number): 'bulking' | 'cutting' => {
    return bmi < 18.5 ? 'bulking' : 'cutting';
  };

  const checkExistingSubscriber = (name: string): { exists: boolean; subscriber?: Subscriber } => {
    const existing = subscribers.find(sub => sub.name.toLowerCase() === name.toLowerCase());
    return { exists: !!existing, subscriber: existing };
  };

  const searchSubscribers = (term: string): Subscriber[] => {
    if (!term.trim()) return [];
    
    return subscribers.filter(subscriber => 
      subscriber.status === 'active' && (
        subscriber.name.toLowerCase().includes(term.toLowerCase()) ||
        (subscriber.phone && subscriber.phone.includes(term)) ||
        subscriber.residence.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const loadData = async () => {
    if (!db || !isReady) return;

    try {
      // تأكد من وجود الجداول أولاً
      const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      if (!tables || tables.length === 0 || tables[0].values.length === 0) {
        // إذا لم تكن هناك جداول، قم بإنشائها
        db.exec(`
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
          );
          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            purchase_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS sales (
            id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL,
            product_name TEXT NOT NULL,
            quantity_sold INTEGER NOT NULL,
            purchase_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            profit REAL NOT NULL,
            sale_date TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS individual_classes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER,
            date TEXT NOT NULL,
            price REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }

      // الآن يمكنك تحميل البيانات بأمان
      // Load subscribers
      const subscribersData = executeQuery("SELECT * FROM subscribers ORDER BY created_at DESC");
      if (subscribersData && subscribersData.length > 0) {
        const mappedSubscribers = subscribersData.map((row: any) => ({
          id: row[0],
          name: row[1],
          gender: row[2],
          age: row[3],
          height: row[4],
          weight: row[5],
          bmi: row[6],
          bodyType: row[7],
          fitnessGoal: row[8],
          customGoal: row[9],
          phone: row[10],
          subscriptionDate: row[11],
          expiryDate: row[12],
          residence: row[13],
          price: row[14],
          debt: row[15] || 0,
          subscriptionDuration: row[16] || 30,
          notes: row[17],
          status: row[18],
          attendance: JSON.parse(row[19] || '[]'),
          shower: Boolean(row[20])
        }));
        setSubscribers(mappedSubscribers.map(updateSubscriberStatus));
        setFilteredSubscribers(filterDataByMonth(mappedSubscribers.map(updateSubscriberStatus), 'subscriptionDate'));
      }

      // Load products
      const productsData = executeQuery("SELECT * FROM products ORDER BY created_at DESC");
      if (productsData && productsData.length > 0) {
        const mappedProducts = productsData.map((row: any) => ({
          id: row[0],
          name: row[1],
          quantity: row[2],
          purchasePrice: row[3],
          sellingPrice: row[4],
          description: row[5]
        }));
        setProducts(mappedProducts);
      }

      // Load sales
      const salesData = executeQuery("SELECT * FROM sales ORDER BY sale_date DESC");
      if (salesData && salesData.length > 0) {
        const mappedSales = salesData.map((row: any) => ({
          id: row[0],
          productId: row[1],
          productName: row[2],
          quantitySold: row[3],
          purchasePrice: row[4],
          sellingPrice: row[5],
          profit: row[6],
          saleDate: row[7]
        }));
        setSales(mappedSales);
        setFilteredSales(filterDataByMonth(mappedSales, 'saleDate'));
      }

      // Load expenses
      const expensesData = executeQuery("SELECT * FROM expenses ORDER BY date DESC");
      if (expensesData && expensesData.length > 0) {
        const mappedExpenses = expensesData.map((row: any) => ({
          id: row[0],
          name: row[1],
          amount: row[2],
          category: row[3],
          description: row[4],
          date: row[5]
        }));
        setExpenses(mappedExpenses);
        setFilteredExpenses(filterDataByMonth(mappedExpenses, 'date'));
      }

      // Load individual classes
      const classesData = executeQuery("SELECT * FROM individual_classes ORDER BY date DESC");
      if (classesData && classesData.length > 0) {
        const mappedClasses = classesData.map((row: any) => ({
          id: row[0],
          name: row[1],
          age: row[2],
          date: row[3],
          price: row[4]
        }));
        setIndividualClasses(mappedClasses);
        setFilteredIndividualClasses(filterDataByMonth(mappedClasses, 'date'));
      }

      // Load view mode
      const savedViewMode = localStorage.getItem('gym_view_mode');
      if (savedViewMode) {
        setViewMode(JSON.parse(savedViewMode));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadData();
    }
  }, [db, isReady]);

  useEffect(() => {
    localStorage.setItem('gym_view_mode', JSON.stringify(viewMode));
  }, [viewMode]);

  const filterDataByMonth = (data: any[], dateField: string) => {
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate.toISOString().slice(0, 7) === currentMonth;
    });
  };

  useEffect(() => {
    if (subscribers.length > 0) {
      setFilteredSubscribers(filterDataByMonth(subscribers, 'subscriptionDate'));
    }
    if (sales.length > 0) {
      setFilteredSales(filterDataByMonth(sales, 'saleDate'));
    }
    if (expenses.length > 0) {
      setFilteredExpenses(filterDataByMonth(expenses, 'date'));
    }
    if (individualClasses.length > 0) {
      setFilteredIndividualClasses(filterDataByMonth(individualClasses, 'date'));
    }
  }, [currentMonth, subscribers, sales, expenses, individualClasses]);

  const updateSubscriberStatus = (subscriber: Subscriber): Subscriber => {
    const today = new Date();
    const expiryDate = new Date(subscriber.expiryDate);
    
    if (subscriber.status === 'frozen') {
      return subscriber;
    }
    
    const status = expiryDate < today ? 'expired' : 'active';
    return { ...subscriber, status };
  };

  const addSubscriber = async (subscriberData: Omit<Subscriber, 'id' | 'status' | 'attendance'>) => {
    if (!db) return;

    const id = Date.now().toString();
    const newSubscriber: Subscriber = {
      ...subscriberData,
      id,
      status: 'active',
      attendance: []
    };
    
    const updatedSubscriber = updateSubscriberStatus(newSubscriber);
    
    try {
      executeQuery(`
        INSERT INTO subscribers (id, name, gender, age, height, weight, bmi, body_type, fitness_goal, custom_goal, phone, subscription_date, expiry_date, residence, price, debt, subscription_duration, notes, status, attendance, shower)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        updatedSubscriber.name,
        updatedSubscriber.gender,
        updatedSubscriber.age || null,
        updatedSubscriber.height || null,
        updatedSubscriber.weight || null,
        updatedSubscriber.bmi || null,
        updatedSubscriber.bodyType || null,
        updatedSubscriber.fitnessGoal || null,
        updatedSubscriber.customGoal || null,
        updatedSubscriber.phone || null,
        updatedSubscriber.subscriptionDate,
        updatedSubscriber.expiryDate,
        updatedSubscriber.residence,
        updatedSubscriber.price,
        updatedSubscriber.debt,
        updatedSubscriber.subscriptionDuration,
        updatedSubscriber.notes || null,
        updatedSubscriber.status,
        JSON.stringify(updatedSubscriber.attendance),
        updatedSubscriber.shower ? 1 : 0
      ]);
      
      setSubscribers(prev => [updatedSubscriber, ...prev]);
      saveDatabase();
    } catch (error) {
      console.error('Error adding subscriber:', error);
      throw error;
    }
  };

  const updateSubscriber = async (id: string, updates: Partial<Subscriber>) => {
    if (!db) return;

    const subscriber = subscribers.find(s => s.id === id);
    if (!subscriber) return;

    const updated = { ...subscriber, ...updates };
    const updatedSubscriber = updateSubscriberStatus(updated);

    try {
      executeQuery(`
        UPDATE subscribers SET 
        name = ?, gender = ?, age = ?, height = ?, weight = ?, bmi = ?, body_type = ?, fitness_goal = ?, custom_goal = ?, phone = ?, subscription_date = ?, expiry_date = ?, 
        residence = ?, price = ?, debt = ?, subscription_duration = ?, notes = ?, status = ?, attendance = ?, shower = ?
        WHERE id = ?
      `, [
        updatedSubscriber.name,
        updatedSubscriber.gender,
        updatedSubscriber.age || null,
        updatedSubscriber.height || null,
        updatedSubscriber.weight || null,
        updatedSubscriber.bmi || null,
        updatedSubscriber.bodyType || null,
        updatedSubscriber.fitnessGoal || null,
        updatedSubscriber.customGoal || null,
        updatedSubscriber.phone || null,
        updatedSubscriber.subscriptionDate,
        updatedSubscriber.expiryDate,
        updatedSubscriber.residence,
        updatedSubscriber.price,
        updatedSubscriber.debt,
        updatedSubscriber.subscriptionDuration,
        updatedSubscriber.notes || null,
        updatedSubscriber.status,
        JSON.stringify(updatedSubscriber.attendance),
        updatedSubscriber.shower ? 1 : 0,
        id
      ]);

      setSubscribers(prev => prev.map(sub => sub.id === id ? updatedSubscriber : sub));
      saveDatabase();
    } catch (error) {
      console.error('Error updating subscriber:', error);
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!db) return;

    try {
      executeQuery("DELETE FROM subscribers WHERE id = ?", [id]);
      setSubscribers(prev => prev.filter(sub => sub.id !== id));
      saveDatabase();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    }
  };

  const freezeSubscriber = async (id: string) => {
    if (!db) return;

    try {
      executeQuery("UPDATE subscribers SET status = 'frozen' WHERE id = ?", [id]);
      setSubscribers(prev => prev.map(sub => 
        sub.id === id ? { ...sub, status: 'frozen' } : sub
      ));
      saveDatabase();
    } catch (error) {
      console.error('Error freezing subscriber:', error);
    }
  };

  const unfreezeSubscriber = async (id: string) => {
    if (!db) return;

    const subscriber = subscribers.find(s => s.id === id);
    if (!subscriber) return;

    const updatedSubscriber = updateSubscriberStatus({ ...subscriber, status: 'active' });

    try {
      executeQuery("UPDATE subscribers SET status = ? WHERE id = ?", [updatedSubscriber.status, id]);
      setSubscribers(prev => prev.map(sub => sub.id === id ? updatedSubscriber : sub));
      saveDatabase();
    } catch (error) {
      console.error('Error unfreezing subscriber:', error);
    }
  };

  const recordAttendance = async (id: string, trainingTypes: string[]): Promise<boolean> => {
    if (!db) return false;

    const today = new Date().toDateString();
    const subscriber = subscribers.find(sub => sub.id === id);
    
    if (!subscriber) return false;
    
    const existingAttendance = subscriber.attendance.find(record => record.date === today);
    if (existingAttendance) {
      return false; // Already recorded today
    }
    
    const newAttendanceRecord: AttendanceRecord = {
      date: today,
      trainingTypes
    };
    
    const newAttendance = [...subscriber.attendance, newAttendanceRecord];

    try {
      executeQuery("UPDATE subscribers SET attendance = ? WHERE id = ?", [JSON.stringify(newAttendance), id]);
      setSubscribers(prev => prev.map(sub => 
        sub.id === id 
          ? { ...sub, attendance: newAttendance }
          : sub
      ));
      saveDatabase();
      return true;
    } catch (error) {
      console.error('Error recording attendance:', error);
      return false;
    }
  };

  const removeAttendance = async (id: string, dateString: string): Promise<boolean> => {
    if (!db) return false;

    const subscriber = subscribers.find(sub => sub.id === id);
    if (!subscriber) return false;

    const newAttendance = subscriber.attendance.filter(record => record.date !== dateString);

    try {
      executeQuery("UPDATE subscribers SET attendance = ? WHERE id = ?", [JSON.stringify(newAttendance), id]);
      setSubscribers(prev => prev.map(sub => 
        sub.id === id 
          ? { ...sub, attendance: newAttendance }
          : sub
      ));
      saveDatabase();
      return true;
    } catch (error) {
      console.error('Error removing attendance:', error);
      return false;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    if (!db) return;

    const id = Date.now().toString();
    const newProduct: Product = {
      ...productData,
      id
    };

    try {
      executeQuery(`
        INSERT INTO products (id, name, quantity, purchase_price, selling_price, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        newProduct.name,
        newProduct.quantity,
        newProduct.purchasePrice,
        newProduct.sellingPrice,
        newProduct.description || null
      ]);
      
      setProducts(prev => [newProduct, ...prev]);
      saveDatabase();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!db) return;

    const product = products.find(p => p.id === id);
    if (!product) return;

    const updated = { ...product, ...updates };

    try {
      executeQuery(`
        UPDATE products SET 
        name = ?, quantity = ?, purchase_price = ?, selling_price = ?, description = ?
        WHERE id = ?
      `, [
        updated.name,
        updated.quantity,
        updated.purchasePrice,
        updated.sellingPrice,
        updated.description || null,
        id
      ]);

      setProducts(prev => prev.map(product => product.id === id ? updated : product));
      saveDatabase();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!db) return;

    try {
      executeQuery("DELETE FROM products WHERE id = ?", [id]);
      setProducts(prev => prev.filter(product => product.id !== id));
      saveDatabase();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const sellProduct = async (id: string, quantity: number): Promise<boolean> => {
    if (!db) return false;

    const product = products.find(p => p.id === id);
    if (!product || product.quantity < quantity) return false;

    const saleId = Date.now().toString();
    const profit = (product.sellingPrice - product.purchasePrice) * quantity;
    const newQuantity = product.quantity - quantity;

    try {
      // Update product quantity
      executeQuery("UPDATE products SET quantity = ? WHERE id = ?", [newQuantity, id]);
      
      // Record sale
      executeQuery(`
        INSERT INTO sales (id, product_id, product_name, quantity_sold, purchase_price, selling_price, profit, sale_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        saleId,
        id,
        product.name,
        quantity,
        product.purchasePrice,
        product.sellingPrice,
        profit,
        new Date().toISOString()
      ]);

      // Update state
      setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: newQuantity } : p));
      
      const newSale: Sale = {
        id: saleId,
        productId: id,
        productName: product.name,
        quantitySold: quantity,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        profit,
        saleDate: new Date().toISOString()
      };
      
      setSales(prev => [newSale, ...prev]);
      saveDatabase();
      return true;
    } catch (error) {
      console.error('Error selling product:', error);
      return false;
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!db) return;

    const id = Date.now().toString();
    const newExpense: Expense = {
      ...expenseData,
      id
    };

    try {
      executeQuery(`
        INSERT INTO expenses (id, name, amount, category, description, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        newExpense.name,
        newExpense.amount,
        newExpense.category,
        newExpense.description || null,
        newExpense.date
      ]);
      
      setExpenses(prev => [newExpense, ...prev]);
      saveDatabase();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    if (!db) return;

    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    const updated = { ...expense, ...updates };

    try {
      executeQuery(`
        UPDATE expenses SET 
        name = ?, amount = ?, category = ?, description = ?, date = ?
        WHERE id = ?
      `, [
        updated.name,
        updated.amount,
        updated.category,
        updated.description || null,
        updated.date,
        id
      ]);

      setExpenses(prev => prev.map(expense => expense.id === id ? updated : expense));
      saveDatabase();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!db) return;

    try {
      executeQuery("DELETE FROM expenses WHERE id = ?", [id]);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      saveDatabase();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const addIndividualClass = async (classData: Omit<IndividualClass, 'id'>) => {
    if (!db) return;

    const id = Date.now().toString();
    const newClass: IndividualClass = {
      ...classData,
      id
    };

    try {
      executeQuery(`
        INSERT INTO individual_classes (id, name, age, date, price)
        VALUES (?, ?, ?, ?, ?)
      `, [
        id,
        newClass.name,
        newClass.age || null,
        newClass.date,
        newClass.price
      ]);
      
      setIndividualClasses(prev => [newClass, ...prev]);
      saveDatabase();
    } catch (error) {
      console.error('Error adding individual class:', error);
    }
  };

  const updateIndividualClass = async (id: string, updates: Partial<IndividualClass>) => {
    if (!db) return;

    const individualClass = individualClasses.find(c => c.id === id);
    if (!individualClass) return;

    const updated = { ...individualClass, ...updates };

    try {
      executeQuery(`
        UPDATE individual_classes SET 
        name = ?, age = ?, date = ?, price = ?
        WHERE id = ?
      `, [
        updated.name,
        updated.age || null,
        updated.date,
        updated.price,
        id
      ]);

      setIndividualClasses(prev => prev.map(c => c.id === id ? updated : c));
      saveDatabase();
    } catch (error) {
      console.error('Error updating individual class:', error);
    }
  };

  const deleteIndividualClass = async (id: string) => {
    if (!db) return;

    try {
      executeQuery("DELETE FROM individual_classes WHERE id = ?", [id]);
      setIndividualClasses(prev => prev.filter(c => c.id !== id));
      saveDatabase();
    } catch (error) {
      console.error('Error deleting individual class:', error);
    }
  };

  // Update subscriber statuses periodically
  useEffect(() => {
    if (!isReady) return;

    const updateStatuses = () => {
      setSubscribers(prev => prev.map(updateSubscriberStatus));
    };
    
    updateStatuses();
    const interval = setInterval(updateStatuses, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [isReady]);

  return (
    <DataContext.Provider value={{
      subscribers,
      filteredSubscribers,
      products,
      sales,
      filteredSales,
      expenses,
      filteredExpenses,
      individualClasses,
      filteredIndividualClasses,
      viewMode,
      currentMonth,
      setCurrentMonth,
      addSubscriber,
      updateSubscriber,
      deleteSubscriber,
      freezeSubscriber,
      unfreezeSubscriber,
      recordAttendance,
      removeAttendance,
      addProduct,
      updateProduct,
      deleteProduct,
      sellProduct,
      addExpense,
      updateExpense,
      deleteExpense,
      addIndividualClass,
      updateIndividualClass,
      deleteIndividualClass,
      setViewMode,
      loadData,
      searchSubscribers,
      calculateBMI,
      getDefaultFitnessGoal,
      checkExistingSubscriber
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}