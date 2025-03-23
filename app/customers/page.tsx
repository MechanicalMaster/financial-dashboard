"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search, Pencil, Trash, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { useDB } from "@/contexts/db-context"
import { Customer } from "@/lib/db"
import { format } from "date-fns"

// Sample customer data removed, using database now

export default function CustomersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getAll, remove } = useDB()

  // Fetch customers from the database
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        const dbCustomers = await getAll<Customer>('customers')
        setCustomers(dbCustomers)
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [getAll])

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )

  const handleDelete = async (id: string) => {
    if (id && window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await remove('customers', id)
        setCustomers(customers.filter(customer => customer.id !== id))
      } catch (error) {
        console.error("Error deleting customer:", error)
      }
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer information and track their transactions</p>
        </div>
        <Button onClick={() => router.push("/customers/add")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>View and manage all your customer records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-2 text-muted-foreground">No customers found</p>
              <Button variant="outline" onClick={() => router.push("/customers/add")}>
                Add your first customer
              </Button>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.id}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.createdAt instanceof Date ? format(customer.createdAt, 'MMM dd, yyyy') : 'Unknown'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/customers/${customer.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/customers/edit/${customer.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer.id || '')}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 