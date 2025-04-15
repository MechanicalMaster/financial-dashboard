"use client"
import { ThemeToggle } from "./theme-toggle"
import { Notifications } from "./notifications"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSettings } from "@/contexts/settings-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getPath } from "@/lib/utils/path-utils"
import { Menu } from "lucide-react"

export function TopNav() {
  const pathname = usePathname() || ""
  const pathSegments = pathname.split("/").filter(Boolean)
  const { settings } = useSettings()
  const { isAuthenticated, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Function to toggle mobile sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    // Dispatch a custom event that the Sidebar component will listen for
    const event = new CustomEvent('toggle-sidebar')
    window.dispatchEvent(event)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="hidden md:block">
            <nav className="flex items-center space-x-2">
              <Link href={getPath("/")} className="text-sm font-medium text-primary hover:text-primary/80">
                Home
              </Link>
              {pathSegments.map((segment, index) => (
                <React.Fragment key={segment}>
                  <span className="text-muted-foreground">/</span>
                  <Link 
                    href={`/${pathSegments.slice(0, index + 1).join("/")}`} 
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
            <Notifications />
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent">
                <Avatar className="h-8 w-8 ring-2 ring-border">
                  <AvatarImage src={settings.profilePhoto} alt={settings.fullName} />
                  <AvatarFallback className="bg-accent text-primary">
                    {settings.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-border" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-primary">{settings.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{settings.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="text-primary hover:text-primary/80 hover:bg-accent">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="text-primary hover:text-primary/80 hover:bg-accent">Settings</Link>
              </DropdownMenuItem>
              {isAuthenticated && (
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-primary hover:text-primary/80 hover:bg-accent"
                >
                  Log out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
