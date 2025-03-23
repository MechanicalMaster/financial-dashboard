"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, BarChart2, Users, Settings, Package, FileText, Store, Building2 } from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    href: string
    title: string
    icon: any
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
            pathname === item.href && "bg-muted text-foreground",
            pathname.startsWith(item.href) && item.href !== "/" && "bg-muted text-foreground",
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

export const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart2,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Purchases",
    href: "/purchases",
    icon: Store,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Building2,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

