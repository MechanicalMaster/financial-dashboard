"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useDB } from "./db-context"

export interface UserSettings {
  avatar: string
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
  privacy: {
    analyticsSharing: boolean
    personalizedAds: boolean
    visibility: "public" | "private"
    dataRetention: "6-months" | "1-year" | "2-years" | "indefinite"
  }
}

const defaultSettings: UserSettings = {
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
  }
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => void
  updateNotificationSettings: (settings: Partial<UserSettings["notifications"]>) => void
  updatePrivacySettings: (settings: Partial<UserSettings["privacy"]>) => void
  updateFirmDetails: (settings: Partial<UserSettings["firmDetails"]>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const { get, update, add, isLoading } = useDB();
  const userId = 'default-user-id'; // In a real app, get this from authentication

  // Load settings from database when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to get existing settings from the database
        const savedSettings = await get<UserSettings>('settings', userId);
        
        if (savedSettings) {
          setSettings(savedSettings);
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
  }, [get, add, userId, isLoading]);

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
      notifications: { ...settings.notifications, ...notificationSettings },
      updatedAt: new Date()
    }
    setSettings(updatedSettings)
    
    try {
      await update('settings', userId, updatedSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  const updatePrivacySettings = async (privacySettings: Partial<UserSettings["privacy"]>) => {
    const updatedSettings = {
      ...settings,
      privacy: { ...settings.privacy, ...privacySettings },
      updatedAt: new Date()
    }
    setSettings(updatedSettings)
    
    try {
      await update('settings', userId, updatedSettings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  }

  const updateFirmDetails = async (firmDetails: Partial<UserSettings["firmDetails"]>) => {
    const updatedSettings = {
      ...settings,
      firmDetails: { ...settings.firmDetails, ...firmDetails },
      updatedAt: new Date()
    }
    setSettings(updatedSettings)
    
    try {
      await update('settings', userId, updatedSettings);
    } catch (error) {
      console.error('Error saving firm details:', error);
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateNotificationSettings,
        updatePrivacySettings,
        updateFirmDetails,
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

