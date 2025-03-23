"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import QRCode from "qrcode"
import Barcode from "react-barcode"

interface AddItemLabelPreviewProps {
  name: string;
  price: string;
  category?: string;
  metal?: string;
  purity?: string;
  weight?: string;
  includeProductName?: boolean;
  includePrice?: boolean;
  includeBarcode?: boolean;
  includeDate?: boolean;
  includeQr?: boolean;
  includeMetal?: boolean;
  includePurity?: boolean;
  includeWeight?: boolean;
}

export function AddItemLabelPreview({ 
  name, 
  price,
  category = "",
  metal = "",
  purity = "",
  weight = "",
  includeProductName = true,
  includePrice = true,
  includeBarcode = true,
  includeDate = true,
  includeQr = true,
  includeMetal = true,
  includePurity = true,
  includeWeight = true
}: AddItemLabelPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  
  // Formats for date display on label
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  
  // Generate QR code data URL when relevant data changes
  useEffect(() => {
    const generateQR = async () => {
      try {
        // Create QR with item data in JSON format
        const itemData = JSON.stringify({
          name,
          category,
          metal,
          purity,
          weight,
          price,
          date: currentDate
        })
        
        const dataUrl = await QRCode.toDataURL(itemData, {
          width: 100,
          margin: 1,
          errorCorrectionLevel: 'M'
        })
        
        setQrDataUrl(dataUrl)
      } catch (err) {
        console.error("Error generating QR code:", err)
      }
    }
    
    generateQR()
  }, [name, category, metal, purity, weight, price, currentDate])

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-[300px] h-[170px] p-4 border-2 border-dashed">
        <div className="flex h-full flex-col">
          <div className="flex justify-between items-start">
            <div className="flex-1 overflow-hidden">
              {includeProductName && <h3 className="text-sm font-bold truncate">{name}</h3>}
              {includeMetal && metal && <p className="text-xs text-muted-foreground">Metal: {metal}</p>}
              {includePurity && purity && <p className="text-xs text-muted-foreground">Purity: {purity}</p>}
              {includeWeight && weight && <p className="text-xs text-muted-foreground">Weight: {weight}g</p>}
            </div>
            {includeQr && qrDataUrl && (
              <div className="ml-2">
                <div className="bg-muted rounded-md p-1">
                  <img 
                    id="label-qr-code"
                    src={qrDataUrl} 
                    alt="QR Code" 
                    className="h-12 w-12" 
                  />
                </div>
              </div>
            )}
          </div>
          <div className="mt-auto">
            <div className="flex justify-between items-end">
              {includeDate && <p className="text-xs text-muted-foreground">Added: {currentDate}</p>}
              {includePrice && <p className="text-lg font-bold">{price}</p>}
            </div>
            {includeBarcode && (
              <div className="mt-2 h-12 flex items-center justify-center" id="label-barcode">
                <Barcode 
                  value={name || "Item"}
                  width={1.5}
                  height={30}
                  fontSize={8}
                  margin={0}
                  displayValue={true}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

