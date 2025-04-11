"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Phone, Mail, Lock, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function LoginPage() {
  const { login, loginWithPhone, confirmOTP, getRecaptchaVerifier } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationId, setVerificationId] = useState("")
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    password: "",
  })
  
  const [phoneFormData, setPhoneFormData] = useState({
    phone: "",
    otp: "",
  })

  // Initialize recaptcha when component mounts
  useEffect(() => {
    const id = "recaptcha-container"
    
    if (!document.getElementById(id) && recaptchaContainerRef.current) {
      const div = document.createElement("div")
      div.id = id
      recaptchaContainerRef.current.appendChild(div)
    }
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(emailFormData.email, emailFormData.password)
      toast.success("Login successful")
    } catch (error: any) {
      console.error("Login error:", error)
      let errorMessage = "Failed to login"
      
      // Handle Firebase auth error codes
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/user-disabled":
          errorMessage = "This account has been disabled"
          break
        case "auth/user-not-found":
          errorMessage = "No account found with this email"
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password"
          break
        default:
          errorMessage = error.message || "Failed to login"
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Initialize recaptcha verifier
      const phoneNumber = phoneFormData.phone
      
      if (!phoneNumber || phoneNumber.length < 10) {
        toast.error("Please enter a valid phone number")
        return
      }
      
      const verifier = getRecaptchaVerifier("recaptcha-container")
      const confirmationResult = await loginWithPhone(phoneNumber)
      
      setVerificationId(confirmationResult.verificationId)
      setIsVerifying(true)
      toast.success("OTP sent successfully")
    } catch (error: any) {
      console.error("Phone login error:", error)
      let errorMessage = "Failed to send OTP"
      
      // Handle Firebase auth error codes
      switch (error.code) {
        case "auth/invalid-phone-number":
          errorMessage = "Invalid phone number format"
          break
        case "auth/quota-exceeded":
          errorMessage = "Too many requests. Try again later"
          break
        default:
          errorMessage = error.message || "Failed to send OTP"
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { otp } = phoneFormData
      
      if (!otp || otp.length < 6) {
        toast.error("Please enter a valid OTP")
        return
      }
      
      await confirmOTP(verificationId, otp)
      toast.success("Login successful")
    } catch (error: any) {
      console.error("OTP verification error:", error)
      
      let errorMessage = "Failed to verify OTP"
      switch (error.code) {
        case "auth/invalid-verification-code":
          errorMessage = "Invalid OTP code"
          break
        case "auth/code-expired":
          errorMessage = "OTP has expired. Please request a new one"
          break
        default:
          errorMessage = error.message || "Failed to verify OTP"
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    form: "email" | "phone"
  ) => {
    const { name, value } = e.target
    
    if (form === "email") {
      setEmailFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setPhoneFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <Link href="/" className="text-sm text-amber-600 hover:text-amber-700">
              Back to Home
            </Link>
          </div>
          <p className="text-muted-foreground">Enter your credentials to continue</p>
        </CardHeader>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <CardContent>
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={emailFormData.email}
                        onChange={(e) => handleInputChange(e, "email")}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={emailFormData.password}
                        onChange={(e) => handleInputChange(e, "email")}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link 
                    href="/reset-password" 
                    className="text-sm text-amber-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700" 
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login with Email"}
                </Button>
              </form>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="phone">
            <CardContent>
              {!isVerifying ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phoneFormData.phone}
                        onChange={(e) => handleInputChange(e, "phone")}
                        className="pl-10"
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        inputMode="numeric"
                        title="Please enter exactly 10 digits"
                      />
                    </div>
                  </div>

                  <div ref={recaptchaContainerRef} className="recaptcha-container"></div>

                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700" 
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={phoneFormData.otp}
                      onChange={(e) => handleInputChange(e, "phone")}
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                    <p className="text-xs text-muted-foreground">
                      OTP sent to +{phoneFormData.phone.startsWith("+") ? 
                        phoneFormData.phone.substring(1) : 
                        `91${phoneFormData.phone}`}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setIsVerifying(false)}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-amber-600 hover:bg-amber-700" 
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex flex-col space-y-4 mt-2">
          <div className="text-center w-full">
            <span className="text-sm text-muted-foreground">Don't have an account?</span>{" "}
            <Link href="/register" className="text-sm text-amber-600 hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 