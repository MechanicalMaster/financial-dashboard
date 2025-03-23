import Dexie, { Table } from 'dexie';

// Define interfaces for each table
export interface User {
  id?: string;
  phone: string;
  fullName: string;
  email?: string;
  avatar?: string;
  lastLogin: Date;
}

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id?: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  cost: number;
  supplier: string;
  weight?: number; // Weight in grams
  metal?: string; // New field for metal type
  purity?: string; // New field for purity
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id?: string;
  customerId: string;
  type: 'invoice' | 'booking';
  date: Date;
  dueDate?: Date;
  bookingDate?: Date;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'booking';
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id?: string;
  itemId: string;
  supplier: string;
  quantity: number;
  cost: number;
  date: Date;
  invoiceFile?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  fontSize: number;
  theme: string;
  layout: string;
  firmDetails: {
    firmName: string;
    firmLogo: string;
    address: string;
    [key: string]: any;
  };
  notifications: {
    email: boolean;
    push: boolean;
    [key: string]: any;
  };
  privacy: {
    analyticsSharing: boolean;
    [key: string]: any;
  };
  updatedAt: Date;
}

export interface Analytics {
  id?: string;
  type: string;
  data: any;
  timestamp: Date;
}

export interface Master {
  id?: string;
  type: string; // category, supplier, status, etc.
  value: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the database class
export class InventoryDB extends Dexie {
  users!: Table<User, string>;
  customers!: Table<Customer, string>;
  inventory!: Table<InventoryItem, string>;
  invoices!: Table<Invoice, string>;
  purchases!: Table<Purchase, string>;
  settings!: Table<Settings, string>;
  analytics!: Table<Analytics, string>;
  masters!: Table<Master, string>;

  constructor() {
    super('InventoryDB');
    
    // Version 1: Base schema
    this.version(1).stores({
      users: 'id, phone',
      customers: 'id, name, email, phone',
      inventory: 'id, name, category, supplier',
      invoices: 'id, customerId, type, status',
      purchases: 'id, itemId, supplier',
      settings: 'id',
      analytics: 'id, type'
    });
    
    // Version 2: Add masters table
    this.version(2).stores({
      masters: 'id, type, value, isActive, displayOrder'
    }).upgrade(tx => {
      console.log("Upgrading to version 2 - adding masters table");
      
      // Define the initial master data
      const initialMasters = [
        // Categories
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'Furniture',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'Electronics',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'Office Supplies',
          isActive: true,
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'Stationery',
          isActive: true,
          displayOrder: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Suppliers
        {
          id: this.generateId('MSTR'),
          type: 'supplier',
          value: 'SupplyCo',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'supplier',
          value: 'TechSuppliers',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      
      // Add to the masters table in this transaction
      return Promise.all(initialMasters.map(master => 
        // @ts-ignore - Dexie allows dynamic table access in transactions
        tx.table('masters').add(master)
      ));
    });
  }

  // Helper method to generate IDs for different tables
  generateId(prefix: string): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  }

  // Method to seed initial data for basic tables (masters are handled by schema version upgrade)
  async seedInitialData() {
    try {
      const customerCount = await this.customers.count();
      const inventoryCount = await this.inventory.count();
      
      if (customerCount === 0) {
        // Seed customers
        const sampleCustomers: Customer[] = [
          {
            id: this.generateId('CUST'),
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            address: '123 Main St, City',
            reference: 'Referral from website',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('CUST'),
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+0987654321',
            address: '456 Oak Ave, Town',
            reference: 'Walk-in customer',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        await this.customers.bulkAdd(sampleCustomers);
        console.log('Initial customer data seeded');
      }
      
      if (inventoryCount === 0) {
        // Seed inventory
        const sampleInventory: InventoryItem[] = [
          {
            id: this.generateId('ITEM'),
            name: 'Widget A',
            category: 'Widgets',
            description: 'Standard widget for general use',
            quantity: 50,
            cost: 25.99,
            supplier: 'SupplyCo',
            weight: 0.5,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('ITEM'),
            name: 'Gadget B',
            category: 'Gadgets',
            description: 'Premium gadget with extra features',
            quantity: 20,
            cost: 49.99,
            supplier: 'TechSuppliers',
            weight: 1.2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        await this.inventory.bulkAdd(sampleInventory);
        console.log('Initial inventory data seeded');
      }
      
      console.log('Database initialization completed');
    } catch (error) {
      console.error('Error seeding initial data:', error);
      throw error;
    }
  }
  
  // Helper to get masters by type
  async getMastersByType(type: string): Promise<Master[]> {
    console.log(`[InventoryDB] getMastersByType called with type: ${type}`)
    try {
      const results = await this.masters
        .where('type')
        .equals(type)
        .and(item => item.isActive)
        .sortBy('displayOrder');
      
      console.log(`[InventoryDB] Found ${results.length} ${type} items:`, results)
      return results
    } catch (error) {
      console.error(`[InventoryDB] Error in getMastersByType:`, error)
      return []
    }
  }
}

// Create and export a single instance to be used throughout the app
const db = new InventoryDB();

export default db; 