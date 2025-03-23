"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, Eye, FileText, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Pagination } from "@/components/invoices/pagination"
import { toast } from "sonner"

interface Supplier {
  id: number
  name: string
  contact: string
  email: string
  phone: string
  invoices: number
}

interface SuppliersListProps {
  suppliers: Supplier[]
}

export function SuppliersList({ suppliers: initialSuppliers }: SuppliersListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState("")
  const [newSupplierContact, setNewSupplierContact] = useState("")
  const [newSupplierEmail, setNewSupplierEmail] = useState("")
  const [newSupplierPhone, setNewSupplierPhone] = useState("")
  const itemsPerPage = 8

  // Load suppliers from localStorage on mount, or use initial suppliers as fallback
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('purchaseSuppliers');
    
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    } else {
      setSuppliers(initialSuppliers);
      // Save initial suppliers to localStorage for future reference
      localStorage.setItem('purchaseSuppliers', JSON.stringify(initialSuppliers));
    }
  }, [initialSuppliers]);

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage)

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSupplierName) {
      toast.error("Please enter a supplier name")
      return
    }

    // Create new supplier
    const newSupplier = {
      id: Date.now(), // Use current timestamp as unique ID
      name: newSupplierName,
      contact: newSupplierContact,
      email: newSupplierEmail,
      phone: newSupplierPhone,
      invoices: 0,
    }

    // Add to suppliers list
    const updatedSuppliers = [...suppliers, newSupplier];
    setSuppliers(updatedSuppliers);
    
    // Save to localStorage
    localStorage.setItem('purchaseSuppliers', JSON.stringify(updatedSuppliers));

    // Reset form and close dialog
    toast.success(`Supplier "${newSupplierName}" added successfully`)
    setNewSupplierName("")
    setNewSupplierContact("")
    setNewSupplierEmail("")
    setNewSupplierPhone("")
    setIsAddSupplierOpen(false)
  }

  const handleViewSupplier = (id: number) => {
    toast.info(`Viewing supplier details for ID: ${id}`)
  }

  const handleEditSupplier = (id: number) => {
    toast.info(`Editing supplier with ID: ${id}`)
  }

  const handleDeleteSupplier = (id: number) => {
    // Ask for confirmation
    if (confirm(`Are you sure you want to delete this supplier?`)) {
      // Remove from suppliers array
      const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
      
      // Update state
      setSuppliers(updatedSuppliers);
      
      // Save to localStorage
      localStorage.setItem('purchaseSuppliers', JSON.stringify(updatedSuppliers));
      
      toast.success("Supplier deleted successfully");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-name">Supplier Name *</Label>
                <Input
                  id="supplier-name"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-contact">Contact Person</Label>
                <Input
                  id="supplier-contact"
                  value={newSupplierContact}
                  onChange={(e) => setNewSupplierContact(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-email">Email</Label>
                <Input
                  id="supplier-email"
                  type="email"
                  value={newSupplierEmail}
                  onChange={(e) => setNewSupplierEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-phone">Phone</Label>
                <Input
                  id="supplier-phone"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddSupplierOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Supplier</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-center">Invoices</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSuppliers.length > 0 ? (
              paginatedSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      {supplier.name}
                    </div>
                  </TableCell>
                  <TableCell>{supplier.contact}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell className="text-center">{supplier.invoices}</TableCell>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewSupplier(supplier.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditSupplier(supplier.id)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" /> View Invoices
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteSupplier(supplier.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No suppliers found. Try adjusting your search or add a new supplier.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedSuppliers.length} of {filteredSuppliers.length} suppliers
        </p>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}

