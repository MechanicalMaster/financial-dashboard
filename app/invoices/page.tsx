"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Filter, Plus, Search, Calendar } from "lucide-react"
import { CreateInvoiceModal } from "@/components/invoices/create-invoice-modal"
import { CreateBookingInvoiceModal } from "@/components/invoices/create-booking-invoice-modal"
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { Pagination } from "@/components/invoices/pagination"
import { DateRangePicker } from "@/components/date-range-picker"
import { type InvoiceStatus } from "@/components/invoices/invoice-status-badge"
import { BookingLedger, type BookingLine, type BookingPayment } from "@/components/invoices/booking-ledger"

// Define invoice type
interface Invoice {
  id: string
  date: string
  dueDate?: string
  bookingDate?: string
  client: string
  amount: number
  status: InvoiceStatus
}

// Sample invoice data
const invoices: Invoice[] = [
  {
    id: "INV-001",
    date: "2023-07-15",
    dueDate: "2023-08-15",
    client: "Acme Corporation",
    amount: 1250.0,
    status: "paid",
  },
  {
    id: "INV-002",
    date: "2023-07-20",
    dueDate: "2023-08-20",
    client: "Globex Industries",
    amount: 3450.75,
    status: "unpaid",
  },
  {
    id: "INV-003",
    date: "2023-06-30",
    dueDate: "2023-07-30",
    client: "Stark Enterprises",
    amount: 7800.5,
    status: "overdue",
  },
  {
    id: "INV-004",
    date: "2023-07-05",
    dueDate: "2023-08-05",
    client: "Wayne Industries",
    amount: 2340.25,
    status: "paid",
  },
  {
    id: "INV-005",
    date: "2023-07-12",
    dueDate: "2023-08-12",
    client: "Oscorp",
    amount: 5670.8,
    status: "unpaid",
  },
  {
    id: "INV-006",
    date: "2023-06-25",
    dueDate: "2023-07-25",
    client: "LexCorp",
    amount: 9870.45,
    status: "overdue",
  },
  {
    id: "INV-007",
    date: "2023-07-18",
    dueDate: "2023-08-18",
    client: "Umbrella Corporation",
    amount: 4560.3,
    status: "paid",
  },
  {
    id: "INV-008",
    date: "2023-07-22",
    dueDate: "2023-08-22",
    client: "Cyberdyne Systems",
    amount: 6780.9,
    status: "unpaid",
  },
  {
    id: "INV-009",
    date: "2023-06-28",
    dueDate: "2023-07-28",
    client: "Weyland-Yutani Corp",
    amount: 8900.15,
    status: "overdue",
  },
  {
    id: "INV-010",
    date: "2023-07-10",
    dueDate: "2023-08-10",
    client: "Massive Dynamic",
    amount: 3210.6,
    status: "paid",
  },
]

