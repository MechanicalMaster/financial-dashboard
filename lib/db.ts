import Dexie, { Table } from 'dexie';

// Define interfaces for each table - User data tables
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

export interface OldStockItem {
  id?: string;
  name: string;
  category: string;
  purchaseDate: Date;
  purchasePrice: number;
  customerName: string;
  customerPhone?: string;
  weight?: number;
  metal?: string;
  purity?: string;
  description?: string;
  status: 'available' | 'sold' | 'processing';
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id?: string;
  customerId: string;
  customerName?: string;
  customerMobile?: string;
  customerAddress?: string;
  type: 'invoice' | 'booking';
  date: Date;
  dueDate?: Date;
  bookingDate?: Date;
  items?: any[];
  subtotal?: number;
  igst?: number;
  cgst?: number;
  amount: number;
  notes?: string;
  paymentTerms?: string;
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
  profilePhoto: string;
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
    phoneNumber: string;
    gstInNumber: string;
    dateOfEstablishment: string;
    constitution: string;
    authToken: string;
    email: string;
    website: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    accountActivity: boolean;
    newFeatures: boolean;
    marketing: boolean;
    frequency: string;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  invoiceTemplates?: {
    activeTemplate: string;
  };
  updatedAt: Date;
}

export interface Analytics {
  id?: string;
  type: string;
  data: any;
  timestamp: Date;
}

// App data interfaces
export interface Master {
  id?: string;
  type: string; // category, supplier, status, etc.
  value: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the User database class (for user-specific data)
export class UserDB extends Dexie {
  users!: Table<User, string>;
  customers!: Table<Customer, string>;
  inventory!: Table<InventoryItem, string>;
  oldStock!: Table<OldStockItem, string>;
  invoices!: Table<Invoice, string>;
  purchases!: Table<Purchase, string>;
  settings!: Table<Settings, string>;
  analytics!: Table<Analytics, string>;

  constructor() {
    super('UserDB');
    
    // Version 1: User data schema
    this.version(1).stores({
      users: 'id, phone',
      customers: 'id, name, email, phone',
      inventory: 'id, name, category, supplier',
      oldStock: 'id, name, category, status, purchaseDate, customerName',
      invoices: 'id, customerId, type, status',
      purchases: 'id, itemId, supplier',
      settings: 'id',
      analytics: 'id, type'
    });
  }

