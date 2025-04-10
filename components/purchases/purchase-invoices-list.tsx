"use client"

import React, { useState, useEffect } from "react"
import {
  ArrowUpDown,
  Download,
  FileText,
  MoreHorizontal,
  Package,
  Search,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/invoices/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDB } from "@/contexts/db-context"
import { Purchase } from "@/lib/db"

// Define interface for the formatted purchase invoice
interface PurchaseInvoice {
  id: string;
  date: string;
  supplier: string;
  invoiceNumber?: string;
  amount: number;
  status: 'received' | 'pending' | 'cancelled';
  paymentStatus?: 'paid' | 'unpaid' | 'partially_paid' | 'cancelled';
  items?: number;
}

export function PurchaseInvoicesList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 8
  const { getAll } = useDB()

  // Load purchase data from database
  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true)
      try {
        // Get purchases from database
        const purchasesData = await getAll<Purchase>('purchases')
        
        // Convert to the format needed for display
        const formattedInvoices: PurchaseInvoice[] = purchasesData.map(purchase => ({
          id: purchase.id || "",
          date: purchase.date instanceof Date 
            ? purchase.date.toISOString().split('T')[0] 
            : new Date(purchase.date).toISOString().split('T')[0],
          supplier: purchase.supplier,
          invoiceNumber: `INV-${purchase.id?.split('-')[1] || '0000'}`,
          amount: purchase.cost,
          status: 'received',
          paymentStatus: 'paid',
          items: purchase.quantity
        }))
        
        setInvoices(formattedInvoices)
      } catch (error) {
        console.error("Error fetching purchases:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPurchases()
  }, [getAll])

  // Get unique suppliers for filter
  const suppliers = [...new Set(invoices.map((invoice) => invoice.supplier))]

  // Filter invoices based on search query and filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesPaymentStatus = paymentStatusFilter === "all" || 
      (invoice.paymentStatus && invoice.paymentStatus === paymentStatusFilter)
    const matchesSupplier = supplierFilter === "all" || invoice.supplier === supplierFilter

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesSupplier
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage)

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return <Badge variant="default">Received</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Helper function to get payment status badge
  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-500">Paid</Badge>
      case "unpaid":
        return <Badge variant="secondary" className="bg-yellow-500">Unpaid</Badge>
      case "partially_paid":
        return <Badge variant="secondary" className="bg-blue-500">Partial</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search purchases..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-md border px-3 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="rounded-md border px-3 py-1 text-sm"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {suppliers.length > 0 && (
            <select
              className="rounded-md border px-3 py-1 text-sm"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="all">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          )}

          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort</span>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Loading purchase data...
                </TableCell>
              </TableRow>
            ) : paginatedInvoices.length > 0 ? (
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
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => window.location.href = `/purchases/invoice/${invoice.id}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.location.href = `/purchases/invoice/${invoice.id}/edit`}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No purchase invoices found. Add your first purchase invoice to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}

