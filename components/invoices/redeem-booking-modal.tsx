"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { BookingLine } from "@/components/invoices/booking-ledger"
import { toast } from "sonner"

// Sample inventory data (this would come from your API in a real app)
const sampleInventoryItems = [
  {
    id: "INV-001",
    name: "Office Chair - Ergonomic",
    category: "Furniture",
    sku: "FRN-0123",
    stockQuantity: 24,
    unitPrice: 129.99,
    status: "in_stock",
  },
  {
    id: "INV-002",
    name: "Desk Lamp - LED",
    category: "Office Supplies",
    sku: "OFS-0456",
    stockQuantity: 37,
    unitPrice: 45.5,
    status: "in_stock",
  },
  {
    id: "INV-003",
    name: 'Laptop - Pro 15"',
    category: "Electronics",
    sku: "ELC-0789",
    stockQuantity: 5,
    unitPrice: 1299.99,
    status: "low_stock",
  },
  {
    id: "INV-004",
    name: "Paper - A4 Premium",
    category: "Stationery",
    sku: "STN-0123",
    stockQuantity: 150,
    unitPrice: 12.99,
    status: "in_stock",
  }
]

interface RedeemBookingModalProps {
  isOpen: boolean
  onClose: () => void
  bookingLine: BookingLine
  onRedeemComplete: (bookingLineId: string, inventoryItem: any) => void
}

export function RedeemBookingModal({ isOpen, onClose, bookingLine, onRedeemComplete }: RedeemBookingModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [availableItems, setAvailableItems] = useState(sampleInventoryItems)
  const [loading, setLoading] = useState(false)

  // Get selected item details
  const selectedItem = availableItems.find(item => item.id === selectedItemId)

  useEffect(() => {
    // In a real app, you would fetch available inventory items here
    setAvailableItems(sampleInventoryItems)
  }, [])

  const handleRedeemBooking = () => {
    if (!selectedItem) {
      toast.error("Please select an item to redeem")
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      onRedeemComplete(bookingLine.id, selectedItem)
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Redeem Booking for Item</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div className="space-y-1">
                  <h3 className="font-medium">Booking Details</h3>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID:</span>
                  <span className="font-medium">{bookingLine.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Amount:</span>
                  <span className="font-medium text-green-600">₹{bookingLine.totalAccumulated.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {selectedItem && (
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <div>
                    <h3 className="font-medium">Selected Item</h3>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium">{selectedItem.name}</span>
                    <p className="text-sm text-muted-foreground">{selectedItem.sku}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span>₹{selectedItem.unitPrice.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full" 
              onClick={handleRedeemBooking} 
              disabled={!selectedItem || loading}
            >
              {loading ? "Processing..." : "Confirm Redemption"}
            </Button>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search inventory..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(90vh-360px)] overflow-y-auto pr-1">
              {availableItems
                .filter(item => 
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.sku.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer hover:border-primary transition-colors ${selectedItemId === item.id ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.sku}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          In Stock ({item.stockQuantity})
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-md font-medium">₹{item.unitPrice.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">{item.category}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 