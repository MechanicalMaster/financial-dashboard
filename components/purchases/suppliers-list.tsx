"use client"

import { useState, useEffect } from "react"
import {
  Building,
  Building2,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash,
  User,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDB } from "@/contexts/db-context"
import { Pagination } from "@/components/invoices/pagination"
import Link from "next/link"

// Define the supplier interface
interface Supplier {
  id: number;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  invoices?: number;
}

export function SuppliersList({ suppliers: propSuppliers = [] }: { suppliers?: Supplier[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const itemsPerPage = 8
  const { getAll, getMastersByType } = useDB()

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        // Try to get suppliers from masters database
        const supplierMasters = await getMastersByType('supplier')
        
        // Convert masters to supplier format
        const suppliersList: Supplier[] = supplierMasters.map((master, index) => ({
          id: index + 1,
          name: master.value,
          contact: "",
          email: "",
          phone: "",
          invoices: 0
        }))
        
        setSuppliers(suppliersList)
      } catch (error) {
        console.error("Error loading suppliers:", error)
        
        // Fallback to props if we can't load from the database
        if (propSuppliers.length > 0) {
          setSuppliers(propSuppliers)
        }
      }
    }
    
    loadSuppliers()
  }, [getMastersByType, propSuppliers])

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.contact && supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (supplier.phone && supplier.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/purchases/supplier/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Link>
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Suppliers Found</CardTitle>
            <p className="text-muted-foreground text-center mb-4">
              Add your first supplier to get started with managing your supply chain.
            </p>
            <Button asChild>
              <Link href="/purchases/supplier/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedSuppliers.map((supplier) => (
              <Card key={supplier.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base truncate">{supplier.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link href={`/purchases/supplier/${supplier.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link href={`/purchases/supplier/${supplier.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 cursor-pointer">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                  {supplier.contact && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">{supplier.contact}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{supplier.phone}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t mt-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{supplier.invoices || 0}</span> Invoices
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

