"use client"

import React, { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Grid, 
  List, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  FileBarChart2, 
  ArrowUpDown, 
  QrCode, 
  Download, 
  Upload,
  ChevronRight,
  ChevronDown 
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useDB } from "@/contexts/db-context"
import { InventoryItem } from "@/lib/db"
import QRCode from "qrcode"
// @ts-ignore - XLSX doesn't have TypeScript definitions in this project
import * as XLSX from "xlsx"

// Import userDB directly for references
import { userDB } from "@/lib/db"

// Define a type for Excel row data
interface ExcelRowData {
  [key: string]: string | number | undefined;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock"

// Determine stock status based on quantity
function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return "out_of_stock"
  if (quantity < 5) return "low_stock"
  return "in_stock"
}

// Component for the sort dropdown
interface SortDropdownProps {
  onSortChange: (field: string) => void
  onSortOrderToggle: () => void
  sortOrder: "asc" | "desc"
  sortField: string
}

function SortDropdown({ onSortChange, onSortOrderToggle, sortOrder, sortField }: SortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 mr-2">
          Sort
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => onSortChange("name")}
          className={sortField === "name" ? "bg-accent" : ""}
        >
          Name
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange("category")}
          className={sortField === "category" ? "bg-accent" : ""}
        >
          Category
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange("quantity")}
          className={sortField === "quantity" ? "bg-accent" : ""}
        >
          Quantity
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange("cost")}
          className={sortField === "cost" ? "bg-accent" : ""}
        >
          Cost
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange("createdAt")}
          className={sortField === "createdAt" ? "bg-accent" : ""}
        >
          Date Added
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onSortOrderToggle}
          className="border-t mt-1 pt-1"
        >
          {sortOrder === "asc" ? "Ascending ↑" : "Descending ↓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Add this custom hook to load image data from IndexedDB
function useImageFromDb(filename?: string): string | null {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!filename) return;
    
    const loadImage = async () => {
      try {
        const imageRecord = await userDB.getImage(filename);
        if (imageRecord && imageRecord.data) {
          const url = URL.createObjectURL(imageRecord.data);
          setImageUrl(url);
        }
      } catch (error) {
        console.error(`Error loading image ${filename}:`, error);
      }
    };
    
    loadImage();
    
    // Cleanup object URL on unmount
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [filename]);
  
  return imageUrl;
}

// Component for displaying a product card in grid view
interface ProductCardProps {
  item: InventoryItem & { imageUrl?: string }
  onDelete: (id: string) => void
  onPrintLabel: (item: InventoryItem) => void
  onGenerateQR: (item: InventoryItem) => void
  id?: string
}

