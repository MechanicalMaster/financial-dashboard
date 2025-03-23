"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Package, Pencil, QrCode, Trash2 } from "lucide-react"
import Image from "next/image"

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

interface Product {
  id: string
  name: string
  category: string
  sku?: string
  stockQuantity: number
  reorderLevel: number
  unitPrice: number
  supplier: string
  lastUpdated: string
  status: StockStatus
}

interface ProductCardProps {
  product: Product
  onPrintLabel: (id: string) => void
  onGenerateQR: (id: string) => void
}

export function ProductCard({ product, onPrintLabel, onGenerateQR }: ProductCardProps) {
  // Stock status badge styles
  const getStatusBadge = (status: StockStatus, quantity: number) => {
    const statusStyles = {
      in_stock: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      low_stock: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      out_of_stock: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }

    const statusLabels = {
      in_stock: "In Stock",
      low_stock: "Low Stock",
      out_of_stock: "Out of Stock",
    }

    return (
      <Badge className={statusStyles[status]} variant="outline">
        {statusLabels[status]} {status !== "out_of_stock" && `(${quantity})`}
      </Badge>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-40 bg-muted">
          <Image
            src={`/placeholder.svg?height=150&width=250&text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Item
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPrintLabel(product.id)}>
                  <QrCode className="mr-2 h-4 w-4" /> Print Labels
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerateQR(product.id)}>
                  <QrCode className="mr-2 h-4 w-4" /> Generate QR
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-1 text-muted-foreground" />
              <CardTitle className="text-base">{product.name}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">ID: {product.sku || product.id.substring(5, 12)}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">{product.category}</span>
            <span className="text-sm font-bold">${product.unitPrice.toFixed(2)}</span>
          </div>
          <div>{getStatusBadge(product.status, product.stockQuantity)}</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onPrintLabel(product.id)}>
          Print Labels
        </Button>
        <Button variant="outline" size="sm" onClick={() => onGenerateQR(product.id)}>
          QR Code
        </Button>
      </CardFooter>
    </Card>
  )
}

