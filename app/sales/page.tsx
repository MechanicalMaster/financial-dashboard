"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Filter, Plus, Search, Calendar, Edit, Pencil } from "lucide-react"
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { Pagination } from "@/components/invoices/pagination"
import { type InvoiceStatus } from "@/components/invoices/invoice-status-badge"
import { BookingLedger, type BookingLine, type BookingPayment } from "@/components/invoices/booking-ledger"
import Link from "next/link"
import { getPath } from "@/lib/utils/path-utils"
import { Invoice as DBInvoice, BookingInvoice, InvoiceStatus as DBInvoiceStatus } from "@/lib/db"
import { useDB } from "@/contexts/db-context"
import { useSettings } from "@/contexts/settings-context"
import { format } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "sonner"
import { InvoiceList } from "@/components/sales/invoice-list"
import { BookingLedgerList } from "@/components/sales/booking-ledger-list"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

// Empty booking ledger data instead of sample data
const bookingLines: BookingLine[] = []

// Extract all booking payments from booking lines
const bookingPayments: BookingPayment[] = bookingLines.flatMap(line => line.payments)

// Remove local type alias for InvoiceStatus
// type InvoiceStatus = "paid" | "unpaid" | "overdue" | "booking"

export default function SalesPage() {
  const { getAll, get } = useDB()
  const { settings } = useSettings()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [invoices, setInvoices] = useState<DBInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({})
  const itemsPerPage = 10
  const [activeTab, setActiveTab] = useState("regular")
  const [bookingLedger, setBookingLedger] = useState<BookingInvoice[]>([])
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)

  // Fetch data for both tabs
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Regular Invoices
      setIsLoadingInvoices(true)
      try {
        const regularInvoices = await getAll<DBInvoice>('invoices')
        // Filter out booking types if they were previously saved here
        setInvoices(regularInvoices.filter(inv => (inv as any).type === 'invoice'))
      } catch (error) {
        console.error("Error fetching regular invoices:", error)
        toast.error("Failed to load regular invoices")
      } finally {
        setIsLoadingInvoices(false)
      }

      // Fetch Booking Ledger Data
      setIsLoadingBookings(true)
      try {
        const bookings = await getAll<BookingInvoice>('bookingInvoices')
        setBookingLedger(bookings)
      } catch (error) {
        console.error("Error fetching booking ledger:", error)
        toast.error("Failed to load booking ledger")
      } finally {
        setIsLoadingBookings(false)
      }
    }

    fetchData()
  }, [getAll])

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (invoice.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)

  // Generate and download invoice PDF
  const handleDownloadInvoice = async (invoice: DBInvoice) => {
    if (!invoice.id) {
        toast.error("Cannot download invoice without ID");
        return;
    }
    const id = invoice.id;
    setIsDownloading(prev => ({ ...prev, [id]: true }));

    try {
      await generatePDF(invoice);
      toast.success(`Invoice ${id} downloaded successfully`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(`Failed to download invoice ${id}`);
    } finally {
      setIsDownloading(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // Default template generation
  const generateDefaultTemplate = async (doc: any, invoiceData: DBInvoice) => {
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
      
      // Format dates
      const invDate = invoiceData.date instanceof Date 
        ? invoiceData.date 
        : new Date(invoiceData.date)
      
      const dueDate = invoiceData.dueDate instanceof Date 
        ? invoiceData.dueDate 
        : invoiceData.dueDate ? new Date(invoiceData.dueDate) : null
      
      doc.text(`Date: ${format(invDate, "dd/MM/yyyy")}`, 14, 50)
      if (dueDate) {
        doc.text(`Due Date: ${format(dueDate, "dd/MM/yyyy")}`, 14, 55)
      }
      
      // Add customer details
      doc.text("Bill To:", 14, 65)
      doc.setFontSize(12)
      doc.text(invoiceData.customerName || "Customer", 14, 70)
      doc.setFontSize(10)
      doc.text(invoiceData.customerMobile || "", 14, 75)
      
      // Format address with line breaks if exists
      if (invoiceData.customerAddress) {
        const addressLines = invoiceData.customerAddress.split(", ")
        addressLines.forEach((line: string, index: number) => {
          doc.text(line, 14, 80 + (index * 5))
        })
      }
      
      // Add item table
      const tableColumn = ["Item Name", "Gross Wt (gm)", "Net Wt (gm)", "Purity", "Rate", "Total"]
      const tableRows = (invoiceData.items || []).map((item: any) => [
        item.description || "",
        item.grossWeight?.toString() || "0",
        item.netWeight?.toString() || "0",
        item.purity || "",
        `₹${(item.rate || 0).toFixed(2)}`,
        `₹${(item.amount || 0).toFixed(2)}`
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
      doc.text(`₹${(invoiceData.subtotal || 0).toFixed(2)}`, 175, finalY + 10, { align: "right" } as any)
      
      doc.text(`IGST (1.5%):`, 140, finalY + 15)
      doc.text(`₹${(invoiceData.igst || 0).toFixed(2)}`, 175, finalY + 15, { align: "right" } as any)
      
      doc.text(`CGST (1.5%):`, 140, finalY + 20)
      doc.text(`₹${(invoiceData.cgst || 0).toFixed(2)}`, 175, finalY + 20, { align: "right" } as any)
      
      doc.text(`Total:`, 140, finalY + 25)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`₹${(invoiceData.amount || 0).toFixed(2)}`, 175, finalY + 25, { align: "right" } as any)
      
      // Add notes if any
      if (invoiceData.notes) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text("Notes:", 14, finalY + 35)
        doc.text(invoiceData.notes, 14, finalY + 40)
      }
      
      // Add payment details
      doc.setFontSize(10)
      doc.text(`Payment Terms: ${invoiceData.paymentTerms ? `Net ${invoiceData.paymentTerms} days` : "Due on receipt"}`, 14, finalY + 55)
      
      // Add footer
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Thank you for your business!', 105, 270, { align: 'center' } as any)
      
      return true
    } catch (error) {
      console.error("Error generating default template:", error)
      return false
    }
  }
  
  // Jeweller template generation
  const generateJewellerTemplate = async (doc: any, invoiceData: DBInvoice) => {
    try {
      // Implementation similar to the one in the create invoice page
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
      const address = settings?.firmDetails?.address || "123 Business Street, Cityville";
      doc.text(address, 105, 35, { align: "center" } as any);
      doc.text(`Phone: ${settings?.firmDetails?.phoneNumber || "9999999999"}`, 105, 40, { align: "center" } as any);
      
      // Format dates
      const invDate = invoiceData.date instanceof Date 
        ? invoiceData.date 
        : new Date(invoiceData.date)
      
      // Customer details and rest of the implementation...
      // Since this is a simplified version, we'll just use the basics
      
      doc.text(`Invoice #: ${invoiceData.id}`, 105, 50, { align: "center" } as any);
      doc.text(`Date: ${format(invDate, "MMM dd, yyyy")}`, 105, 55, { align: "center" } as any);
      
      // Save the PDF
      return true
    } catch (error) {
      console.error("Error generating jeweller template:", error)
      return false
    }
  }

  const generatePDF = async (invoiceData: DBInvoice) => {
    const doc = new jsPDF();
    const activeTemplateId = settings?.invoiceTemplates?.activeTemplate || "default";

    if (activeTemplateId === "jeweller") {
      await generateJewellerTemplate(doc, invoiceData);
    } else {
      await generateDefaultTemplate(doc, invoiceData);
    }
    
    doc.save(`Invoice_${invoiceData.id}.pdf`);
  };

  // Define a helper for formatting dates safely
  const formatDateSafe = (date: Date | undefined): string => {
    try {
      return date ? format(date, 'dd/MM/yyyy') : '-';
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-amber-900">Sales</h1>
          <div className="flex flex-col xs:flex-row w-full sm:w-auto items-stretch sm:items-center gap-2 sm:gap-4">
            <Link href={getPath("/sales/create-booking")} className="w-full sm:w-auto">
              <Button variant="outline" className="hover:bg-amber-50 w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" /> Create Booking
              </Button>
            </Link>
            <Link href={getPath("/sales/create")} className="w-full sm:w-auto">
              <Button className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Create Invoice
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full md:w-auto">
            <TabsTrigger value="regular">Regular Invoices</TabsTrigger>
            <TabsTrigger value="booking-ledger">Booking Ledger</TabsTrigger>
          </TabsList>
          <TabsContent value="regular">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search invoices..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoadingInvoices ? (
              <div className="h-24 flex items-center justify-center">
                <p className="text-center text-muted-foreground">Loading invoices...</p>
              </div>
            ) : (
              <>
                {/* Mobile card view - visible only on small screens */}
                <div className="md:hidden space-y-4">
                  {filteredInvoices.length === 0 ? (
                    <div className="h-24 flex items-center justify-center">
                      <p className="text-center text-muted-foreground">No invoices found.</p>
                    </div>
                  ) : (
                    filteredInvoices
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((invoice) => (
                        <div key={invoice.id || 'unknown'} className="bg-card rounded-lg border border-amber-200 shadow-sm p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{invoice.id || 'Unknown'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDateSafe(invoice.date)}
                              </p>
                            </div>
                            <InvoiceStatusBadge status={invoice.status} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm">
                            <div className="text-muted-foreground">Customer:</div>
                            <div className="font-medium">{invoice.customerName || 'Unknown'}</div>
                            
                            <div className="text-muted-foreground">Due Date:</div>
                            <div className="font-medium">{formatDateSafe(invoice.dueDate)}</div>
                            
                            <div className="text-muted-foreground">Amount:</div>
                            <div className="font-medium">₹{invoice.amount.toFixed(2)}</div>
                          </div>
                          
                          <div className="flex justify-end mt-3 gap-2">
                            <Link href={getPath(`/sales/edit/${invoice.id || 'unknown'}`)}>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownloadInvoice(invoice)}
                              disabled={isDownloading[invoice.id || '']}
                            >
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Desktop view (table layout) - hidden on small screens */}
                <div className="hidden md:block rounded-lg border border-amber-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No invoices found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((invoice) => (
                            <TableRow key={invoice.id || 'unknown'}>
                              <TableCell>{invoice.id || 'Unknown'}</TableCell>
                              <TableCell>{formatDateSafe(invoice.date)}</TableCell>
                              <TableCell>{formatDateSafe(invoice.dueDate)}</TableCell>
                              <TableCell>{invoice.customerName || 'Unknown'}</TableCell>
                              <TableCell className="text-right">₹{invoice.amount.toFixed(2)}</TableCell>
                              <TableCell>
                                <InvoiceStatusBadge status={invoice.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-1">
                                  <Link href={getPath(`/sales/edit/${invoice.id || 'unknown'}`)}>
                                    <Button variant="ghost" size="icon">
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                  </Link>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleDownloadInvoice(invoice)}
                                    disabled={isDownloading[invoice.id || '']}
                                  >
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Download</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              </>
            )}
          </TabsContent>
          <TabsContent value="booking-ledger">
            {isLoadingBookings ? (
              <div className="h-24 flex items-center justify-center">
                <p className="text-center text-muted-foreground">Loading booking ledger...</p>
              </div>
            ) : (
              <BookingLedgerList bookings={bookingLedger} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

