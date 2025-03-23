"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import db, { 
  InventoryDB, 
  User, 
  Customer, 
  InventoryItem, 
  Invoice, 
  Purchase, 
  Settings, 
  Analytics,
  Master
} from '@/lib/db';

// Define the shape of our context
interface DBContextType {
  db: InventoryDB;
  // Generic CRUD operations
  add: <T>(storeName: string, item: T) => Promise<string>;
  get: <T>(storeName: string, id: string) => Promise<T | undefined>;
  getAll: <T>(storeName: string) => Promise<T[]>;
  update: <T>(storeName: string, id: string, changes: Partial<T>) => Promise<void>;
  remove: (storeName: string, id: string) => Promise<void>;
  // Specialized operations
  getMastersByType: (type: string) => Promise<Master[]>;
  // Database status
  isLoading: boolean;
  error: Error | null;
}

// Create context with a default value
const DBContext = createContext<DBContextType | undefined>(undefined);

// Provider component
export function DBProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize the database
  useEffect(() => {
    const initDb = async () => {
      try {
        setIsLoading(true);
        
        // Seed initial data if needed
        await db.seedInitialData();
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error('Unknown database error'));
        setIsLoading(false);
      }
    };

    initDb();
  }, []);

  // Generic CRUD operations
  const add = async <T,>(storeName: string, item: T): Promise<string> => {
    try {
      // Ensure the table exists before attempting to add
      if (!db.tables.some(table => table.name === storeName)) {
        throw new Error(`Table "${storeName}" does not exist in the database`);
      }
      
      // @ts-ignore - Dexie allows dynamic table access
      return await db.table(storeName).add(item);
    } catch (err) {
      console.error(`Failed to add item to ${storeName}:`, err);
      // Rethrow with more specific error message
      throw new Error(`Database error: Failed to add item to ${storeName}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const get = async <T,>(storeName: string, id: string): Promise<T | undefined> => {
    try {
      // @ts-ignore - Dexie allows dynamic table access
      return await db.table(storeName).get(id);
    } catch (err) {
      console.error(`Failed to get item from ${storeName}:`, err);
      throw err;
    }
  };

  const getAll = async <T,>(storeName: string): Promise<T[]> => {
    try {
      // @ts-ignore - Dexie allows dynamic table access
      return await db.table(storeName).toArray();
    } catch (err) {
      console.error(`Failed to get all items from ${storeName}:`, err);
      throw err;
    }
  };

  const update = async <T,>(storeName: string, id: string, changes: Partial<T>): Promise<void> => {
    try {
      // @ts-ignore - Dexie allows dynamic table access
      return await db.table(storeName).update(id, changes);
    } catch (err) {
      console.error(`Failed to update item in ${storeName}:`, err);
      throw err;
    }
  };

  const remove = async (storeName: string, id: string): Promise<void> => {
    try {
      // @ts-ignore - Dexie allows dynamic table access
      return await db.table(storeName).delete(id);
    } catch (err) {
      console.error(`Failed to delete item from ${storeName}:`, err);
      throw err;
    }
  };

  // Context value
  const value: DBContextType = {
    db,
    add,
    get,
    getAll,
    update,
    remove,
    getMastersByType: async (type: string) => {
      console.log(`[DBContext] Getting masters of type: ${type}`)
      try {
        const results = await db.getMastersByType(type)
        console.log(`[DBContext] Found ${results.length} results:`, results)
        return results
      } catch (error) {
        console.error(`[DBContext] Error in getMastersByType(${type}):`, error)
        return []
      }
    },
    isLoading,
    error
  };

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

// Custom hook to use the DB context
export function useDB() {
  const context = useContext(DBContext);
  if (context === undefined) {
    throw new Error('useDB must be used within a DBProvider');
  }
  return context;
} 