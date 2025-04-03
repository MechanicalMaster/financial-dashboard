"use client"

import { Toaster } from "sonner"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DBProvider } from "@/contexts/db-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DBProvider>
        <SettingsProvider>
          <TooltipProvider delayDuration={0}>
            <div className="relative">
              {!isHomePage && (
                <div className="fixed inset-y-0 z-50 hidden h-full w-72 lg:block">
                  <Sidebar />
                </div>
              )}
              <main className={!isHomePage ? "lg:pl-72" : ""}>
                {children}
              </main>
            </div>
            <Toaster position="top-right" />
          </TooltipProvider>
        </SettingsProvider>
      </DBProvider>
    </ThemeProvider>
  )
} 