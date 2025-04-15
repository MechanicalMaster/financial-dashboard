"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isResetSent, setIsResetSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }
    
    setLoading(true)

    try {
      await resetPassword(email)
      setIsResetSent(true)
      toast.success("Password reset email sent")
    } catch (error: any) {
      console.error("Password reset error:", error)
      
      let errorMessage = "Failed to send reset email"
      switch (error.code) {
        case "auth/user-not-found":
          // For security reasons, don't reveal if user exists
          setIsResetSent(true) // Still show success to prevent user enumeration
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later"
          break
        default:
          errorMessage = error.message || "Failed to send reset email"
      }
      
      if (!isResetSent) {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <Link href="/login" className="text-sm text-primary hover:text-primary/80 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
          <p className="text-muted-foreground">
            {isResetSent 
              ? "Check your email for reset instructions" 
              : "Enter your email to receive a password reset link"}
          </p>
        </CardHeader>
        <CardContent>
          {isResetSent ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-xl font-medium mb-2">Email Sent</h3>
              <p className="text-muted-foreground mb-6">
                We've sent reset instructions to:
                <br />
                <span className="font-medium text-black mt-2 block">{email}</span>
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Don't see it? Check your spam folder.</p>
                <p className="mt-2">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => setIsResetSent(false)}
                  >
                    Try another email address
                  </Button>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/80" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center w-full">
            <span className="text-sm text-muted-foreground">Remember your password?</span>{" "}
            <Link href="/login" className="text-sm text-primary hover:underline">
              Log in
            </Link>
          </div>
          <div className="text-center w-full">
            <span className="text-sm text-muted-foreground">Don't have an account?</span>{" "}
            <Link href="/register" className="text-sm text-primary hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
