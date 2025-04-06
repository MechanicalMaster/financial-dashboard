"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { PurchaseInvoicesList } from "@/components/purchases/purchase-invoices-list"
import { SuppliersList } from "@/components/purchases/suppliers-list"
import { RecentActivity } from "@/components/purchases/recent-activity"
import { StatsCard } from "@/components/purchases/stats-card"
import { Building2, Clock, FileText, FilePlus2, Package, Percent, PlusSquare, Truck, ShoppingCart, Users2 } from "lucide-react"
import Link from "next/link"
import { useDB } from "@/contexts/db-context"

// Sample recent purchase data
const recentPurchases = [
  {
    id: "PO-001",
    supplier: "Office Supplies Inc.",
    date: "2023-07-25",
    amount: 1250.0,
    status: "received",
  },
  {
    id: "PO-002",
    supplier: "Tech Solutions Ltd.",
    date: "2023-07-22",
    amount: 3450.75,
    status: "pending",
  },
  {
    id: "PO-003",
    supplier: "Furniture Depot",
    date: "2023-07-20",
    amount: 7800.5,
    status: "received",
  },
  {
    id: "PO-004",
    supplier: "Paper Products Co.",
    date: "2023-07-18",
    amount: 540.25,
    status: "received",
  },
  {
    id: "PO-005",
    supplier: "Global Electronics",
    date: "2023-07-15",
    amount: 12670.8,
    status: "cancelled",
  },
]

// Sample supplier data
const suppliers = [
  {
    id: 1,
    name: "Office Supplies Inc.",
    contact: "John Smith",
    email: "john@officesupplies.com",
    phone: "555-1234",
    invoices: 12,
  },
  {
    id: 2,
    name: "Tech Solutions Ltd.",
    contact: "Emily Johnson",
    email: "emily@techsolutions.com",
    phone: "555-5678",
    invoices: 8,
  },
  {
    id: 3,
    name: "Furniture Depot",
    contact: "Robert Davis",
    email: "robert@furnituredepot.com",
    phone: "555-9012",
    invoices: 5,
  },
  {
    id: 4,
    name: "Paper Products Co.",
    contact: "Sarah Miller",
    email: "sarah@paperproducts.com",
    phone: "555-3456",
    invoices: 15,
  },
  {
    id: 5,
    name: "Global Electronics",
    contact: "Michael Wilson",
    email: "michael@globalelectronics.com",
    phone: "555-7890",
    invoices: 3,
  },
]

// Sample statistics
const statistics = [
  { title: "Total Purchases", value: "₹45,678.50", icon: FileText, change: "+12.5%" },
  { title: "Active Suppliers", value: "24", icon: Building2, change: "+3" },
  { title: "Pending Orders", value: "7", icon: Clock, change: "-2" },
  { title: "Avg. Turnaround", value: "4.2 days", icon: Truck, change: "-0.5 days" },
]

const overviewItems = [
  { title: "Total Purchases", value: "₹45,678.50", icon: FileText, change: "+12.5%" },
  { title: "Pending Orders", value: "23", icon: Package, change: "-5.2%" },
  { title: "Average Order", value: "₹1,890.20", icon: ShoppingCart, change: "+2.3%" },
  { title: "Vendors", value: "156", icon: Users2, change: "+12.0%" },
]

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { db } = useDB();

  // One-time cleanup for dummy data
  useEffect(() => {
    const cleanupDummyData = async () => {
      try {
        // Call the cleanupPurchaseData method directly
        await db.cleanupPurchaseData();
      } catch (error) {
        console.error("Error cleaning up purchase data:", error);
      }
    };
    
    cleanupDummyData();
  }, [db]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">Manage your purchase invoices and suppliers</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link href="/purchases/invoice/new">
              <FilePlus2 className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/purchases/supplier/new">
              <Building2 className="mr-2 h-4 w-4" />
              Add Supplier
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statistics.map((stat, index) => (
              <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} change={stat.change} />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchase Invoices</CardTitle>
                <CardDescription>Overview of your recent purchase transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity purchases={recentPurchases} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/inventory">
                      <Package className="mr-2 h-4 w-4" />
                      View Inventory
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/purchases/reports">
                      <FileText className="mr-2 h-4 w-4" />
                      Purchase Reports
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/inventory/add">
                      <PlusSquare className="mr-2 h-4 w-4" />
                      Add Inventory Item
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/purchases/discounts">
                      <Percent className="mr-2 h-4 w-4" />
                      Supplier Discounts
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Purchase Summary</CardTitle>
                <DateRangePicker />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                    <p className="text-2xl font-bold">₹78,594.50</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Invoices Processed</p>
                    <p className="text-2xl font-bold">128</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Avg. Invoice Value</p>
                    <p className="text-2xl font-bold">₹614.02</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Top Supplier</p>
                    <p className="text-2xl font-bold">Office Supplies Inc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <PurchaseInvoicesList />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersList suppliers={suppliers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

