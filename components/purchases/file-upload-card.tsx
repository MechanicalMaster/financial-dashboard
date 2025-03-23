"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormEvent } from "react"
import { Upload, Plus, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Supplier {
  id: number
  name: string
}

interface FileUploadCardProps {
  suppliers: Supplier[]
}

export function FileUploadCard({ suppliers }: FileUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState("")
  const [newSupplierEmail, setNewSupplierEmail] = useState("")
  const [newSupplierPhone, setNewSupplierPhone] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    if (!selectedSupplier) {
      toast.error("Please select a supplier")
      return
    }

    if (!invoiceDate) {
      toast.error("Please enter the invoice date")
      return
    }

    setIsUploading(true)

    // In a real app, you would upload the file to your server here
    setTimeout(() => {
      setIsUploading(false)
      toast.success("Invoice uploaded successfully")

      // Reset form
      setSelectedFile(null)
      setSelectedSupplier("")
      setInvoiceDate("")
      setInvoiceNumber("")

      // Reset file input
      const fileInput = document.getElementById("invoice-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    }, 2000)
  }

  const handleAddSupplier = (e: FormEvent) => {
    e.preventDefault()

    if (!newSupplierName) {
      toast.error("Please enter a supplier name")
      return
    }

    // In a real app, you would add the new supplier to your database here
    toast.success(`New supplier "${newSupplierName}" added successfully`)

    // Reset form and close dialog
    setNewSupplierName("")
    setNewSupplierEmail("")
    setNewSupplierPhone("")
    setIsAddSupplierOpen(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invoice-upload">Upload Invoice</Label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md p-4 hover:bg-muted/50 transition-colors cursor-pointer">
          <input
            id="invoice-upload"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="invoice-upload" className="cursor-pointer flex flex-col items-center space-y-2">
            {selectedFile ? (
              <>
                <FileText className="h-8 w-8" />
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <p className="text-sm font-medium">Drag and drop or click to upload</p>
                <p className="text-xs text-muted-foreground">Supports PDF, PNG, JPG (max 10MB)</p>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="supplier">Supplier</Label>
          <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-7 gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs">Add New</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSupplier} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-name">Supplier Name</Label>
                  <Input
                    id="supplier-name"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    required
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
        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
          <SelectTrigger id="supplier">
            <SelectValue placeholder="Select a supplier" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoice-date">Invoice Date</Label>
          <Input id="invoice-date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-number">Invoice Number</Label>
          <Input
            id="invoice-number"
            placeholder="Optional"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload Invoice"}
      </Button>
    </form>
  )
}