  // Generate ID helper function
  generateId(prefix: string): string {
    // Use timestamp + random number to ensure uniqueness
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${randomStr}`;
  }

  // Initial seed data for settings
  async seedInitialData() {
    try {
      // Check if there's already a settings record
      const settingsCount = await this.settings.count();
      
      if (settingsCount === 0) {
        // Create initial settings with minimal default values (no dummy data)
        const defaultSettings: Settings = {
          id: 'app-settings',
          profilePhoto: '',
          fullName: '',
          email: '',
          phone: '',
          timezone: 'Asia/Kolkata',
          language: 'en',
          currency: 'INR',
          dateFormat: 'DD/MM/YYYY',
          fontSize: 16,
          theme: 'light',
          layout: 'default',
          firmDetails: {
            firmName: '',
            firmLogo: '',
            address: '',
            phoneNumber: '',
            gstInNumber: '',
            dateOfEstablishment: '',
            constitution: '',
            authToken: '',
            email: '',
            website: ''
          },
          notifications: {
            email: true,
            push: true,
            sms: true,
            accountActivity: true,
            newFeatures: true,
            marketing: false,
            frequency: 'daily',
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00'
          },
          invoiceTemplates: {
            activeTemplate: 'default'
          },
          updatedAt: new Date()
        };
        
        await this.settings.add(defaultSettings);
        console.log('Added minimal default settings (no personal data)');
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing settings:', error);
      return false;
    }
  }
  
  // Method to ensure no invoices are added during initialization
  async ensureNoSampleInvoices() {
    try {
      const invoiceCount = await this.invoices.count();
      
      // If there are invoices, remove them
      if (invoiceCount > 0) {
        // Get all invoice IDs
        const allInvoices = await this.invoices.toArray();
        const invoiceIds = allInvoices.map(invoice => invoice.id).filter(Boolean) as string[];
        
        // Delete them all
        if (invoiceIds.length > 0) {
          await this.invoices.bulkDelete(invoiceIds);
          console.log(`Removed ${invoiceIds.length} sample invoices`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up invoice data:', error);
      return false;
    }
  }

  // Method to clean up inventory data
  async cleanupInventoryData() {
    try {
      const inventoryCount = await this.inventory.count();
      
      // If there are inventory items, remove them
      if (inventoryCount > 0) {
        // Get all inventory IDs
        const allItems = await this.inventory.toArray();
        const itemIds = allItems.map(item => item.id).filter(Boolean) as string[];
        
        // Delete them all
        if (itemIds.length > 0) {
          await this.inventory.bulkDelete(itemIds);
          console.log(`Removed ${itemIds.length} inventory items`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up inventory data:', error);
      return false;
    }
  }

  // Method to clean up customer data
  async cleanupCustomerData() {
    try {
      const customerCount = await this.customers.count();
      
      // If there are customers, remove them
      if (customerCount > 0) {
        // Get all customer IDs
        const allCustomers = await this.customers.toArray();
        const customerIds = allCustomers.map(customer => customer.id).filter(Boolean) as string[];
        
        // Delete them all
        if (customerIds.length > 0) {
          await this.customers.bulkDelete(customerIds);
          console.log(`Removed ${customerIds.length} customers`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up customer data:', error);
      return false;
    }
  }

  // Method to clean up purchase data
  async cleanupPurchaseData() {
    try {
      // 1. Clean up purchases from IndexedDB
      const purchaseCount = await this.purchases.count();
      
      if (purchaseCount > 0) {
        // Delete all purchases directly
        await this.purchases.clear();
        console.log(`Removed ${purchaseCount} purchases from database`);
      }

      // 2. Clean up purchase invoices from localStorage
      if (typeof window !== 'undefined') {
        // Check if localStorage has purchase invoices
        const savedInvoices = localStorage.getItem('purchaseInvoices');
        if (savedInvoices) {
          // Remove the item from localStorage
          localStorage.removeItem('purchaseInvoices');
          console.log('Removed purchase invoices from localStorage');
        }

        // Also clean up suppliers data if present
        const savedSuppliers = localStorage.getItem('suppliers');
        if (savedSuppliers) {
          localStorage.removeItem('suppliers');
          console.log('Removed suppliers data from localStorage');
        }
        
        // Clear any other potential purchase-related localStorage items
        localStorage.removeItem('purchaseSuppliers');
        localStorage.removeItem('recentPurchases');
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up purchase data:', error);
      return false;
    }
  }
}

// Define the App database class (for application-wide data like masters)
export class AppDB extends Dexie {
  masters!: Table<Master, string>;

  constructor() {
    super('AppDB');
    
    // Version 1: App data schema
    this.version(1).stores({
      masters: 'id, type, value, isActive, displayOrder'
    }).upgrade(tx => {
      console.log("Creating AppDB - adding masters table");
      
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
        
        // Statuses
        {
          id: this.generateId('MSTR'),
          type: 'status',
          value: 'In Stock',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'status',
          value: 'Low Stock',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'status',
          value: 'Out of Stock',
          isActive: true,
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Payment Methods
        {
          id: this.generateId('MSTR'),
          type: 'payment_method',
          value: 'Cash',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'payment_method',
          value: 'Credit Card',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'payment_method',
          value: 'UPI',
          isActive: true,
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'payment_method',
          value: 'Net Banking',
          isActive: true,
          displayOrder: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Units
        {
          id: this.generateId('MSTR'),
          type: 'unit',
          value: 'Pieces',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'unit',
          value: 'Grams',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'unit',
          value: 'Kilograms',
          isActive: true,
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Suppliers (moved to separate table)
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
        },
        
        // Purity
        {
          id: this.generateId('MSTR'),
          type: 'purity',
          value: '916',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'purity',
          value: '750',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Metal
        {
          id: this.generateId('MSTR'),
          type: 'metal',
          value: 'Gold',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'metal',
          value: 'Silver',
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

  // Generate ID helper function
  generateId(prefix: string): string {
    // Use timestamp + random number to ensure uniqueness
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${randomStr}`;
  }
  
