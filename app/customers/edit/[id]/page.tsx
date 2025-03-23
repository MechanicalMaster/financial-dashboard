"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

// Sample customer data (this would come from your API in a real app)
const sampleCustomers = [
  {
    id: "CUST-001",
    name: "Acme Corporation",
    email: "info@acmecorp.com",
    phone: "+91 98765 43210",
    address: "123 Main Street, Mumbai, 400001",
    reference: "Via Website",
    createdAt: "2023-05-15",
  },
  {
    id: "CUST-002",
    name: "Globex Industries",
    email: "contact@globex.com",
    phone: "+91 98765 12345",
    address: "456 Park Avenue, Delhi, 110001",
    reference: "Google Search",
    createdAt: "2023-06-20",
  },
  {
    id: "CUST-003",
    name: "Stark Enterprises",
    email: "hello@stark.com",
    phone: "+91 77665 54433",
    address: "789 Tower Road, Bangalore, 560001",
    reference: "Exhibition",
    createdAt: "2023-05-05",
  },
  {
    id: "CUST-004",
    name: "Wayne Industries",
    email: "business@wayne.com",
    phone: "+91 88899 77766",
    address: "101 Central Avenue, Chennai, 600001",
    reference: "Word of Mouth",
    createdAt: "2023-06-10",
  },
  {
    id: "CUST-005",
    name: "Oscorp",
    email: "info@oscorp.com",
    phone: "+91 92233 44556",
    address: "222 Tech Park, Hyderabad, 500001",
    reference: "Return Customer",
    createdAt: "2023-07-01",
  },
]

interface EditCustomerPageProps {
  params: {
    id: string
  }
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const router = useRouter()
  const { id } = params
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    reference: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you would fetch the customer data from your API
    const fetchCustomer = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        const customer = sampleCustomers.find((c) => c.id === id)
        
        if (!customer) {
          setError("Customer not found")
          return
        }
        
        setFormData({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          reference: customer.reference,
        })
      } catch (error) {
        console.error("Error fetching customer:", error)
        setError("Failed to load customer data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomer()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real application, you would submit this data to your API
      console.log("Form data submitted for update:", formData)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast.success("Customer updated successfully")
      router.push("/customers")
    } catch (error) {
      console.error("Error updating customer:", error)
      toast.error("Failed to update customer. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <p>Loading customer data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push("/customers")}>Back to Customers</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Update the details of customer {id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="email">Email Address</Label>
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
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
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

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter customer address"
                value={formData.address}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => router.push("/customers")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Customer"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 