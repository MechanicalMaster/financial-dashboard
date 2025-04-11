"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { User, Mail, Lock, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function RegisterPage() {
  console.log("RegisterPage component is rendering") // Debug log
  
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [firebaseError, setFirebaseError] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setFirebaseError(null)

    try {
      await register(formData.email, formData.password, formData.fullName)
      toast.success("Registration successful! You can now log in")
    } catch (error: any) {
      console.error("Registration error:", error)
      
      let errorMessage = "Failed to register"
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email already in use"
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/weak-password":
          errorMessage = "Password is too weak"
          break
        case "auth/operation-not-allowed":
          errorMessage = "Email/password registration is not enabled"
          break
        default:
          errorMessage = error.message || "Failed to register"
      }
      
      if (error.message === "Authentication is not available") {
        setFirebaseError("Firebase authentication is not configured. Please contact the administrator.")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <Link href="/" className="text-sm text-amber-600 hover:text-amber-700">
              Back to Home
            </Link>
          </div>
          <p className="text-muted-foreground">Sign up for a new account</p>
        </CardHeader>
        {firebaseError && (
          <div className="bg-red-50 p-4 border-l-4 border-red-500 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {firebaseError}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  To fix this, you need to set up Firebase credentials in your environment variables.
                </p>
              </div>
            </div>
          </div>
        )}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.fullName && (
                  <div className="flex items-center text-red-500 mt-1 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.fullName}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center text-red-500 mt-1 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.password ? (
                  <div className="flex items-center text-red-500 mt-1 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 6 characters long
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center text-red-500 mt-1 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700" 
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center w-full">
            <span className="text-sm text-muted-foreground">Already have an account?</span>{" "}
            <Link href="/login" className="text-sm text-amber-600 hover:underline">
              Log in
            </Link>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 