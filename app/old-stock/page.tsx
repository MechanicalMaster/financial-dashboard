"use client"

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
  Eye,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Pagination } from "@/components/invoices/pagination"
import { toast } from "sonner"
import { useDB } from "@/contexts/db-context"
import { format } from "date-fns"
import { MasterDropdown } from "@/components/masters/master-dropdown"

interface OldStockItem {
  id?: string;
  name: string;
  category: string;
  purchaseDate: Date;
  purchasePrice: number;
  customerName: string;
  customerPhone?: string;
  weight?: number;
  metal?: string;
  purity?: string;
  description?: string;
  status: 'available' | 'sold' | 'processing';
  createdAt: Date;
  updatedAt: Date;
}

export default function OldStockPage() {
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [oldStock, setOldStock] = useState<OldStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const itemsPerPage = 10
  const { getAll, remove } = useDB()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const fetchOldStock = async () => {
      try {
        setLoading(true)
        const oldStockData = await getAll<OldStockItem>('oldStock')
        setOldStock(oldStockData)
      } catch (error) {
        console.error("Error fetching old stock:", error)
        toast.error("Failed to load old stock data")
      } finally {
        setLoading(false)
      }
    }

    fetchOldStock()
  }, [getAll])

  const getFilteredOldStock = () => {
    return oldStock
      .filter((item) => {
        const matchesSearch = 
          (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
          (item.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.customerPhone || '').includes(searchQuery);
        
        const matchesCategory = filterCategory === "all" || item.category === filterCategory;
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
  };

  const filteredOldStock = getFilteredOldStock();
  const totalPages = Math.ceil(filteredOldStock.length / itemsPerPage);
  const displayedOldStock = filteredOldStock.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default">Available</Badge>;
      case 'sold':
        return <Badge variant="secondary">Sold</Badge>;
      case 'processing':
        return <Badge variant="destructive">Processing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
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
      await remove('oldStock', id);
      setOldStock(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Old Stock Management</h1>
          <p className="text-muted-foreground">Manage items purchased from customers</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild className="sm:self-start">
            <Link href="/old-stock/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Old Stock
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by item name, customer name, or phone..."
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
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p>Loading old stock data...</p>
        </div>
      ) : !isMounted ? (
        <div className="text-center py-16">
          <p>Loading old stock data...</p>
        </div>
      ) : oldStock.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-medium mb-2">No old stock items found</h3>
            <p className="text-muted-foreground mb-6">Start by adding your first old stock item</p>
            <Button asChild>
              <Link href="/old-stock/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Old Stock
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Old Stock List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedOldStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div>{item.customerName}</div>
                          <div className="text-sm text-muted-foreground">{item.customerPhone}</div>
                        </TableCell>
                        <TableCell>{formatDate(item.purchaseDate)}</TableCell>
                        <TableCell className="text-right">₹{item.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                                <Link href={`/old-stock/${item.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/old-stock/edit/${item.id}`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
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