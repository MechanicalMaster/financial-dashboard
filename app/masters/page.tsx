"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Sparkles } from "lucide-react"
import { useDB } from "@/contexts/db-context"
import { Master } from "@/lib/db"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState("category")
  const [masters, setMasters] = useState<Master[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { getAll, add, update, remove, db } = useDB()
  
  // New master form state
  const [newMasterValue, setNewMasterValue] = useState("")
  const [editingMaster, setEditingMaster] = useState<Master | null>(null)

  // Master types for tabs
  const masterTypes = [
    { id: "category", label: "Categories" },
    { id: "status", label: "Statuses" },
    { id: "payment_method", label: "Payment Methods" },
    { id: "unit", label: "Units" },
    { id: "purity", label: "Purity" },
    { id: "metal", label: "Metal" },
    { id: "label_config", label: "Label Configuration" }
  ]

  // State for label configuration
  const [labelQuantity, setLabelQuantity] = useState("1")
  const [labelType, setLabelType] = useState("standard")
  const [includeProductName, setIncludeProductName] = useState(true)
  const [includePrice, setIncludePrice] = useState(true)
  const [includeBarcode, setIncludeBarcode] = useState(true)
  const [includeDate, setIncludeDate] = useState(true)
  const [includeQr, setIncludeQr] = useState(true)
  const [includeMetal, setIncludeMetal] = useState(true)
  const [includePurity, setIncludePurity] = useState(true)
  const [includeWeight, setIncludeWeight] = useState(true)

  // Fetch masters whenever active tab changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchMasters = async () => {
      if (!getAll) return; // Make sure getAll is available
      
      try {
        setLoading(true)
        const allMasters = await getAll<Master>('masters')
        
        // Only update state if component is still mounted
        if (isMounted) {
          const filteredMasters = allMasters.filter(
            master => master.type === activeTab
          ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          
          setMasters(filteredMasters)
          setLoading(false)
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} masters:`, error)
        
        // Only update state if component is still mounted
        if (isMounted) {
          toast.error(`Failed to load ${activeTab} data`)
          setLoading(false)
        }
      }
    }

    fetchMasters()
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [activeTab, getAll])

  // Add this function to save label configuration
  const saveLabelConfiguration = () => {
    try {
      // Create an object with the current configuration
      const labelConfig = {
        labelType,
        labelQuantity,
        includeProductName,
        includePrice,
        includeBarcode,
        includeDate,
        includeQr,
        includeMetal,
        includePurity,
        includeWeight,
      };
      
      // Save to localStorage
      localStorage.setItem('labelConfig', JSON.stringify(labelConfig));
      
      toast.success("Label configuration saved successfully");
    } catch (error) {
      console.error("Error saving label configuration:", error);
      toast.error("Failed to save label configuration");
    }
  }

  // Load the label configuration when the component mounts
  useEffect(() => {
    try {
      // Try to load saved configuration from localStorage
      const savedConfig = localStorage.getItem('labelConfig');
      
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Update state with saved configuration
        setLabelType(config.labelType || 'standard');
        setLabelQuantity(config.labelQuantity || '1');
        setIncludeProductName(config.includeProductName !== undefined ? config.includeProductName : true);
        setIncludePrice(config.includePrice !== undefined ? config.includePrice : true);
        setIncludeBarcode(config.includeBarcode !== undefined ? config.includeBarcode : true);
        setIncludeDate(config.includeDate !== undefined ? config.includeDate : true);
        setIncludeQr(config.includeQr !== undefined ? config.includeQr : true);
        setIncludeMetal(config.includeMetal !== undefined ? config.includeMetal : true);
        setIncludePurity(config.includePurity !== undefined ? config.includePurity : true);
        setIncludeWeight(config.includeWeight !== undefined ? config.includeWeight : true);
      }
    } catch (error) {
      console.error("Error loading label configuration:", error);
    }
  }, []);

  // Filter masters based on search query
  const filteredMasters = masters.filter(master => 
    master.value.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle adding a new master
  const handleAddMaster = async () => {
    if (!newMasterValue.trim()) {
      toast.error("Value cannot be empty")
      return
    }

    // Check if value already exists for this type
    const isDuplicate = masters.some(
      m => m.value.toLowerCase() === newMasterValue.toLowerCase()
    )

    if (isDuplicate) {
      toast.error(`${newMasterValue} already exists in ${activeTab}`)
      return
    }

    try {
      // Create a new master record with all required fields
      const newMaster: Master = {
        id: db.generateId('MSTR'), // Explicitly generate the ID
        type: activeTab,
        value: newMasterValue.trim(),
        isActive: true,
        displayOrder: masters.length + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // First add to the database
      await add('masters', newMaster)
      
      // Then update the UI
      setMasters(prev => [...prev, newMaster])
      setNewMasterValue("")
      toast.success(`${newMasterValue} added to ${activeTab}`)
    } catch (error) {
      console.error(`Error adding ${activeTab}:`, error)
      toast.error(`Failed to add new ${activeTab}. ${error instanceof Error ? error.message : ''}`)
    }
  }

  // Handle updating a master's active status
  const handleToggleStatus = async (master: Master) => {
    if (!master.id) {
      toast.error("Cannot update: Item has no ID")
      return
    }

    try {
      // Create updated master object with toggled status
      const updatedMaster = { 
        ...master, 
        isActive: !master.isActive, 
        updatedAt: new Date() 
      }
      
      // First update in the database
      await update('masters', master.id, { 
        isActive: !master.isActive, 
        updatedAt: new Date() 
      })
      
      // Then update the UI
      setMasters(prev => prev.map(m => 
        m.id === master.id ? updatedMaster : m
      ))
      
      toast.success(`${master.value} ${updatedMaster.isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error(`Error updating status for ${activeTab}:`, error)
      toast.error(`Failed to update ${master.value} status. ${error instanceof Error ? error.message : ''}`)
    }
  }

  // Handle updating a master
  const handleUpdateMaster = async () => {
    if (!editingMaster) return
    
    if (!editingMaster.value.trim()) {
      toast.error("Value cannot be empty")
      return
    }

    // Check if value already exists for this type (excluding the current master)
    const isDuplicate = masters.some(
      m => m.id !== editingMaster.id && 
      m.value.toLowerCase() === editingMaster.value.toLowerCase()
    )

    if (isDuplicate) {
      toast.error(`${editingMaster.value} already exists in ${activeTab}`)
      return
    }

    try {
      // Create updated master object
      const updatedMaster = { 
        ...editingMaster, 
        updatedAt: new Date() 
      }
      
      // First update the database
      await update('masters', editingMaster.id!, {
        value: editingMaster.value,
        isActive: editingMaster.isActive,
        updatedAt: new Date()
      })
      
      // Then update the UI
      setMasters(prev => prev.map(m => 
        m.id === editingMaster.id ? updatedMaster : m
      ))
      
      setEditingMaster(null)
      toast.success(`${editingMaster.value} updated successfully`)
    } catch (error) {
      console.error(`Error updating ${activeTab}:`, error)
      toast.error(`Failed to update ${editingMaster.value}. ${error instanceof Error ? error.message : ''}`)
    }
  }

  // Handle deleting a master
  const handleDeleteMaster = async (master: Master) => {
    if (!window.confirm(`Are you sure you want to delete ${master.value}?`)) {
      return
    }

    if (!master.id) {
      toast.error("Cannot delete: Item has no ID")
      return
    }

    try {
      // First delete from database
      await remove('masters', master.id)
      
      // Then update the UI
      setMasters(prev => prev.filter(m => m.id !== master.id))
      toast.success(`${master.value} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting ${activeTab}:`, error)
      toast.error(`Failed to delete ${master.value}. ${error instanceof Error ? error.message : ''}`)
    }
  }

  // Function to seed jewelry-specific masters
  const seedJewelryMasters = async () => {
    try {
      await db.seedJewelryMasters()
      toast.success("Jewelry-specific categories, metals, and purity values added successfully!")
      // Refresh the masters list
      setActiveTab("category") // First show categories
      const refreshedMasters = await getAll<Master>('masters')
      const filteredMasters = refreshedMasters.filter(
        master => master.type === "category"
      ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      setMasters(filteredMasters)
    } catch (error) {
      console.error("Error seeding jewelry masters:", error)
      toast.error("Failed to add jewelry masters")
    }
  }

  // Function to clean up masters data (remove duplicates and unwanted categories)
  const cleanupMastersData = async () => {
    try {
      await db.cleanupMastersData();
      toast.success("Removed duplicate entries and cleaned up categories!");
      
      // Refresh the masters list
      const refreshedMasters = await getAll<Master>('masters')
      const filteredMasters = refreshedMasters.filter(
        master => master.type === activeTab
      ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      setMasters(filteredMasters)
    } catch (error) {
      console.error("Error cleaning up masters data:", error)
      toast.error("Failed to clean up masters data")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Masters Management</h1>
          <p className="text-muted-foreground">
            Define and manage dropdown values used throughout the application
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
            onClick={cleanupMastersData}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Remove Duplicates
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
            onClick={seedJewelryMasters}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Add Jewelry Masters
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New {getTabLabel(activeTab)}</DialogTitle>
                <DialogDescription>
                  Enter a value for the new {activeTab}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="name">Value</Label>
                <Input 
                  id="name" 
                  value={newMasterValue} 
                  onChange={(e) => setNewMasterValue(e.target.value)}
                  placeholder={`Enter ${activeTab} value...`}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleAddMaster}>Add {getTabLabel(activeTab)}</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {masterTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {masterTypes.filter(type => type.id !== "label_config").map((type) => (
          <TabsContent key={type.id} value={type.id}>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Search ${type.label.toLowerCase()}...`}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardHeader className="py-4">
                <CardTitle>{type.label}</CardTitle>
                <CardDescription>
                  Manage {type.label.toLowerCase()} used throughout the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            Loading {type.label.toLowerCase()}...
                          </TableCell>
                        </TableRow>
                      ) : filteredMasters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            No {type.label.toLowerCase()} found. Add your first one!
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMasters.map((master) => (
                          <TableRow key={master.id}>
                            <TableCell className="font-medium">{master.value}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={master.isActive}
                                onCheckedChange={() => handleToggleStatus(master)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => setEditingMaster(master)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDeleteMaster(master)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* Label Configuration Tab */}
        <TabsContent value="label_config">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Label Configuration</CardTitle>
              <CardDescription>
                Configure and print labels for inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Label Options</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="labelType">Label Type</Label>
                        <Select value={labelType} onValueChange={setLabelType}>
                          <SelectTrigger id="labelType">
                            <SelectValue placeholder="Select a label type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard (2.25" x 1.25")</SelectItem>
                            <SelectItem value="large">Large (4" x 2")</SelectItem>
                            <SelectItem value="small">Small (1" x 0.5")</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="labelQuantity">Number of Labels</Label>
                        <Select value={labelQuantity} onValueChange={setLabelQuantity}>
                          <SelectTrigger id="labelQuantity">
                            <SelectValue placeholder="Select number of labels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Include on Label</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeProductName" 
                          checked={includeProductName} 
                          onCheckedChange={(checked) => setIncludeProductName(checked === true)} 
                        />
                        <Label htmlFor="includeProductName">Product Name</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeMetal" 
                          checked={includeMetal} 
                          onCheckedChange={(checked) => setIncludeMetal(checked === true)} 
                        />
                        <Label htmlFor="includeMetal">Metal</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includePrice" 
                          checked={includePrice} 
                          onCheckedChange={(checked) => setIncludePrice(checked === true)} 
                        />
                        <Label htmlFor="includePrice">Price</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeWeight" 
                          checked={includeWeight} 
                          onCheckedChange={(checked) => setIncludeWeight(checked === true)} 
                        />
                        <Label htmlFor="includeWeight">Weight</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeBarcode" 
                          checked={includeBarcode} 
                          onCheckedChange={(checked) => setIncludeBarcode(checked === true)} 
                        />
                        <Label htmlFor="includeBarcode">Barcode</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includePurity" 
                          checked={includePurity} 
                          onCheckedChange={(checked) => setIncludePurity(checked === true)} 
                        />
                        <Label htmlFor="includePurity">Purity</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeDate" 
                          checked={includeDate} 
                          onCheckedChange={(checked) => setIncludeDate(checked === true)} 
                        />
                        <Label htmlFor="includeDate">Date</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeQr" 
                          checked={includeQr} 
                          onCheckedChange={(checked) => setIncludeQr(checked === true)} 
                        />
                        <Label htmlFor="includeQr">QR Code</Label>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={saveLabelConfiguration}
                    className="w-full"
                  >
                    Save Configuration
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Label Preview</h3>
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="aspect-[1.8/1] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4">
                      <p className="text-center text-muted-foreground">
                        Label preview will appear here when printing from inventory
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Note: The actual configuration will be applied when printing labels from the Inventory section.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog - keep existing code */}
      <Dialog open={!!editingMaster} onOpenChange={(open) => !open && setEditingMaster(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {getTabLabel(activeTab)}</DialogTitle>
            <DialogDescription>
              Update the value for this {activeTab}
            </DialogDescription>
          </DialogHeader>
          {editingMaster && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-value">Value</Label>
                  <Input
                    id="edit-value"
                    value={editingMaster.value}
                    onChange={(e) => setEditingMaster({
                      ...editingMaster,
                      value: e.target.value
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={editingMaster.isActive}
                    onCheckedChange={(checked) => setEditingMaster({
                      ...editingMaster,
                      isActive: checked
                    })}
                  />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMaster(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMaster}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper to get the label for a tab
function getTabLabel(tabId: string): string {
  const labels: Record<string, string> = {
    category: "Category",
    status: "Status",
    payment_method: "Payment Method",
    unit: "Unit",
    purity: "Purity",
    metal: "Metal",
    label_config: "Label Configuration"
  }
  
  return labels[tabId] || tabId.charAt(0).toUpperCase() + tabId.slice(1)
} 