function ProductCard({ item, onDelete, onPrintLabel, onGenerateQR, id }: ProductCardProps) {
  const stockStatus = getStockStatus(item.quantity)
  
  // Load thumbnail image or first image
  const thumbnailUrl = useImageFromDb(item.thumbnailUrl);
  const [firstImageUrl, setFirstImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Only try to load the first image if no thumbnail is available
    if (!item.thumbnailUrl && item.imageFilenames && item.imageFilenames.length > 0) {
      const loadFirstImage = async () => {
        try {
          const firstImageFilename = item.imageFilenames![0];
          const imageRecord = await userDB.getImage(firstImageFilename);
          if (imageRecord && imageRecord.data) {
            const url = URL.createObjectURL(imageRecord.data);
            setFirstImageUrl(url);
          }
        } catch (error) {
          console.error('Error loading first image:', error);
        }
      };
      
      loadFirstImage();
    }
    
    // Cleanup object URL on unmount
    return () => {
      if (firstImageUrl) {
        URL.revokeObjectURL(firstImageUrl);
      }
    };
  }, [item.thumbnailUrl, item.imageFilenames]);
  
  // Determine which image URL to use (thumbnail, first image, or default)
  const displayImageUrl = thumbnailUrl || firstImageUrl || item.imageUrl;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="bg-muted h-40 flex items-center justify-center">
          {displayImageUrl ? (
            <img 
              src={displayImageUrl} 
              alt={item.name || 'Product'} 
              className="h-full w-full object-cover"
            />
          ) : (
            <FileBarChart2 className="h-16 w-16 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.category}</p>
          </div>
        </div>
        
        <div className="text-sm space-y-1 mt-3 mb-3">
          {item.weight !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span>{item.weight}g</span>
            </div>
          )}
          {item.metal && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metal:</span>
              <span>{item.metal}</span>
            </div>
          )}
          {item.purity && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purity:</span>
              <span>{item.purity}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between gap-2 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPrintLabel(item)}
          className="flex-1"
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          Label
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onGenerateQR(item)}
          className="flex-1"
        >
          <QrCode className="h-3.5 w-3.5 mr-1" />
          QR
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/stock/edit/${item.id}`}>Edit Item</Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(item.id!)}
            >
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

// Stock status badge component
function StockStatusBadge({ status }: { status: StockStatus }) {
  if (status === "in_stock") {
    return <Badge variant="default" className="bg-green-500">In Stock</Badge>
  } else if (status === "low_stock") {
    return <Badge variant="default" className="bg-yellow-500">Low Stock</Badge>
  } else {
    return <Badge variant="destructive">Out of Stock</Badge>
  }
}

// Category section with collapsible items
interface CategorySectionProps {
  category: string
  items: (InventoryItem & { imageUrl?: string })[]
  onDelete: (id: string) => void
  onPrintLabel: (item: InventoryItem) => void
  onGenerateQR: (item: InventoryItem) => void
  viewType: "grid" | "list"
  formatDate: (date: Date | string) => string
}

function CategorySection({ 
  category, 
  items, 
  onDelete, 
  onPrintLabel, 
  onGenerateQR, 
  viewType,
  formatDate
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mb-8">
      <div 
        className="flex items-center gap-2 mb-4 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
        <h2 className="text-xl font-semibold">{category} ({items.length})</h2>
      </div>
      
      {isExpanded && (
        viewType === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onDelete={onDelete}
                onPrintLabel={onPrintLabel}
                onGenerateQR={onGenerateQR}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Metal/Purity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const stockStatus = getStockStatus(item.quantity)
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.metal && `${item.metal}${item.purity ? ` / ${item.purity}` : ''}`}
                        {!item.metal && item.purity}
                      </TableCell>
                      <TableCell>
                        {item.weight !== undefined ? `${item.weight} g` : '-'}
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt || '')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPrintLabel(item)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onGenerateQR(item)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/stock/edit/${item.id}`}>Edit Item</Link>
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    Delete Item
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure you want to delete this item?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete
                                      the stock item {item.name}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onDelete(item.id!)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )
      )}
    </div>
  )
}