// Sample booking ledger data
const bookingLines: BookingLine[] = [
  {
    id: "BKG-0001",
    customerName: "Globex Industries",
    customerId: "CUST-002",
    startDate: "2023-05-15",
    totalAccumulated: 5000.00,
    status: "active",
    payments: [
      {
        id: "PAY-001",
        bookingId: "BKG-0001",
        date: "2023-05-15",
        amount: 1000.00,
        paymentMethod: "Cash",
        reference: "Initial Payment"
      },
      {
        id: "PAY-002",
        bookingId: "BKG-0001",
        date: "2023-06-15",
        amount: 1000.00,
        paymentMethod: "Cash",
        reference: "Monthly Payment"
      },
      {
        id: "PAY-003",
        bookingId: "BKG-0001",
        date: "2023-07-15",
        amount: 1000.00,
        paymentMethod: "Cash",
        reference: "Monthly Payment"
      },
      {
        id: "PAY-004",
        bookingId: "BKG-0001",
        date: "2023-08-15",
        amount: 1000.00,
        paymentMethod: "Cash",
        reference: "Monthly Payment"
      },
      {
        id: "PAY-005",
        bookingId: "BKG-0001",
        date: "2023-09-15",
        amount: 1000.00,
        paymentMethod: "Cash",
        reference: "Monthly Payment"
      }
    ]
  },
  {
    id: "BKG-0002",
    customerName: "Stark Enterprises",
    customerId: "CUST-003",
    startDate: "2023-06-10",
    totalAccumulated: 3000.00,
    status: "pending_purchase",
    payments: [
      {
        id: "PAY-006",
        bookingId: "BKG-0002",
        date: "2023-06-10",
        amount: 1500.00,
        paymentMethod: "Bank Transfer",
        reference: "Initial Payment"
      },
      {
        id: "PAY-007",
        bookingId: "BKG-0002",
        date: "2023-07-10",
        amount: 1500.00,
        paymentMethod: "Bank Transfer",
        reference: "Monthly Payment"
      }
    ]
  },
  {
    id: "BKG-0003",
    customerName: "Wayne Industries",
    customerId: "CUST-004",
    startDate: "2023-04-05",
    totalAccumulated: 0.00, // Zero because already redeemed
    status: "completed",
    payments: [
      {
        id: "PAY-008",
        bookingId: "BKG-0003",
        date: "2023-04-05",
        amount: 2000.00,
        paymentMethod: "Credit Card",
        reference: "Initial Payment"
      },
      {
        id: "PAY-009",
        bookingId: "BKG-0003",
        date: "2023-05-05",
        amount: 2000.00,
        paymentMethod: "Credit Card",
        reference: "Monthly Payment"
      },
      {
        id: "PAY-010",
        bookingId: "BKG-0003",
        date: "2023-06-05",
        amount: 2000.00,
        paymentMethod: "Credit Card",
        reference: "Monthly Payment"
      },
      {
        id: "PAY-011",
        bookingId: "BKG-0003",
        date: "2023-07-05",
        amount: 2000.00,
        paymentMethod: "Credit Card",
        reference: "Final Payment"
      }
    ]
  },
  {
    id: "BKG-0004",
    customerName: "Acme Corporation",
    customerId: "CUST-001",
    startDate: "2023-08-01",
    totalAccumulated: 2500.00,
    status: "active",
    payments: [
      {
        id: "PAY-012",
        bookingId: "BKG-0004",
        date: "2023-08-01",
        amount: 1000.00,
        paymentMethod: "Cash",
        reference: "Initial Payment"
      },
      {
        id: "PAY-013",
        bookingId: "BKG-0004",
        date: "2023-09-01",
        amount: 1500.00,
        paymentMethod: "Cash",
        reference: "Monthly Payment"
      }
    ]
  },
  {
    id: "BKG-0005",
    customerName: "Oscorp",
    customerId: "CUST-005",
    startDate: "2023-07-20",
    totalAccumulated: 1000.00,
    status: "active",
    payments: [
      {
        id: "PAY-014",
        bookingId: "BKG-0005",
        date: "2023-07-20",
        amount: 500.00,
        paymentMethod: "UPI",
        reference: "Initial Payment"
      },
      {
        id: "PAY-015",
        bookingId: "BKG-0005",
        date: "2023-08-20",
        amount: 500.00,
        paymentMethod: "UPI",
        reference: "Monthly Payment"
      }
    ]
  }
]

// Extract all booking payments from booking lines
const bookingPayments: BookingPayment[] = bookingLines.flatMap(line => line.payments)

export default function InvoicesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateBookingModalOpen, setIsCreateBookingModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("invoices")
  const itemsPerPage = 8

  // Filter invoices based on search query and status filter
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage)

  const handleCreateInvoice = (invoiceData: any) => {
    console.log("New invoice created:", invoiceData)
    setIsCreateModalOpen(false)
    // In a real application, you would add the new invoice to your data store
  }

  const handleCreateBookingInvoice = (invoiceData: any) => {
    console.log("New booking invoice created:", invoiceData)
    setIsCreateBookingModalOpen(false)
    // In a real application, you would add the new booking invoice to your data store
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreateBookingModalOpen(true)} variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> Create Booking Invoice
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="booking-ledger">Booking Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <DateRangePicker className="w-full sm:w-auto" />
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> More Filters
              </Button>
            </div>
          </div>

          <div className="rounded-md border mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell className="text-right">₹{invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No invoices found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedInvoices.length} of {filteredInvoices.length} invoices
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </TabsContent>

        <TabsContent value="booking-ledger">
          <BookingLedger bookingLines={bookingLines} bookingPayments={bookingPayments} />
        </TabsContent>
      </Tabs>

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateInvoice={handleCreateInvoice}
      />

      <CreateBookingInvoiceModal
        isOpen={isCreateBookingModalOpen}
        onClose={() => setIsCreateBookingModalOpen(false)}
        onCreateBookingInvoice={handleCreateBookingInvoice}
      />
    </div>
  )
}

