"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateInvoice: (invoiceData: any) => void
}

interface InvoiceItem {
  id: string
  description: string
  weight: number
  rate: number
}

// Before the CreateInvoiceModal function declaration, add our sample customers
// Sample customer data (this would come from your API in a real app)
const sampleCustomers = [
  {
    id: "CUST-001",
    name: "Acme Corporation",
    email: "info@acmecorp.com",
    phone: "+91 98765 43210",
    address: "123 Main Street, Mumbai, 400001",
  },
  {
    id: "CUST-002",
    name: "Globex Industries",
    email: "contact@globex.com",
    phone: "+91 98765 12345",
    address: "456 Park Avenue, Delhi, 110001",
  },
  {
    id: "CUST-003",
    name: "Stark Enterprises",
    email: "hello@stark.com",
    phone: "+91 77665 54433",
    address: "789 Tower Road, Bangalore, 560001",
  },
  {
    id: "CUST-004",
    name: "Wayne Industries",
    email: "business@wayne.com",
    phone: "+91 88899 77766",
    address: "101 Central Avenue, Chennai, 600001",
  },
  {
    id: "CUST-005",
    name: "Oscorp",
    email: "info@oscorp.com",
    phone: "+91 92233 44556",
    address: "222 Tech Park, Hyderabad, 500001",
  },
]

export function CreateInvoiceModal({ isOpen, onClose, onCreateInvoice }: CreateInvoiceModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
  )
  const [customerName, setCustomerName] = useState("")
  const [customerMobile, setCustomerMobile] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [issueDate, setIssueDate] = useState<Date>(new Date())
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: "", weight: 0, rate: 0 },
  ])
  const [notes, setNotes] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("30")

  // Inside the component, add a state for available customers
  const [availableCustomers, setAvailableCustomers] = useState(sampleCustomers)

  // Inside the component, add a useEffect to fetch the customers (simulating API call)
  useEffect(() => {
    // In a real app, you would fetch customers from an API
    const fetchCustomers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300))
        setAvailableCustomers(sampleCustomers)
      } catch (error) {
        console.error("Error fetching customers:", error)
      }
    }

    fetchCustomers()
  }, [])

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: "", weight: 0, rate: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.weight * item.rate) / 1000, 0)
  }

  const calculateIGST = () => {
    return calculateSubtotal() * 0.015 // 1.5% IGST
  }

  const calculateCGST = () => {
    return calculateSubtotal() * 0.015 // 1.5% CGST
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIGST() + calculateCGST()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const invoiceData = {
      id: invoiceNumber,
      customerName,
      customerMobile,
      customerAddress,
      issueDate: format(issueDate, "yyyy-MM-dd"),
      items,
      subtotal: calculateSubtotal(),
      igst: calculateIGST(),
      cgst: calculateCGST(),
      total: calculateTotal(),
      notes,
      paymentTerms,
      status: "unpaid",
    }

    onCreateInvoice(invoiceData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input
                  id="invoice-number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer-name">Customer Name</Label>
                <Select value={customerName} onValueChange={setCustomerName} required>
                  <SelectTrigger id="customer-name">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.name}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="customer-mobile">Customer Mobile</Label>
                <Input
                  id="customer-mobile"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="Customer mobile number"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="issue-date">Issue Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {issueDate ? format(issueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={issueDate}
                      onSelect={(date) => date && setIssueDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="customer-address">Customer Address</Label>
                <Textarea
                  id="customer-address"
                  placeholder="Enter customer address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="h-[104px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Invoice Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <Label htmlFor={`item-desc-${index}`} className="sr-only">
                      Item Description
                    </Label>
                    <Input
                      id={`item-desc-${index}`}
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`item-weight-${index}`} className="sr-only">
                      Weight (in Grams)
                    </Label>
                    <Input
                      id={`item-weight-${index}`}
                      type="number"
                      placeholder="Weight (g)"
                      min="0"
                      value={item.weight}
                      onChange={(e) => updateItem(item.id, "weight", Number.parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor={`item-rate-${index}`} className="sr-only">
                      Rate
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                      <Input
                        id={`item-rate-${index}`}
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="pl-7"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">₹{((item.weight * item.rate) / 1000).toFixed(2)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end space-y-2">
                <div className="w-1/2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IGST (1.5%):</span>
                    <span>₹{calculateIGST().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST (1.5%):</span>
                    <span>₹{calculateCGST().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or payment instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-32"
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger id="payment-terms">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                    <SelectItem value="7">Net 7 Days</SelectItem>
                    <SelectItem value="15">Net 15 Days</SelectItem>
                    <SelectItem value="30">Net 30 Days</SelectItem>
                    <SelectItem value="60">Net 60 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Print Invoice</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

