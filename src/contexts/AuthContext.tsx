import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'
import SupabaseService from '../services/supabaseService'
import MultiChainService from '../services/multiChainService'

interface User {
  id: string
  email: string
  name: string
  role: 'donor' | 'recipient' | 'admin'
  bloodType?: string
  location?: string
  phone?: string
  walletAddress?: string
  verified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: 'donor' | 'recipient'
  bloodType?: string
  location?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Initialize multi-chain service
      await MultiChainService.initialize()
      
      // Check for existing session
      const currentUser = await SupabaseService.getCurrentUser()
      if (currentUser) {
        const profile = await SupabaseService.getUserProfile(currentUser.id)
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            role: profile.role,
            bloodType: profile.blood_type || undefined,
            location: profile.location || undefined,
            phone: profile.phone || undefined,
            walletAddress: profile.wallet_address || undefined,
            verified: profile.verified
          })
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const authData = await SupabaseService.signIn(email, password)
      if (authData.user) {
        const profile = await SupabaseService.getUserProfile(authData.user.id)
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            role: profile.role,
            bloodType: profile.blood_type || undefined,
            location: profile.location || undefined,
            phone: profile.phone || undefined,
            walletAddress: profile.wallet_address || undefined,
            verified: profile.verified
          })
          toast.success('Login successful!')
          return true
        }
      }
      return false
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    try {
      const authData = await SupabaseService.signUp(userData.email, userData.password, {
        full_name: userData.name
      })
      
      if (authData.user) {
        // Create user profile
        const profile = await SupabaseService.createUserProfile({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.name,
          role: userData.role,
          blood_type: userData.bloodType,
          location: userData.location,
          phone: userData.phone,
          verified: false
        })
        
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            role: profile.role,
            bloodType: profile.blood_type || undefined,
            location: profile.location || undefined,
            phone: profile.phone || undefined,
            walletAddress: profile.wallet_address || undefined,
            verified: profile.verified
          })
          toast.success('Registration successful!')
          return true
        }
      }
      return false
    } catch (error) {
      toast.error('Registration failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await SupabaseService.signOut()
      await MultiChainService.disconnect()
      setUser(null)
      toast.success('Logged out successfully!')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    try {
      const updateData: any = {}
      if (data.name) updateData.full_name = data.name
      if (data.bloodType) updateData.blood_type = data.bloodType
      if (data.location) updateData.location = data.location
      if (data.phone) updateData.phone = data.phone
      if (data.walletAddress) updateData.wallet_address = data.walletAddress
      
      const updatedProfile = await SupabaseService.updateUserProfile(user.id, updateData)
      if (updatedProfile) {
        setUser(prev => prev ? { ...prev, ...data } : null)
        toast.success('Profile updated successfully!')
        return true
      }
      return false
    } catch (error) {
      toast.error('Failed to update profile.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}