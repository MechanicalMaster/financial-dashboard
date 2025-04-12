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
import { useDB } from "@/contexts/db-context"
import { MasterDropdown } from "@/components/masters/master-dropdown"
import { Customer, Invoice, BookingInvoice } from "@/lib/db"
import { toast } from "sonner"
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog"

interface InvoiceItem {
  id: string
  description: string
  weight: number
  rate: number
}

interface BookingLineItem {
  id: string
  description: string
  weight: number // Assuming grams
  rate: number // Assuming per kg
}

// Sample data removed

export default function CreateBookingInvoicePage() {
  const router = useRouter()
  const { add, getAll, getMastersByType } = useDB()
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerMobile, setCustomerMobile] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [bookingDate, setBookingDate] = useState<Date>(new Date())
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: "", weight: 0, rate: 0 },
  ])
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentPlan, setPaymentPlan] = useState("")
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([])
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<{id?: string, value: string}[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)

  // Find the selected customer's full details
  const selectedCustomer = availableCustomers.find(c => c.id === customerId)

  useEffect(() => {
    // Auto-generate invoice number
    setInvoiceNumber(`BKG-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`)
    
    const fetchData = async () => {
      try {
        const customers = await getAll<Customer>('customers');
        setAvailableCustomers(customers || []);

        const paymentMethodsData = await getMastersByType('payment_method');
        setAvailablePaymentMethods(paymentMethodsData || []);
        // Set default payment method if available
        if (paymentMethodsData && paymentMethodsData.length > 0) {
          setPaymentMethod(paymentMethodsData[0].value);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load customers or payment methods");
      }
    };

    fetchData();
  }, [getAll, getMastersByType])
  
  // Auto-fill details when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.name || "")
      setCustomerMobile(selectedCustomer.phone || "")
      setCustomerAddress(selectedCustomer.address || "")
    } else {
      setCustomerName("")
      setCustomerMobile("")
      setCustomerAddress("")
    }
  }, [selectedCustomer])

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
    return items.reduce((sum, item) => sum + (item.weight * item.rate) / 1000, 0) // Assuming weight in mg?
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
  
  const handleCustomerAdded = (newCustomer: Customer) => {
    setAvailableCustomers(prev => [...prev, newCustomer]);
    setCustomerId(newCustomer.id || "");
    setIsAddCustomerOpen(false);
    toast.success("New customer added successfully");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (items.some(item => !item.description || item.weight <= 0 || item.rate <= 0)) {
      toast.error("Please fill in all item details (description, weight > 0, rate > 0)");
      return;
    }
    
    setIsSaving(true);

    const subtotal = calculateSubtotal();
    const igst = calculateIGST();
    const cgst = calculateCGST();
    const total = calculateTotal();

    const bookingData: BookingInvoice = {
      id: invoiceNumber,
      customerId: customerId,
      customerName: customerName,
      customerMobile: customerMobile,
      customerAddress: customerAddress,
      bookingDate: bookingDate,
      items: items.map(item => ({ ...item, amount: (item.weight * item.rate) / 1000 })),
      estimatedAmount: total,
      accumulatedAmount: 0,
      notes: notes,
      paymentMethod: paymentMethod,
      paymentPlan: paymentPlan,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await add('bookingInvoices', bookingData);
      console.log("Booking invoice created:", bookingData);
      toast.success("Booking created successfully");
      router.push("/sales?tab=booking-ledger");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSaving(false);
    }
  }

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/sales")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-900">Create Booking Invoice</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button type="button" variant="outline" onClick={() => router.push("/sales")} className="flex-1 sm:flex-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} onClick={handleSubmit} className="flex-1 sm:flex-auto">
            {isSaving ? "Creating..." : "Create Booking Invoice"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoice-number">Booking Number</Label>
              <Input
                id="invoice-number"
                value={invoiceNumber}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="customer-id">Customer</Label>
              <div className="flex gap-2">
                <Select value={customerId} onValueChange={setCustomerId} required>
                  <SelectTrigger id="customer-id">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id!}>
                        {customer.name} ({customer.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddCustomerDialog 
                  open={isAddCustomerOpen} 
                  onOpenChange={setIsAddCustomerOpen}
                  onCustomerAdded={handleCustomerAdded}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customer-mobile">Customer Mobile</Label>
              <Input
                id="customer-mobile"
                value={customerMobile}
                readOnly
                className="bg-muted"
                placeholder="Select a customer to view mobile"
              />
            </div>
          </div>

          {/* Right Column */}
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
                readOnly
                className="bg-muted h-[104px]"
                placeholder="Select a customer to view address"
                value={customerAddress}
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Booking Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 border rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
                  <div className="space-y-1 sm:col-span-3">
                    <Label htmlFor={`item-desc-${index}`}>Item Description</Label>
                    <Input
                      id={`item-desc-${index}`}
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`item-weight-${index}`}>Weight (g)</Label>
                    <Input
                      id={`item-weight-${index}`}
                      type="number"
                      placeholder="Weight"
                      value={item.weight}
                      onChange={(e) => updateItem(item.id, "weight", parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`item-rate-${index}`}>Rate (per kg)</Label>
                    <Input
                      id={`item-rate-${index}`}
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Amount</Label>
                    <Input
                      value={`₹${((item.weight * item.rate) / 1000).toFixed(2)}`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="mt-4 md:mt-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Plan and Notes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <MasterDropdown
                masterType="payment_method"
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                placeholder="Select payment method"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="space-y-4">
             <div>
              <Label htmlFor="payment-plan">Payment Plan</Label>
              <Textarea
                id="payment-plan"
                placeholder="Describe the payment plan for this booking..."
                value={paymentPlan}
                onChange={(e) => setPaymentPlan(e.target.value)}
                rows={9} // Make it taller
              />
            </div>
          </div>
        </div>
        
        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IGST (1.5%)</span>
              <span>₹{calculateIGST().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CGST (1.5%)</span>
              <span>₹{calculateCGST().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
} 