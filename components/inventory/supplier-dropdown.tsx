"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDB } from "@/contexts/db-context"

interface SupplierDropdownProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SupplierDropdown({
  value,
  onValueChange,
  placeholder = "Select a supplier",
  className = "w-full"
}: SupplierDropdownProps) {
  const [suppliers, setSuppliers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { getAll } = useDB()
  
  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  
  // Fetch suppliers from purchases when component mounts
  useEffect(() => {
    if (!mounted) return
    
    const fetchSuppliers = async () => {
      setLoading(true)
      setError(null)
      try {
        // First check localStorage for saved suppliers
        const savedSuppliers = localStorage.getItem('purchaseSuppliers');
        
        if (savedSuppliers) {
          // Extract unique supplier names from the saved suppliers
          const suppliersList = JSON.parse(savedSuppliers);
          const uniqueSuppliers = [...new Set(suppliersList.map((supplier: any) => supplier.name))] as string[];
          console.log(`[SupplierDropdown] Found ${uniqueSuppliers.length} suppliers from localStorage:`, uniqueSuppliers);
          setSuppliers(uniqueSuppliers);
        } else {
          // Fall back to getting suppliers from purchases database
          const purchases = await getAll('purchases')
          
          // Extract unique suppliers
          const uniqueSuppliers = [...new Set(purchases.map(purchase => 
            (purchase as any).supplier || ''
          ))].filter(s => s);
          
          console.log(`[SupplierDropdown] Found ${uniqueSuppliers.length} suppliers from purchases:`, uniqueSuppliers)
          setSuppliers(uniqueSuppliers)
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error)
        setError("Failed to load suppliers")
        setSuppliers([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchSuppliers()
    
    // Setup a refresh interval to check for new suppliers every 30 seconds
    const intervalId = setInterval(fetchSuppliers, 30000)
    
    // Clear interval on cleanup
    return () => clearInterval(intervalId)
  }, [getAll, mounted])
  
  if (!mounted) return null
  
  return (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {error && (
          <div className="px-2 py-1 text-red-500">{error}</div>
        )}
        
        {suppliers.map(supplier => (
          <SelectItem key={supplier} value={supplier}>
            {supplier}
          </SelectItem>
        ))}
        
        {/* Fallback suppliers if none are found */}
        {suppliers.length === 0 && !loading && !error && (
          <>
            <div className="px-2 py-1 text-muted-foreground">No suppliers found</div>
            <SelectItem value="Office Supplies Inc.">Office Supplies Inc.</SelectItem>
            <SelectItem value="Tech Solutions Ltd.">Tech Solutions Ltd.</SelectItem>
            <SelectItem value="Furniture Depot">Furniture Depot</SelectItem>
            <SelectItem value="Paper Products Co.">Paper Products Co.</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  )
} 