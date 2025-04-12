"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useDB } from "@/contexts/db-context"
import { Customer } from "@/lib/db"

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerAdded: (customer: Customer) => void
}

export function AddCustomerDialog({ open, onOpenChange, onCustomerAdded }: AddCustomerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { add, userDB } = useDB()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    reference: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error("Customer name is required")
        setIsSubmitting(false)
        return
      }
      
      if (!formData.phone.trim()) {
        toast.error("Phone number is required")
        setIsSubmitting(false)
        return
      }
      
      // Phone validation: must be exactly 10 digits
      if (!/^\d{10}$/.test(formData.phone)) {
        toast.error("Phone number must be exactly 10 digits")
        setIsSubmitting(false)
        return
      }

      // Create a new customer object with the form data
      const newCustomer: Customer = {
        id: userDB.generateId('CUST'),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Add the customer to the database
      await add('customers', newCustomer)
      
      toast.success("Customer added successfully")
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        reference: "",
      })
      
      // Close dialog and notify parent
      onOpenChange(false)
      onCustomerAdded(newCustomer)
    } catch (error) {
      console.error("Error adding customer:", error)
      toast.error("Failed to add customer. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to use in your invoice
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter customer name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Customer Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                maxLength={10}
                inputMode="numeric"
                title="Please enter exactly 10 digits"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Customer Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter customer address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                name="reference"
                placeholder="How did they find you?"
                value={formData.reference}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 