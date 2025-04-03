"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Package, Users, IndianRupee } from "lucide-react"

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const stats = [
    {
      title: "Total Stock Value",
      value: "₹45,23,000",
      icon: IndianRupee,
      description: "Current inventory value",
    },
    {
      title: "Active Stock Items",
      value: "234",
      icon: Package,
      description: "Items in inventory",
    },
    {
      title: "Total Customers",
      value: "1,234",
      icon: Users,
      description: "Registered customers",
    },
    {
      title: "Monthly Sales",
      value: "₹12,45,000",
      icon: BarChart,
      description: "Revenue this month",
    },
  ]

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">Dashboard</h1>
      
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-amber-100 hover:border-amber-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-amber-800">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{stat.value}</div>
              <p className="text-xs text-amber-600">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add more dashboard content here */}
    </div>
  )
} 