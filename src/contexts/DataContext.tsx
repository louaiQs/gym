import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';

export interface Subscriber {
  id: string;
  name: string;
  gender: 'male' | 'female';
  phone?: string;
  subscriptionDate: string;
  expiryDate: string;
  residence: string;
  price: number;
  notes?: string;
  status: 'active' | 'expired' | 'frozen';
  attendance: string[];
  shower: boolean;
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

interface DataContextType {
  subscribers: Subscriber[];
  products: Product[];
  sales: Sale[];
  viewMode: 'cards' | 'list';
  addSubscriber: (subscriber: Omit<Subscriber, 'id' | 'status' | 'attendance'>) => void;
  updateSubscriber: (id: string, updates: Partial<Subscriber>) => void;
  deleteSubscriber: (id: string) => void;
  freezeSubscriber: (id: string) => void;
  unfreezeSubscriber: (id: string) => void;
  recordAttendance: (id: string) => boolean;
  removeAttendance: (id: string, dateString: string) => boolean;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  sellProduct: (id: string, quantity: number) => boolean;
  setViewMode: (mode: 'cards' | 'list') => void;
  loadData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Check if we're running in Electron
const isElectron = typeof window !== 'undefined' && window.require;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { db, isReady, saveDatabase } = useDatabase();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
    if (isElectron) {
      const { ipcRenderer } = window.require('electron');
      return await ipcRenderer.invoke('execute-query', query, params);
    } else if (db && db.exec) {
      // Browser fallback
      if (query.startsWith('SELECT')) {
        const result = db.exec(query);
        return result.length > 0 ? result[0].values : [];
      } else {
        db.run(query, params);
        return true;
      }
    }
    return null;
  };

  const loadData = async () => {
    if (!db || !isReady) return;

    try {
      // Load subscribers
      const subscribersData = await executeQuery("SELECT * FROM subscribers ORDER BY created_at DESC");
      if (subscribersData && subscribersData.length > 0) {
        const mappedSubscribers = subscribersData.map((row: any) => ({
          id: row[0],
          name: row[1],
          gender: row[2],
          phone: row[3],
          subscriptionDate: row[4],
          expiryDate: row[5],
          residence: row[6],
          price: row[7],
          notes: row[8],
          status: row[9],
          attendance: JSON.parse(row[10] || '[]'),
          shower: Boolean(row[11])
        }));
        setSubscribers(mappedSubscribers.map(updateSubscriberStatus));
      }

      // Load products
      const productsData = await executeQuery("SELECT * FROM products ORDER BY created_at DESC");
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
      const salesData = await executeQuery("SELECT * FROM sales ORDER BY sale_date DESC");
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
      await executeQuery(`
        INSERT INTO subscribers (id, name, gender, phone, subscription_date, expiry_date, residence, price, notes, status, attendance, shower)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        updatedSubscriber.name,
        updatedSubscriber.gender,
        updatedSubscriber.phone || null,
        updatedSubscriber.subscriptionDate,
        updatedSubscriber.expiryDate,
        updatedSubscriber.residence,
        updatedSubscriber.price,
        updatedSubscriber.notes || null,
        updatedSubscriber.status,
        JSON.stringify(updatedSubscriber.attendance),
        updatedSubscriber.shower ? 1 : 0
      ]);
      
      setSubscribers(prev => [updatedSubscriber, ...prev]);
      saveDatabase();
    } catch (error) {
      console.error('Error adding subscriber:', error);
    }
  };

  const updateSubscriber = async (id: string, updates: Partial<Subscriber>) => {
    if (!db) return;

    const subscriber = subscribers.find(s => s.id === id);
    if (!subscriber) return;

    const updated = { ...subscriber, ...updates };
    const updatedSubscriber = updateSubscriberStatus(updated);

    try {
      await executeQuery(`
        UPDATE subscribers SET 
        name = ?, gender = ?, phone = ?, subscription_date = ?, expiry_date = ?, 
        residence = ?, price = ?, notes = ?, status = ?, attendance = ?, shower = ?
        WHERE id = ?
      `, [
        updatedSubscriber.name,
        updatedSubscriber.gender,
        updatedSubscriber.phone || null,
        updatedSubscriber.subscriptionDate,
        updatedSubscriber.expiryDate,
        updatedSubscriber.residence,
        updatedSubscriber.price,
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
      await executeQuery("DELETE FROM subscribers WHERE id = ?", [id]);
      setSubscribers(prev => prev.filter(sub => sub.id !== id));
      saveDatabase();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    }
  };

  const freezeSubscriber = async (id: string) => {
    if (!db) return;

    try {
      await executeQuery("UPDATE subscribers SET status = 'frozen' WHERE id = ?", [id]);
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
      await executeQuery("UPDATE subscribers SET status = ? WHERE id = ?", [updatedSubscriber.status, id]);
      setSubscribers(prev => prev.map(sub => sub.id === id ? updatedSubscriber : sub));
      saveDatabase();
    } catch (error) {
      console.error('Error unfreezing subscriber:', error);
    }
  };

  const recordAttendance = async (id: string): Promise<boolean> => {
    if (!db) return false;

    const today = new Date().toDateString();
    const subscriber = subscribers.find(sub => sub.id === id);
    
    if (!subscriber) return false;
    
    if (subscriber.attendance.includes(today)) {
      return false; // Already recorded today
    }
    
    const newAttendance = [...subscriber.attendance, today];

    try {
      await executeQuery("UPDATE subscribers SET attendance = ? WHERE id = ?", [JSON.stringify(newAttendance), id]);
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

    const newAttendance = subscriber.attendance.filter(date => date !== dateString);

    try {
      await executeQuery("UPDATE subscribers SET attendance = ? WHERE id = ?", [JSON.stringify(newAttendance), id]);
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
      await executeQuery(`
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
      await executeQuery(`
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
      await executeQuery("DELETE FROM products WHERE id = ?", [id]);
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
      await executeQuery("UPDATE products SET quantity = ? WHERE id = ?", [newQuantity, id]);
      
      // Record sale
      await executeQuery(`
        INSERT INTO sales (id, product_id, product_name, quantity_sold, purchase_price, selling_price, profit)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        saleId,
        id,
        product.name,
        quantity,
        product.purchasePrice,
        product.sellingPrice,
        profit
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
      products,
      sales,
      viewMode,
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
      setViewMode,
      loadData
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