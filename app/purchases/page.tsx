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
import { Purchase } from "@/lib/db"

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { db, getAll } = useDB();
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [suppliers, setSuppliers] = useState<string[]>([])
  const [statistics, setStatistics] = useState([
    { title: "Total Purchases", value: "₹0.00", icon: FileText, change: "0%" },
    { title: "Active Suppliers", value: "0", icon: Building2, change: "0" },
    { title: "Pending Orders", value: "0", icon: Clock, change: "0" },
    { title: "Avg. Turnaround", value: "0 days", icon: Truck, change: "0 days" }
  ])

  // Fetch actual purchase data from the database
  useEffect(() => {
    const fetchPurchaseData = async () => {
      setIsLoading(true);
      try {
        // Get purchases from database
        const purchasesData = await getAll<Purchase>('purchases');
        setPurchases(purchasesData);
        
        // Extract unique suppliers
        const uniqueSuppliers = [...new Set(purchasesData.map(p => p.supplier))];
        setSuppliers(uniqueSuppliers);
        
        // Calculate statistics
        if (purchasesData.length > 0) {
          const totalAmount = purchasesData.reduce((sum, item) => sum + item.cost, 0);
          setStatistics([
            { 
              title: "Total Purchases", 
              value: `₹${totalAmount.toFixed(2)}`, 
              icon: FileText, 
              change: "0%" 
            },
            { 
              title: "Active Suppliers", 
              value: uniqueSuppliers.length.toString(), 
              icon: Building2, 
              change: "0" 
            },
            { 
              title: "Pending Orders", 
              value: "0", 
              icon: Clock, 
              change: "0" 
            },
            { 
              title: "Avg. Turnaround", 
              value: "0 days", 
              icon: Truck, 
              change: "0 days" 
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching purchase data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPurchaseData();
  }, [getAll]);

  // Format purchase data for recent activity
  const formatRecentPurchases = () => {
    return purchases
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
      })
      .slice(0, 5) // Take only the 5 most recent
      .map(purchase => ({
        id: purchase.id || "",
        supplier: purchase.supplier,
        date: purchase.date instanceof Date 
          ? purchase.date.toISOString().split('T')[0] 
          : new Date(purchase.date).toISOString().split('T')[0],
        amount: purchase.cost,
        status: "received" // Default status since we don't track this yet
      }));
  };

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
                {isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading purchase data...</div>
                ) : purchases.length > 0 ? (
                  <RecentActivity purchases={formatRecentPurchases()} />
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No purchase data available. Add your first purchase invoice to get started.
                  </div>
                )}
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
                    <Link href="/stock">
                      <Package className="mr-2 h-4 w-4" />
                      View Stock
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/purchases/reports">
                      <FileText className="mr-2 h-4 w-4" />
                      Purchase Reports
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/stock/add">
                      <PlusSquare className="mr-2 h-4 w-4" />
                      Add Stock Item
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
                {isLoading ? (
                  <div className="py-4 text-center text-muted-foreground">Loading summary...</div>
                ) : purchases.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                      <p className="text-2xl font-bold">
                        ₹{purchases.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Invoices Processed</p>
                      <p className="text-2xl font-bold">{purchases.length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Avg. Invoice Value</p>
                      <p className="text-2xl font-bold">
                        ₹{(purchases.reduce((sum, item) => sum + item.cost, 0) / (purchases.length || 1)).toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Top Supplier</p>
                      <p className="text-2xl font-bold">
                        {suppliers.length > 0 ? suppliers[0] : 'None'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No purchase data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <PurchaseInvoicesList />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

