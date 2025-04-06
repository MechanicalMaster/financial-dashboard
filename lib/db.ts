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
    phoneNumber: string;
    gstInNumber: string;
    dateOfEstablishment: string;
    constitution: string;
    authToken: string;
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
  privacy: {
    analyticsSharing: boolean;
    personalizedAds: boolean;
    visibility: string;
    dataRetention: string;
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
  oldStock!: Table<OldStockItem, string>;
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
    
    // Version 3: Add oldStock table
    this.version(3).stores({
      oldStock: 'id, name, category, status, purchaseDate, customerName'
    }).upgrade(tx => {
      console.log("Upgrading to version 3 - adding oldStock table");
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
      const settingsCount = await this.settings.count();
      
      // Check if settings need to be reset (wrong firm name)
      await this.resetSettingsIfNeeded();
      
      // Remove customer seeding - we don't want dummy customer data
      
      // Remove inventory seeding - we don't want dummy inventory data
      
      if (settingsCount === 0) {
        // Seed settings
        const defaultSettings: Settings = {
          id: 'default-user-id',
          avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
          fullName: "Dollar Singh",
          email: "dollar.singh@example.com",
          phone: "+1 (555) 123-4567",
          timezone: "utc-8",
          language: "en",
          currency: "usd",
          dateFormat: "MM/DD/YYYY",
          fontSize: 16,
          theme: "system",
          layout: "default",
          firmDetails: {
            firmName: "Kuber",
            firmLogo: "/logo.png",
            address: "123 Business Park, Mumbai, India",
            phoneNumber: "+91 98765 43210",
            gstInNumber: "27AADCB2230M1ZT",
            dateOfEstablishment: "2010-01-15",
            constitution: "Proprietorship",
            authToken: "abc123xyz456"
          },
          notifications: {
            email: true,
            push: true,
            sms: false,
            accountActivity: true,
            newFeatures: true,
            marketing: false,
            frequency: "daily",
            quietHoursStart: "22:00",
            quietHoursEnd: "08:00"
          },
          privacy: {
            analyticsSharing: true,
            personalizedAds: false,
            visibility: "public",
            dataRetention: "1-year"
          },
          updatedAt: new Date()
        };
        
        await this.settings.add(defaultSettings);
        console.log('Initial settings data seeded');
      }
      
      // Clean up existing customer data
      await this.cleanupCustomerData();
      
      // Clean up existing inventory data
      await this.cleanupInventoryData();
      
      // Clean up existing purchase data
      await this.cleanupPurchaseData();
      
      // Seed jewelry-specific masters
      await this.seedJewelryMasters();
      
      // Clean up duplicates and unwanted categories
      await this.cleanupMastersData();
      
      // Ensure no sample invoices
      await this.ensureNoSampleInvoices();
      
      console.log('Database initialization completed');
    } catch (error) {
      console.error('Error seeding initial data:', error);
      throw error;
    }
  }
  
  // Helper to reset settings if they have the wrong firm name
  async resetSettingsIfNeeded() {
    try {
      const existingSettings = await this.settings.get('default-user-id');
      
      // If settings exist but have the wrong firm name, reset them
      if (existingSettings && existingSettings.firmDetails.firmName !== "Kuber") {
        console.log(`Resetting settings: Found "${existingSettings.firmDetails.firmName}" instead of "Kuber"`);
        
        // Update the firm name
        await this.settings.update('default-user-id', {
          firmDetails: {
            ...existingSettings.firmDetails,
            firmName: "Kuber"
          },
          updatedAt: new Date()
        });
        
        console.log('Settings reset completed: Firm name updated to "Kuber"');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }
  
  // Helper method to seed jewelry-specific master data
  async seedJewelryMasters() {
    try {
      // Define the jewelry categories to add
      const jewelryCategories = [
        "Chain", "Necklace", "Ladies Ring", "Gents Ring", "Jhumka", 
        "Bangles", "Mangalsutra", "Bali", "Tops", "Coins"
      ];
      
      // Define the metal types to add
      const metalTypes = [
        "Gold", "Silver", "Platinum", "Rhodium", "Others"
      ];
      
      // Define the purity values to add
      const purityValues = [
        "916", "750", "925", "850", "825", "OTH"
      ];
      
      // Get existing categories, metals and purity values to avoid duplicates
      const existingCategories = (await this.masters.where('type').equals('category').toArray()).map(m => m.value.toLowerCase());
      const existingMetals = (await this.masters.where('type').equals('metal').toArray()).map(m => m.value.toLowerCase());
      const existingPurities = (await this.masters.where('type').equals('purity').toArray()).map(m => m.value.toLowerCase());
      
      // Prepare arrays to hold new entries
      const categoriesToAdd = [];
      const metalsToAdd = [];
      const puritiesToAdd = [];
      
      // Check and add categories
      for (let [index, category] of jewelryCategories.entries()) {
        if (!existingCategories.includes(category.toLowerCase())) {
          categoriesToAdd.push({
            id: this.generateId('MSTR'),
            type: 'category',
            value: category,
            isActive: true,
            displayOrder: existingCategories.length + index + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      
      // Check and add metals
      for (let [index, metal] of metalTypes.entries()) {
        if (!existingMetals.includes(metal.toLowerCase())) {
          metalsToAdd.push({
            id: this.generateId('MSTR'),
            type: 'metal',
            value: metal,
            isActive: true,
            displayOrder: existingMetals.length + index + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      
      // Check and add purity values
      for (let [index, purity] of purityValues.entries()) {
        if (!existingPurities.includes(purity.toLowerCase())) {
          puritiesToAdd.push({
            id: this.generateId('MSTR'),
            type: 'purity',
            value: purity,
            isActive: true,
            displayOrder: existingPurities.length + index + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      
      // Combine all new masters to add
      const allNewMasters = [...categoriesToAdd, ...metalsToAdd, ...puritiesToAdd];
      
      // Add them to the database if there are any
      if (allNewMasters.length > 0) {
        await this.masters.bulkAdd(allNewMasters);
        console.log(`Added ${categoriesToAdd.length} categories, ${metalsToAdd.length} metals, and ${puritiesToAdd.length} purity values.`);
      } else {
        console.log('No new jewelry masters needed to be added.');
      }
    } catch (error) {
      console.error('Error seeding jewelry masters:', error);
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

  // Helper method to remove duplicates and clean up categories
  async cleanupMastersData() {
    try {
      // Get all masters
      const allMasters = await this.masters.toArray();
      
      // Keep track of seen values by type to identify duplicates
      const seenValues: Record<string, Set<string>> = {};
      const duplicateIds: string[] = [];
      
      // Identify duplicates
      allMasters.forEach(master => {
        if (!seenValues[master.type]) {
          seenValues[master.type] = new Set();
        }
        
        const lowerValue = master.value.toLowerCase();
        if (seenValues[master.type].has(lowerValue)) {
          // This is a duplicate
          if (master.id) {
            duplicateIds.push(master.id);
          }
        } else {
          seenValues[master.type].add(lowerValue);
        }
      });
      
      // Remove duplicates if found
      if (duplicateIds.length > 0) {
        await this.masters.bulkDelete(duplicateIds);
        console.log(`Removed ${duplicateIds.length} duplicate masters`);
      }
      
      // Define allowed jewelry categories
      const allowedCategories = [
        "Chain", "Necklace", "Ladies Ring", "Gents Ring", "Jhumka", 
        "Bangles", "Mangalsutra", "Bali", "Tops", "Coins"
      ].map(c => c.toLowerCase());
      
      // Get all categories
      const categories = await this.masters.where('type').equals('category').toArray();
      
      // Find categories to remove (except default ones)
      const defaultCategories = ["Furniture", "Electronics", "Office Supplies", "Stationery"];
      const categoriesToRemove = categories.filter(cat => 
        !allowedCategories.includes(cat.value.toLowerCase()) && 
        !defaultCategories.includes(cat.value)
      );
      
      // Remove unwanted categories
      if (categoriesToRemove.length > 0) {
        const categoryIds = categoriesToRemove.map(cat => cat.id).filter(Boolean) as string[];
        await this.masters.bulkDelete(categoryIds);
        console.log(`Removed ${categoryIds.length} unwanted categories`);
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up masters data:', error);
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

// Create and export a single instance to be used throughout the app
const db = new InventoryDB();

export default db; 