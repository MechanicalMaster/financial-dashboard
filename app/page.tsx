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

// Define SVG motifs for jewelry-themed decorative elements
const jewelryMotifs = {
  mandala: (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5">
      <path d="M100 10C100 4.48 104.48 0 110 0C115.52 0 120 4.48 120 10V25C120 30.52 115.52 35 110 35C104.48 35 100 30.52 100 25V10Z" fill="currentColor"/>
      <path d="M145.96 16.18C143.57 11.27 145.7 5.35 150.61 2.96C155.52 0.57 161.43 2.7 163.82 7.61L171.89 23.97C174.28 28.88 172.15 34.8 167.24 37.19C162.33 39.58 156.41 37.45 154.02 32.54L145.96 16.18Z" fill="currentColor"/>
      <path d="M182.09 45.98C177.91 42.58 177.28 36.28 180.68 32.09C184.08 27.91 190.38 27.28 194.57 30.68L206.16 40.07C210.34 43.47 210.97 49.77 207.57 53.95C204.18 58.14 197.88 58.77 193.69 55.37L182.09 45.98Z" fill="currentColor"/>
      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4"/>
      <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="2"/>
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M85 100C85 91.72 91.72 85 100 85C108.28 85 115 91.72 115 100C115 108.28 108.28 115 100 115C91.72 115 85 108.28 85 100Z" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  
  paisley: (
    <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5">
      <path d="M60 10C85 10 100 35 100 60C100 85 85 110 60 130C35 110 20 85 20 60C20 35 35 10 60 10Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M60 30C75 30 85 45 85 60C85 75 75 90 60 100C45 90 35 75 35 60C35 45 45 30 60 30Z" stroke="currentColor" strokeWidth="1"/>
      <path d="M60 50C65 50 70 55 70 60C70 65 65 70 60 75C55 70 50 65 50 60C50 55 55 50 60 50Z" fill="currentColor" fillOpacity="0.2"/>
      <path d="M60 130C60 130 85 145 85 155C85 158 82 160 78 160H42C38 160 35 158 35 155C35 145 60 130 60 130Z" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  
  jewelryBorder: (
    <svg width="100" height="30" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5">
      <circle cx="10" cy="15" r="4" fill="currentColor"/>
      <circle cx="30" cy="15" r="4" fill="currentColor"/>
      <circle cx="50" cy="15" r="4" fill="currentColor"/>
      <circle cx="70" cy="15" r="4" fill="currentColor"/>
      <circle cx="90" cy="15" r="4" fill="currentColor"/>
      <path d="M14 15H26" stroke="currentColor" strokeWidth="1"/>
      <path d="M34 15H46" stroke="currentColor" strokeWidth="1"/>
      <path d="M54 15H66" stroke="currentColor" strokeWidth="1"/>
      <path d="M74 15H86" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  
  diamond: (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5">
      <path d="M30 5L55 30L30 55L5 30L30 5Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M30 15L45 30L30 45L15 30L30 15Z" stroke="currentColor" strokeWidth="1"/>
      <path d="M30 25L35 30L30 35L25 30L30 25Z" fill="currentColor" fillOpacity="0.2"/>
    </svg>
  ),
  
  jhumka: (
    <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-5">
      <circle cx="40" cy="20" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="40" cy="20" r="15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
      <path d="M40 30C50 30 60 40 60 50C60 70 40 80 40 80C40 80 20 70 20 50C20 40 30 30 40 30Z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="40" cy="90" r="5" stroke="currentColor" strokeWidth="1"/>
      <path d="M40 80L40 85" stroke="currentColor" strokeWidth="1"/>
      <path d="M30 40C30 40 40 45 50 40" stroke="currentColor" strokeWidth="1"/>
      <path d="M25 50C25 50 40 60 55 50" stroke="currentColor" strokeWidth="1"/>
      <path d="M30 60C30 60 40 65 50 60" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  
  headerDecoration: (
    <svg width="800" height="60" viewBox="0 0 800 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
      <path d="M400 5L420 25L400 45L380 25L400 5Z" fill="currentColor"/>
      <circle cx="400" cy="25" r="8" fill="white"/>
      <circle cx="400" cy="25" r="5" fill="currentColor"/>
      
      <path d="M340 15L355 30L340 45L325 30L340 15Z" stroke="currentColor" strokeWidth="1"/>
      <path d="M460 15L475 30L460 45L445 30L460 15Z" stroke="currentColor" strokeWidth="1"/>
      
      <path d="M280 20L290 30L280 40L270 30L280 20Z" stroke="currentColor" strokeWidth="1"/>
      <path d="M520 20L530 30L520 40L510 30L520 20Z" stroke="currentColor" strokeWidth="1"/>
      
      <circle cx="220" cy="30" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
      <circle cx="580" cy="30" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
      
      <line x1="150" y1="30" x2="200" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
      <line x1="600" y1="30" x2="650" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
      
      <circle cx="120" cy="30" r="5" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="680" cy="30" r="5" fill="currentColor" fillOpacity="0.3"/>
      
      <circle cx="90" cy="30" r="3" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="710" cy="30" r="3" fill="currentColor" fillOpacity="0.3"/>
      
      <circle cx="70" cy="30" r="2" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="730" cy="30" r="2" fill="currentColor" fillOpacity="0.3"/>
      
      <circle cx="55" cy="30" r="1" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="745" cy="30" r="1" fill="currentColor" fillOpacity="0.3"/>
    </svg>
  )
}

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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white relative overflow-hidden">
        {/* Decorative Background Motifs with shimmer animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none text-amber-700">
          {/* Top Left Mandala */}
          <motion.div 
            className="absolute -top-20 -left-20 transform rotate-12"
            animate={{ 
              opacity: [0.2, 0.3, 0.2],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.mandala}
          </motion.div>
          
          {/* Bottom Right Mandala */}
          <motion.div 
            className="absolute -bottom-40 -right-20 transform rotate-45"
            animate={{ 
              opacity: [0.15, 0.25, 0.15],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.mandala}
          </motion.div>
          
          {/* Middle Right Paisley */}
          <motion.div 
            className="absolute top-1/4 -right-10 transform rotate-12"
            animate={{ 
              opacity: [0.2, 0.3, 0.2],
              y: [0, 5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.paisley}
          </motion.div>
          
          {/* Bottom Left Paisley */}
          <motion.div 
            className="absolute bottom-10 left-10 transform -rotate-20"
            animate={{ 
              opacity: [0.15, 0.25, 0.15],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.paisley}
          </motion.div>
          
          {/* Traditional Jhumka earring motifs */}
          <motion.div 
            className="absolute top-40 left-10 transform rotate-15"
            animate={{ 
              y: [0, 3, 0],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.jhumka}
          </motion.div>
          
          <motion.div 
            className="absolute bottom-20 right-20 transform -rotate-10"
            animate={{ 
              y: [0, 3, 0],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.jhumka}
          </motion.div>
          
          {/* Scattered Diamonds */}
          <motion.div 
            className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -rotate-12"
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
              rotate: ["-12deg", "-10deg", "-12deg"]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.diamond}
          </motion.div>
          
          <motion.div 
            className="absolute top-2/3 right-1/4 transform translate-x-1/2 rotate-25"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              rotate: ["25deg", "28deg", "25deg"]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.diamond}
          </motion.div>
          
          <motion.div 
            className="absolute top-1/2 left-16 transform rotate-45"
            animate={{ 
              opacity: [0.25, 0.45, 0.25],
              rotate: ["45deg", "47deg", "45deg"]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.diamond}
          </motion.div>
        </div>

        {/* Content Container with frosted glass effect */}
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex justify-between items-center mb-2">
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
          
          {/* Decorative Header Line with shimmer */}
          <motion.div 
            className="w-full flex justify-center mb-8 text-amber-700 overflow-hidden"
            animate={{ 
              opacity: [0.6, 0.9, 0.6] 
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {jewelryMotifs.headerDecoration}
          </motion.div>

          {/* Navigation Cards with enhanced hover effects */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {navigationTiles.map((tile) => (
              <Link 
                key={tile.name} 
                href={getPath(tile.href)}
                className="group"
              >
                <motion.div 
                  className="h-full flex flex-col bg-white/90 backdrop-blur-sm border border-amber-100 rounded-lg overflow-hidden shadow-sm transition-all duration-200"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    borderColor: "rgba(217, 119, 6, 0.5)"
                  }}
                >
                  <div className="flex-1 p-4 md:p-6 flex flex-col items-center text-center">
                    <motion.div 
                      className="p-3 rounded-full bg-amber-50 text-amber-600 mb-3 group-hover:bg-amber-100 transition-colors"
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: "rgba(251, 191, 36, 0.2)"
                      }}
                    >
                      <tile.icon className="h-7 w-7" />
                    </motion.div>
                    <h3 className="font-semibold text-amber-900 mb-1">{tile.name}</h3>
                    <p className="text-xs text-amber-600 hidden md:block">{tile.description}</p>
                  </div>
                </motion.div>
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

