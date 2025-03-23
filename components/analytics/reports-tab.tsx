"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Printer } from "lucide-react"

const reportTypes = [
  "Financial Summary",
  "Customer Acquisition",
  "Product Performance",
  "Risk Assessment",
  "Marketing Campaign Analysis",
  "Operational Efficiency",
]

const financialMetrics = [
  { id: 1, metric: "Total Revenue", value: "₹1,234,567" },
  { id: 2, metric: "Net Profit", value: "₹345,678" },
  { id: 3, metric: "Operating Expenses", value: "₹567,890" },
  { id: 4, metric: "Cost of Goods Sold", value: "45%" },
  { id: 5, metric: "Gross Margin", value: "55%" },
]

const customerMetrics = [
  { id: 1, metric: "Total Customers", value: "15,678" },
  { id: 2, metric: "Customer Acquisition Cost", value: "₹50" },
  { id: 3, metric: "Conversion Rate", value: "3.2%" },
  { id: 4, metric: "Customer Lifetime Value", value: "₹1,200" },
  { id: 5, metric: "Churn Rate", value: "1.8%" },
]

const dummyReportData = {
  "Financial Summary": financialMetrics,
  "Customer Acquisition": customerMetrics,
  // Add more report types here
}

export function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState(reportTypes[0])

  const handleGenerateReport = () => {
    console.log(`Generating ${selectedReport} report...`)
  }

  const handleDownloadReport = () => {
    console.log(`Downloading ${selectedReport} report...`)
  }

  const handlePrintReport = () => {
    console.log(`Printing ${selectedReport} report...`)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{selectedReport} Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyReportData[selectedReport]?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.metric}</TableCell>
                  <TableCell>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handlePrintReport}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

