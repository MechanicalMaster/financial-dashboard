import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Masters Management",
  description: "Manage master data for categories, suppliers, and other dropdown options",
}

interface MastersLayoutProps {
  children: React.ReactNode
}

export default function MastersLayout({ children }: MastersLayoutProps) {
  return <>{children}</>
} 