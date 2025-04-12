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
  Download 
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { Invoice, InvoiceStatus } from "@/lib/db" // Use Invoice from db.ts
import Link from "next/link"

interface InvoiceListProps {
  invoices: Invoice[];
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const statusColors: Record<InvoiceStatus, string> = {
    paid: "bg-green-500",
    unpaid: "bg-yellow-500",
    overdue: "bg-red-500",
    booking: "bg-blue-500" // Although this component is for regular invoices, include for type safety
  }
  return (
    <Badge variant="default" className={`${statusColors[status] || 'bg-gray-500'} text-white capitalize`}>
      {status}
    </Badge>
  )
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)

  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const totalPages = Math.ceil(invoices.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile view (card layout) - hidden on medium screens and up */}
      <div className="md:hidden space-y-4">
        {paginatedInvoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No invoices found.
          </div>
        ) : (
          paginatedInvoices.map((invoice) => (
            <div key={invoice.id || 'unknown'} className="bg-card rounded-lg border shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{invoice.id || 'Unknown'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(invoice.date, 'dd/MM/yyyy')}
                  </p>
                </div>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                </div>
                <div className="font-medium">{invoice.customerName}</div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                </div>
                <div className="font-medium">
                  {invoice.dueDate ? format(invoice.dueDate, 'dd/MM/yyyy') : '-'}
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                </div>
                <div className="font-medium">₹{invoice.amount.toFixed(2)}</div>
              </div>
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`#view-${invoice.id || 'unknown'}`}>
                    <FileText className="mr-2 h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`#edit-${invoice.id || 'unknown'}`}>
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
              <TableHead>Invoice ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{format(invoice.date, 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{invoice.dueDate ? format(invoice.dueDate, 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
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
                           {/* TODO: Implement View Invoice */} 
                          <Link href={`#view-${invoice.id}`}> 
                            <FileText className="mr-2 h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           {/* TODO: Implement Edit Invoice */} 
                          <Link href={`#edit-${invoice.id}`}> 
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                           {/* TODO: Implement Download PDF */} 
                          <Link href={`#download-${invoice.id}`}> 
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          /* TODO: Implement Delete Invoice */ 
                          // onClick={() => handleDelete(invoice.id)} 
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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
              Math.min(currentPage * itemsPerPage, invoices.length)
            } of {invoices.length} invoices
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