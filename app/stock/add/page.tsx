"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Save, UploadCloud, X } from "lucide-react"
import Link from "next/link"
import type { FormEvent } from "react"
import { toast } from "sonner"
import { AddItemLabelPreview } from "@/components/inventory/add-item-label-preview"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useDB } from "@/contexts/db-context"
import { useRouter } from "next/navigation"
import { InventoryItem } from "@/lib/db"
import { MasterDropdown } from "@/components/masters/master-dropdown"
import { createThumbnail } from "@/lib/utils"

export default function AddStockItemPage() {
  const router = useRouter();
  const { add, userDB, getAll } = useDB();
  
  const [itemName, setItemName] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemQuantity, setItemQuantity] = useState("")
  const [itemCost, setItemCost] = useState("")
  const [itemSupplier, setItemSupplier] = useState("")
  const [itemWeight, setItemWeight] = useState("")
  const [itemMetal, setItemMetal] = useState("")
  const [itemPurity, setItemPurity] = useState("")
  const [labelQuantity, setLabelQuantity] = useState("1")
  const [labelType, setLabelType] = useState("standard")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Label inclusions
  const [includeProductName, setIncludeProductName] = useState(true)
  const [includePrice, setIncludePrice] = useState(true)
  const [includeBarcode, setIncludeBarcode] = useState(true)
  const [includeDate, setIncludeDate] = useState(true)
  const [includeQr, setIncludeQr] = useState(true)
  const [includeMetal, setIncludeMetal] = useState(true)
  const [includePurity, setIncludePurity] = useState(true)
  const [includeWeight, setIncludeWeight] = useState(true)

  // Set isMounted after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-generate name when category changes
  useEffect(() => {
    if (!itemCategory) return;

    const generateItemName = async () => {
      try {
        // Get existing inventory items with this category
        const inventoryItems = await getAll<InventoryItem>('inventory');
        const categoryPrefix = itemCategory.substring(0, 3).toUpperCase();
        
        // Find highest sequence number for this category
        let highestSequence = 0;
        
        inventoryItems.forEach(item => {
          if (item.name && item.name.startsWith(categoryPrefix)) {
            const sequencePart = item.name.substring(4); // Skip prefix and hyphen
            const sequenceNum = parseInt(sequencePart);
            if (!isNaN(sequenceNum) && sequenceNum > highestSequence) {
              highestSequence = sequenceNum;
            }
          }
        });
        
        // Generate new name with incremented sequence
        const newSequence = highestSequence + 1;
        const paddedSequence = newSequence.toString().padStart(4, '0');
        const generatedName = `${categoryPrefix}-${paddedSequence}`;
        
        setItemName(generatedName);
      } catch (error) {
        console.error("Error generating item name:", error);
      }
    };
    
    generateItemName();
  }, [itemCategory, getAll]);

  // Ensure category has a valid value once dropdown is mounted
  useEffect(() => {
    if (isMounted && !itemCategory) {
      // Set a default category value after a short delay to allow MasterDropdown to load
      const timeoutId = setTimeout(() => {
        if (!itemCategory) {
          setItemCategory("Chain")
          console.log("Set default category to Chain")
        }
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isMounted, itemCategory])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setSelectedFiles(files)
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log("Submit clicked with values:", {
      name: itemName,
      category: itemCategory,
      supplier: itemSupplier,
      quantity: itemQuantity
    })

    if (!itemName) {
      toast.error("Please enter an item name")
      return
    }

    if (!itemCategory) {
      toast.error("Please select a category")
      return
    }

    if (!itemQuantity || parseInt(itemQuantity) < 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    setIsSubmitting(true)

    try {
      // Generate ID first, as it's needed for image filenames
      const id = userDB.generateId('ITEM');

      const imageFilenames: string[] = []; // Array to store filenames
      let thumbnailUrl: string | undefined = undefined;

      // 1. Save Images to IndexedDB and collect filenames
      if (selectedFiles.length > 0) {
        // Create thumbnail from the first image
        try {
          const firstFile = selectedFiles[0];
          const thumbnailBlob = await createThumbnail(firstFile, 300, 300);
          const fileExtension = firstFile.name.split('.').pop();
          const timestamp = Date.now();
          const thumbnailFilename = `THUMB-${id}-${timestamp}.${fileExtension}`;
          
          // Save thumbnail to IndexedDB
          await userDB.images.add({ filename: thumbnailFilename, data: thumbnailBlob });
          thumbnailUrl = thumbnailFilename;
        } catch (thumbError) {
          console.error("Error creating thumbnail:", thumbError);
          // Continue even if thumbnail creation fails
        }

        // Process all images
        for (const [index, file] of selectedFiles.entries()) {
          const fileExtension = file.name.split('.').pop();
          const timestamp = Date.now();
          const filename = `ITEM-${id}-${timestamp}-${index}.${fileExtension}`;

          await userDB.images.add({ filename: filename, data: file });
          imageFilenames.push(filename);
        }
      }

      // Create new stock item object AFTER generating ID and saving images
      const newItem: InventoryItem = {
        id: id,
        name: itemName,
        category: itemCategory,
        description: itemDescription || "",
        quantity: parseInt(itemQuantity) || 0,
        cost: itemCost ? parseFloat(itemCost) : 0,
        supplier: itemSupplier || "",
        weight: itemWeight ? parseFloat(itemWeight) : undefined,
        metal: itemMetal || undefined,
        purity: itemPurity || undefined,
        imageFilenames: imageFilenames,
        thumbnailUrl: thumbnailUrl, // Add the thumbnail URL
        createdAt: new Date(),
        updatedAt: new Date()
      }

      console.log("Saving stock item:", newItem)
      
      // 2. Add Inventory Item metadata to database
      await add('inventory', newItem);
      
      toast.success("Stock item added successfully with images")
      
      // Redirect back to stock page
      router.push('/stock')
    } catch (error) {
      console.error("Error adding stock item:", error)
      toast.error(`Failed to add stock item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrintLabels = () => {
    if (!itemName) {
      toast.error("Please enter an item name before printing labels")
      return
    }

    // Try to load the saved configuration
    try {
      const savedConfig = localStorage.getItem('labelConfig');
      
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // Update state with saved configuration
        setLabelType(config.labelType || 'standard');
        setLabelQuantity(config.labelQuantity || '1');
        setIncludeProductName(config.includeProductName !== undefined ? config.includeProductName : true);
        setIncludePrice(config.includePrice !== undefined ? config.includePrice : true);
        setIncludeBarcode(config.includeBarcode !== undefined ? config.includeBarcode : true);
        setIncludeDate(config.includeDate !== undefined ? config.includeDate : true);
        setIncludeQr(config.includeQr !== undefined ? config.includeQr : true);
        setIncludeMetal(config.includeMetal !== undefined ? config.includeMetal : true);
        setIncludePurity(config.includePurity !== undefined ? config.includePurity : true);
        setIncludeWeight(config.includeWeight !== undefined ? config.includeWeight : true);
      }
    } catch (error) {
      console.error("Error loading label configuration:", error);
    }

    // Use setTimeout to ensure the DOM elements are rendered
    setTimeout(() => {
      // Get references to the barcode and QR code elements
      const qrCodeElement = document.getElementById('label-qr-code') as HTMLImageElement
      const barcodeElement = document.querySelector('#label-barcode svg') as SVGElement
      
      if (!qrCodeElement && includeQr) {
        toast.error("QR code element not found")
        return
      }

      if (!barcodeElement && includeBarcode) {
        toast.error("Barcode element not found")
        return
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error("Unable to open print window. Please check your browser settings.")
        return
      }

      // Convert SVG barcode to data URL if it exists
      let barcodeDataUrl = ''
      if (barcodeElement && includeBarcode) {
        const svgData = new XMLSerializer().serializeToString(barcodeElement)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Set canvas dimensions to match the SVG
        const svgRect = barcodeElement.getBoundingClientRect()
        canvas.width = svgRect.width
        canvas.height = svgRect.height
        
        // Create an image from SVG
        const img = new Image()
        img.onload = function() {
          // Draw the image to the canvas and get data URL
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            barcodeDataUrl = canvas.toDataURL('image/png')

            // Now that we have the barcode image, generate the HTML content
            generatePrintContent(printWindow, qrCodeElement?.src, barcodeDataUrl)
          }
        }
        
        // Set the SVG as the image source
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
      } else {
        // If no barcode needed, proceed with just the QR code
        generatePrintContent(printWindow, qrCodeElement?.src, '')
      }
    }, 500)
  }

  // Helper function to generate the print content
  const generatePrintContent = (printWindow: Window, qrCodeSrc: string = '', barcodeSrc: string = '') => {
    // Generate label content
    const labelContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stock Labels - ${itemName}</title>
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
          .barcode {
            margin-top: 10px;
            text-align: center;
          }
          .barcode img {
            max-width: 100%;
            height: 40px;
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
          ${Array(parseInt(labelQuantity)).fill(0).map(() => `
            <div class="label">
              <div class="label-header">
                <div class="label-info">
                  ${includeProductName ? `<p class="product-name">${itemName}</p>` : ''}
                  ${includeMetal && itemMetal ? `<p class="product-meta">Metal: ${itemMetal}</p>` : ''}
                  ${includePurity && itemPurity ? `<p class="product-meta">Purity: ${itemPurity}</p>` : ''}
                  ${includeWeight && itemWeight ? `<p class="product-meta">Weight: ${itemWeight}g</p>` : ''}
                </div>
                ${includeQr && qrCodeSrc ? `<img class="qr-code" src="${qrCodeSrc}" />` : ''}
              </div>
              <div class="label-footer">
                <div class="date-price">
                  ${includeDate ? `<span class="date">Added: ${new Date().toLocaleDateString()}</span>` : ''}
                  ${includePrice ? `<span class="price">${itemCost ? `₹${parseFloat(itemCost).toFixed(2)}` : '₹0.00'}</span>` : ''}
                </div>
                ${includeBarcode && barcodeSrc ? `
                  <div class="barcode">
                    <img src="${barcodeSrc}" />
                  </div>
                ` : ''}
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

    // Write to the new window and trigger print
    printWindow.document.open()
    printWindow.document.write(labelContent)
    printWindow.document.close()

    toast.success(`${labelQuantity} label(s) sent to printer`)
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 md:py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/stock">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Stock Item</h1>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={handlePrintLabels} disabled={!itemName} className="flex-1 sm:flex-auto">
            <FileText className="mr-2 h-4 w-4" />
            Print Labels
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 sm:flex-auto">
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Add Item"}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the essential details for this stock item</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName" className="font-medium">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="itemName"
                placeholder="Enter item name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                className="w-full"
              />
              {itemCategory && <p className="text-xs text-muted-foreground">Auto-generated from category</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemCategory" className="font-medium">
                Category <span className="text-red-500">*</span>
              </Label>
              {isMounted && (
                <MasterDropdown
                  masterType="category"
                  value={itemCategory}
                  onValueChange={setItemCategory}
                  placeholder="Select a category"
                  className="w-full"
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemMetal" className="font-medium">Metal</Label>
              {isMounted && (
                <MasterDropdown
                  masterType="metal"
                  value={itemMetal}
                  onValueChange={setItemMetal}
                  placeholder="Select a metal type"
                  className="w-full"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemPurity" className="font-medium">Purity</Label>
              {isMounted && (
                <MasterDropdown
                  masterType="purity"
                  value={itemPurity}
                  onValueChange={setItemPurity}
                  placeholder="Select purity"
                  className="w-full"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemSupplier" className="font-medium">Supplier</Label>
              <MasterDropdown
                masterType="supplier"
                value={itemSupplier}
                onValueChange={setItemSupplier}
                placeholder="Select a supplier"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemQuantity" className="font-medium">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="itemQuantity"
                type="number"
                placeholder="Enter quantity"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemCost" className="font-medium">Purchase Cost (₹)</Label>
              <Input
                id="itemCost"
                type="number"
                step="0.01"
                placeholder="Enter cost"
                value={itemCost}
                onChange={(e) => setItemCost(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemWeight" className="font-medium">Weight (grams)</Label>
              <Input
                id="itemWeight"
                type="number"
                step="0.01"
                placeholder="Enter weight in grams"
                value={itemWeight}
                onChange={(e) => setItemWeight(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-image">Product Image(s)</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <Input 
                  id="item-image" 
                  type="file" 
                  multiple
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <label htmlFor="item-image" className="cursor-pointer">
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag & drop images here, or click to select files
                  </p>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP, GIF (Max 5MB per file)</p>
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img 
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="object-cover w-full h-full rounded-md"
                        onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemDescription" className="font-medium">Description</Label>
            <Textarea
              id="itemDescription"
              placeholder="Enter product description"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 