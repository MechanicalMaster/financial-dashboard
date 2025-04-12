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
import { CalendarIcon, Plus, Trash2, ArrowLeft, Printer } from "lucide-react"
import { format } from "date-fns"
import { getPath } from "@/lib/utils/path-utils"
import { useDB } from "@/contexts/db-context"
import { useSettings } from "@/contexts/settings-context"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
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

export default function CreateInvoicePage() {
  const router = useRouter()
  const { add, getMastersByType, getAll } = useDB()
  const { settings } = useSettings()
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
  )
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
  const [purities, setPurities] = useState<{id?: string, value: string}[]>([])
  const [paymentMethods, setPaymentMethods] = useState<{id?: string, value: string}[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)

  // Find the selected customer's full details
  const selectedCustomer = availableCustomers.find(c => c.name === customerName)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customers = await getAll('customers')
        setAvailableCustomers(customers || [])
      } catch (error) {
        console.error("Error fetching customers:", error)
        setAvailableCustomers([])
      }
    }

    const fetchPurities = async () => {
      try {
        const purityData = await getMastersByType('purity')
        if (purityData && purityData.length > 0) {
          setPurities(purityData)
        } else {
          // Fallback purity options if no masters data
          setPurities([
            { value: "916" },
            { value: "750" },
            { value: "925" },
            { value: "850" },
            { value: "825" },
            { value: "OTH" }
          ])
        }
      } catch (error) {
        console.error("Error fetching purities:", error)
        // Fallback purity options
        setPurities([
          { value: "916" },
          { value: "750" },
          { value: "925" },
          { value: "850" },
          { value: "825" },
          { value: "OTH" }
        ])
      }
    }
    
    const fetchPaymentMethods = async () => {
      try {
        const paymentMethodData = await getMastersByType('payment_method')
        
        // Log the fetched data to inspect for duplicates
        console.log("Fetched Payment Methods from DB:", paymentMethodData)
        
        if (paymentMethodData && paymentMethodData.length > 0) {
          setPaymentMethods(paymentMethodData)
          // Set default payment method if available
          if (paymentMethodData.length > 0) {
            const defaultMethod = paymentMethodData.find(m => 
              m.value.toLowerCase().includes("net 30")
            ) || paymentMethodData[0]
            setPaymentMethod(defaultMethod.value)
          }
        } else {
          // Fallback payment methods
          const defaultMethods = [
            { value: "Due on Receipt" },
            { value: "Net 15" },
            { value: "Net 30" },
            { value: "Net 45" },
            { value: "Net 60" },
          ]
          setPaymentMethods(defaultMethods)
          setPaymentMethod("Net 30")
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error)
        // Fallback payment methods
        const defaultMethods = [
          { value: "Due on Receipt" },
          { value: "Net 15" },
          { value: "Net 30" },
          { value: "Net 45" },
          { value: "Net 60" },
        ]
        setPaymentMethods(defaultMethods)
        setPaymentMethod("Net 30")
      }
    }

    fetchCustomers()
    fetchPurities()
    fetchPaymentMethods()
  }, [getMastersByType, getAll])

  // When customer is selected, auto-fill their mobile and address
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerMobile(selectedCustomer.phone)
      setCustomerAddress(selectedCustomer.address)
    }
  }, [selectedCustomer])

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
        const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        
        // If updating grossWeight, also set netWeight to the same value as a convenience
        if (field === 'grossWeight') {
          return { ...item, [field]: numericValue, netWeight: numericValue };
        }
        
        return { ...item, [field]: field === 'description' || field === 'purity' ? value : numericValue };
      }
      return item;
    }));
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
    
    return "30" // Default to Net 30
  }

  // Save invoice data to database
  const saveInvoice = async () => {
    if (!customerName) {
      toast.error("Please select a customer")
      return null
    }

    if (items.some(item => !item.description || item.netWeight <= 0 || item.rate <= 0 || !item.purity)) {
      toast.error("Please fill in all item details")
      return null
    }

    try {
      const subtotal = calculateSubtotal();
      const igst = calculateIGST();
      const cgst = calculateCGST();
      const total = calculateTotal();
      
      // Extract payment terms days from payment method
      const paymentTerms = extractPaymentTerms(paymentMethod)
      
      const invoiceData = {
        id: invoiceNumber,
        customerId: selectedCustomer?.id || "UNKNOWN",
        customerName,
        customerMobile,
        customerAddress,
        type: 'invoice' as const,
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
        status: 'unpaid' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Add to database
      await add('invoices', invoiceData)
      toast.success("Invoice saved successfully")
      return invoiceData
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast.error("Failed to save invoice")
      return null
    }
  }

  // Generate PDF invoice
  const generatePDF = async (invoiceData: any) => {
    try {
      const doc = new jsPDF()
      
      // Check which template is active, with fallback to default
      const activeTemplateId = settings?.invoiceTemplates?.activeTemplate || "default";
      
      if (activeTemplateId === "jeweller") {
        return generateJewellerTemplate(doc, invoiceData);
      } else {
        // Default template
        return generateDefaultTemplate(doc, invoiceData);
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      return false
    }
  }
  
  // Default template generation
  const generateDefaultTemplate = (doc: any, invoiceData: any) => {
    try {
      // Add company logo/header
      doc.setFontSize(20)
      doc.setTextColor(150, 75, 0) // Amber-like color
      doc.text("KUBER", 105, 20, { align: "center" } as any)
      
      // Add invoice title
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text("INVOICE", 105, 30, { align: "center" } as any)
      
      // Add invoice details
      doc.setFontSize(10)
      doc.text(`Invoice No: ${invoiceData.id}`, 14, 45)
      doc.text(`Date: ${format(invoiceData.date, "dd/MM/yyyy")}`, 14, 50)
      doc.text(`Due Date: ${format(invoiceData.dueDate, "dd/MM/yyyy")}`, 14, 55)
      
      // Add customer details
      doc.text("Bill To:", 14, 65)
      doc.setFontSize(12)
      doc.text(invoiceData.customerName, 14, 70)
      doc.setFontSize(10)
      doc.text(invoiceData.customerMobile, 14, 75)
      
      // Format address with line breaks
      const addressLines = invoiceData.customerAddress.split(", ")
      addressLines.forEach((line: string, index: number) => {
        doc.text(line, 14, 80 + (index * 5))
      })
      
      // Add item table
      const tableColumn = ["Item Name", "Gross Wt (gm)", "Net Wt (gm)", "Purity", "Rate", "Total"]
      const tableRows = invoiceData.items.map((item: any) => [
        item.description,
        item.grossWeight.toString(),
        item.netWeight.toString(),
        item.purity,
        `₹${item.rate.toFixed(2)}`,
        `₹${item.amount.toFixed(2)}`
      ])
      
      // Use autoTable plugin directly
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 100,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [210, 120, 20] }, // Amber-like color
        columnStyles: {
          0: { cellWidth: 60 },  // Item Name
          1: { cellWidth: 20, halign: 'center' },  // Gross Wt
          2: { cellWidth: 20, halign: 'center' },  // Net Wt
          3: { cellWidth: 15, halign: 'center' },  // Purity
          4: { cellWidth: 25, halign: 'right' },   // Rate
          5: { cellWidth: 25, halign: 'right' }    // Total
        }
      })
      
      // Add invoice totals
      const finalY = (doc as any).lastAutoTable.finalY || 150
      
      doc.text(`Subtotal:`, 140, finalY + 10)
      doc.text(`₹${invoiceData.subtotal.toFixed(2)}`, 175, finalY + 10, { align: "right" } as any)
      
      doc.text(`IGST (1.5%):`, 140, finalY + 15)
      doc.text(`₹${invoiceData.igst.toFixed(2)}`, 175, finalY + 15, { align: "right" } as any)
      
      doc.text(`CGST (1.5%):`, 140, finalY + 20)
      doc.text(`₹${invoiceData.cgst.toFixed(2)}`, 175, finalY + 20, { align: "right" } as any)
      
      doc.text(`Total:`, 140, finalY + 25)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`₹${invoiceData.amount.toFixed(2)}`, 175, finalY + 25, { align: "right" } as any)
      
      // Add notes if any
      if (invoiceData.notes) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text("Notes:", 14, finalY + 35)
        doc.text(invoiceData.notes, 14, finalY + 40)
      }
      
      // Add terms
      doc.setFontSize(10)
      doc.text(`Payment Terms: Net ${invoiceData.paymentTerms} days`, 14, finalY + 55)
      
      // Add footer
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Thank you for your business!', 105, 270, { align: 'center' } as any)
      
      // Save the PDF
      doc.save(`Invoice_${invoiceData.id}.pdf`)
      
      return true
    } catch (error) {
      console.error("Error generating default template:", error)
      return false
    }
  }
  
  // Jeweller template generation (based on the image provided)
  const generateJewellerTemplate = (doc: any, invoiceData: any) => {
    try {
      // Set up basic document settings
      doc.setFontSize(10);
      
      // Create full border around entire page
      doc.rect(10, 10, 190, 275);
      
      // Header section
      doc.setFontSize(8);
      doc.text(`GSTIN#: ${settings?.firmDetails?.gstInNumber || "GST123456789"}`, 15, 15);
      doc.text(`Tax Invoice`, 105, 15, { align: "center" } as any);
      doc.text(`Original/Recipient`, 185, 15, { align: "right" } as any);
      
      // Main header with company name
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(settings?.firmDetails?.firmName || "Kuber", 105, 30, { align: "center" } as any);
      
      // Company details
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const address = settings?.firmDetails?.address || "123 Business Street, Suite 101, Cityville, State 12345";
      doc.text(address, 105, 35, { align: "center" } as any);
      doc.text(`Phone No: ${settings?.firmDetails?.phoneNumber || "99888888"} Email Id: ${settings?.firmDetails?.email || "kuber@example.com"}`, 105, 40, { align: "center" } as any);
      doc.text(`Website: ${settings?.firmDetails?.website || "www.kuber.com"}`, 105, 45, { align: "center" } as any);
      
      // Draw line under header
      doc.line(10, 50, 200, 50);
      
      // Customer details section (left side)
      doc.setFontSize(9);
      doc.text(`Customer Name: ${invoiceData.customerName}`, 20, 65);
      doc.text(`${invoiceData.customerAddress}`, 20, 70);
      doc.text(`Mobile: ${invoiceData.customerMobile}`, 20, 80);
      
      // Invoice details (right side)
      doc.text(`Date:`, 130, 65);
      doc.text(`${format(invoiceData.date, "MMM dd, yyyy")}`, 185, 65, { align: "right" } as any);
      
      doc.text(`Invoice No:`, 130, 70);
      doc.text(`${invoiceData.id}`, 185, 70, { align: "right" } as any);
      
      doc.text(`Payment Mode:`, 130, 75);
      doc.text("CASH", 185, 75, { align: "right" } as any);
      
      // Notes section
      doc.text("Notes:", 20, 95);
      if (invoiceData.notes) {
        doc.text(invoiceData.notes, 20, 100);
      }
      
      // Table header
      const startY = 110;
      doc.setFillColor(240, 240, 240);
      doc.rect(15, startY, 180, 10, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text("Sr.No.", 20, startY + 7);
      doc.text("Item Name", 45, startY + 7);
      doc.text("Qty.", 95, startY + 7);
      doc.text("Gross Wt. (gm)", 110, startY + 7);
      doc.text("Net Wt. (gm)", 140, startY + 7);
      doc.text("Purity", 165, startY + 7);
      doc.text("Rate", 178, startY + 7);
      doc.text("Amount", 193, startY + 7, { align: "right" } as any);
      
      // Table content - Items
      doc.setFont('helvetica', 'normal');
      let y = startY + 20;
      
      invoiceData.items.forEach((item: any, index: number) => {
        doc.text((index + 1).toString(), 20, y);
        doc.text(item.description, 45, y);
        doc.text("1", 95, y); // Fixed quantity
        doc.text(item.grossWeight.toString(), 115, y);
        doc.text(item.netWeight.toString(), 145, y);
        doc.text(item.purity, 165, y);
        
        // Format currency values to ensure consistent spacing
        const formattedRate = `₹${parseFloat(item.rate).toFixed(2)}`;
        const formattedAmount = `₹${parseFloat(item.amount).toFixed(2)}`;
        
        doc.text(formattedRate, 178, y);
        doc.text(formattedAmount, 193, y, { align: "right" } as any);
        
        y += 15;
      });
      
      // Add a line at the bottom
      const bottomLineY = Math.max(y + 20, 220);
      doc.line(10, bottomLineY, 200, bottomLineY);
      
      // Totals section
      const finalY = bottomLineY + 10;
      
      // GST calculations
      doc.setFontSize(9);
      doc.text("CGST %: 1.5", 15, finalY);
      doc.text(`Total CGST Amt.: ₹${parseFloat(invoiceData.cgst).toFixed(2)}`, 70, finalY);
      
      doc.text("SGST %: 1.5", 15, finalY + 5);
      doc.text(`Total SGST Amt.: ₹${parseFloat(invoiceData.igst).toFixed(2)}`, 70, finalY + 5);
      
      doc.text(`Total GST Tax: ₹${parseFloat(invoiceData.cgst + invoiceData.igst).toFixed(2)}`, 70, finalY + 10);
      
      // Final amounts
      doc.text(`Total Amt. Before Tax:`, 140, finalY);
      doc.text(`₹${parseFloat(invoiceData.subtotal).toFixed(2)}`, 193, finalY, { align: "right" } as any);
      
      doc.text(`Additional Discount:`, 140, finalY + 5);
      doc.text(`₹0.00`, 193, finalY + 5, { align: "right" } as any);
      
      doc.text(`Total Amt. After Tax:`, 140, finalY + 10);
      doc.text(`₹${parseFloat(invoiceData.amount).toFixed(2)}`, 193, finalY + 10, { align: "right" } as any);
      
      // Amount in words
      doc.setFont('helvetica', 'bold');
      doc.text("Amount in Word:", 15, finalY + 20);
      doc.setFont('helvetica', 'normal');
      
      // Convert amount to words function
      const numberToWords = (num: number) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
          'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        const convertLessThanOneThousand = (num: number) => {
          if (num === 0) return '';
          if (num < 20) return ones[num];
          
          const ten = Math.floor(num / 10) % 10;
          const one = num % 10;
          
          return (ten > 0 ? tens[ten] + (one > 0 ? ' ' + ones[one] : '') : ones[one]);
        };
        
        if (num === 0) return 'Zero';
        
        const roundedNum = Math.round(num);
        let rupeesRemaining = Math.floor(roundedNum);
        const paise = Math.round((num - rupeesRemaining) * 100);
        
        let result = '';
        
        if (rupeesRemaining >= 10000000) {
          result += convertLessThanOneThousand(Math.floor(rupeesRemaining / 10000000)) + ' Crore ';
          rupeesRemaining %= 10000000;
        }
        
        if (rupeesRemaining >= 100000) {
          result += convertLessThanOneThousand(Math.floor(rupeesRemaining / 100000)) + ' Lakh ';
          rupeesRemaining %= 100000;
        }
        
        if (rupeesRemaining >= 1000) {
          result += convertLessThanOneThousand(Math.floor(rupeesRemaining / 1000)) + ' Thousand ';
          rupeesRemaining %= 1000;
        }
        
        if (rupeesRemaining >= 100) {
          result += convertLessThanOneThousand(Math.floor(rupeesRemaining / 100)) + ' Hundred ';
          rupeesRemaining %= 100;
        }
        
        if (rupeesRemaining > 0) {
          result += convertLessThanOneThousand(rupeesRemaining);
        }
        
        result = result.trim() + ' Rupees';
        
        if (paise > 0) {
          result += ' and ' + convertLessThanOneThousand(paise) + ' Paise';
        }
        
        return result + ' Only';
      };
      
      const amountInWords = numberToWords(invoiceData.amount);
      doc.text(amountInWords, 55, finalY + 20);
      
      // Signature sections
      doc.text("Customer Signature", 50, finalY + 35, { align: "center" } as any);
      doc.text(`For ${settings?.firmDetails?.firmName || "Kuber"}`, 150, finalY + 35, { align: "center" } as any);
      
      // Final thank you note
      doc.text("Thank You ! Visit Again.", 105, finalY + 45, { align: "center" } as any);
      
      // Save the PDF
      doc.save(`Invoice_${invoiceData.id}.pdf`);
      
      return true;
    } catch (error) {
      console.error("Error generating jeweller template:", error);
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const invoiceData = await saveInvoice()
      if (invoiceData) {
        router.push(getPath("/invoices"))
      }
    } catch (error) {
      console.error("Error handling form submission:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrintInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPrinting(true)
    
    try {
      // First, save the invoice to the database
      const invoiceData = await saveInvoice()
      if (invoiceData) {
        // Generate the PDF only if the invoice was saved successfully
        const pdfSuccess = await generatePDF(invoiceData)
        if (pdfSuccess) {
          toast.success("Invoice saved and printed successfully")
          // Redirect to the invoices page to see the newly created invoice
          router.push(getPath("/invoices"))
        } else {
          toast.error("Invoice saved but failed to print")
          // Still redirect if the invoice was saved but PDF generation failed
          router.push(getPath("/invoices"))
        }
      }
    } catch (error) {
      console.error("Error printing invoice:", error)
      toast.error("Failed to save and print invoice")
    } finally {
      setIsPrinting(false)
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

  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(getPath("/sales"))}
            className="hover:bg-amber-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-amber-900">Create New Invoice</h1>
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

          {/* Responsive Invoice Items Section */}
          <div className="space-y-4">
            {/* Column Labels - Hidden on mobile, shown on md and up */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-4 text-sm font-medium text-gray-700">
              <div className="md:col-span-3">Item Name</div>
              <div className="md:col-span-1 text-center">Gross Wt</div>
              <div className="md:col-span-1 text-center">Net Wt</div>
              <div className="md:col-span-1 text-center">Purity</div>
              <div className="md:col-span-2 text-center">Rate</div>
              <div className="md:col-span-3 text-right pr-3">Total</div>
              <div className="md:col-span-1"></div> { /* Spacer for delete button */}
            </div>
            
            {items.map((item, index) => (
              <div key={item.id} className="border rounded-md p-4 md:p-0 md:border-none md:grid md:grid-cols-12 md:gap-4 md:items-center space-y-2 md:space-y-0">
                {/* Item Name */}
                <div className="md:col-span-3 space-y-1 md:space-y-0">
                  <Label htmlFor={`item-desc-${index}`} className="text-xs font-medium md:hidden">
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
                
                {/* Mobile layout for weights, purity, rate */}
                <div className="grid grid-cols-2 gap-4 md:col-span-5 md:grid-cols-5">
                  {/* Gross Wt */}
                  <div className="space-y-1 md:space-y-0">
                    <Label htmlFor={`item-gross-weight-${index}`} className="text-xs font-medium md:hidden">
                      Gross Wt (g)
                    </Label>
                    <Input
                      id={`item-gross-weight-${index}`}
                      type="number"
                      placeholder="Gross Wt"
                      value={item.grossWeight}
                      onChange={(e) => updateItem(item.id, "grossWeight", parseFloat(e.target.value) || 0)}
                      required
                      className="text-center"
                    />
                  </div>
                  {/* Net Wt */}
                  <div className="space-y-1 md:space-y-0">
                    <Label htmlFor={`item-net-weight-${index}`} className="text-xs font-medium md:hidden">
                      Net Wt (g)
                    </Label>
                    <Input
                      id={`item-net-weight-${index}`}
                      type="number"
                      placeholder="Net Wt"
                      value={item.netWeight}
                      onChange={(e) => updateItem(item.id, "netWeight", parseFloat(e.target.value) || 0)}
                      required
                      className="text-center"
                    />
                  </div>
                  {/* Purity */}
                  <div className="space-y-1 md:space-y-0">
                    <Label htmlFor={`item-purity-${index}`} className="text-xs font-medium md:hidden">
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
                  {/* Rate - takes 2 columns on mobile grid, 2 on md grid */}
                  <div className="space-y-1 md:space-y-0 md:col-span-2">
                    <Label htmlFor={`item-rate-${index}`} className="text-xs font-medium md:hidden">
                      Rate
                    </Label>
                    <Input
                      id={`item-rate-${index}`}
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                      required
                      className="text-center"
                    />
                  </div>
                </div>
                
                {/* Total Amount & Delete Button */}
                <div className="md:col-span-4 flex items-center justify-between md:justify-end space-x-2">
                  <div className="flex flex-col items-start md:items-end md:col-span-3">
                    <Label className="text-xs font-medium md:hidden">
                      Amount
                    </Label>
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted text-right w-full md:w-auto">
                      ₹{(item.netWeight * item.rate).toFixed(2)}
                    </div>
                  </div>
                  <div className="md:col-span-1 flex justify-center pt-4 md:pt-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Remove Item</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push(getPath("/sales"))}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="border-amber-600 text-amber-600 hover:bg-amber-50"
            onClick={handlePrintInvoice}
            disabled={isPrinting}
          >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? "Printing..." : "Print Invoice"}
          </Button>
          <Button 
            type="submit" 
            className="bg-amber-600 hover:bg-amber-700"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Create Invoice"}
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