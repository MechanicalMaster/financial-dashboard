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
import { getPath } from "@/lib/utils/path-utils"
import { useDB } from "@/contexts/db-context"
import { useSettings } from "@/contexts/settings-context"
import { toast } from "sonner"
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog"

interface InvoiceItem {
  id: string
  description: string
  grossWeight: number
  netWeight: number
  purity: string
  rate: number
}

// Generate UUID function for compatibility across browsers
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const invoiceId = params.id
  const router = useRouter()
  const { get, update, getMastersByType, getAll } = useDB()
  const { settings } = useSettings()
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerMobile, setCustomerMobile] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [issueDate, setIssueDate] = useState<Date>(new Date())
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateUUID(), description: "", grossWeight: 0, netWeight: 0, purity: "", rate: 0 },
  ])
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [availableCustomers, setAvailableCustomers] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<{id?: string, value: string}[]>([])
  const [purities, setPurities] = useState<{id?: string, value: string}[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [originalInvoice, setOriginalInvoice] = useState<any>(null)

  // Find the selected customer's full details
  const selectedCustomer = availableCustomers.find(c => c.name === customerName)

  // Load invoice data and masters
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch invoice by ID
        const invoice = await get('invoices', invoiceId)
        if (!invoice) {
          toast.error("Invoice not found")
          router.push(getPath("/invoices"))
          return
        }
        
        setOriginalInvoice(invoice)
        
        // Set invoice details
        setInvoiceNumber(invoice.id)
        setCustomerName(invoice.customerName || "")
        setCustomerMobile(invoice.customerMobile || "")
        setCustomerAddress(invoice.customerAddress || "")
        
        // Set date
        if (invoice.date) {
          setIssueDate(invoice.date instanceof Date 
            ? invoice.date
            : new Date(invoice.date))
        }
        
        // Set items
        if (invoice.items && Array.isArray(invoice.items)) {
          const mappedItems = invoice.items.map((item: any) => ({
            id: generateUUID(),
            description: item.description || "",
            grossWeight: item.grossWeight || 0,
            netWeight: item.netWeight || 0,
            purity: item.purity || "",
            rate: item.rate || 0
          }))
          
          setItems(mappedItems.length > 0 ? mappedItems : [
            { id: generateUUID(), description: "", grossWeight: 0, netWeight: 0, purity: "", rate: 0 }
          ])
        }
        
        // Set other fields
        setNotes(invoice.notes || "")
        setPaymentMethod(invoice.paymentMethod || "")
        
        // Fetch payment methods
        const paymentMethodData = await getMastersByType('payment_method')
        if (paymentMethodData && paymentMethodData.length > 0) {
          setPaymentMethods(paymentMethodData)
          // If no payment method is set but there's paymentTerms, try to find a matching one
          if (!invoice.paymentMethod && invoice.paymentTerms) {
            const termDays = invoice.paymentTerms.toString()
            const matchingMethod = paymentMethodData.find(method => 
              method.value.toLowerCase().includes(`net ${termDays}`) || 
              (termDays === "0" && method.value.toLowerCase().includes("receipt"))
            )
            if (matchingMethod) {
              setPaymentMethod(matchingMethod.value)
            }
          }
        } else {
          // Default payment methods
          setPaymentMethods([
            { value: "Due on Receipt" },
            { value: "Net 15" },
            { value: "Net 30" },
            { value: "Net 45" },
            { value: "Net 60" },
          ])
        }
        
        // Fetch purities
        const purityData = await getMastersByType('purity')
        if (purityData && purityData.length > 0) {
          setPurities(purityData)
        } else {
          // Fallback options
          setPurities([
            { value: "916" },
            { value: "750" },
            { value: "925" },
            { value: "850" },
            { value: "825" },
            { value: "OTH" }
          ])
        }
        
        // Fetch customers
        const customers = await getAll('customers')
        setAvailableCustomers(customers || [])
      } catch (error) {
        console.error("Error loading invoice data:", error)
        toast.error("Failed to load invoice data")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [invoiceId, get, getMastersByType, getAll, router])

  const addItem = () => {
    setItems([...items, { id: generateUUID(), description: "", grossWeight: 0, netWeight: 0, purity: "", rate: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        // Convert value to number if necessary
        const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
        
        // If updating grossWeight, also set netWeight to the same value as a convenience
        if (field === 'grossWeight') {
          return { ...item, [field]: numericValue, netWeight: numericValue }
        }
        
        return { ...item, [field]: field === 'description' || field === 'purity' ? value : numericValue }
      }
      return item
    }))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.netWeight * item.rate), 0)
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

  // Extract payment terms from payment method
  const extractPaymentTerms = (method: string): string => {
    if (!method) return "0"
    
    if (method.toLowerCase().includes("receipt")) return "0"
    
    // Try to extract number from strings like "Net 30"
    const match = method.match(/Net\s+(\d+)/i)
    if (match && match[1]) {
      return match[1]
    }
    
    return "0" // Default to due on receipt
  }

  // Update invoice data in database
  const saveInvoice = async () => {
    if (!customerName) {
      toast.error("Please select a customer")
      return false
    }

    if (items.some(item => !item.description || item.netWeight <= 0 || item.rate <= 0 || !item.purity)) {
      toast.error("Please fill in all item details")
      return false
    }

    try {
      const subtotal = calculateSubtotal()
      const igst = calculateIGST()
      const cgst = calculateCGST()
      const total = calculateTotal()
      
      // Extract payment terms days from payment method
      const paymentTerms = extractPaymentTerms(paymentMethod)
      
      const invoiceData = {
        ...originalInvoice,
        customerId: selectedCustomer?.id || originalInvoice.customerId || "UNKNOWN",
        customerName,
        customerMobile,
        customerAddress,
        date: issueDate,
        dueDate: new Date(issueDate.getTime() + parseInt(paymentTerms) * 24 * 60 * 60 * 1000),
        items: items.map(item => ({
          description: item.description,
          grossWeight: item.grossWeight,
          netWeight: item.netWeight,
          purity: item.purity,
          rate: item.rate,
          amount: item.netWeight * item.rate
        })),
        notes,
        paymentMethod,
        paymentTerms,
        subtotal,
        igst,
        cgst,
        amount: total,
        updatedAt: new Date()
      }

      // Update in database
      await update('invoices', invoiceId, invoiceData)
      toast.success("Invoice updated successfully")
      return true
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast.error("Failed to update invoice")
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const success = await saveInvoice()
      if (success) {
        router.push(getPath("/invoices"))
      }
    } catch (error) {
      console.error("Error handling form submission:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle when a new customer is added via dialog
  const handleCustomerAdded = (newCustomer: any) => {
    // Add to available customers list
    setAvailableCustomers(prev => [...prev, newCustomer])
    
    // Auto-select the new customer
    setCustomerName(newCustomer.name)
    setCustomerMobile(newCustomer.phone)
    setCustomerAddress(newCustomer.address)
    
    toast.success(`Customer "${newCustomer.name}" added and selected`)
  }

  // Handle customer selection change
  const handleCustomerChange = (value: string) => {
    if (value === "new-customer") {
      setIsAddCustomerOpen(true)
    } else {
      setCustomerName(value)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center h-screen">
        <p>Loading invoice data...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(getPath("/invoices"))}
            className="hover:bg-amber-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-amber-900">Edit Invoice #{invoiceNumber}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input
                id="invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                disabled
                required
              />
            </div>

            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Select value={customerName} onValueChange={handleCustomerChange} required>
                <SelectTrigger id="customer-name">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-customer" className="text-primary font-medium">
                    + New Customer
                  </SelectItem>
                  <div className="h-px bg-muted my-1" />
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
                pattern="[0-9]{10}"
                maxLength={10}
                inputMode="numeric"
                title="Please enter exactly 10 digits"
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
            {/* Column Labels */}
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-3">Item Name</div>
              <div className="col-span-1 text-center">Gross Wt</div>
              <div className="col-span-1 text-center">Net Wt</div>
              <div className="col-span-1 text-center">Purity</div>
              <div className="col-span-2 text-center">Rate</div>
              <div className="col-span-3 text-right pr-3">Total</div>
              <div className="col-span-1"></div>
            </div>
            
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <Label htmlFor={`item-desc-${index}`} className="sr-only">
                    Item Name
                  </Label>
                  <Input
                    id={`item-desc-${index}`}
                    placeholder="Item name"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor={`item-gross-weight-${index}`} className="sr-only">
                    Gross Weight (g)
                  </Label>
                  <Input
                    id={`item-gross-weight-${index}`}
                    type="number"
                    placeholder="Gross Wt"
                    value={item.grossWeight}
                    onChange={(e) => updateItem(item.id, "grossWeight", parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor={`item-net-weight-${index}`} className="sr-only">
                    Net Weight (g)
                  </Label>
                  <Input
                    id={`item-net-weight-${index}`}
                    type="number"
                    placeholder="Net Wt"
                    value={item.netWeight}
                    onChange={(e) => updateItem(item.id, "netWeight", parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor={`item-purity-${index}`} className="sr-only">
                    Purity
                  </Label>
                  <Select
                    value={item.purity}
                    onValueChange={(value) => updateItem(item.id, "purity", value)}
                  >
                    <SelectTrigger id={`item-purity-${index}`}>
                      <SelectValue placeholder="Purity" />
                    </SelectTrigger>
                    <SelectContent>
                      {purities.map((purity) => (
                        <SelectItem key={purity.id || purity.value} value={purity.value}>
                          {purity.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`item-rate-${index}`} className="sr-only">
                    Rate
                  </Label>
                  <Input
                    id={`item-rate-${index}`}
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="col-span-3">
                  <Label className="sr-only">Amount</Label>
                  <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-right">
                    ₹{(item.netWeight * item.rate).toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
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
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id || method.value} value={method.value}>
                        {method.value}
                      </SelectItem>
                    ))}
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
          <Button type="button" variant="outline" onClick={() => router.push(getPath("/invoices"))}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-amber-600 hover:bg-amber-700"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Update Invoice"}
          </Button>
        </div>
      </form>
      
      {/* Add Customer Dialog */}
      <AddCustomerDialog 
        open={isAddCustomerOpen} 
        onOpenChange={(open) => {
          setIsAddCustomerOpen(open)
          if (!open && customerName === "new-customer") {
            // Reset customer selection if dialog is closed without adding
            setCustomerName("")
          }
        }}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  )
} 