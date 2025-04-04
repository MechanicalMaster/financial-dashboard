"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getPath } from "@/lib/utils/path-utils"

interface AuthContextType {
  isAuthenticated: boolean
  login: (phone: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
})

// Define public routes that don't need authentication
const publicRoutes = ['/', '/login']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(authStatus)
    setIsLoading(false)

    // If on a private route and not authenticated, redirect to login
    if (!authStatus && !publicRoutes.includes(pathname)) {
      router.push(getPath("/login"))
    }

    // If authenticated and on login page, redirect to dashboard
    if (authStatus && pathname === "/login") {
      router.push(getPath("/dashboard"))
    }
  }, [pathname, router])

  const login = async (phone: string, password: string) => {
    // Static credential check
    if (phone === "8454881721" && password === "pwd") {
      localStorage.setItem("isAuthenticated", "true")
      setIsAuthenticated(true)
      router.push(getPath("/dashboard"))
    } else {
      throw new Error("Invalid credentials")
    }
  }

  const logout = () => {
    localStorage.removeItem("isAuthenticated")
    setIsAuthenticated(false)
    router.push(getPath("/"))
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 