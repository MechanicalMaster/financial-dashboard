"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

interface SortDropdownProps {
  sortField: string
  sortOrder: string
  onSortFieldChange: (value: string) => void
  onSortOrderChange: () => void
}

export function SortDropdown({ 
  sortField, 
  sortOrder, 
  onSortFieldChange, 
  onSortOrderChange 
}: SortDropdownProps) {
  return (
    <div className="flex space-x-2">
      <Select value={sortField} onValueChange={onSortFieldChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="quantity">Quantity</SelectItem>
          <SelectItem value="cost">Price</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={onSortOrderChange}
      >
        <ArrowUpDown className="h-4 w-4 mr-2" />
        {sortOrder === "asc" ? "Ascending" : "Descending"}
      </Button>
    </div>
  )
} 