"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import Link from "next/link"
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  Database,
  Settings,
  LogOut,
  BarChart,
  IndianRupee
} from "lucide-react"

// Define the navigation tile data with icons and routes
const navigationTiles = [
  { name: "Dashboard", href: "/dashboard", icon: Home, description: "View account overview and statistics" },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart, description: "Manage your purchase orders" },
  { name: "Stock", href: "/inventory", icon: Package, description: "Track your inventory items" },
  { name: "Old Stock", href: "/old-stock", icon: Package, description: "Manage used or second-hand items" },
  { name: "Customers", href: "/customers", icon: Users, description: "View and manage customer information" },
  { name: "Invoices", href: "/invoices", icon: Receipt, description: "Create and manage invoices" },
]

// Quick stats for the top of the dashboard
const quickStats = [
  {
    title: "Total Stock Value",
    value: "₹45,23,000",
    icon: IndianRupee,
    description: "Current inventory value",
  },
  {
    title: "Monthly Sales",
    value: "₹12,45,000",
    icon: BarChart,
    description: "Revenue this month",
  },
]

export default function DashboardPage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const { settings } = useSettings()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent mb-2">
          {settings?.firmDetails?.firmName || "Kuber"}
        </h1>
        <p className="text-amber-700">Welcome to your business dashboard</p>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickStats.map((stat) => (
          <div 
            key={stat.title}
            className="bg-white rounded-lg shadow-sm border border-amber-100 p-4 flex items-center space-x-4"
          >
            <div className="p-3 rounded-full bg-amber-50 text-amber-600">
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-800">{stat.title}</h3>
              <p className="text-xl font-bold text-amber-900">{stat.value}</p>
              <p className="text-xs text-amber-600">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {navigationTiles.map((tile) => (
          <Link 
            key={tile.name} 
            href={tile.href}
            className="group"
          >
            <div className="h-full flex flex-col bg-white border border-amber-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200">
              <div className="flex-1 p-3 md:p-6 flex flex-col items-center text-center">
                <div className="p-2 md:p-3 rounded-full bg-amber-50 text-amber-600 mb-2 md:mb-3 group-hover:bg-amber-100 transition-colors">
                  <tile.icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h3 className="font-semibold text-amber-900 mb-1 text-sm md:text-base">{tile.name}</h3>
                <p className="text-xs text-amber-600 hidden md:block">{tile.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 