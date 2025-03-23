"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export interface EditBookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: {
    id: string
    date: string
    bookingDate?: string
    amount: number
    status: string
    customerId?: string
    customerName?: string
  }
  onSave: (updatedBooking: any) => void
}

export function EditBookingModal({ open, onOpenChange, booking, onSave }: EditBookingModalProps) {
  const [bookingId, setBookingId] = useState(booking.id)
  const [date, setDate] = useState<Date | undefined>(
    booking.date ? new Date(booking.date) : undefined
  )
  const [bookingDate, setBookingDate] = useState<Date | undefined>(
    booking.bookingDate ? new Date(booking.bookingDate) : undefined
  )
  const [amount, setAmount] = useState(booking.amount)
  const [status, setStatus] = useState(booking.status)

  const handleSave = () => {
    if (!bookingId || !date) {
      toast.error("Please fill in all required fields")
      return
    }

    const updatedBooking = {
      ...booking,
      id: bookingId,
      date: date ? format(date, "yyyy-MM-dd") : booking.date,
      bookingDate: bookingDate ? format(bookingDate, "yyyy-MM-dd") : undefined,
      amount,
      status
    }

    onSave(updatedBooking)
    toast.success("Booking updated successfully")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="booking-id">Booking ID</Label>
            <Input 
              id="booking-id" 
              value={bookingId} 
              onChange={(e) => setBookingId(e.target.value)} 
              placeholder="BKG-XXXX"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label>Invoice Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>Booking Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={setBookingDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">₹</span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                className="pl-7"
                value={amount.toString()}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 