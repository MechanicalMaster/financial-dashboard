"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewSupplierPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Form fields
  const [supplierName, setSupplierName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  // Set isMounted after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supplierName) {
      toast.error("Please enter supplier name")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Get existing suppliers from localStorage
      const savedSuppliers = localStorage.getItem('purchaseSuppliers');
      let suppliersList = savedSuppliers ? JSON.parse(savedSuppliers) : [];
      
      // Create new supplier
      const newSupplier = {
        id: Date.now(),
        name: supplierName,
        contact: contactName,
        email,
        phone,
        address,
        notes,
        invoices: 0,
      };
      
      // Add to suppliers list
      suppliersList = [...suppliersList, newSupplier];
      
      // Save to localStorage
      localStorage.setItem('purchaseSuppliers', JSON.stringify(suppliersList));
      
      toast.success("Supplier added successfully");
      
      // Navigate back to suppliers list
      setTimeout(() => {
        router.push('/purchases?tab=suppliers');
      }, 1500);
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Failed to add supplier");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Supplier</h1>
          <p className="text-muted-foreground">Add details about a new supplier to your system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Supplier"}
          </Button>
          <Button variant="outline" onClick={() => router.push('/purchases?tab=suppliers')}>
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the essential details about this supplier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-name">Supplier Name *</Label>
                <Input 
                  id="supplier-name" 
                  value={supplierName} 
                  onChange={(e) => setSupplierName(e.target.value)} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-name">Contact Person</Label>
                <Input 
                  id="contact-name" 
                  value={contactName} 
                  onChange={(e) => setContactName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Add more details about this supplier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  rows={4}
                />
              </div>
              
              <div className="rounded-md p-4 border mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Supplier Information</h3>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• All suppliers added here will be available when creating purchase invoices</li>
                  <li>• You can edit supplier details at any time</li>
                  <li>• Purchase history will be tracked for each supplier</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
} 