"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDB } from "@/contexts/db-context"
import { Master } from "@/lib/db"

interface MasterDropdownProps {
  masterType: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  showAllOption?: boolean
  allOptionLabel?: string
  allOptionValue?: string
  triggerClassName?: string
  refreshInterval?: number
}

export function MasterDropdown({ 
  masterType, 
  value, 
  onValueChange,
  placeholder = "Select...",
  className = "",
  showAllOption = false,
  allOptionLabel = "All",
  allOptionValue = "all",
  triggerClassName = "w-full sm:w-[180px]",
  refreshInterval = 30000 // Default to 30 seconds
}: MasterDropdownProps) {
  const [items, setItems] = useState<Master[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { getMastersByType } = useDB()
  
  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  
  // Fetch items from masters when component mounts
  useEffect(() => {
    if (!mounted) return
    
    const fetchItems = async () => {
      setLoading(true)
      setError(null)
      try {
        const masterItems = await getMastersByType(masterType)
        console.log(`[MasterDropdown] Got ${masterItems.length} ${masterType} items:`, masterItems)
        setItems(masterItems)
      } catch (error) {
        console.error(`Error fetching ${masterType} items:`, error)
        setError(`Failed to load ${masterType} items`)
        // Fall back to empty array
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchItems()
    
    // Setup a refresh interval to check for new masters
    const intervalId = setInterval(fetchItems, refreshInterval)
    
    // Clear interval on cleanup
    return () => clearInterval(intervalId)
  }, [masterType, getMastersByType, mounted, refreshInterval])
  
  if (!mounted) return null
  
  return (
    <div className={className}>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={loading}
      >
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={loading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {error && (
            <div className="py-2 px-2 text-sm text-center text-red-500">
              {error}
            </div>
          )}
          
          {showAllOption && (
            <SelectItem value={allOptionValue}>{allOptionLabel}</SelectItem>
          )}
          
          {items.map(item => (
            <SelectItem key={item.id} value={item.value}>
              {item.value}
            </SelectItem>
          ))}
          
          {/* Show message if no items are found */}
          {items.length === 0 && !loading && !error && (
            <>
              <div className="py-2 px-2 text-sm text-center text-muted-foreground">
                No {masterType} items found
              </div>
              
              {/* Fallback items based on masterType */}
              {masterType === 'category' && (
                <>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Stationery">Stationery</SelectItem>
                </>
              )}
              
              {masterType === 'supplier' && (
                <>
                  <SelectItem value="SupplyCo">SupplyCo</SelectItem>
                  <SelectItem value="TechSuppliers">TechSuppliers</SelectItem>
                  <SelectItem value="Office Depot">Office Depot</SelectItem>
                </>
              )}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  )
} 