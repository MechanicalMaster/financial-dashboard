"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Pencil, Mail, Phone, Building, Tag, Download } from "lucide-react"
import { type InvoiceStatus } from "@/components/invoices/invoice-status-badge"
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { EditBookingModal } from "@/components/customers/edit-booking-modal"
import { toast } from "sonner"
import { useDB } from "@/contexts/db-context"
import { Customer, Invoice as DBInvoice } from "@/lib/db"
import { format } from "date-fns"

// Define invoice interface for component use
interface Invoice extends Omit<DBInvoice, 'date' | 'dueDate' | 'bookingDate' | 'createdAt' | 'updatedAt'> {
  date: string;
  dueDate?: string;
  bookingDate?: string;
  customerName?: string;
}

interface CustomerDetailPageProps {
  params: {
    id: string
  }
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const router = useRouter()
  const { id } = params
  const { get, getAll, update } = useDB()
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [bookingToEdit, setBookingToEdit] = useState<Invoice | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  // Fetch customer and related invoice data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch customer
        const customerData = await get<Customer>('customers', id)
        if (!customerData) {
          toast.error("Customer not found")
          router.push("/customers")
          return
        }
        
        setCustomer(customerData)
        
        // Fetch related invoices
        const allInvoices = await getAll<DBInvoice>('invoices')
        const customerInvoices = allInvoices
          .filter(invoice => invoice.customerId === id)
          .map(invoice => ({
            ...invoice,
            date: invoice.date instanceof Date ? format(invoice.date, 'yyyy-MM-dd') : '',
            dueDate: invoice.dueDate instanceof Date ? format(invoice.dueDate, 'yyyy-MM-dd') : undefined,
            bookingDate: invoice.bookingDate instanceof Date ? format(invoice.bookingDate, 'yyyy-MM-dd') : undefined,
            customerName: customerData.name,
          }))
        
        setInvoices(customerInvoices)
      } catch (error) {
        console.error("Error fetching customer data:", error)
        toast.error("Failed to load customer information")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [id, get, getAll, router])

  const calculateTotalAmount = () => {
    return invoices.reduce((total, invoice) => total + invoice.amount, 0)
  }

  const calculateOutstandingAmount = () => {
    return invoices
      .filter(invoice => invoice.status === "unpaid" || invoice.status === "overdue")
      .reduce((total, invoice) => total + invoice.amount, 0)
  }

  const handleEditBooking = (invoice: Invoice) => {
    setBookingToEdit(invoice)
    setEditModalOpen(true)
  }

  const handleSaveBooking = async (updatedBooking: any) => {
    try {
      // Find the original booking in the database
      const originalInvoice = await get<DBInvoice>('invoices', updatedBooking.id)
      
      if (!originalInvoice) {
        throw new Error("Invoice not found")
      }
      
      // Update the booking in the database
      const updatedInvoice: Partial<DBInvoice> = {
        ...originalInvoice,
        bookingDate: updatedBooking.bookingDate ? new Date(updatedBooking.bookingDate) : originalInvoice.bookingDate,
        amount: updatedBooking.amount !== undefined ? updatedBooking.amount : originalInvoice.amount,
        updatedAt: new Date()
      }
      
      await update('invoices', updatedBooking.id, updatedInvoice)
      
      // Update local state
      setInvoices(prev => 
        prev.map(inv => 
          inv.id === updatedBooking.id 
            ? { 
                ...inv, 
                bookingDate: updatedBooking.bookingDate,
                amount: updatedBooking.amount 
              } 
            : inv
        )
      )
      
      setEditModalOpen(false)
      toast.success("Booking updated successfully")
    } catch (error) {
      console.error("Error updating booking:", error)
      toast.error("Failed to update booking")
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <p>Loading customer information...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-lg font-medium">Customer not found</h2>
              <p className="text-muted-foreground mt-2">The customer you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push("/customers")} className="mt-6">
                Return to Customers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
        </div>
        <Button onClick={() => router.push(`/customers/edit/${id}`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Customer
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices & Bookings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>Contact information for {customer.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex items-start">
                    <dt className="w-10 flex-shrink-0">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </dt>
                    <dd>{customer.email || "No email provided"}</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-10 flex-shrink-0">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </dt>
                    <dd>{customer.phone}</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-10 flex-shrink-0">
                      <Building className="h-5 w-5 text-muted-foreground" />
                    </dt>
                    <dd className="whitespace-pre-line">{customer.address || "No address provided"}</dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="w-10 flex-shrink-0">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                    </dt>
                    <dd>{customer.reference || "No reference provided"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Overview of financial transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="grid grid-cols-2">
                    <dt className="text-muted-foreground">Total Billed</dt>
                    <dd className="text-right font-medium">₹{calculateTotalAmount().toFixed(2)}</dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-muted-foreground">Outstanding</dt>
                    <dd className="text-right font-medium text-destructive">₹{calculateOutstandingAmount().toFixed(2)}</dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-muted-foreground">Invoices</dt>
                    <dd className="text-right font-medium">{invoices.filter(inv => inv.type === "invoice").length}</dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-muted-foreground">Bookings</dt>
                    <dd className="text-right font-medium">{invoices.filter(inv => inv.type === "booking").length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest customer interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{invoice.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.type === "invoice" ? "Invoice" : "Booking"} for ₹{invoice.amount.toFixed(2)}
                            </p>
                          </div>
                          <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {invoice.type === "invoice" 
                            ? `Due on ${invoice.dueDate || "N/A"}` 
                            : `Booked for ${invoice.bookingDate || "TBD"}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoices & Bookings</CardTitle>
                <CardDescription>
                  Manage invoices and booking records for this customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  renderInvoicesTable(invoices, handleEditBooking)
                ) : (
                  <div className="text-center py-10 border rounded-lg">
                    <p className="text-muted-foreground">No invoices or bookings yet</p>
                    <div className="mt-4 space-x-4">
                      <Button variant="outline" onClick={() => router.push("/invoices/add")}>
                        Create Invoice
                      </Button>
                      <Button variant="outline" onClick={() => router.push("/bookings/add")}>
                        Create Booking
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Documents</CardTitle>
              <CardDescription>
                Manage documents related to this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 border rounded-lg">
                <p className="text-muted-foreground">No documents available</p>
                <Button variant="outline" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {bookingToEdit && (
        <EditBookingModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          booking={bookingToEdit}
          onSave={handleSaveBooking}
        />
      )}
    </div>
  )
}

// Helper function to render the invoices table
function renderInvoicesTable(invoices: Invoice[], onEditBooking?: (invoice: Invoice) => void) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>
                {invoice.type === "invoice" ? "Invoice" : "Booking"}
              </TableCell>
              <TableCell>
                {invoice.type === "invoice" 
                  ? invoice.date 
                  : (invoice.bookingDate || "TBD")}
              </TableCell>
              <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-right">
                {invoice.type === "booking" && onEditBooking && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditBooking(invoice)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // View details functionality would go here
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 