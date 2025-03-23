import { Badge } from "@/components/ui/badge"

export type InvoiceStatus = "paid" | "unpaid" | "overdue" | "booking"

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const statusStyles = {
    paid: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200",
    unpaid: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200",
    overdue: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200",
    booking: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200",
  }

  const statusLabels = {
    paid: "Paid",
    unpaid: "Unpaid",
    overdue: "Overdue",
    booking: "Booking",
  }

  return (
    <Badge className={statusStyles[status]} variant="outline">
      {statusLabels[status]}
    </Badge>
  )
}

