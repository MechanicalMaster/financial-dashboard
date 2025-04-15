"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Save, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useDB } from "@/contexts/db-context"
import { Purchase } from "@/lib/db"

export default function NewPurchaseInvoicePage() {
  const router = useRouter()
  const { db, getMastersByType } = useDB()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Form fields
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date())
  const [supplier, setSupplier] = useState("")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState("received")
  const [paymentStatus, setPaymentStatus] = useState("paid")
  const [items, setItems] = useState("")
  const [notes, setNotes] = useState("")
  const [suppliers, setSuppliers] = useState<{id: string, value: string}[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isFileUploading, setIsFileUploading] = useState(false)

  // Set isMounted after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    
    // Load suppliers from database
    const loadSuppliers = async () => {
      try {
        const supplierData = await getMastersByType('supplier');
        // Map the master data to the expected format
        const formattedSuppliers = supplierData.map(supplier => ({
          id: supplier.id || '',
          value: supplier.value
        }));
        setSuppliers(formattedSuppliers);
      } catch (error) {
        console.error("Error loading suppliers:", error);
      }
    };
    
    loadSuppliers();
  }, [getMastersByType])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Check file size (max 10MB)
      if (files[0].size > 10 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 10MB.")
        return
      }
      
      setSelectedFile(files[0])
      toast.success("File selected: " + files[0].name)
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      // Check file size (max 10MB)
      if (files[0].size > 10 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 10MB.")
        return
      }
      
      setSelectedFile(files[0])
      toast.success("File selected: " + files[0].name)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invoiceNumber || !supplier || !amount) {
      toast.error("Please fill all required fields")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Create new purchase record for database
      const newPurchase: Purchase = {
        id: db.generateId('PURCH'),
        itemId: items || '1', // This should be a proper item ID in a real app
        supplier,
        quantity: parseInt(items) || 1,
        cost: parseFloat(amount),
        date: invoiceDate || new Date(),
        invoiceFile: selectedFile ? selectedFile.name : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to database
      await db.purchases.add(newPurchase);
      
      toast.success("Purchase invoice added successfully");
      
      // Navigate back to invoices list
      setTimeout(() => {
        router.push('/purchases');
      }, 1500);
    } catch (error) {
      console.error("Error adding invoice:", error);
      toast.error("Failed to add invoice");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Purchase Invoice</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Invoice"}
          </Button>
          <Button variant="outline" onClick={() => router.push('/purchases')}>
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Enter the basic information about this purchase invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice Number *</Label>
                <Input 
                  id="invoice-number" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Invoice Date *</Label>
                <DatePicker 
                  date={invoiceDate} 
                  setDate={setInvoiceDate} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select value={supplier} onValueChange={setSupplier} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.value}>
                        {s.value}
                      </SelectItem>
                    ))}
                    {suppliers.length === 0 && (
                      <>
                        <SelectItem value="Office Supplies Inc.">Office Supplies Inc.</SelectItem>
                        <SelectItem value="Tech Solutions Ltd.">Tech Solutions Ltd.</SelectItem>
                        <SelectItem value="Furniture Depot">Furniture Depot</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Add more details about this purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-status">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="items">Number of Items</Label>
                <Input 
                  id="items" 
                  type="number" 
                  min="1"
                  value={items} 
                  onChange={(e) => setItems(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upload Invoice File</CardTitle>
            <CardDescription>Attach the original invoice document (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="flex items-center justify-center border-2 border-dashed rounded-md p-8 cursor-pointer"
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
            >
              <div className="text-center">
                {selectedFile ? (
                  <>
                    <FileText className="h-10 w-10 text-primary mx-auto mb-4" />
                    <p className="text-sm font-medium mb-1">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setSelectedFile(null)}
                    >
                      Replace File
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium mb-1">Drag and drop your files here</p>
                    <p className="text-xs text-muted-foreground mb-4">Supports PDF, PNG, JPG (max 10MB)</p>
                    <input
                      type="file"
                      id="invoice-file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => document.getElementById('invoice-file')?.click()}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Select File
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
