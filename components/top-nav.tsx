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
import React from "react"
import { useAuth } from "@/contexts/auth-context"
import { getPath } from "@/lib/utils/path-utils"

export function TopNav() {
  const pathname = usePathname() || ""
  const pathSegments = pathname.split("/").filter(Boolean)
  const { settings } = useSettings()
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-amber-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="hidden md:block">
          <nav className="flex items-center space-x-2">
            <Link href={getPath("/")} className="text-sm font-medium text-amber-900 hover:text-amber-700">
              Home
            </Link>
            {pathSegments.map((segment, index) => (
              <React.Fragment key={segment}>
                <span className="text-amber-300">/</span>
                <Link 
                  href={`/${pathSegments.slice(0, index + 1).join("/")}`} 
                  className="text-sm font-medium text-amber-900 hover:text-amber-700"
                >
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </Link>
              </React.Fragment>
            ))}
          </nav>
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
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-amber-50">
                <Avatar className="h-8 w-8 ring-2 ring-amber-200">
                  <AvatarImage src={settings.avatar} alt={settings.fullName} />
                  <AvatarFallback className="bg-amber-100 text-amber-900">
                    {settings.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-amber-100" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-amber-900">{settings.fullName}</p>
                  <p className="text-xs leading-none text-amber-600">{settings.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-amber-100" />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="text-amber-900 hover:text-amber-700 hover:bg-amber-50">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="text-amber-900 hover:text-amber-700 hover:bg-amber-50">Settings</Link>
              </DropdownMenuItem>
              {isAuthenticated && (
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-amber-900 hover:text-amber-700 hover:bg-amber-50"
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

