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
import { Laptop, Smartphone, Tablet, Download, Upload, Clock, AlertCircle } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { settings, updateSettings, updateNotificationSettings, updateFirmDetails, updateInvoiceTemplates, createBackup, restoreBackup } = useSettings()
  const [isRestoring, setIsRestoring] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveAccount = () => {
    updateSettings({
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

  const handleSaveInvoiceTemplate = (templateId: string) => {
    updateInvoiceTemplates({
      activeTemplate: templateId
    })
    toast.success("Invoice template updated successfully")
  }

  const handleCreateBackup = async () => {
    try {
      const result = await createBackup()
      if (result.success) {
        toast.success("Backup created successfully")
      } else {
        toast.error(`Failed to create backup: ${result.error}`)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    }
  }

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      setIsRestoring(true)
      
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = e.target?.result as string
        const result = await restoreBackup(data)
        
        if (result.success) {
          toast.success("Backup restored successfully")
        } else {
          toast.error(`Failed to restore backup: ${result.error}`)
        }
        
        setIsRestoring(false)
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
      
      reader.onerror = () => {
        toast.error("Failed to read backup file")
        setIsRestoring(false)
      }
      
      reader.readAsText(file)
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
      setIsRestoring(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="firm-details">Firm Details</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="profile-photo">Upload Profile Photo</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    {settings.profilePhoto ? (
                      <AvatarImage src={settings.profilePhoto} alt={settings.fullName} />
                    ) : (
                      <AvatarFallback>
                        {settings.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <Input 
                    id="profile-photo" 
                    type="file" 
                    accept="image/*" 
                    className="max-w-xs"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateSettings({ profilePhoto: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
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

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Create backups and restore your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Create Backup */}
                <div className="space-y-4 border rounded-md p-4">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Create Backup</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Export all your data into a JSON file that you can save locally.
                  </p>
                  <Button onClick={handleCreateBackup} className="w-full">
                    Download Backup
                  </Button>
                </div>

                {/* Restore Backup */}
                <div className="space-y-4 border rounded-md p-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Restore Backup</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Import data from a previously created backup file.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="backup-file">Select Backup File</Label>
                    <Input 
                      id="backup-file" 
                      ref={fileInputRef}
                      type="file" 
                      accept=".json" 
                      onChange={handleRestoreBackup}
                      disabled={isRestoring}
                    />
                  </div>
                  {isRestoring && (
                    <div className="flex items-center justify-center p-2 text-sm">
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Restoring your backup...
                    </div>
                  )}
                  <div className="flex items-center mt-2">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                    <p className="text-xs text-amber-500">
                      Warning: Restoring a backup will replace all your current data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Backup History */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Backup History</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Backups Created</h4>
                    {settings.backups?.created && settings.backups.created.length > 0 ? (
                      <div className="space-y-2">
                        {settings.backups.created.map((backup, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span className="text-sm">{new Date(backup.timestamp).toLocaleString()}</span>
                            </div>
                            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {backup.filename}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent backups</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Restores</h4>
                    {settings.backups?.restored && settings.backups.restored.length > 0 ? (
                      <div className="space-y-2">
                        {settings.backups.restored.map((restore, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span className="text-sm">{new Date(restore.timestamp).toLocaleString()}</span>
                            </div>
                            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {restore.filename}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent restores</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

