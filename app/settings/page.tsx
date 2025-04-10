"use client"

import { useSettings } from "@/contexts/settings-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Laptop, Smartphone, Tablet } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const defaultAvatars = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9439775.jpg-4JVJWOjPksd3DtnBYJXoWHA5lc1DU9.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238645_11475210.jpg-lU8bOe6TLt5Rv51hgjg8NT8PsDBmvN.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/375238208_11475222.jpg-poEIzVHAGiIfMFQ7EiF8PUG1u0Zkzz.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-4MCwPC2Bec6Ume26Yo1kao3CnONxDg.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334178.jpg-Y74tW6XFO68g7N36SE5MSNDNVKLQ08.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5295.jpg-fLw0wGGZp8wuTzU5dnyfjZDwAHN98a.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9720029.jpg-Yf9h2a3kT7rYyCb648iLIeHThq5wEy.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/27470341_7294795.jpg-XE0zf7R8tk4rfA1vm4fAHeZ1QoVEOo.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/799.jpg-0tEi4Xvg5YsFoGoQfQc698q4Dygl1S.jpeg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9334228.jpg-eOsHCkvVrVAwcPHKYSs5sQwVKsqWpC.jpeg",
]

export default function SettingsPage() {
  const { settings, updateSettings, updateNotificationSettings, updatePrivacySettings, updateFirmDetails, updateInvoiceTemplates } = useSettings()
  const [selectedAvatar, setSelectedAvatar] = useState(settings.avatar)

  const handleSaveAccount = () => {
    updateSettings({
      avatar: selectedAvatar,
      fullName: settings.fullName,
      email: settings.email,
      phone: settings.phone,
      timezone: settings.timezone,
    })
    toast.success("Account settings saved successfully")
  }

  const handleSaveNotifications = () => {
    updateNotificationSettings(settings.notifications)
    toast.success("Notification settings saved successfully")
  }

  const handleSavePrivacy = () => {
    updatePrivacySettings(settings.privacy)
    toast.success("Privacy settings saved successfully")
  }

  const handleSaveInvoiceTemplate = (templateId: string) => {
    updateInvoiceTemplates({
      activeTemplate: templateId
    })
    toast.success("Invoice template updated successfully")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="firm-details">Firm Details</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Current Avatar</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedAvatar} alt={settings.fullName} />
                    <AvatarFallback>
                      {settings.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Label>Choose a new avatar</Label>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {defaultAvatars.map((avatar, index) => (
                    <Avatar
                      key={index}
                      className={`h-20 w-20 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary shrink-0 ${
                        selectedAvatar === avatar ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} className="object-cover" />
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <Label htmlFor="custom-avatar">Or upload a custom avatar</Label>
                  <Input id="custom-avatar" type="file" accept="image/*" className="mt-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={settings.fullName}
                  onChange={(e) => updateSettings({ fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  inputMode="numeric"
                  title="Please enter exactly 10 digits"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccount}>Save Account Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="firm-details">
          <Card>
            <CardHeader>
              <CardTitle>Firm Details</CardTitle>
              <CardDescription>Manage your firm or business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Firm Logo</Label>
                <div className="flex items-center space-x-4">
                  {settings?.firmDetails?.firmLogo ? (
                    <div className="h-20 w-40 relative">
                      <img 
                        src={settings.firmDetails.firmLogo} 
                        alt="Firm Logo" 
                        className="h-full object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No logo uploaded</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="firm-logo">Upload Firm Logo</Label>
                  <Input id="firm-logo" type="file" accept="image/*" className="mt-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm-name">Firm Name</Label>
                <Input
                  id="firm-name"
                  value={settings?.firmDetails?.firmName || ""}
                  onChange={(e) => updateFirmDetails({ firmName: e.target.value })}
                  placeholder="Enter your firm or business name"
                />
                <p className="text-xs text-muted-foreground">This name will be displayed in the top corner of the application.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm-address">Firm Address</Label>
                <textarea
                  id="firm-address"
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings?.firmDetails?.address || ""}
                  onChange={(e) => updateFirmDetails({ address: e.target.value })}
                  placeholder="Enter your business address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm-phone">Firm Phone Number</Label>
                <Input
                  id="firm-phone"
                  type="tel"
                  value={settings?.firmDetails?.phoneNumber || ""}
                  onChange={(e) => updateFirmDetails({ phoneNumber: e.target.value })}
                  placeholder="Enter your business phone number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  inputMode="numeric"
                  title="Please enter exactly 10 digits"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm-gst">Firm GSTIN Number</Label>
                <Input
                  id="firm-gst"
                  value={settings?.firmDetails?.gstInNumber || ""}
                  onChange={(e) => updateFirmDetails({ gstInNumber: e.target.value })}
                  placeholder="Enter your GSTIN"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm-email">Firm Email Address</Label>
                <Input
                  id="firm-email"
                  type="email"
                  value={settings?.firmDetails?.email || ""}
                  onChange={(e) => updateFirmDetails({ email: e.target.value })}
                  placeholder="Enter your business email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm-website">Firm Website</Label>
                <Input
                  id="firm-website"
                  type="url"
                  value={settings?.firmDetails?.website || ""}
                  onChange={(e) => updateFirmDetails({ website: e.target.value })}
                  placeholder="Enter your business website"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm-date">Date of Establishment</Label>
                <Input
                  id="firm-date"
                  type="date"
                  value={settings?.firmDetails?.dateOfEstablishment || ""}
                  onChange={(e) => updateFirmDetails({ dateOfEstablishment: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm-constitution">Constitution</Label>
                <Select 
                  value={settings?.firmDetails?.constitution || ""}
                  onValueChange={(value) => updateFirmDetails({ constitution: value })}
                >
                  <SelectTrigger id="firm-constitution">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="Limited Liability Partnership">Limited Liability Partnership (LLP)</SelectItem>
                    <SelectItem value="Private Limited Company">Private Limited Company</SelectItem>
                    <SelectItem value="Public Limited Company">Public Limited Company</SelectItem>
                    <SelectItem value="One Person Company">One Person Company (OPC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firm-auth-token">Auth Token</Label>
                <Input
                  id="firm-auth-token"
                  type="password"
                  value={settings?.firmDetails?.authToken || ""}
                  onChange={(e) => updateFirmDetails({ authToken: e.target.value })}
                  placeholder="Enter your authentication token"
                />
                <p className="text-xs text-muted-foreground">This token is used for API integration.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                if (settings?.firmDetails) {
                  updateFirmDetails(settings.firmDetails);
                  toast.success("Firm details saved successfully");
                }
              }}>Save Firm Details</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Templates</CardTitle>
              <CardDescription>Choose and manage your invoice templates</CardDescription>
            </CardHeader>
            <CardContent>
              {settings.invoiceTemplates ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {settings.invoiceTemplates.templates.map((template) => (
                    <div 
                      key={template.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        settings.invoiceTemplates.activeTemplate === template.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleSaveInvoiceTemplate(template.id)}
                    >
                      <div className="aspect-video rounded-md overflow-hidden bg-muted mb-3">
                        {template.imagePath ? (
                          <img 
                            src={template.imagePath} 
                            alt={template.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No preview available
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <div className="flex h-5 items-center space-x-2">
                          <Checkbox 
                            id={`template-${template.id}`} 
                            checked={settings.invoiceTemplates.activeTemplate === template.id}
                            onCheckedChange={() => handleSaveInvoiceTemplate(template.id)}
                          />
                          <label
                            htmlFor={`template-${template.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Active
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p>Loading template settings...</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                The selected template will be used when generating invoice PDFs.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account's security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="two-factor" />
                  <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Security Settings</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>Recent login activities on your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { date: "2023-07-20", time: "14:30 UTC", ip: "192.168.1.1", location: "New York, USA" },
                  { date: "2023-07-19", time: "09:15 UTC", ip: "10.0.0.1", location: "London, UK" },
                  { date: "2023-07-18", time: "22:45 UTC", ip: "172.16.0.1", location: "Tokyo, Japan" },
                ].map((login, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>
                      {login.date} {login.time}
                    </span>
                    <span>{login.ip}</span>
                    <span>{login.location}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Currently active sessions on your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { device: "Laptop", browser: "Chrome", os: "Windows 10", icon: Laptop },
                  { device: "Smartphone", browser: "Safari", os: "iOS 15", icon: Smartphone },
                  { device: "Tablet", browser: "Firefox", os: "Android 12", icon: Tablet },
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <session.icon className="mr-2 h-4 w-4" />
                      {session.device}
                    </span>
                    <span>{session.browser}</span>
                    <span>{session.os}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline">Log Out All Other Sessions</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your dashboard experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="inr" disabled>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="INR (₹)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="mm-dd-yyyy">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select Date Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Slider defaultValue={[16]} max={24} min={12} step={1} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup defaultValue="system">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Dashboard Layout</Label>
                <RadioGroup defaultValue="default">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="layout-default" />
                    <Label htmlFor="layout-default">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="layout-compact" />
                    <Label htmlFor="layout-compact">Compact</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expanded" id="layout-expanded" />
                    <Label htmlFor="layout-expanded">Expanded</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Notification Channels</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ email: checked as boolean })
                      }
                    />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ push: checked as boolean })
                      }
                    />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms-notifications"
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) => 
                        updateNotificationSettings({ sms: checked as boolean })
                      }
                    />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notification Types</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="account-activity"
                      checked={settings.notifications.accountActivity}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ accountActivity: checked as boolean })
                      }
                    />
                    <Label htmlFor="account-activity">Account Activity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new-features"
                      checked={settings.notifications.newFeatures}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ newFeatures: checked as boolean })
                      }
                    />
                    <Label htmlFor="new-features">New Features and Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={settings.notifications.marketing}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({ marketing: checked as boolean })
                      }
                    />
                    <Label htmlFor="marketing">Marketing and Promotions</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">Notification Frequency</Label>
                <Select
                  value={settings.notifications.frequency}
                  onValueChange={(value: "real-time" | "daily" | "weekly") => 
                    updateNotificationSettings({ frequency: value })
                  }
                >
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-time">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-hours-start">Quiet Hours</Label>
                <div className="flex items-center space-x-2">
                  <Input id="quiet-hours-start" type="time" defaultValue="22:00" />
                  <span>to</span>
                  <Input id="quiet-hours-end" type="time" defaultValue="07:00" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy and data settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Sharing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics-sharing">Share analytics data</Label>
                      <Switch
                        id="analytics-sharing"
                        checked={settings.privacy.analyticsSharing}
                        onCheckedChange={(checked) =>
                          updatePrivacySettings({ analyticsSharing: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="personalized-ads">Allow personalized ads</Label>
                      <Switch
                        id="personalized-ads"
                        checked={settings.privacy.personalizedAds}
                        onCheckedChange={(checked) =>
                          updatePrivacySettings({ personalizedAds: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Visibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={settings.privacy.visibility}
                      onValueChange={(value: "public" | "private") => 
                        updatePrivacySettings({ visibility: value })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="visibility-public" />
                        <Label htmlFor="visibility-public">Public</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="visibility-private" />
                        <Label htmlFor="visibility-private">Private</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Retention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={settings.privacy.dataRetention}
                      onValueChange={(value: "6-months" | "1-year" | "2-years" | "indefinite") => 
                        updatePrivacySettings({ dataRetention: value })
                      }
                    >
                      <SelectTrigger id="data-retention">
                        <SelectValue placeholder="Select Data Retention Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-months">6 Months</SelectItem>
                        <SelectItem value="1-year">1 Year</SelectItem>
                        <SelectItem value="2-years">2 Years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Third-Party Integrations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Connected: Google Analytics, Facebook Pixel</p>
                    <Button variant="outline">Manage Integrations</Button>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-between">
                <Button variant="outline">Download Your Data</Button>
                <Button variant="destructive">Delete My Account</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePrivacy}>Save Privacy Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

