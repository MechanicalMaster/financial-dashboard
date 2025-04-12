"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Save, UploadCloud, X } from "lucide-react"
import Link from "next/link"
import type { FormEvent } from "react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { useDB } from "@/contexts/db-context"
import { useRouter } from "next/navigation"
import { InventoryItem, ImageRecord } from "@/lib/db"
import { MasterDropdown } from "@/components/masters/master-dropdown"
import { createThumbnail } from "@/lib/utils"

export default function EditStockItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { update, get, userDB, getAll } = useDB();
  
  const [itemName, setItemName] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemQuantity, setItemQuantity] = useState("")
  const [itemCost, setItemCost] = useState("")
  const [itemSupplier, setItemSupplier] = useState("")
  const [itemWeight, setItemWeight] = useState("")
  const [itemMetal, setItemMetal] = useState("")
  const [itemPurity, setItemPurity] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<{filename: string, url: string}[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  // Set isMounted after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load existing item data
  useEffect(() => {
    const fetchItemData = async () => {
      if (!params.id) return;
      
      try {
        const item = await get<InventoryItem>('inventory', params.id);
        
        if (!item) {
          toast.error("Item not found");
          router.push('/stock');
          return;
        }
        
        // Set form data from item
        setItemName(item.name || "");
        setItemCategory(item.category || "");
        setItemDescription(item.description || "");
        setItemQuantity(item.quantity?.toString() || "0");
        setItemCost(item.cost?.toString() || "");
        setItemSupplier(item.supplier || "");
        setItemWeight(item.weight?.toString() || "");
        setItemMetal(item.metal || "");
        setItemPurity(item.purity || "");
        
        // Load images if they exist
        if (item.imageFilenames && item.imageFilenames.length > 0) {
          const images = await userDB.getImages(item.imageFilenames);
          
          const imageUrls = await Promise.all(
            images.map(async (img) => {
              const blob = img.data;
              const url = URL.createObjectURL(blob);
              return { filename: img.filename, url };
            })
          );
          
          setExistingImages(imageUrls);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching item data:", error);
        toast.error("Failed to load item data");
        router.push('/stock');
      }
    };
    
    if (isMounted) {
      fetchItemData();
    }
  }, [params.id, get, router, isMounted, userDB]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  }
  
  const handleRemoveExistingImage = (filename: string) => {
    setExistingImages(existingImages.filter(img => img.filename !== filename));
    setImagesToDelete(prev => [...prev, filename]);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!params.id) {
      toast.error("Item ID is missing");
      return;
    }

    if (!itemCategory) {
      toast.error("Please select a category");
      return;
    }

    if (!itemQuantity || parseInt(itemQuantity) < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setIsSubmitting(true);

    try {
      // Process existing images first
      let imageFilenames = existingImages.map(img => img.filename);
      let thumbnailUrl: string | undefined = undefined;
      
      // Delete marked images
      for (const filename of imagesToDelete) {
        await userDB.deleteImage(filename);
        
        // If we're deleting the current thumbnail, we'll need to create a new one
        if (thumbnailUrl === filename) {
          thumbnailUrl = undefined;
        }
      }
      
      // Add new images
      if (selectedFiles.length > 0) {
        // Create thumbnail from the first new image if needed
        try {
          const firstFile = selectedFiles[0];
          const thumbnailBlob = await createThumbnail(firstFile, 300, 300);
          const fileExtension = firstFile.name.split('.').pop();
          const timestamp = Date.now();
          const thumbnailFilename = `THUMB-${params.id}-${timestamp}.${fileExtension}`;
          
          // Save thumbnail to IndexedDB
          await userDB.images.add({ filename: thumbnailFilename, data: thumbnailBlob });
          thumbnailUrl = thumbnailFilename;
        } catch (thumbError) {
          console.error("Error creating thumbnail:", thumbError);
          // Continue even if thumbnail creation fails
        }
        
        // Process all new images
        for (const [index, file] of selectedFiles.entries()) {
          const fileExtension = file.name.split('.').pop();
          const timestamp = Date.now();
          const filename = `ITEM-${params.id}-${timestamp}-${index}.${fileExtension}`;
          
          await userDB.images.add({ filename: filename, data: file });
          imageFilenames.push(filename);
        }
      }

      // Update stock item in database
      const updatedItem: Partial<InventoryItem> = {
        category: itemCategory,
        description: itemDescription || "",
        quantity: parseInt(itemQuantity) || 0,
        cost: itemCost ? parseFloat(itemCost) : 0,
        supplier: itemSupplier || "",
        weight: itemWeight ? parseFloat(itemWeight) : undefined,
        metal: itemMetal || undefined,
        purity: itemPurity || undefined,
        imageFilenames: imageFilenames,
        updatedAt: new Date()
      };
      
      // Only update the thumbnail if we've created a new one
      if (thumbnailUrl) {
        updatedItem.thumbnailUrl = thumbnailUrl;
      }

      console.log("Updating stock item:", updatedItem);
      
      // Update item in database
      await update('inventory', params.id, updatedItem);
      
      toast.success("Stock item updated successfully");
      
      // Redirect back to stock page
      router.push('/stock');
    } catch (error) {
      console.error("Error updating stock item:", error);
      toast.error(`Failed to update stock item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 md:py-6 space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading item data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" asChild>
                <Link href="/stock">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Stock Item</h1>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 sm:flex-auto">
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Item Information</CardTitle>
              <CardDescription>Update the details for this stock item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName" className="font-medium">
                    Item Name
                  </Label>
                  <Input
                    id="itemName"
                    value={itemName}
                    disabled
                    className="w-full bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Item name cannot be changed</p>
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
                  <Label htmlFor="item-image">Product Images</Label>
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
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mt-4 mb-2">Current Images</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {existingImages.map((img, index) => (
                          <div key={index} className="relative group aspect-square">
                            <img 
                              src={img.url}
                              alt={`Image ${index + 1}`}
                              className="object-cover w-full h-full rounded-md"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveExistingImage(img.filename)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* New Images Preview */}
                  {selectedFiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mt-4 mb-2">New Images to Add</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative group aspect-square">
                            <img 
                              src={URL.createObjectURL(file)}
                              alt={`New image ${index + 1}`}
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
        </>
      )}
    </div>
  )
} 