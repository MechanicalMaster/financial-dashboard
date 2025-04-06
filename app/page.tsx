"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { Diamond, CreditCard, Users, Bell, BarChart, Package, LogIn, Languages, Home, ShoppingCart, Receipt, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useSettings } from "@/contexts/settings-context"
import { getPath } from "@/lib/utils/path-utils"

// Define the navigation tile data with icons and routes
const navigationTiles = [
  { name: "Purchases", href: "/purchases", icon: ShoppingCart, description: "Manage your purchase orders" },
  { name: "Stock", href: "/inventory", icon: Package, description: "Track your inventory items" },
  { name: "Old Stock", href: "/old-stock", icon: Package, description: "Manage used or second-hand items" },
  { name: "Customers", href: "/customers", icon: Users, description: "View and manage customer information" },
  { name: "Invoices", href: "/invoices", icon: Receipt, description: "Create and manage invoices" },
]

export default function HomePage() {
  const { isAuthenticated, logout } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })
  const { settings } = useSettings()

  const handleLogin = () => {
    router.push(getPath("/login"))
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push(getPath("/"))
    } else {
      router.push(getPath("/login"))
    }
  }

  const features = [
    {
      icon: Diamond,
      title: "stockManagement",
      description: "stockDesc"
    },
    {
      icon: CreditCard,
      title: "invoicing",
      description: "invoicingDesc"
    },
    {
      icon: Users,
      title: "customerRelations",
      description: "customerDesc"
    },
    {
      icon: Bell,
      title: "reminders",
      description: "remindersDesc"
    },
    {
      icon: BarChart,
      title: "analytics",
      description: "analyticsDesc"
    },
    {
      icon: Package,
      title: "oldStock",
      description: "oldStockDesc"
    }
  ]

  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
              {settings?.firmDetails?.firmName || "Kuber"}
            </h1>
            <Button
              onClick={logout}
              variant="outline"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              {t("logout")}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {navigationTiles.map((tile) => (
              <Link 
                key={tile.name} 
                href={getPath(tile.href)}
                className="group"
              >
                <div className="h-full flex flex-col bg-white border border-amber-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200">
                  <div className="flex-1 p-4 md:p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-amber-50 text-amber-600 mb-3 group-hover:bg-amber-100 transition-colors">
                      <tile.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-amber-900 mb-1">{tile.name}</h3>
                    <p className="text-xs text-amber-600 hidden md:block">{tile.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-amber-50 to-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-amber-200/20 via-transparent to-transparent rounded-full" />
        </motion.div>
      </div>

      {/* Top Navigation */}
      <motion.nav
        className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-amber-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Diamond className="h-8 w-8 text-amber-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Kuber</span>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Languages className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>
                    🇬🇧 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("hi")}>
                    🇮🇳 हिंदी
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handleLogin}
                variant="ghost"
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                {t("login")}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div 
        className="relative text-center pt-32 pb-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 mb-8"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-4"
            style={{
              background: "linear-gradient(to right, #92400e, #f59e0b, #92400e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
            }}
            animate={{
              backgroundPosition: ["0%", "200%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {settings?.firmDetails?.firmName || "Kuber"}
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleGetStarted}
          >
            {t("getStarted")}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-amber-600 text-amber-600 hover:bg-amber-50"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t("learnMore")}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-4xl font-bold text-amber-600 mb-2">1000+</h3>
            <p className="text-gray-600">{t("activeUsers")}</p>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-4xl font-bold text-amber-600 mb-2">₹10Cr+</h3>
            <p className="text-gray-600">{t("transactionsProcessed")}</p>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-4xl font-bold text-amber-600 mb-2">98%</h3>
            <p className="text-gray-600">{t("customerSatisfaction")}</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <div id="features" className="relative py-16 px-4 bg-white">
        <motion.div
          className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"
          style={{ y: parallaxY }}
        />
        <motion.h2 
          className="text-3xl font-bold text-center mb-12 text-gray-800 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t("featuresTitle")}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className="w-12 h-12 text-amber-600 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{t(feature.title)}</h3>
                  <p className="text-gray-600">{t(feature.description)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="relative bg-amber-50 py-12 px-4 text-center overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        </motion.div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t("ready")}
          </h2>
          <p className="text-gray-600 mb-8">
            {t("joinText")}
          </p>
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleGetStarted}
          >
            {t("startJourney")}
          </Button>
        </div>
      </motion.footer>
    </div>
  )
}

