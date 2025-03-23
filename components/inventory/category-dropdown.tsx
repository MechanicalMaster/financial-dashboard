"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDB } from "@/contexts/db-context"
import { Master } from "@/lib/db"

interface CategoryDropdownProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CategoryDropdown({
  value,
  onValueChange,
  placeholder = "All Categories",
  className = "w-full sm:w-[180px]"
}: CategoryDropdownProps) {
  const [categories, setCategories] = useState<Master[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { getMastersByType } = useDB()
  
  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  
  // Fetch categories from masters when component mounts
  useEffect(() => {
    if (!mounted) return
    
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)
      try {
        const masterCategories = await getMastersByType('category')
        setCategories(masterCategories)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError("Failed to load categories")
        // Fall back to empty array
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
    
    // Setup a refresh interval to check for new categories every 30 seconds
    const intervalId = setInterval(fetchCategories, 30000)
    
    // Clear interval on cleanup
    return () => clearInterval(intervalId)
  }, [getMastersByType, mounted])
  
  if (!mounted) return null
  
  return (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        
        {error && (
          <div className="px-2 py-1 text-red-500">{error}</div>
        )}
        
        {categories.map(category => (
          <SelectItem key={category.id} value={category.value}>
            {category.value}
          </SelectItem>
        ))}
        
        {/* Fallback categories if none are found in the database */}
        {categories.length === 0 && !loading && !error && (
          <>
            <SelectItem value="Furniture">Furniture</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Office Supplies">Office Supplies</SelectItem>
            <SelectItem value="Stationery">Stationery</SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  )
} 