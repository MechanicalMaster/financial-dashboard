"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useDB } from "./db-context"
import { userDB } from "@/lib/db"
import { useAuth } from "./auth-context"

export interface UserSettings {
  profilePhoto: string
  fullName: string
  email: string
  phone: string
  timezone: string
  language: string
  currency: string
  dateFormat: string
  fontSize: number
  theme: "light" | "dark" | "system"
  layout: "default" | "compact" | "expanded"
  firmDetails: {
    firmName: string
    firmLogo: string
    address: string
    phoneNumber: string
    gstInNumber: string
    dateOfEstablishment: string
    constitution: string
    authToken: string
    email: string
    website: string
  }
  invoiceTemplates: {
    activeTemplate: string
    templates: {
      id: string
      name: string
      description: string
      imagePath: string
    }[]
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    accountActivity: boolean
    newFeatures: boolean
    marketing: boolean
    frequency: "real-time" | "daily" | "weekly"
    quietHoursStart: string
    quietHoursEnd: string
  }
  backups: {
    created: {
      timestamp: string;
      filename: string;
    }[];
    restored: {
      timestamp: string;
      filename: string;
    }[];
  }
}

const defaultSettings: UserSettings = {
  profilePhoto: "",
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
    authToken: "abc123xyz456",
    email: "kuber@example.com",
    website: "www.kuber.com"
  },
  invoiceTemplates: {
    activeTemplate: "default",
    templates: [
      {
        id: "default",
        name: "Default",
        description: "Simple clean invoice template",
        imagePath: "/templates/default.png"
      },
      {
        id: "jeweller",
        name: "Jeweller",
        description: "Specialized template for jewellery business",
        imagePath: "/templates/jeweller.png"
      }
    ]
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
  backups: {
    created: [],
    restored: []
  }
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => void
  updateNotificationSettings: (settings: Partial<UserSettings["notifications"]>) => void
  updateFirmDetails: (settings: Partial<UserSettings["firmDetails"]>) => void
  updateInvoiceTemplates: (templates: Partial<UserSettings["invoiceTemplates"]>) => void
  createBackup: () => Promise<{ success: boolean; filename?: string; error?: string }>
  restoreBackup: (backupData: string) => Promise<{ success: boolean; error?: string }>
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const { get, update, add, isLoading } = useDB();
  const { user } = useAuth();
  const userId = user?.uid || 'default-user-id'; // Use Firebase user ID or fallback

  // Load settings from database when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to get existing settings from the database
        const savedSettings = await get<UserSettings>('settings', userId);
        
        if (savedSettings) {
          // Merge saved settings with default settings to ensure new properties are initialized
          const mergedSettings = {
            ...defaultSettings,
            ...savedSettings,
            // Ensure nested objects are properly merged
            firmDetails: {
              ...defaultSettings.firmDetails,
              ...(savedSettings.firmDetails || {})
            },
            invoiceTemplates: {
              ...defaultSettings.invoiceTemplates,
              ...(savedSettings.invoiceTemplates || {})
            },
            notifications: {
              ...defaultSettings.notifications,
              ...(savedSettings.notifications || {})
            },
            backups: {
              ...defaultSettings.backups,
              ...(savedSettings.backups || {})
            }
          };
          
          setSettings(mergedSettings);
          
          // Update the database with the merged settings if new properties were added
          if (!savedSettings.invoiceTemplates) {
            await update('settings', userId, mergedSettings);
          }
        } else {
          // If no settings exist yet, create them with defaults
          await add('settings', {
            ...defaultSettings,
            id: userId,
            updatedAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fall back to default settings if database access fails
      }
    };

    if (!isLoading) {
      loadSettings();
    }
  }, [get, add, update, userId, isLoading]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings, updatedAt: new Date() }
    setSettings(updatedSettings)
    
    try {
      await update('settings', userId, updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  const updateNotificationSettings = async (notificationSettings: Partial<UserSettings["notifications"]>) => {
    const updatedSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        ...notificationSettings
      },
      updatedAt: new Date()
    }
    setSettings(updatedSettings)
    
    try {
      await update('settings', userId, updatedSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  const updateFirmDetails = async (firmDetails: Partial<UserSettings["firmDetails"]>) => {
    const updatedSettings = {
      ...settings,
      firmDetails: {
        ...settings.firmDetails,
        ...firmDetails
      },
      updatedAt: new Date()
    }
    setSettings(updatedSettings)
    
    try {
      await update('settings', userId, updatedSettings);
    } catch (error) {
      console.error('Error saving firm details:', error);
    }
  }

  const updateInvoiceTemplates = async (invoiceTemplates: Partial<UserSettings["invoiceTemplates"]>) => {
    const updatedSettings = {
      ...settings,
      invoiceTemplates: {
        ...settings.invoiceTemplates,
        ...invoiceTemplates
      },
      updatedAt: new Date()
    }
    setSettings(updatedSettings)
    
    try {
      await update('settings', userId, updatedSettings);
    } catch (error) {
      console.error('Error saving invoice templates:', error);
    }
  }

  const createBackup = async (): Promise<{ success: boolean; filename?: string; error?: string }> => {
    try {
      // Get all data from UserDB tables
      const userData = {
        users: await userDB.users.toArray(),
        customers: await userDB.customers.toArray(),
        inventory: await userDB.inventory.toArray(),
        oldStock: await userDB.oldStock.toArray(),
        invoices: await userDB.invoices.toArray(),
        purchases: await userDB.purchases.toArray(),
        settings: await userDB.settings.toArray(),
        analytics: await userDB.analytics.toArray()
      };

      // Create a JSON string from the data
      const backupData = JSON.stringify(userData, null, 2);
      
      // Generate a filename with timestamp
      const timestamp = new Date().toISOString();
      const filename = `kuber_backup_${timestamp.replace(/[:.]/g, "-")}.json`;
      
      // Create a downloadable file for the user
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update backup history
      const updatedSettings = {
        ...settings,
        backups: {
          ...settings.backups,
          created: [
            { timestamp, filename },
            ...settings.backups.created.slice(0, 2) // Keep only the 3 most recent
          ]
        }
      };
      
      setSettings(updatedSettings);
      await update('settings', userId, updatedSettings);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during backup' 
      };
    }
  };

  const restoreBackup = async (backupData: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Parse the backup data
      const data = JSON.parse(backupData);
      
      // Validate the backup data
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid backup data format' };
      }
      
      // Check if required tables exist
      const requiredTables = ['users', 'customers', 'inventory', 'invoices', 'settings'];
      const missingTables = requiredTables.filter(table => !data[table]);
      
      if (missingTables.length > 0) {
        return { 
          success: false, 
          error: `Backup is missing data for tables: ${missingTables.join(', ')}` 
        };
      }
      
      // Clear all existing data
      await userDB.users.clear();
      await userDB.customers.clear();
      await userDB.inventory.clear();
      await userDB.oldStock.clear();
      await userDB.invoices.clear();
      await userDB.purchases.clear();
      await userDB.settings.clear();
      await userDB.analytics.clear();
      
      // Restore data to each table
      await userDB.users.bulkAdd(data.users || []);
      await userDB.customers.bulkAdd(data.customers || []);
      await userDB.inventory.bulkAdd(data.inventory || []);
      await userDB.oldStock.bulkAdd(data.oldStock || []);
      await userDB.invoices.bulkAdd(data.invoices || []);
      await userDB.purchases.bulkAdd(data.purchases || []);
      await userDB.analytics.bulkAdd(data.analytics || []);
      
      // We need to handle settings specially to retain backup history
      const currentSettings = settings;
      
      // Find the settings for the current user
      let userSettings = data.settings.find((s: any) => s.id === userId);
      
      if (userSettings) {
        // Make sure to preserve the backup history
        userSettings = {
          ...userSettings,
          backups: {
            ...userSettings.backups,
            restored: [
              { 
                timestamp: new Date().toISOString(), 
                filename: `Restored from backup on ${new Date().toLocaleString()}`
              },
              ...currentSettings.backups.restored.slice(0, 2) // Keep only the 3 most recent
            ]
          }
        };
        
        await userDB.settings.add(userSettings);
        setSettings(userSettings);
      }
      
      // Reload the page to reflect changes
      window.location.reload();
      
      return { success: true };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during restore' 
      };
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateNotificationSettings,
        updateFirmDetails,
        updateInvoiceTemplates,
        createBackup,
        restoreBackup
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)

  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }

  return context
}

