"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, Eye, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditBookingModal } from "@/components/customers/edit-booking-modal"
import { RedeemBookingModal } from "@/components/invoices/redeem-booking-modal"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination } from "@/components/invoices/pagination"

// Define booking ledger item types
export interface BookingLine {
  id: string
  customerName: string
  customerId: string
  startDate: string
  totalAccumulated: number
  status: "active" | "pending_purchase" | "completed"
  payments: BookingPayment[]
}

export interface BookingPayment {
  id: string
  bookingId: string
  date: string
  amount: number
  paymentMethod: string
  reference: string
}

export function BookingLedger({ bookingLines, bookingPayments }: { 
  bookingLines: BookingLine[], 
  bookingPayments: BookingPayment[] 
}) {
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBookingLine, setSelectedBookingLine] = useState<BookingLine | null>(null)
  const [editingBookingLine, setEditingBookingLine] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [localBookingLines, setLocalBookingLines] = useState<BookingLine[]>(bookingLines)
  const itemsPerPage = 8

  // Filter booking lines based on search query and filters
  const filteredBookingLines = localBookingLines.filter((line) => {
    const matchesSearch =
      line.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      line.customerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || line.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredBookingLines.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBookingLines = filteredBookingLines.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (bookingLine: BookingLine) => {
    setActiveTab(bookingLine.id)
  }

  const handleRedeemBooking = (bookingLine: BookingLine) => {
    setSelectedBookingLine(bookingLine)
    setIsRedeemModalOpen(true)
  }

  const handleEditBooking = (bookingLine: BookingLine) => {
    // Convert BookingLine to the format expected by EditBookingModal
    const bookingInvoice = {
      id: bookingLine.id,
      date: new Date().toISOString().split('T')[0], // Current date as default
      bookingDate: bookingLine.startDate,
      amount: bookingLine.totalAccumulated,
      status: bookingLine.status,
      customerId: bookingLine.customerId,
      customerName: bookingLine.customerName
    };
    
    setEditingBookingLine(bookingInvoice);
    setIsEditModalOpen(true);
  }

  const handleSaveBooking = (updatedBooking: any) => {
    // Update the booking line with the new information
    const updatedBookingLines = localBookingLines.map(line => {
      if (line.id === updatedBooking.id) {
        return {
          ...line,
          id: updatedBooking.id,
          startDate: updatedBooking.bookingDate || line.startDate,
          totalAccumulated: updatedBooking.amount,
          status: updatedBooking.status as "active" | "pending_purchase" | "completed"
        };
      }
      return line;
    });
    
    setLocalBookingLines(updatedBookingLines);
    
    // If we're currently looking at the details view of the updated booking line,
    // update the active tab in case the ID changed
    if (activeTab === editingBookingLine.id && updatedBooking.id !== editingBookingLine.id) {
      setActiveTab(updatedBooking.id);
    }
    
    toast.success(`Booking ${updatedBooking.id} updated successfully`);
  }

  const handleRedeemComplete = (bookingLineId: string, inventoryItem: any) => {
    toast.success(`Booking ${bookingLineId} redeemed for ${inventoryItem.name}`)
    setIsRedeemModalOpen(false)
    
    // Update the booking line status to completed
    const updatedBookingLines = localBookingLines.map(line => {
      if (line.id === bookingLineId) {
        return {
          ...line,
          status: "completed" as const,
          totalAccumulated: 0 // Reset accumulated amount after redemption
        };
      }
      return line;
    });
    
    setLocalBookingLines(updatedBookingLines);
  }

  // Render status badge
  const renderStatusBadge = (status: BookingLine['status']) => {
    const statusConfig = {
      active: { label: "Active", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      pending_purchase: { label: "Pending Purchase", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      completed: { label: "Completed", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    }

    const config = statusConfig[status]
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="all">All Booking Lines</TabsTrigger>
          {bookingLines.map((line) => (
            <TabsTrigger key={line.id} value={line.id} className="hidden">
              {line.id}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bookings..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_purchase">Pending Purchase</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> More Filters
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Accumulated Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookingLines.length > 0 ? (
                  paginatedBookingLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">{line.id}</TableCell>
                      <TableCell>{line.customerName}</TableCell>
                      <TableCell>{line.startDate}</TableCell>
                      <TableCell className="text-right">₹{line.totalAccumulated.toFixed(2)}</TableCell>
                      <TableCell>{renderStatusBadge(line.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(line)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditBooking(line)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {line.status !== "completed" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRedeemBooking(line)}
                              disabled={line.totalAccumulated < 100} // Example threshold
                            >
                              Redeem
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No booking lines found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedBookingLines.length} of {filteredBookingLines.length} booking lines
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </TabsContent>

        {bookingLines.map((line) => (
          <TabsContent key={line.id} value={line.id}>
            <Button variant="outline" className="mb-6" onClick={() => setActiveTab("all")}>
              ← Back to all booking lines
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ID:</span>
                    <span className="font-medium">{line.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{line.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{line.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{renderStatusBadge(line.status)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Amount Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Accumulated:</span>
                    <span className="font-medium">₹{line.totalAccumulated.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Payments:</span>
                    <span>{line.payments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Payment:</span>
                    <span>
                      {line.payments.length > 0
                        ? `₹${line.payments[line.payments.length - 1].amount.toFixed(2)} on ${
                            line.payments[line.payments.length - 1].date
                          }`
                        : "No payments yet"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleEditBooking(line)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Booking
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleRedeemBooking(line)}
                    disabled={line.status === "completed" || line.totalAccumulated < 100} // Example threshold
                  >
                    Redeem for Item
                  </Button>
                  <Button className="w-full" variant="outline">
                    Add Payment
                  </Button>
                  <Button className="w-full" variant="outline">
                    Print Details
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {line.payments
                      .slice()
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>{payment.reference}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell className="text-right">₹{payment.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    {line.payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No payment history found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {selectedBookingLine && (
        <RedeemBookingModal
          isOpen={isRedeemModalOpen}
          onClose={() => setIsRedeemModalOpen(false)}
          bookingLine={selectedBookingLine}
          onRedeemComplete={handleRedeemComplete}
        />
      )}

      {editingBookingLine && (
        <EditBookingModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          bookingInvoice={editingBookingLine}
          onSave={handleSaveBooking}
        />
      )}
    </div>
  )
} 