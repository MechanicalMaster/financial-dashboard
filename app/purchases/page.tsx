"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PurchaseInvoicesList } from "@/components/purchases/purchase-invoices-list"
import { SuppliersList } from "@/components/purchases/suppliers-list"
import { Building2, FilePlus2 } from "lucide-react"
import Link from "next/link"

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState("invoices")

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
        <TabsList className="grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

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

