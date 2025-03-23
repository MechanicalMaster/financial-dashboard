"use client"

import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

interface Purchase {
  id: string
  supplier: string
  date: string
  amount: number
  status: string
}

interface RecentActivityProps {
  purchases: Purchase[]
}

export function RecentActivity({ purchases }: RecentActivityProps) {
  // Status badge styles
  const getStatusBadge = (status) => {
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

  return (
    <div className="space-y-8">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="flex items-center">
          <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium">{purchase.supplier}</p>
            <p className="text-xs text-muted-foreground">
              {purchase.id} • {purchase.date}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-medium">${purchase.amount.toFixed(2)}</p>
            <div className="flex items-center justify-end mt-1">{getStatusBadge(purchase.status)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

