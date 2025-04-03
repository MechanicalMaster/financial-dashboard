"use client"

import { Card } from "@/components/ui/card"
import { Package, PackageOpen, FileSpreadsheet, Users, Settings } from "lucide-react"
import Link from "next/link"

interface MenuTile {
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
}

const menuTiles: MenuTile[] = [
  {
    title: "Stock",
    description: "Manage your stock, track items, and monitor stock levels",
    icon: Package,
    href: "/inventory",
    color: "bg-blue-500"
  },
  {
    title: "Old Stock",
    description: "Track items purchased from customers and maintain records",
    icon: PackageOpen,
    href: "/old-stock",
    color: "bg-purple-500"
  },
  {
    title: "Invoices",
    description: "Create and manage invoices, track payments",
    icon: FileSpreadsheet,
    href: "/invoices",
    color: "bg-green-500"
  },
  {
    title: "Masters",
    description: "Manage categories, customers, and other master data",
    icon: Users,
    href: "/masters",
    color: "bg-orange-500"
  },
  {
    title: "Settings",
    description: "Configure application settings and preferences",
    icon: Settings,
    href: "/settings",
    color: "bg-gray-500"
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground mt-2">Select a module to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuTiles.map((tile) => {
            const Icon = tile.icon
            return (
              <Link key={tile.href} href={tile.href}>
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="p-6">
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${tile.color}`} />
                    <div className={`inline-flex items-center justify-center p-3 rounded-lg ${tile.color} bg-opacity-10 mb-4`}>
                      <Icon className={`w-6 h-6 ${tile.color.replace('bg-', 'text-')}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{tile.title}</h3>
                    <p className="text-muted-foreground text-sm">{tile.description}</p>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Need help? Contact support</p>
        </div>
      </div>
    </div>
  )
}

