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
import { Plus, MoreHorizontal, Pencil, Trash2, Search } from "lucide-react"
import { useDB } from "@/contexts/db-context"
import { Master } from "@/lib/db"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

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
    { id: "metal", label: "Metal" }
  ]

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Masters Management</h1>
          <p className="text-muted-foreground">
            Define and manage dropdown values used throughout the application
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</DialogTitle>
              <DialogDescription>
                Enter the value for the new {activeTab}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    value={newMasterValue}
                    onChange={(e) => setNewMasterValue(e.target.value)}
                    placeholder={`Enter ${activeTab} value...`}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleAddMaster}>Add</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              {masterTypes.map(type => (
                <TabsTrigger key={type.id} value={type.id}>
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Search ${activeTab}...`}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {masterTypes.map(type => (
            <TabsContent key={type.id} value={type.id} className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>{type.label}</CardTitle>
                  <CardDescription>
                    Manage {type.label.toLowerCase()} used throughout the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-8 text-center">
                      <p>Loading {type.label.toLowerCase()}...</p>
                    </div>
                  ) : filteredMasters.length === 0 ? (
                    <div className="py-8 text-center">
                      <p>No {type.label.toLowerCase()} found.</p>
                      <p className="text-muted-foreground mt-2">
                        {searchQuery ? "Try a different search term" : "Add a new one to get started"}
                      </p>
                    </div>
                  ) : (
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
                          {filteredMasters.map((master) => (
                            <TableRow key={master.id}>
                              <TableCell className="font-medium">{master.value}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={master.isActive}
                                    onCheckedChange={() => handleToggleStatus(master)}
                                  />
                                  <Badge variant={master.isActive ? "default" : "secondary"}>
                                    {master.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
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
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => {
                                          e.preventDefault()
                                          setEditingMaster(master)
                                        }}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Edit {activeTab}</DialogTitle>
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
                                          <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                          </DialogClose>
                                          <DialogClose asChild>
                                            <Button onClick={handleUpdateMaster}>Save</Button>
                                          </DialogClose>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeleteMaster(master)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
} 