export default function StockPage() {
  // State for view type (grid or list)
  const [viewType, setViewType] = useState<"grid" | "list">("grid")
  
  // State for filtering and sorting
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  
  // State for inventory data
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  // References for file input
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Get the database context
  const { getAll, remove: deleteItem, add: addItem } = useDB()
  
  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true)
      try {
        const items = await getAll<InventoryItem>('inventory')
        
        // Sort the items
        items.sort((a, b) => {
          const valA = a[sortField as keyof InventoryItem];
          const valB = b[sortField as keyof InventoryItem];
          
          // Handle undefined or null values
          if (valA === undefined || valA === null) return sortOrder === "asc" ? -1 : 1;
          if (valB === undefined || valB === null) return sortOrder === "asc" ? 1 : -1;
          
          // Compare values
          if (valA < valB) {
            return sortOrder === "asc" ? -1 : 1;
          }
          if (valA > valB) {
            return sortOrder === "asc" ? 1 : -1;
          }
          return 0;
        });
        
        setInventoryData(items);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(items.map(item => item.category))].filter(Boolean) as string[];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast.error("Failed to load inventory items");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInventory();
  }, [getAll, sortField, sortOrder]);
  
  // Effect to ensure client-side mounting before using browser APIs
  useEffect(() => {
    setIsMounted(true)
    
    // Try to load the view preference from localStorage
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('inventoryViewType')
      if (savedView && (savedView === 'grid' || savedView === 'list')) {
        setViewType(savedView)
      }
    }
  }, [])
  
  // Handle saving view preference
  const handleViewChange = (view: "grid" | "list") => {
    setViewType(view)
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventoryViewType', view)
    }
  }
  
  // Filter inventory items based on category and search query
  const filteredItems = inventoryData.filter(item => {
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    const matchesSearch = !searchQuery || 
      (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.metal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.purity?.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })
  
  // Group items by category
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, InventoryItem[]>)
  
  // Format date consistently for display to avoid hydration mismatch
  const formatDate = (date: Date | string) => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString()
  }
  
  // Handle delete item
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem('inventory', id)
      
      // Update state to remove the deleted item
      setInventoryData(inventoryData.filter(item => item.id !== id))
      
      toast.success("Item deleted successfully")
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Failed to delete item")
    }
  }
  
  // Handle printing label
  const handlePrintLabel = (item: InventoryItem) => {
    try {
      // Try to load the saved configuration
      const savedConfig = localStorage.getItem('labelConfig')
      let labelSettings = {
        labelType: 'standard',
        labelQuantity: '1',
        includeProductName: true,
        includePrice: true,
        includeBarcode: true,
        includeDate: true,
        includeQr: true,
        includeMetal: true,
        includePurity: true,
        includeWeight: true
      }
      
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        labelSettings = { ...labelSettings, ...config }
      }
      
      // Generate QR code for the item
      QRCode.toDataURL(JSON.stringify({
        id: item.id,
        name: item.name || 'Unnamed Item',
        category: item.category || 'Uncategorized',
        metal: item.metal || '',
        purity: item.purity || '',
        weight: item.weight || 0
      }), {
        width: 128,
        margin: 1
      }, (err, url) => {
        if (err) {
          console.error("Error generating QR code:", err)
          toast.error("Failed to generate QR code for label")
          return
        }
        
        // Create print window
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          toast.error("Unable to open print window. Please check your browser settings.")
          return
        }
        
        // Generate label HTML
        const labelHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Stock Label - ${item.name || 'Unnamed Item'}</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .label-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: flex-start;
              }
              .label {
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 10px;
                width: 300px;
                height: 170px;
                box-sizing: border-box;
                margin-bottom: 10px;
                display: flex;
                flex-direction: column;
              }
              .label-header {
                display: flex;
                justify-content: space-between;
              }
              .label-info {
                flex: 1;
              }
              .product-name {
                font-weight: bold;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .product-meta {
                color: #666;
                font-size: 12px;
                margin: 2px 0;
              }
              .qr-code {
                width: 60px;
                height: 60px;
                background: #f5f5f5;
                border-radius: 4px;
                padding: 5px;
              }
              .label-footer {
                margin-top: auto;
              }
              .date-price {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 10px;
              }
              .date {
                color: #666;
                font-size: 12px;
              }
              .price {
                font-weight: bold;
                font-size: 18px;
              }
              @media print {
                @page {
                  size: auto;
                  margin: 0;
                }
                body {
                  padding: 10px;
                }
              }
            </style>
          </head>
          <body>
            <div class="label-container">
              ${Array(parseInt(labelSettings.labelQuantity)).fill(0).map(() => `
                <div class="label">
                  <div class="label-header">
                    <div class="label-info">
                      ${labelSettings.includeProductName ? `<p class="product-name">${item.name || 'Unnamed Item'}</p>` : ''}
                      ${labelSettings.includeMetal && item.metal ? `<p class="product-meta">Metal: ${item.metal}</p>` : ''}
                      ${labelSettings.includePurity && item.purity ? `<p class="product-meta">Purity: ${item.purity}</p>` : ''}
                      ${labelSettings.includeWeight && item.weight ? `<p class="product-meta">Weight: ${item.weight}g</p>` : ''}
                    </div>
                    ${labelSettings.includeQr ? `<img class="qr-code" src="${url}" />` : ''}
                  </div>
                  <div class="label-footer">
                    <div class="date-price">
                      ${labelSettings.includeDate ? `<span class="date">Added: ${formatDate(item.createdAt || new Date())}</span>` : ''}
                      ${labelSettings.includePrice ? `<span class="price">${item.cost ? `₹${item.cost.toFixed(2)}` : '₹0.00'}</span>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                }, 500);
              };
            </script>
          </body>
          </html>
        `
        
        // Write to the print window
        printWindow.document.open()
        printWindow.document.write(labelHtml)
        printWindow.document.close()
        
        toast.success(`${labelSettings.labelQuantity} label(s) sent to printer`)
      })
    } catch (error) {
      console.error("Error printing label:", error)
      toast.error("Failed to print label")
    }
  }
  
  // Handle generating QR code
  const handleGenerateQR = (item: InventoryItem) => {
    try {
      // Generate data for QR code
      const qrData = JSON.stringify({
        id: item.id,
        name: item.name || 'Unnamed Item',
        category: item.category || 'Uncategorized',
        metal: item.metal || '',
        purity: item.purity || '',
        weight: item.weight || 0,
        date: formatDate(item.createdAt || new Date())
      })
      
      // Generate QR code
      QRCode.toDataURL(qrData, {
        width: 256,
        margin: 1
      }, (err, url) => {
        if (err) {
          console.error("Error generating QR code:", err)
          toast.error("Failed to generate QR code")
          return
        }
        
        // Create a new window to display the QR code
        const qrWindow = window.open('', '_blank')
        if (!qrWindow) {
          toast.error("Unable to open QR code window. Please check your browser settings.")
          return
        }
        
        // Generate HTML for the QR code window
        const qrHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR Code - ${item.name || 'Unnamed Item'}</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                text-align: center;
              }
              h1 {
                margin-bottom: 10px;
              }
              .details {
                margin-bottom: 20px;
                color: #666;
              }
              .qr-container {
                margin: 20px;
                border: 1px solid #eee;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 20px;
                border-radius: 8px;
                background: white;
              }
              img {
                display: block;
                max-width: 100%;
              }
              button {
                margin-top: 20px;
                padding: 8px 16px;
                background: #0070f3;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              }
              button:hover {
                background: #0060df;
              }
              @media print {
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <h1>${item.name || 'Unnamed Item'}</h1>
            <div class="details">
              ${item.category || 'Uncategorized'} ${item.metal ? `| ${item.metal}` : ''} ${item.purity ? `| ${item.purity}` : ''} 
              ${item.weight ? `| ${item.weight}g` : ''}
            </div>
            <div class="qr-container">
              <img src="${url}" alt="QR Code" />
            </div>
            <button onclick="window.print()">Print QR Code</button>
          </body>
          </html>
        `
        
        // Write to the QR code window
        qrWindow.document.open()
        qrWindow.document.write(qrHtml)
        qrWindow.document.close()
      })
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code")
    }
  }

  // Handle bulk download
  const handleBulkDownload = () => {
    try {
      if (inventoryData.length === 0) {
        toast.error("No stock items to download")
        return
      }

      // Prepare data for Excel export
      const excelData = inventoryData.map(item => ({
        Name: item.name || '',
        Category: item.category || '',
        Description: item.description || '',
        Quantity: item.quantity || 0,
        Cost: item.cost || 0,
        Supplier: item.supplier || '',
        Weight: item.weight || '',
        Metal: item.metal || '',
        Purity: item.purity || '',
        'Date Added': formatDate(item.createdAt || '')
      }))

      // Create workbook
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Stock Items")

      // Generate Excel file and download
      XLSX.writeFile(wb, "stock-items.xlsx")
      
      toast.success("Stock items downloaded successfully")
    } catch (error) {
      console.error("Error downloading stock items:", error)
      toast.error("Failed to download stock items")
    }
  }

  // Handle bulk upload
  const handleBulkUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Process uploaded Excel file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Read the Excel file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        toast.error("No sheets found in the Excel file")
        return
      }
      
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      if (!worksheet) {
        toast.error("Could not read sheet from Excel file")
        return
      }
      
      const jsonData = XLSX.utils.sheet_to_json<ExcelRowData>(worksheet)

      if (jsonData.length === 0) {
        toast.error("No data found in the Excel file")
        return
      }

      // Show processing toast
      toast.info(`Processing ${jsonData.length} stock items...`)

      // Process each row and add to database
      let successCount = 0
      let errorCount = 0

      for (const row of jsonData) {
        try {
          // Get property values with proper fallbacks
          const name = (row.Name as string) || (row.name as string) || ''
          const category = (row.Category as string) || (row.category as string) || ''
          const description = (row.Description as string) || (row.description as string) || ''
          const quantity = Number(row.Quantity || row.quantity || 0)
          const cost = Number(row.Cost || row.cost || 0)
          const supplier = (row.Supplier as string) || (row.supplier as string) || ''
          
          // Handling possibly undefined properties safely
          let weight: number | undefined = undefined
          if (typeof row.Weight === 'number' || typeof row.weight === 'number') {
            weight = Number(row.Weight || row.weight)
          }
          
          const metal = (row.Metal as string) || (row.metal as string) || ''
          const purity = (row.Purity as string) || (row.purity as string) || ''

          const item: InventoryItem = {
            id: userDB.generateId('ITEM'),
            name,
            category,
            description,
            quantity,
            cost,
            supplier,
            weight,
            metal,
            purity,
            createdAt: new Date(),
            updatedAt: new Date()
          }

          // Validate required fields
          if (!item.name || !item.category) {
            errorCount++
            continue
          }

          // Add to database
          await addItem('inventory', item)
          successCount++
        } catch (error) {
          console.error("Error adding item:", error)
          errorCount++
        }
      }

      // Refresh inventory data
      const updatedItems = await getAll<InventoryItem>('inventory')
      setInventoryData(updatedItems)

      // Show completion toast
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} stock items`)
      }
      if (errorCount > 0) {
        toast.error(`Failed to add ${errorCount} stock items`)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error("Error processing Excel file:", error)
      toast.error("Failed to process Excel file")
    }
  }
  
  if (!isMounted) {
    return <div className="container py-6">Loading...</div>
  }
  
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/stock/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Stock Item
            </Link>
          </Button>
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button variant="outline" onClick={handleBulkDownload}>
            <Download className="mr-2 h-4 w-4" />
            Bulk Download
          </Button>
          <input 
            type="file" 
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          {categories.length > 0 && (
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <SortDropdown
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={setSortField}
            onSortOrderToggle={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          />
          
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewType === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 rounded-r-none"
              onClick={() => handleViewChange("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0 rounded-l-none"
              onClick={() => handleViewChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <p>Loading stock items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <FileBarChart2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No stock items found</h3>
          <p className="mt-1 text-muted-foreground">
            {searchQuery 
              ? "Try a different search term or clear the filters" 
              : "Add your first stock item to get started"}
          </p>
          <Button asChild className="mt-4">
            <Link href="/stock/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Stock Item
            </Link>
          </Button>
        </div>
      ) : filterCategory !== "all" ? (
        // When a specific category is selected, show without the category headers
        viewType === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onDelete={handleDeleteItem}
                onPrintLabel={handlePrintLabel}
                onGenerateQR={handleGenerateQR}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Metal/Purity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.quantity)
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.metal && `${item.metal}${item.purity ? ` / ${item.purity}` : ''}`}
                        {!item.metal && item.purity}
                      </TableCell>
                      <TableCell>
                        {item.weight !== undefined ? `${item.weight} g` : '-'}
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt || '')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrintLabel(item)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerateQR(item)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/stock/edit/${item.id}`}>Edit Item</Link>
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    Delete Item
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure you want to delete this item?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete
                                      the stock item {item.name}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteItem(item.id!)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        // When showing all categories, organize by category
        <div>
          {Object.entries(itemsByCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <CategorySection
                key={category}
                category={category}
                items={items}
                onDelete={handleDeleteItem}
                onPrintLabel={handlePrintLabel}
                onGenerateQR={handleGenerateQR}
                viewType={viewType}
                formatDate={formatDate}
              />
            ))
          }
        </div>
      )}
    </div>
  )
} 