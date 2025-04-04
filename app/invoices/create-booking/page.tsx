"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2, ArrowLeft } from "lucide-react"
import { format } from "date-fns"

interface InvoiceItem {
  id: string
  description: string
  weight: number
  rate: number
}

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

export default function CreateBookingInvoicePage() {
  const router = useRouter()
  const [invoiceNumber, setInvoiceNumber] = useState(
    `BKG-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
  )
  const [customerName, setCustomerName] = useState("")
  const [customerMobile, setCustomerMobile] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [bookingDate, setBookingDate] = useState<Date>(new Date())
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: "", weight: 0, rate: 0 },
  ])
  const [notes, setNotes] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("30")
  const [availableCustomers, setAvailableCustomers] = useState(sampleCustomers)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const invoiceData = {
      id: invoiceNumber,
      customerName,
      customerMobile,
      customerAddress,
      bookingDate: format(bookingDate, "yyyy-MM-dd"),
      items,
      subtotal: calculateSubtotal(),
      igst: calculateIGST(),
      cgst: calculateCGST(),
      total: calculateTotal(),
      notes,
      paymentTerms,
      status: "booking",
    }

    // Here you would typically save the invoice data
    console.log("Creating booking invoice:", invoiceData)
    
    // Navigate back to invoices list
    router.push("/invoices")
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/invoices")}
            className="hover:bg-amber-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-amber-900">Create Booking Invoice</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoice-number">Booking Number</Label>
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
              <Label htmlFor="booking-date">Booking Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={bookingDate}
                    onSelect={(date) => date && setBookingDate(date)}
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
                    Weight (g)
                  </Label>
                  <Input
                    id={`item-weight-${index}`}
                    type="number"
                    placeholder="Weight (g)"
                    value={item.weight}
                    onChange={(e) => updateItem(item.id, "weight", parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`item-rate-${index}`} className="sr-only">
                    Rate (per kg)
                  </Label>
                  <Input
                    id={`item-rate-${index}`}
                    type="number"
                    placeholder="Rate (per kg)"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label className="sr-only">Amount</Label>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-right">
                    ₹{((item.weight * item.rate) / 1000).toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or payment instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger id="payment-terms">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Due on Receipt</SelectItem>
                    <SelectItem value="15">Net 15</SelectItem>
                    <SelectItem value="30">Net 30</SelectItem>
                    <SelectItem value="45">Net 45</SelectItem>
                    <SelectItem value="60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <div className="flex justify-between items-center text-sm">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>IGST (1.5%):</span>
                <span>₹{calculateIGST().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>CGST (1.5%):</span>
                <span>₹{calculateCGST().toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-center font-medium">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/invoices")}>
            Cancel
          </Button>
          <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
            Create Booking Invoice
          </Button>
        </div>
      </form>
    </div>
  )
} 