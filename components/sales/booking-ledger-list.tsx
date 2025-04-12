"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  FileText, 
  CheckCircle, 
  XCircle 
} from "lucide-react"
import { format } from "date-fns"
import { BookingInvoice } from "@/lib/db"
import Link from "next/link"

interface BookingLedgerListProps {
  bookings: BookingInvoice[];
}

type BookingStatus = 'active' | 'completed' | 'cancelled';

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const statusColors = {
    active: "bg-blue-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };
  return (
    <Badge variant="default" className={`${statusColors[status] || 'bg-gray-500'} text-white capitalize`}>
      {status}
    </Badge>
  );
}

export function BookingLedgerList({ bookings }: BookingLedgerListProps) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile view (card layout) - hidden on medium screens and up */}
      <div className="md:hidden space-y-4">
        {paginatedBookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No bookings found.
          </div>
        ) : (
          paginatedBookings.map((booking) => (
            <div key={booking.id} className="bg-card rounded-lg border shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{booking.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.bookingDate ? format(new Date(booking.bookingDate), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                </div>
                <div className="font-medium">{booking.customerName}</div>
                <div>
                  <span className="text-muted-foreground">Est. Amount:</span>
                </div>
                <div className="font-medium">₹{booking.estimatedAmount?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`#view-booking-${booking.id}`}>
                    <FileText className="mr-2 h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`#edit-booking-${booking.id}`}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop view (table layout) - hidden on small screens */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Booking Date</TableHead>
              <TableHead>Estimated Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>{booking.customerName}</TableCell>
                  <TableCell>{format(new Date(booking.bookingDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>₹{booking.estimatedAmount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          {/* TODO: Implement View Booking Details */} 
                          <Link href={`#view-booking-${booking.id}`}> 
                            <FileText className="mr-2 h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          {/* TODO: Implement Edit Booking */} 
                          <Link href={`#edit-booking-${booking.id}`}> 
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-green-600"
                          /* TODO: Implement Mark as Completed */ 
                          // onClick={() => handleMarkComplete(booking.id)} 
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          /* TODO: Implement Cancel Booking */ 
                          // onClick={() => handleCancel(booking.id)} 
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {
              Math.min(currentPage * itemsPerPage, bookings.length)
            } of {bookings.length} bookings
          </span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 