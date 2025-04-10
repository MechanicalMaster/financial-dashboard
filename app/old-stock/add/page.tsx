"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useDB } from "@/contexts/db-context"
import { MasterDropdown } from "@/components/masters/master-dropdown"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Image as ImageIcon, Camera } from "lucide-react"

interface OldStockFormData {
  name: string;
  category: string;
  purchaseDate: string;
  purchasePrice: string;
  customerName: string;
  customerPhone: string;
  aadharCard: string;
  weight: string;
  metal: string;
  purity: string;
  description: string;
  photo?: string;
}

export default function AddOldStockPage() {
  const router = useRouter()
  const { add } = useDB()
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState<OldStockFormData>({
    name: "",
    category: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: "",
    customerName: "",
    customerPhone: "",
    aadharCard: "",
    weight: "",
    metal: "",
    purity: "",
    description: "",
  })

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Photo size should be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPhotoPreview(base64String)
        setFormData(prev => ({ ...prev, photo: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.purchaseDate || 
          !formData.purchasePrice || !formData.customerName || !formData.aadharCard) {
        throw new Error("Please fill in all required fields")
      }

      // Validate Aadhar Card format (12 digits)
      const aadharRegex = /^\d{12}$/
      if (!aadharRegex.test(formData.aadharCard)) {
        throw new Error("Please enter a valid 12-digit Aadhar Card number")
      }

      if (!formData.photo) {
        throw new Error("Please upload a photo of the item")
      }

      const oldStockItem = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
        purchaseDate: new Date(formData.purchaseDate),
      }

      await add('oldStock', oldStockItem)
      toast.success("Old stock item added successfully")
      router.push("/old-stock")
      router.refresh()
    } catch (error) {
      console.error("Error adding old stock item:", error)
      toast.error(`Failed to add old stock item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Old Stock Item</h1>
        <p className="text-muted-foreground">Add a new item to your old stock inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <MasterDropdown
                  masterType="category"
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  placeholder="Select category"
                  showAllOption={false}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date *</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (₹) *</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  placeholder="Enter purchase price"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadharCard">Aadhar Card *</Label>
                <Input
                  id="aadharCard"
                  name="aadharCard"
                  value={formData.aadharCard}
                  onChange={handleInputChange}
                  placeholder="Enter 12-digit Aadhar number"
                  pattern="[0-9]{12}"
                  maxLength={12}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="Enter customer phone"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  inputMode="numeric"
                  title="Please enter exactly 10 digits"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (g)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Enter weight in grams"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metal">Metal Type</Label>
                <Input
                  id="metal"
                  name="metal"
                  value={formData.metal}
                  onChange={handleInputChange}
                  placeholder="Enter metal type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purity">Purity</Label>
                <Input
                  id="purity"
                  name="purity"
                  value={formData.purity}
                  onChange={handleInputChange}
                  placeholder="Enter purity (e.g., 22K, 916)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Item Photo *</Label>
              <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-lg">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  capture={isMobile ? "environment" : undefined}
                  className="hidden"
                  onChange={handlePhotoChange}
                  required
                />
                <label
                  htmlFor="photo"
                  className="flex flex-col items-center justify-center w-full h-32 cursor-pointer"
                >
                  {photoPreview ? (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      {isMobile ? (
                        <>
                          <Camera className="w-8 h-8 mb-2 text-amber-600" />
                          <p className="text-sm text-gray-700">Tap to take a photo</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">Click to upload photo</p>
                        </>
                      )}
                      <p className="text-xs text-gray-400">(Max size: 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter item description"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 