"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  change: string
}

export function StatsCard({ title, value, icon: Icon, change }: StatsCardProps) {
  const isPositive = change.startsWith("+")

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">{value}</div>
          <p className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>{change}</p>
        </div>
      </CardContent>
    </Card>
  )
}