  // Get masters by type
  async getMastersByType(type: string): Promise<Master[]> {
    try {
      console.log(`[AppDB] Getting masters of type: ${type}`)
      const results = await this.masters
        .where('type')
        .equals(type)
        .sortBy('displayOrder');
         
      return results;
    } catch (error) {
      console.error(`[AppDB] Error in getMastersByType:`, error)
      return []
    }
  }

  // Add method to check and seed initial masters data if needed
  async seedInitialData() {
    try {
      console.log("[AppDB] Checking if masters data needs to be seeded");
      const mastersCount = await this.masters.count();
      
      if (mastersCount === 0) {
        console.log("[AppDB] No masters found, seeding initial data");
        
        // Define the initial master data (same as hardRefreshMasters)
        const initialMasters = [
          // Categories
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'chain',
            isActive: true,
            displayOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'ladies_ring',
            isActive: true,
            displayOrder: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'gents_ring',
            isActive: true,
            displayOrder: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'necklace',
            isActive: true,
            displayOrder: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'jhumka',
            isActive: true,
            displayOrder: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'j_tops',
            isActive: true,
            displayOrder: 6,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'tops',
            isActive: true,
            displayOrder: 7,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'mangalsutra',
            isActive: true,
            displayOrder: 8,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'bangles',
            isActive: true,
            displayOrder: 9,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'category',
            value: 'bracelet',
            isActive: true,
            displayOrder: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          
          // Statuses
          {
            id: this.generateId('MSTR'),
            type: 'status',
            value: 'In Stock',
            isActive: true,
            displayOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'status',
            value: 'Low Stock',
            isActive: true,
            displayOrder: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'status',
            value: 'Out of Stock',
            isActive: true,
            displayOrder: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          
          // Payment Methods
          {
            id: this.generateId('MSTR'),
            type: 'payment_method',
            value: 'UPI',
            isActive: true,
            displayOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'payment_method',
            value: 'Cash',
            isActive: true,
            displayOrder: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'payment_method',
            value: 'Credit',
            isActive: true,
            displayOrder: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'payment_method',
            value: 'Cheque',
            isActive: true,
            displayOrder: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'payment_method',
            value: 'Bank_Transfer',
            isActive: true,
            displayOrder: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          
          // Units
          {
            id: this.generateId('MSTR'),
            type: 'unit',
            value: 'grams',
            isActive: true,
            displayOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          
          // Purity
          {
            id: this.generateId('MSTR'),
            type: 'purity',
            value: '916',
            isActive: true,
            displayOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'purity',
            value: '750',
            isActive: true,
            displayOrder: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'purity',
            value: '925',
            isActive: true,
            displayOrder: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'purity',
            value: '999',
            isActive: true,
            displayOrder: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'purity',
            value: '850',
            isActive: true,
            displayOrder: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          
          // Metal
          {
            id: this.generateId('MSTR'),
            type: 'metal',
            value: 'silver',
            isActive: true,
            displayOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'metal',
            value: 'gold',
            isActive: true,
            displayOrder: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'metal',
            value: 'platinum',
            isActive: true,
            displayOrder: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'metal',
            value: 'rhodium',
            isActive: true,
            displayOrder: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: this.generateId('MSTR'),
            type: 'metal',
            value: 'others',
            isActive: true,
            displayOrder: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ];
        
        // Add items one by one to avoid bulk add errors
        let successCount = 0;
        for (const master of initialMasters) {
          try {
            // Generate a new ID for each master to ensure uniqueness
            master.id = this.generateId('MSTR');
            await this.masters.add(master);
            successCount++;
          } catch (error) {
            console.error(`[AppDB] Error adding master ${master.value} during initial seeding:`, error);
          }
        }
        
        console.log(`[AppDB] Successfully added ${successCount} of ${initialMasters.length} masters as seed data`);
      } else {
        console.log(`[AppDB] Database already has ${mastersCount} masters, no need to seed`);
      }
      
      return true;
    } catch (error) {
      console.error('[AppDB] Error seeding initial masters data:', error);
      return false;
    }
  }
  
  // Method to hard refresh masters with updated values
  async hardRefreshMasters() {
    try {
      console.log("[AppDB] Performing hard refresh of masters data");
      
      // First, completely delete the masters table to ensure no ID conflicts
      await this.masters.clear();
      console.log("[AppDB] Cleared all existing masters data");
      
      // Define the updated master data with new values
      const updatedMasters = [
        // Categories - new values
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'chain',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'ladies_ring',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'gents_ring',
          isActive: true,
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'necklace',
          isActive: true,
          displayOrder: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'jhumka',
          isActive: true,
          displayOrder: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'j_tops',
          isActive: true,
          displayOrder: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'tops',
          isActive: true,
          displayOrder: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'mangalsutra',
          isActive: true,
          displayOrder: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'bangles',
          isActive: true,
          displayOrder: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'category',
          value: 'bracelet',
          isActive: true,
          displayOrder: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Statuses - keep the same
        {
          id: this.generateId('MSTR'),
          type: 'status',
          value: 'In Stock',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'status',
          value: 'Low Stock',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'status',
          value: 'Out of Stock',
          isActive: true,
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Payment Methods - new values
        {
          id: this.generateId('MSTR'),
          type: 'payment_method',
          value: 'UPI',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'payment_method',
          value: 'Cash',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'payment_method',
          value: 'Credit',
          isActive: true,
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'payment_method',
          value: 'Cheque',
          isActive: true,
          displayOrder: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'payment_method',
          value: 'Bank_Transfer',
          isActive: true,
          displayOrder: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Units - new value (only grams)
        {
          id: this.generateId('MSTR'),
          type: 'unit',
          value: 'grams',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Purity - new values
        {
          id: this.generateId('MSTR'),
          type: 'purity',
          value: '916',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'purity',
          value: '750',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'purity',
          value: '925',
          isActive: true,
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'purity',
          value: '999',
          isActive: true,
          displayOrder: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'purity',
          value: '850',
          isActive: true,
          displayOrder: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        
        // Metal - new values
        {
          id: this.generateId('MSTR'),
          type: 'metal',
          value: 'silver',
          isActive: true,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'metal',
          value: 'gold',
          isActive: true,
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'metal',
          value: 'platinum',
          isActive: true,
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'metal',
          value: 'rhodium',
          isActive: true,
          displayOrder: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: this.generateId('MSTR'),
          type: 'metal',
          value: 'others',
          isActive: true,
          displayOrder: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      
      // Add items one by one to avoid bulk add errors
      let successCount = 0;
      for (const master of updatedMasters) {
        try {
          await this.masters.add(master);
          successCount++;
        } catch (error) {
          console.error(`[AppDB] Error adding master ${master.value}:`, error);
        }
      }
      
      console.log(`[AppDB] Successfully added ${successCount} of ${updatedMasters.length} masters`);
      return true;
    } catch (error) {
      console.error('[AppDB] Error refreshing masters data:', error);
      return false;
    }
  }
}

// Create and export instances to be used throughout the app
const userDB = new UserDB();
const appDB = new AppDB();

export { userDB, appDB };

// For backward compatibility, export the user database as default
export default userDB; 