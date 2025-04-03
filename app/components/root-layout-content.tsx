"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { useAuth } from "@/contexts/auth-context"

// Define public routes that don't need authentication
const publicRoutes = ['/', '/login']

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const isPublicRoute = publicRoutes.includes(pathname)

  // For public routes (landing page and login), show only the content without app layout
  if (isPublicRoute) {
    return children
  }

  // For private routes, if not authenticated, return null (auth context will handle redirect)
  if (!isAuthenticated) {
    return null
  }

  // For authenticated users on private routes, show the app layout
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <TopNav />
        <div className="container mx-auto p-6 max-w-7xl">
          <main className="w-full">{children}</main>
        </div>
      </div>
    </div>
  )
} 