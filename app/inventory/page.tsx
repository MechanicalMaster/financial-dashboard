"use client"

// Flag to completely skip server rendering
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  Eye,
  Grid3X3,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  QrCode,
  Search,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ProductCard } from "@/components/inventory/product-card"
import { Pagination } from "@/components/invoices/pagination"
import { toast } from "sonner"
import { useDB } from "@/contexts/db-context"
import { InventoryItem } from "@/lib/db"
import { format } from "date-fns"
import { MasterDropdown } from "@/components/masters/master-dropdown"
import { SortDropdown } from "@/components/inventory/sort-dropdown"
import db from "@/lib/db"

// Define the StockStatus type to match the one in product-card.tsx
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

// Sample inventory data removed, using database instead

export default function InventoryPage() {
  const [view, setView] = useState("grid")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortField, setSortField] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const itemsPerPage = 12
  const { getAll, remove } = useDB()

  // Ensure client-side mounting is detected
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch inventory data from database
  useEffect(() => {
    // Skip fetch during server-side rendering
    if (typeof window === 'undefined') return;
    
    const fetchInventory = async () => {
      try {
        setLoading(true)
        const inventoryData = await getAll<InventoryItem>('inventory')
        setInventory(inventoryData)
      } catch (error) {
        console.error("Error fetching inventory:", error)
        toast.error("Failed to load inventory data")
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [getAll])

  // Filtering and sorting functions
  const getFilteredInventory = () => {
    return inventory
      .filter((item) => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (item.supplier || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = filterCategory === "all" || item.category === filterCategory;
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortField === "name") {
          return sortOrder === "asc" 
            ? (a.name || '').localeCompare(b.name || '') 
            : (b.name || '').localeCompare(a.name || '');
        }
        if (sortField === "quantity") {
          return sortOrder === "asc" 
            ? (a.quantity || 0) - (b.quantity || 0) 
            : (b.quantity || 0) - (a.quantity || 0);
        }
        if (sortField === "cost") {
          return sortOrder === "asc" 
            ? (a.cost || 0) - (b.cost || 0) 
            : (b.cost || 0) - (a.cost || 0);
        }
        return 0;
      });
  };

  const filteredInventory = getFilteredInventory();
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const displayedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Format date in a consistent way to avoid hydration mismatch
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Unknown';
    
    try {
      if (date instanceof Date) {
        return format(date, 'yyyy-MM-dd');
      } else {
        return format(new Date(date), 'yyyy-MM-dd');
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStockStatus = (quantity: number, reorderLevel: number = 5): StockStatus => {
    if (quantity <= 0) return "out_of_stock";
    if (quantity <= reorderLevel) return "low_stock";
    return "in_stock";
  };

  const getStatusBadge = (status: string, quantity: number) => {
    if (status === "out_of_stock" || quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (status === "low_stock" || quantity <= 5) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  const handleDeleteItem = async (id: string) => {
    if (!id) {
      toast.error("Cannot delete item without an ID")
      return
    }
    
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      // First delete from database
      await remove('inventory', id);
      
      // Then update the UI
      setInventory(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePrintLabels = (id: string) => {
    toast.info(`Printing labels for item ${id}`);
  };

  const handleGenerateQR = (id: string) => {
    toast.info(`Generating QR code for item ${id}`);
  };

  // Handle sort order toggle
  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">Manage your stock, track items, and monitor stock levels</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/inventory/bulk-upload'} 
            className="sm:self-start"
          >
            <Download className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button asChild className="sm:self-start">
            <Link href="/inventory/add">
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory by name, SKU, or supplier..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-auto">
            {isMounted && (
              <MasterDropdown 
                masterType="category"
                value={filterCategory} 
                onValueChange={setFilterCategory} 
                showAllOption={true}
                allOptionLabel="All Categories"
                placeholder="All Categories"
              />
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className={view === "grid" ? "bg-muted" : ""}
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={view === "table" ? "bg-muted" : ""}
              onClick={() => setView("table")}
            >
              <Package className="h-4 w-4" />
              <span className="sr-only">Table view</span>
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p>Loading inventory data...</p>
        </div>
      ) : !isMounted ? (
        <div className="text-center py-16">
          <p>Loading inventory data...</p>
        </div>
      ) : inventory.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-medium mb-2">No inventory items found</h3>
            <p className="text-muted-foreground mb-6">Get started by adding your first inventory item</p>
            <Button asChild>
              <Link href="/inventory/add">
                <Plus className="mr-2 h-4 w-4" />
                Add New Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div>
          {isMounted ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedInventory.map((item) => (
                <ProductCard
                  key={item.id}
                  product={{
                    id: item.id || '',
                    name: item.name || 'Unnamed Item',
                    category: item.category || 'Uncategorized',
                    stockQuantity: item.quantity || 0,
                    reorderLevel: 5, // Default reorder level
                    unitPrice: item.cost || 0,
                    supplier: item.supplier || 'Unknown Supplier',
                    lastUpdated: formatDate(item.updatedAt),
                    status: getStockStatus(item.quantity || 0, 5)
                  }}
                  onPrintLabel={() => handlePrintLabels(item.id || '')}
                  onGenerateQR={() => handleGenerateQR(item.id || '')}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p>Loading inventory data...</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <Card>
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle>Inventory List</CardTitle>
                {isMounted && (
                  <SortDropdown
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSortFieldChange={setSortField}
                    onSortOrderChange={handleSortOrderToggle}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isMounted ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name || 'Unnamed Item'}</TableCell>
                          <TableCell>{item.id?.substring(5, 12) || 'No ID'}</TableCell>
                          <TableCell>{item.category || 'Uncategorized'}</TableCell>
                          <TableCell className="text-right">{item.quantity || 0}</TableCell>
                          <TableCell className="text-right">₹{(item.cost || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            {getStatusBadge(getStockStatus(item.quantity || 0, 5), item.quantity || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/inventory/${item.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/inventory/edit/${item.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePrintLabels(item.id || '')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Print Labels
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleGenerateQR(item.id || '')}>
                                  <QrCode className="mr-2 h-4 w-4" />
                                  Generate QR Code
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteItem(item.id || '')}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <p>Loading inventory data...</p>
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

