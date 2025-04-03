"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart2,
  Wallet,
  Receipt,
  MessagesSquare,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  ShoppingCart,
  Package,
  Users,
  Database,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useSettings } from "@/contexts/settings-context"
import { useAuth } from "@/contexts/auth-context"

interface NavItemType {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItemType[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Stock", href: "/inventory", icon: Package },
  { name: "Old Stock", href: "/old-stock", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Invoices", href: "/invoices", icon: Receipt },
]

const bottomNavigation: NavItemType[] = [
  { name: "Masters", href: "/masters", icon: Database },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { settings } = useSettings()
  const { logout } = useAuth()

  const NavItem = ({ item, isBottom = false }: { item: NavItemType; isBottom?: boolean }) => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-amber-50 text-amber-900 border border-amber-200"
              : "text-amber-700 hover:bg-amber-50 hover:text-amber-900 hover:border hover:border-amber-100",
            isCollapsed && "justify-center px-2",
          )}
        >
          <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span>{item.name}</span>}
        </Link>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right" className="flex items-center gap-4">
          {item.name}
        </TooltipContent>
      )}
    </Tooltip>
  )

  return (
    <TooltipProvider>
      <>
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div
          className={cn(
            "fixed inset-y-0 z-20 flex flex-col bg-background transition-all duration-300 ease-in-out lg:static",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="border-b border-amber-100">
            <div className={cn("flex h-16 items-center gap-2 px-4", isCollapsed && "justify-center px-2")}>
              {!isCollapsed && (
                <Link href="/" className="flex items-center font-semibold">
                  <span className="text-lg bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">{settings?.firmDetails?.firmName || "Kuber"}</span>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn("ml-auto h-8 w-8", isCollapsed && "ml-0")}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} Sidebar</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
          <div className="border-t border-amber-100 p-2">
            <nav className="space-y-1">
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} isBottom />
              ))}
            </nav>
          </div>
          <div className="border-t border-amber-100 p-2">
            <Button
              variant="ghost"
              className="w-full -mx-2 text-amber-700 hover:text-amber-900 hover:bg-amber-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
              onClick={logout}
            >
              <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </>
    </TooltipProvider>
  )
}

