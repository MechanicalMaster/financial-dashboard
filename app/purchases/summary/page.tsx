"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { SupplierChart } from "@/components/purchases/supplier-chart";
import { PieChart } from "@/components/ui/pie-chart";

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  supplier: string;
  amount: number;
  paymentStatus: string;
  items: Array<{
    itemName: string;
    quantity: number;
    price: number;
  }>;
}

export default function PurchaseSummaryPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On client side only
    const savedInvoices = localStorage.getItem("purchaseInvoices");
    const savedSuppliers = localStorage.getItem("suppliers");
    
    const invoicesData = savedInvoices ? JSON.parse(savedInvoices) : [];
    const suppliersData = savedSuppliers ? JSON.parse(savedSuppliers) : [];
    
    setInvoices(invoicesData);
    setTotalPurchases(invoicesData.reduce((sum: number, invoice: PurchaseInvoice) => sum + invoice.amount, 0));
    setTotalSuppliers(suppliersData.length);
    setPendingPayments(invoicesData
      .filter((invoice: PurchaseInvoice) => invoice.paymentStatus === "Pending")
      .reduce((sum: number, invoice: PurchaseInvoice) => sum + invoice.amount, 0));
    
    setIsLoading(false);
  }, []);

  // Calculate summary data for charts
  const getTopSuppliers = () => {
    const supplierTotals = invoices.reduce((acc: Record<string, number>, invoice: PurchaseInvoice) => {
      if (!acc[invoice.supplier]) {
        acc[invoice.supplier] = 0;
      }
      acc[invoice.supplier] += invoice.amount;
      return acc;
    }, {});

    return Object.entries(supplierTotals)
      .map(([supplier, total]) => ({ supplier, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const getPurchasesByMonth = () => {
    const monthlyData: Record<string, number> = {};
    
    invoices.forEach((invoice: PurchaseInvoice) => {
      const date = new Date(invoice.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += invoice.amount;
    });
    
    return Object.entries(monthlyData)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => {
        const monthA = new Date(a.month);
        const monthB = new Date(b.month);
        return monthA.getTime() - monthB.getTime();
      });
  };

  // For the status distribution chart
  const getStatusDistribution = () => {
    const statusData: Record<string, number> = {
      Paid: 0,
      Pending: 0,
      Overdue: 0
    };
    
    invoices.forEach((invoice: PurchaseInvoice) => {
      if (statusData[invoice.paymentStatus] !== undefined) {
        statusData[invoice.paymentStatus] += invoice.amount;
      }
    });
    
    return Object.entries(statusData).map(([status, amount]) => ({
      name: status,
      value: amount
    }));
  };

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading purchase summary...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Purchase Summary</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              For {invoices.length} invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Across all purchases
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Purchase</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices.length ? (totalPurchases / invoices.length).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per invoice</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Purchases</CardTitle>
                <CardDescription>
                  Purchase volume over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {getPurchasesByMonth().length > 0 ? (
                  <SupplierChart 
                    data={getPurchasesByMonth().map(item => ({
                      name: item.month,
                      total: item.total
                    }))} 
                  />
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No purchase data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>
                  Distribution by payment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getStatusDistribution().some(item => item.value > 0) ? (
                  <PieChart 
                    data={getStatusDistribution()}
                    colors={["#4CAF50", "#FFC107", "#F44336"]} 
                  />
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No payment data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
              <CardDescription>
                Suppliers by purchase volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getTopSuppliers().length > 0 ? (
                <div className="space-y-8">
                  {getTopSuppliers().map((supplier, index) => (
                    <div className="flex items-center" key={index}>
                      <div className="w-[120px] md:w-[200px] font-medium truncate">
                        {supplier.supplier}
                      </div>
                      <div className="ml-auto font-medium">${supplier.total.toLocaleString()}</div>
                      <div className="ml-4 w-28">
                        <div className="h-2 rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${(supplier.total / getTopSuppliers()[0].total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-[300px]">
                  <p className="text-muted-foreground">No supplier data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Trends</CardTitle>
              <CardDescription>
                Analysis of purchase patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Average Items per Invoice</h3>
                      <p className="text-2xl font-bold">
                        {(invoices.reduce((sum, invoice) => sum + invoice.items.length, 0) / invoices.length).toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Most Recent Purchase</h3>
                      <p className="text-2xl font-bold">
                        {new Date(Math.max(...invoices.map(i => new Date(i.date).getTime()))).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-[300px]">
                  <p className="text-muted-foreground">No purchase data available for trend analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 