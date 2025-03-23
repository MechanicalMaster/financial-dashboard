"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/date-range-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Eye, FileText, Filter, MoreHorizontal, Pencil, Search, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/invoices/pagination"

// Sample invoice data
const purchaseInvoices: PurchaseInvoice[] = [
  {
    id: "PO-001",
    date: "2023-07-25",
    supplier: "Office Supplies Inc.",
    invoiceNumber: "INV-12345",
    amount: 1250.0,
    status: "received",
    paymentStatus: "paid",
    items: 12,
  },
  {
    id: "PO-002",
    date: "2023-07-22",
    supplier: "Tech Solutions Ltd.",
    invoiceNumber: "TS-9876",
    amount: 3450.75,
    status: "pending",
    paymentStatus: "unpaid",
    items: 5,
  },
  {
    id: "PO-003",
    date: "2023-07-20",
    supplier: "Furniture Depot",
    invoiceNumber: "FD-4567",
    amount: 7800.5,
    status: "received",
    paymentStatus: "paid",
    items: 3,
  },
  {
    id: "PO-004",
    date: "2023-07-18",
    supplier: "Paper Products Co.",
    invoiceNumber: "PP-7890",
    amount: 540.25,
    status: "received",
    paymentStatus: "paid",
    items: 8,
  },
  {
    id: "PO-005",
    date: "2023-07-15",
    supplier: "Global Electronics",
    invoiceNumber: "GE-3456",
    amount: 12670.8,
    status: "cancelled",
    paymentStatus: "cancelled",
    items: 2,
  },
  {
    id: "PO-006",
    date: "2023-07-10",
    supplier: "Office Supplies Inc.",
    invoiceNumber: "INV-12346",
    amount: 890.5,
    status: "received",
    paymentStatus: "paid",
    items: 15,
  },
  {
    id: "PO-007",
    date: "2023-07-08",
    supplier: "Tech Solutions Ltd.",
    invoiceNumber: "TS-9877",
    amount: 2300.25,
    status: "received",
    paymentStatus: "partially_paid",
    items: 7,
  },
  {
    id: "PO-008",
    date: "2023-07-05",
    supplier: "Furniture Depot",
    invoiceNumber: "FD-4568",
    amount: 4500.0,
    status: "pending",
    paymentStatus: "unpaid",
    items: 2,
  },
  {
    id: "PO-009",
    date: "2023-07-03",
    supplier: "Paper Products Co.",
    invoiceNumber: "PP-7891",
    amount: 780.3,
    status: "received",
    paymentStatus: "paid",
    items: 10,
  },
  {
    id: "PO-010",
    date: "2023-07-01",
    supplier: "Global Electronics",
    invoiceNumber: "GE-3457",
    amount: 9500.75,
    status: "received",
    paymentStatus: "paid",
    items: 1,
  },
]

// Define types for the component
interface PurchaseInvoice {
  id: string;
  date: string;
  supplier: string;
  invoiceNumber: string;
  amount: number;
  status: 'received' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid' | 'cancelled';
  items: number;
}

export function PurchaseInvoicesList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([])
  const itemsPerPage = 8

  // Load saved invoices from localStorage on mount
  useEffect(() => {
    // Try to load from localStorage first
    const savedInvoices = localStorage.getItem('purchaseInvoices');
    
    if (savedInvoices) {
      // If we have saved invoices, use those
      setInvoices(JSON.parse(savedInvoices));
    } else {
      // Otherwise use the default ones
      setInvoices(purchaseInvoices);
    }
  }, []);

  // Get unique suppliers for filter
  const suppliers = [...new Set(invoices.map((invoice) => invoice.supplier))]

  // Filter invoices based on search query and filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesPaymentStatus = paymentStatusFilter === "all" || invoice.paymentStatus === paymentStatusFilter
    const matchesSupplier = supplierFilter === "all" || invoice.supplier === supplierFilter

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesSupplier
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage)

  // Status badge styles
  const getStatusBadge = (status: 'received' | 'pending' | 'cancelled') => {
    const statusStyles = {
      received: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }

    const statusLabels = {
      received: "Received",
      pending: "Pending",
      cancelled: "Cancelled",
    }

    return (
      <Badge className={statusStyles[status]} variant="outline">
        {statusLabels[status]}
      </Badge>
    )
  }

  // Payment status badge styles
  const getPaymentStatusBadge = (status: 'paid' | 'unpaid' | 'partially_paid' | 'cancelled') => {
    const statusStyles = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      unpaid: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      partially_paid: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    }

    const statusLabels = {
      paid: "Paid",
      unpaid: "Unpaid",
      partially_paid: "Partially Paid",
      cancelled: "Cancelled",
    }

    return (
      <Badge className={statusStyles[status]} variant="outline">
        {statusLabels[status]}
      </Badge>
    )
  }

  const handleViewInvoice = (id: string) => {
    toast.info(`Viewing invoice ${id}`)
  }

  const handleEditInvoice = (id: string) => {
    toast.info(`Editing invoice ${id}`)
  }

  const handleDeleteInvoice = (id: string) => {
    // Ask for confirmation
    if (confirm(`Are you sure you want to delete invoice ${id}?`)) {
      // Remove from invoices array
      const newInvoices = invoices.filter(invoice => invoice.id !== id);
      
      // Update state
      setInvoices(newInvoices);
      
      // Save to localStorage for persistence
      localStorage.setItem('purchaseInvoices', JSON.stringify(newInvoices));
      
      toast.success(`Invoice ${id} deleted`);
    }
  }

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Invoice ${id} downloaded`)
  }

  return (
    <div className="space-y-4">
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
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier, index) => (
                <SelectItem key={index} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangePicker className="w-full sm:w-auto" />
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> More Filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purchase #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.supplier}</TableCell>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-right">₹{invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(invoice.paymentStatus)}</TableCell>
                  <TableCell>{invoice.items}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewInvoice(invoice.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditInvoice(invoice.id)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No invoices found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedInvoices.length} of {filteredInvoices.length} invoices
        </p>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" /> Export CSV
        </Button>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Bulk Upload
        </Button>
      </div>
    </div>
  )
}

