"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Filter, Plus, Search, Calendar, MoreHorizontal } from "lucide-react"
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { Pagination } from "@/components/invoices/pagination"
import { DateRangePicker } from "@/components/date-range-picker"
import { type InvoiceStatus } from "@/components/invoices/invoice-status-badge"
import { BookingLedger, type BookingLine, type BookingPayment } from "@/components/invoices/booking-ledger"
import Link from "next/link"
import { getPath } from "@/lib/utils/path-utils"
import db, { Invoice as DBInvoice } from "@/lib/db"

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

// Empty invoice data instead of sample data
const invoices: Invoice[] = []

// Empty booking ledger data instead of sample data
const bookingLines: BookingLine[] = []

// Extract all booking payments from booking lines
const bookingPayments: BookingPayment[] = bookingLines.flatMap(line => line.payments)

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)

  // Add a cleanup function that runs once on component mount
  useEffect(() => {
    const cleanupDummyInvoices = async () => {
      try {
        // Get all invoices
        const allInvoices = await db.invoices.toArray();
        
        // Check if there are any dummy invoices
        if (allInvoices.length > 0) {
          // These are the IDs of all the demo invoices we want to remove
          const dummyInvoiceIds = allInvoices
            .map(invoice => invoice.id)
            .filter((id): id is string => id !== undefined);
          
          if (dummyInvoiceIds.length > 0) {
            // Delete all dummy invoices
            await db.invoices.bulkDelete(dummyInvoiceIds);
            console.log(`Removed ${dummyInvoiceIds.length} dummy invoices`);
            
            // Force refresh the page to show empty state
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("Error removing dummy invoices:", error);
      }
    };
    
    // Run the cleanup function
    cleanupDummyInvoices();
  }, []);

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-amber-900">Invoices</h1>
          <div className="flex items-center gap-4">
            <Link href={getPath("/invoices/create-booking")}>
              <Button variant="outline" className="hover:bg-amber-50">
                <Calendar className="mr-2 h-4 w-4" /> Create Booking Invoice
              </Button>
            </Link>
            <Link href={getPath("/invoices/create")}>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="mr-2 h-4 w-4" /> Create Invoice
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Regular Invoices</TabsTrigger>
            <TabsTrigger value="bookings">Booking Ledger</TabsTrigger>
          </TabsList>
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 md:max-w-sm">
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
                  <SelectTrigger className="md:w-[180px]">
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
                <DateRangePicker />
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200">
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
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </div>

            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </TabsContent>
          <TabsContent value="bookings">
            <BookingLedger 
              bookingLines={bookingLines} 
              bookingPayments={[]} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

