"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Upload } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useDB } from "@/contexts/db-context"
import { InventoryItem } from "@/lib/db"
import { Separator } from "@/components/ui/separator"

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStats, setUploadStats] = useState<{
    total: number
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { add, db, getAll } = useDB()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type !== "text/csv") {
      toast.error("Please select a CSV file")
      return
    }
    setFile(selectedFile || null)
    setUploadStats(null)
  }

  const downloadTemplate = () => {
    // Create CSV template content
    const headers = [
      "category",
      "name",
      "description",
      "quantity",
      "cost",
      "supplier",
      "weight",
      "metal",
      "purity"
    ]
    
    // Format with proper CSV escaping for text fields
    const formatCSVField = (value: string): string => {
      // Escape fields that contain commas or quotes
      if (value.includes(',') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }
    
    const sampleRow1 = [
      formatCSVField("Necklace"),
      "",
      formatCSVField("Gold chain necklace, 24 inch"),
      "10",
      "12500",
      formatCSVField("Chains Corner"),
      "15.5",
      formatCSVField("Gold"),
      "91.6"
    ]
    
    const sampleRow2 = [
      formatCSVField("Bracelet"),
      "",
      formatCSVField("Silver charm bracelet"),
      "5",
      "8500",
      formatCSVField("Silver & Co."),
      "12.3",
      formatCSVField("Silver"),
      "92.5"
    ]
    
    const csvContent = [
      headers.join(','),
      sampleRow1.join(','),
      sampleRow2.join(',')
    ].join('\n')

    // Create and download the template file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'stock_upload_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("Template downloaded successfully")
  }

  const processCSV = async (text: string) => {
    const stats = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    try {
      // Parse CSV - use proper CSV parsing with handling for commas within quoted fields
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length < 2) {
        throw new Error("CSV file must contain at least a header row and one data row");
      }

      const headers = parseCSVLine(lines[0]);
      
      // Skip header row, process data rows
      const dataRows = lines.slice(1);
      stats.total = dataRows.length;
      
      // Fetch existing stock items to check for category prefixes
      const existingItems = await getAll<InventoryItem>('inventory');
      const existingItemsMap = new Map<string, number>(); // Map to track highest sequence per category
      
      // Pre-process existing items to find highest sequence numbers
      existingItems.forEach(item => {
        if (item.name && item.name.length > 4) {
          const categoryPrefix = item.name.substring(0, 3).toUpperCase();
          const sequencePart = item.name.substring(4); // Skip prefix and hyphen
          const sequenceNum = parseInt(sequencePart);
          
          if (!isNaN(sequenceNum)) {
            const currentMax = existingItemsMap.get(categoryPrefix) || 0;
            if (sequenceNum > currentMax) {
              existingItemsMap.set(categoryPrefix, sequenceNum);
            }
          }
        }
      });
      
      // Process each row
      for (let i = 0; i < dataRows.length; i++) {
        try {
          // Parse the CSV line properly
          const values = parseCSVLine(dataRows[i]);
          
          // Map values to object using headers
          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            // Make sure we have a value for this header, even if it's empty
            rowData[header] = index < values.length ? values[index] : '';
          });
          
          // Validate required fields
          const category = rowData.category;
          if (!category || category.trim() === '') {
            throw new Error(`Row ${i + 2}: Category is required`);
          }
          
          if (!rowData.quantity || isNaN(parseInt(rowData.quantity))) {
            throw new Error(`Row ${i + 2}: Quantity must be a valid number`);
          }
          
          // Generate name from category prefix if not provided
          let itemName = rowData.name ? rowData.name.trim() : '';
          if (!itemName) {
            const categoryPrefix = category.substring(0, 3).toUpperCase();
            
            // Get highest sequence number for this category
            let highestSequence = existingItemsMap.get(categoryPrefix) || 0;
            
            // Generate new name with incremented sequence
            const newSequence = highestSequence + 1;
            const paddedSequence = newSequence.toString().padStart(4, '0');
            itemName = `${categoryPrefix}-${paddedSequence}`;
            
            // Update our tracking map with this new sequence
            existingItemsMap.set(categoryPrefix, newSequence);
          }
          
          // Create new stock item
          const newItem: InventoryItem = {
            name: itemName,
            category: category.trim(),
            description: rowData.description ? rowData.description.trim() : "",
            quantity: parseInt(rowData.quantity) || 0,
            cost: rowData.cost && !isNaN(parseFloat(rowData.cost)) ? parseFloat(rowData.cost) : 0,
            supplier: rowData.supplier ? rowData.supplier.trim() : "",
            weight: rowData.weight && !isNaN(parseFloat(rowData.weight)) ? parseFloat(rowData.weight) : undefined,
            metal: rowData.metal ? rowData.metal.trim() : undefined,
            purity: rowData.purity ? rowData.purity.trim() : undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Generate ID explicitly
          const id = db.generateId('ITEM');
          newItem.id = id;
          
          // Add to database
          await add('inventory', newItem);
          stats.success++;
          
          console.log(`Added item: ${newItem.name}`);
        } catch (error) {
          stats.failed++;
          stats.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`Error processing row ${i + 2}:`, error);
        }
      }
    } catch (error) {
      stats.failed++;
      stats.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Error processing CSV:", error);
    }
    
    return stats;
  };

  // Function to properly parse CSV lines with support for quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Handle quotes - toggle inQuotes state
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // If comma and not in quotes, end the current field
        result.push(current.trim());
        current = '';
      } else {
        // Normal character, add to current field
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file to upload")
      return
    }

    setIsUploading(true)
    setUploadStats(null)

    try {
      // Read file content
      const text = await file.text()
      
      // Process CSV
      const stats = await processCSV(text)
      setUploadStats(stats)
      
      if (stats.failed === 0) {
        toast.success(`Successfully imported ${stats.success} stock items`)
      } else {
        toast.warning(`Imported ${stats.success} items with ${stats.failed} errors`)
      }
    } catch (error) {
      console.error("Error uploading stock:", error)
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setFile(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Upload Stock</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Stock Items</CardTitle>
              <CardDescription>
                Import multiple stock items at once using a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">CSV File</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a CSV file with headers: category, name, description, quantity, cost, supplier, weight, metal, purity
                </p>
              </div>

              <Button 
                className="w-full" 
                onClick={handleUpload} 
                disabled={!file || isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload and Process"}
              </Button>

              {uploadStats && (
                <div className="space-y-4 mt-4">
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium">Upload Results</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-md p-3 text-center">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{uploadStats.total}</p>
                      </div>
                      <div className="border rounded-md p-3 text-center bg-green-50">
                        <p className="text-sm text-muted-foreground">Successful</p>
                        <p className="text-2xl font-bold text-green-600">{uploadStats.success}</p>
                      </div>
                      <div className="border rounded-md p-3 text-center bg-red-50">
                        <p className="text-sm text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{uploadStats.failed}</p>
                      </div>
                    </div>
                  </div>

                  {uploadStats.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTitle>Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {uploadStats.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>CSV Format</CardTitle>
              <CardDescription>
                Required format for your CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Headers</h3>
                <p className="text-sm bg-muted p-2 rounded-md font-mono text-xs">
                  category,name,description,quantity,cost,supplier,weight,metal,purity
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Required Fields</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><span className="font-medium">category</span>: Item category (e.g., "Necklace")</li>
                  <li><span className="font-medium">quantity</span>: Numeric value for stock count</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Optional Fields</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><span className="font-medium">name</span>: Will be auto-generated if empty</li>
                  <li><span className="font-medium">description</span>: Item description</li>
                  <li><span className="font-medium">cost</span>: Numeric value (e.g., "12500")</li>
                  <li><span className="font-medium">supplier</span>: Supplier name</li>
                  <li><span className="font-medium">weight</span>: Weight in grams (e.g., "15.5")</li>
                  <li><span className="font-medium">metal</span>: Metal type (e.g., "Gold")</li>
                  <li><span className="font-medium">purity</span>: Purity value (e.g., "91.6")</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Example</h3>
                <p className="text-sm bg-muted p-2 rounded-md font-mono text-xs whitespace-normal break-all">
                  Necklace,,"Gold chain necklace, 24 inch",10,12500,"Chains Corner",15.5,Gold,91.6
                </p>
                <p className="text-sm bg-muted p-2 rounded-md font-mono text-xs whitespace-normal break-all mt-2">
                  Bracelet,,"Silver charm bracelet",5,8500,"Silver & Co.",12.3,Silver,92.5
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Text fields containing commas should be enclosed in double quotes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 