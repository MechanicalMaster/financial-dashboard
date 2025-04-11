"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getPath } from "@/lib/utils/path-utils"
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  PhoneAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
  UserCredential,
  signInWithCredential,
  Auth
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc, getDoc, serverTimestamp, Firestore } from "firebase/firestore"

interface UserData {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  createdAt?: Date;
  lastLogin?: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  confirmOTP: (verificationId: string, otp: string) => Promise<UserCredential>;
  register: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getRecaptchaVerifier: (elementId: string) => RecaptchaVerifier;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error("Not implemented") },
  loginWithPhone: async () => { throw new Error("Not implemented") },
  confirmOTP: async () => { throw new Error("Not implemented") },
  register: async () => { throw new Error("Not implemented") },
  logout: async () => { throw new Error("Not implemented") },
  resetPassword: async () => { throw new Error("Not implemented") },
  getRecaptchaVerifier: () => { throw new Error("Not implemented") }
})

// Define public routes that don't need authentication
const publicRoutes = ['/', '/login', '/register', '/reset-password']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null)
  const [firebaseReady, setFirebaseReady] = useState(!!auth)
  
  // Check if user is authenticated
  const isAuthenticated = !!user

  // Listen for auth state changes
  useEffect(() => {
    // If Firebase isn't initialized, skip the auth listener
    if (!auth) {
      console.warn("Firebase Auth not initialized. Authentication features will not work.");
      setIsLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser && db) {
        // Get user data from Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData)
          } else {
            // Create user document if it doesn't exist
            const newUserData: UserData = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              phoneNumber: currentUser.phoneNumber,
              photoURL: currentUser.photoURL,
              createdAt: new Date(),
              lastLogin: new Date()
            }
            
            await setDoc(userDocRef, {
              ...newUserData,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            })
            
            setUserData(newUserData)
          }
        } catch (error) {
          console.error("Error getting user data:", error)
        }
      } else {
        setUserData(null)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Handle routing based on auth state
  useEffect(() => {
    if (!isLoading) {
      console.log("Auth state changed:", {
        isAuthenticated,
        pathname,
        isPublicRoute: publicRoutes.includes(pathname)
      });
      
      // Redirect to login if trying to access protected route while not authenticated
      if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        console.log("Redirecting to login from protected route", pathname);
        router.push(getPath("/login"));
      }
      
      // Redirect to home if accessing auth routes while authenticated
      if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
        console.log("Redirecting to home from auth route", pathname);
        router.push(getPath("/"));
      }
    }
  }, [isAuthenticated, pathname, router, isLoading]);

  const login = async (email: string, password: string) => {
    if (!auth) {
      console.error("Firebase auth is not initialized");
      throw new Error("Authentication is not available");
    }
    
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (result) => {
        // Update user's last login time
        if (result.user && db) {
          const userDocRef = doc(db, "users", result.user.uid)
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true })
        }
        return result
      })
  }

  const loginWithPhone = async (phoneNumber: string) => {
    if (!auth) {
      console.error("Firebase auth is not initialized");
      throw new Error("Authentication is not available");
    }
    
    if (!recaptchaVerifier) {
      throw new Error("Recaptcha verifier not initialized")
    }
    
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
    const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
    setConfirmResult(result)
    return result
  }

  const confirmOTP = async (verificationId: string, otp: string) => {
    if (!auth) {
      console.error("Firebase auth is not initialized");
      throw new Error("Authentication is not available");
    }
    
    if (!confirmResult) {
      const credential = PhoneAuthProvider.credential(verificationId, otp)
      return signInWithCredential(auth, credential)
    }
    
    return confirmResult.confirm(otp)
      .then(async (result) => {
        // Update or create user document
        if (result.user && db) {
          const userDocRef = doc(db, "users", result.user.uid)
          await setDoc(userDocRef, {
            uid: result.user.uid,
            phoneNumber: result.user.phoneNumber,
            lastLogin: serverTimestamp()
          }, { merge: true })
        }
        return result
      })
  }

  const register = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      console.error("Firebase auth is not initialized");
      throw new Error("Authentication is not available");
    }
    
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (result) => {
        // Update profile with display name
        if (result.user) {
          await updateProfile(result.user, { displayName })
          
          // Create user document
          if (db) {
            const userDocRef = doc(db, "users", result.user.uid)
            await setDoc(userDocRef, {
              uid: result.user.uid,
              email: result.user.email,
              displayName,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            })
          }
        }
        return result
      })
  }

  const logout = async () => {
    if (auth) {
      await signOut(auth)
    }
    router.push(getPath("/"))
  }

  const resetPassword = async (email: string) => {
    if (!auth) {
      console.error("Firebase auth is not initialized");
      throw new Error("Authentication is not available");
    }
    
    return sendPasswordResetEmail(auth, email)
  }

  const getRecaptchaVerifier = (elementId: string) => {
    try {
      console.log("Getting recaptcha verifier for element:", elementId);
      
      if (recaptchaVerifier) {
        console.log("Returning existing recaptcha verifier");
        return recaptchaVerifier;
      }
      
      if (!auth) {
        console.error("Firebase auth is not initialized");
        throw new Error("Authentication is not available");
      }
      
      // Make sure element exists
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element with ID ${elementId} not found for recaptcha`);
        throw new Error(`Element with ID ${elementId} not found`);
      }
      
      console.log("Creating new recaptcha verifier");
      const verifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {
          console.log("Recaptcha verified successfully");
        },
        'expired-callback': () => {
          console.log("Recaptcha expired");
        }
      });
      
      setRecaptchaVerifier(verifier);
      return verifier;
    } catch (error) {
      console.error("Error creating recaptcha verifier:", error);
      throw error;
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const value: AuthContextType = {
    user,
    userData,
    isAuthenticated,
    isLoading,
    login,
    loginWithPhone,
    confirmOTP,
    register,
    logout,
    resetPassword,
    getRecaptchaVerifier
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 