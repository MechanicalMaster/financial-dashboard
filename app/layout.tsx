import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SettingsProvider } from "@/contexts/settings-context"
import { DBProvider } from "@/contexts/db-context"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { RootLayoutContent } from "./components/root-layout-content"
import type { Metadata } from "next"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kuber - Jewelry Business Management",
  description: "The ultimate jewelry business management solution for modern jewelers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <DBProvider>
                <SettingsProvider>
                  <TooltipProvider delayDuration={0}>
                    <RootLayoutContent>{children}</RootLayoutContent>
                  </TooltipProvider>
                </SettingsProvider>
              </DBProvider>
            </ThemeProvider>
            <Toaster position="top-right" />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'