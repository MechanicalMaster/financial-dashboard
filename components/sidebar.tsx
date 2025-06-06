"use client"

import { useState, useEffect } from "react"
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
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useSettings } from "@/contexts/settings-context"
import { useAuth } from "@/contexts/auth-context"
import { getPath } from "@/lib/utils/path-utils"

interface NavItemType {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItemType[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Stock", href: "/stock", icon: Package },
  { name: "Old Stock", href: "/old-stock", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Sales", href: "/sales", icon: Receipt },
]

const bottomNavigation: NavItemType[] = [
  { name: "Masters", href: "/masters", icon: Database },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { settings } = useSettings()
  const { logout } = useAuth()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])
  
  // Listen for custom toggle-sidebar event from TopNav
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsMobileOpen(!isMobileOpen)
    }
    
    window.addEventListener('toggle-sidebar', handleToggleSidebar)
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggleSidebar)
    }
  }, [isMobileOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen])

  const NavItem = ({ item, isBottom = false }: { item: NavItemType; isBottom?: boolean }) => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          href={getPath(item.href)}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-accent text-primary border border-border"
              : "text-foreground hover:bg-accent hover:text-primary hover:border hover:border-border",
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
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md hover:bg-accent transition-colors"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
        <div
          className={cn(
            "fixed inset-y-0 z-40 flex flex-col bg-background transition-all duration-300 ease-in-out lg:static",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            "shadow-lg lg:shadow-none"
          )}
        >
          <div className="border-b border-border">
            <div className={cn("flex h-16 items-center gap-2 px-4", isCollapsed && "justify-center px-2")}>
              {!isCollapsed && (
                <Link href={getPath("/")} className="flex items-center font-semibold">
                  <span className="text-lg text-primary">{settings?.firmDetails?.firmName || "Kuber"}</span>
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
          <div className="border-t border-border p-2">
            <nav className="space-y-1">
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} isBottom />
              ))}
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={logout}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors w-full",
                      "text-foreground hover:bg-accent hover:text-primary hover:border hover:border-border",
                      isCollapsed && "justify-center px-2",
                    )}
                  >
                    <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span>Logout</span>}
                  </button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="flex items-center gap-4">
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>
            </nav>
          </div>
        </div>
      </>
    </TooltipProvider>
  )
}
