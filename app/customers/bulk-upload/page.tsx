"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Upload, Check, X, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useDB } from "@/contexts/db-context"
import { Customer } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as XLSX from 'xlsx'
import { Separator } from "@/components/ui/separator"

interface ParsedCustomer {
  name: string
  email: string
  phone: string
  address: string
  reference: string
  isValid: boolean
  validationErrors?: string[]
}

export default function BulkUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedCustomer[]>([])
  const [uploadStats, setUploadStats] = useState<{
    total: number
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { add, userDB } = useDB()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      return
    }
    
    // Check if file is Excel
    const isExcel = 
      selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
      selectedFile.type === "application/vnd.ms-excel" ||
      selectedFile.name.endsWith('.xlsx') || 
      selectedFile.name.endsWith('.xls')
    
    if (!isExcel) {
      toast.error("Please select an Excel file (.xlsx or .xls)")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }
    
    setFile(selectedFile)
    setUploadStats(null)
    await processFile(selectedFile)
  }
  
  const processFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      if (!jsonData || jsonData.length === 0) {
        toast.error("The Excel file is empty or has no valid data")
        return
      }
      
      // Convert and validate each row
      const processedData: ParsedCustomer[] = jsonData.map((row: any) => {
        const customer: ParsedCustomer = {
          name: row.name || row.Name || row.NAME || '',
          email: row.email || row.Email || row.EMAIL || '',
          phone: row.phone || row.Phone || row.PHONE || row.mobile || row.Mobile || row.MOBILE || '',
          address: row.address || row.Address || row.ADDRESS || '',
          reference: row.reference || row.Reference || row.REFERENCE || '',
          isValid: true,
          validationErrors: []
        }
        
        // Validate required fields
        if (!customer.name) {
          customer.isValid = false
          customer.validationErrors = customer.validationErrors || []
          customer.validationErrors.push('Name is required')
        }
        
        if (!customer.phone) {
          customer.isValid = false
          customer.validationErrors = customer.validationErrors || []
          customer.validationErrors.push('Phone is required')
        } else if (!/^\d{10}$/.test(customer.phone)) {
          customer.isValid = false
          customer.validationErrors = customer.validationErrors || []
          customer.validationErrors.push('Phone must be exactly 10 digits')
        }
        
        // Validate email format if provided
        if (customer.email && !/\S+@\S+\.\S+/.test(customer.email)) {
          customer.isValid = false
          customer.validationErrors = customer.validationErrors || []
          customer.validationErrors.push('Email format is invalid')
        }
        
        return customer
      })
      
      setParsedData(processedData)
      
      // Show toast with summary
      const validCount = processedData.filter(row => row.isValid).length
      const invalidCount = processedData.length - validCount
      
      if (invalidCount > 0) {
        toast.warning(`Found ${processedData.length} customers: ${validCount} valid, ${invalidCount} with errors`)
      } else {
        toast.success(`Found ${processedData.length} valid customers ready to upload`)
      }
      
    } catch (error) {
      console.error("Error processing Excel file:", error)
      toast.error("Error processing the Excel file. Please check the format.")
    }
  }
  
  const downloadTemplate = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const data = [
      ['name', 'email', 'phone', 'address', 'reference'],
      ['John Doe', 'john@example.com', '9876543210', '123 Main St', 'Website'],
      ['Jane Smith', 'jane@example.com', '9876543211', '456 Oak St', 'Referral']
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Customers')
    
    // Generate file and trigger download
    XLSX.writeFile(wb, 'customer_upload_template.xlsx')
  }
  
  const handleUpload = async () => {
    // Check if any valid customers exist
    const validCustomers = parsedData.filter(customer => customer.isValid)
    
    if (validCustomers.length === 0) {
      toast.error("No valid customers to upload. Please fix the errors first.")
      return
    }
    
    try {
      setIsSaving(true)
      
      let successCount = 0
      let failedCount = 0
      const errors: string[] = []
      
      // Upload each valid customer
      for (const customer of validCustomers) {
        try {
          // Create a proper Customer object
          const newCustomer: Customer = {
            id: userDB.generateId('CUST'),
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            reference: customer.reference,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          await add('customers', newCustomer)
          successCount++
        } catch (error) {
          console.error("Error adding customer:", error)
          failedCount++
          errors.push(`Failed to add "${customer.name}": ${error}`)
        }
      }
      
      // Update stats
      setUploadStats({
        total: validCustomers.length,
        success: successCount,
        failed: failedCount,
        errors
      })
      
      if (failedCount === 0) {
        toast.success(`Successfully added ${successCount} customers`)
      } else {
        toast.warning(`Added ${successCount} customers, ${failedCount} failed`)
      }
      
    } catch (error) {
      console.error("Error in bulk upload:", error)
      toast.error("An error occurred during the upload process")
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Upload Customers</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Customer Data</CardTitle>
            <CardDescription>
              Upload an Excel file with your customer data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Excel File</p>
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
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Upload an Excel file with headers: name, email, phone, address, reference
              </p>
            </div>
          </CardContent>
        </Card>
        
        {parsedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview Data</CardTitle>
              <CardDescription>
                Review your customer data before uploading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((customer, index) => (
                      <TableRow key={index} className={!customer.isValid ? "bg-red-50" : ""}>
                        <TableCell>
                          {customer.isValid ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.address}</TableCell>
                        <TableCell>{customer.reference}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {parsedData.some(customer => !customer.isValid) && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    Some customers have validation errors. Only valid customers will be uploaded.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4">
                <Button 
                  className="w-full" 
                  onClick={handleUpload} 
                  disabled={parsedData.filter(c => c.isValid).length === 0 || isSaving}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isSaving ? "Uploading..." : "Upload Valid Customers"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {uploadStats && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>Summary of the bulk upload operation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{uploadStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-500">{uploadStats.success}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-red-500">{uploadStats.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
              
              {uploadStats.failed > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <h3 className="font-semibold">Error Details:</h3>
                  <ul className="text-sm space-y-1">
                    {uploadStats.errors.map((error, index) => (
                      <li key={index} className="text-red-500">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => router.push("/customers")}>
                  Return to Customers
                </Button>
                <Button onClick={() => {
                  setFile(null)
                  setParsedData([])
                  setUploadStats(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}>
                  Upload More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 