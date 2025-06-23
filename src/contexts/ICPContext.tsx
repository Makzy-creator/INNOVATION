import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Actor, HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import toast from 'react-hot-toast'

interface BloodDonation {
  id: string
  donorId: string
  recipientId: string
  bloodType: string
  amount: number
  timestamp: Date
  location: string
  status: 'pending' | 'completed' | 'cancelled'
  txHash?: string
}

interface BloodRequest {
  id: string
  recipientId: string
  bloodType: string
  amount: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  location: string
  timestamp: Date
  status: 'open' | 'fulfilled' | 'expired'
  description?: string
}

interface ICPContextType {
  isConnected: boolean
  principal: Principal | null
  donations: BloodDonation[]
  requests: BloodRequest[]
  connectWallet: () => Promise<boolean>
  disconnectWallet: () => void
  recordDonation: (donation: Omit<BloodDonation, 'id' | 'timestamp' | 'txHash'>) => Promise<boolean>
  createBloodRequest: (request: Omit<BloodRequest, 'id' | 'timestamp'>) => Promise<boolean>
  fulfillRequest: (requestId: string, donorId: string) => Promise<boolean>
  getDonationHistory: (userId: string) => BloodDonation[]
  getBloodRequests: () => BloodRequest[]
  isLoading: boolean
}

const ICPContext = createContext<ICPContextType | undefined>(undefined)

export const useICP = () => {
  const context = useContext(ICPContext)
  if (context === undefined) {
    throw new Error('useICP must be used within an ICPProvider')
  }
  return context
}

export const ICPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [principal, setPrincipal] = useState<Principal | null>(null)
  const [donations, setDonations] = useState<BloodDonation[]>([])
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Initialize with mock data
    const mockDonations: BloodDonation[] = [
      {
        id: '1',
        donorId: 'donor1',
        recipientId: 'recipient1',
        bloodType: 'O+',
        amount: 450,
        timestamp: new Date('2024-01-15'),
        location: 'Lagos University Teaching Hospital',
        status: 'completed',
        txHash: '0x1234...abcd'
      },
      {
        id: '2',
        donorId: 'donor2',
        recipientId: 'recipient2',
        bloodType: 'A-',
        amount: 450,
        timestamp: new Date('2024-01-10'),
        location: 'General Hospital Ikeja',
        status: 'completed',
        txHash: '0x5678...efgh'
      }
    ]

    const mockRequests: BloodRequest[] = [
      {
        id: '1',
        recipientId: 'recipient3',
        bloodType: 'B+',
        amount: 2,
        urgency: 'critical',
        location: 'National Hospital Abuja',
        timestamp: new Date(),
        status: 'open',
        description: 'Urgent need for surgery patient'
      },
      {
        id: '2',
        recipientId: 'recipient4',
        bloodType: 'AB-',
        amount: 1,
        urgency: 'high',
        location: 'University College Hospital',
        timestamp: new Date(),
        status: 'open',
        description: 'Emergency transfusion required'
      }
    ]

    setDonations(mockDonations)
    setRequests(mockRequests)
  }, [])

  const connectWallet = async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock principal
      const mockPrincipal = Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai')
      setPrincipal(mockPrincipal)
      setIsConnected(true)
      
      toast.success('Wallet connected successfully!')
      return true
    } catch (error) {
      toast.error('Failed to connect wallet')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setPrincipal(null)
    setIsConnected(false)
    toast.success('Wallet disconnected')
  }

  const recordDonation = async (donation: Omit<BloodDonation, 'id' | 'timestamp' | 'txHash'>): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return false
    }

    setIsLoading(true)
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newDonation: BloodDonation = {
        ...donation,
        id: Date.now().toString(),
        timestamp: new Date(),
        txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`
      }
      
      setDonations(prev => [newDonation, ...prev])
      toast.success('Donation recorded on blockchain!')
      return true
    } catch (error) {
      toast.error('Failed to record donation')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const createBloodRequest = async (request: Omit<BloodRequest, 'id' | 'timestamp'>): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newRequest: BloodRequest = {
        ...request,
        id: Date.now().toString(),
        timestamp: new Date()
      }
      
      setRequests(prev => [newRequest, ...prev])
      toast.success('Blood request created successfully!')
      return true
    } catch (error) {
      toast.error('Failed to create blood request')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const fulfillRequest = async (requestId: string, donorId: string): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return false
    }

    setIsLoading(true)
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'fulfilled' as const }
            : req
        )
      )
      
      toast.success('Blood request fulfilled!')
      return true
    } catch (error) {
      toast.error('Failed to fulfill request')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const getDonationHistory = (userId: string): BloodDonation[] => {
    return donations.filter(donation => 
      donation.donorId === userId || donation.recipientId === userId
    )
  }

  const getBloodRequests = (): BloodRequest[] => {
    return requests.filter(request => request.status === 'open')
  }

  const value: ICPContextType = {
    isConnected,
    principal,
    donations,
    requests,
    connectWallet,
    disconnectWallet,
    recordDonation,
    createBloodRequest,
    fulfillRequest,
    getDonationHistory,
    getBloodRequests,
    isLoading
  }

  return (
    <ICPContext.Provider value={value}>
      {children}
    </ICPContext.Provider>
  )
}