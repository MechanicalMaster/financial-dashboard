"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { useAuth } from "@/contexts/auth-context"

// Define public routes that don't need authentication
const publicRoutes = ['/login']

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''
  const { isAuthenticated } = useAuth()
  
  // Home page is handled specially - it can be public or private
  const isHomePage = pathname === '/'
  const isPublicRoute = publicRoutes.includes(pathname)

  // For login page, show only the content without app layout
  if (isPublicRoute) {
    return children
  }
  
  // For home page when not authenticated, show without app layout
  if (isHomePage && !isAuthenticated) {
    return children
  }

  // For private routes, if not authenticated, return null (auth context will handle redirect)
  if (!isAuthenticated) {
    return null
  }

  // For authenticated users on private routes or home page, show the app layout
  return (
    <div className="min-h-screen flex bg-amber-50/20">
      <Sidebar />
      <div className="flex-1 flex flex-col transition-all duration-200 ease-in-out">
        <TopNav />
        <div className="flex-1 container mx-auto p-6 max-w-7xl">
          <main className="w-full">{children}</main>
        </div>
      </div>
    </div>
  )
} 