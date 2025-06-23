import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import ICPService from '../services/icpService'
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
  verified: boolean
  nftTokenId?: number
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
  principal: string | null
  donations: BloodDonation[]
  requests: BloodRequest[]
  connectWallet: () => Promise<boolean>
  disconnectWallet: () => void
  recordDonation: (donation: Omit<BloodDonation, 'id' | 'timestamp' | 'txHash' | 'verified' | 'nftTokenId'>) => Promise<boolean>
  createBloodRequest: (request: Omit<BloodRequest, 'id' | 'timestamp'>) => Promise<boolean>
  fulfillRequest: (requestId: string, donorId: string) => Promise<boolean>
  getDonationHistory: (userId: string) => BloodDonation[]
  getBloodRequests: () => BloodRequest[]
  registerDonor: (name: string, bloodType: string, location: string) => Promise<boolean>
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
  const [principal, setPrincipal] = useState<string | null>(null)
  const [donations, setDonations] = useState<BloodDonation[]>([])
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    initializeICP()
  }, [])

  const initializeICP = async () => {
    try {
      await ICPService.initialize()
      const connected = ICPService.isConnected()
      setIsConnected(connected)
      
      if (connected) {
        const principalText = ICPService.getPrincipalText()
        setPrincipal(principalText)
        await loadData()
      }
    } catch (error) {
      console.error('Failed to initialize ICP:', error)
    }
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load donations and requests from ICP canisters
      const [donationsData, requestsData] = await Promise.all([
        ICPService.getDonations(),
        ICPService.getBloodRequests()
      ])

      // Transform the data to match our interface
      const transformedDonations: BloodDonation[] = donationsData.map((d: any) => ({
        id: d.id,
        donorId: d.donorId.toText(),
        recipientId: d.recipientId ? d.recipientId.toText() : '',
        bloodType: d.bloodType,
        amount: Number(d.amount),
        timestamp: new Date(Number(d.timestamp) / 1000000), // Convert from nanoseconds
        location: d.location,
        status: d.verified ? 'completed' : 'pending',
        txHash: d.txHash,
        verified: d.verified,
        nftTokenId: d.nftTokenId ? Number(d.nftTokenId) : undefined
      }))

      const transformedRequests: BloodRequest[] = requestsData.map((r: any) => ({
        id: r.id,
        recipientId: r.recipientId.toText(),
        bloodType: r.bloodType,
        amount: Number(r.amount),
        urgency: r.urgency as any,
        location: r.location,
        timestamp: new Date(Number(r.timestamp) / 1000000),
        status: r.status as any,
        description: r.description || undefined
      }))

      setDonations(transformedDonations)
      setRequests(transformedRequests)
    } catch (error) {
      console.error('Failed to load data from ICP:', error)
      // Fallback to mock data for demo
      loadMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const loadMockData = () => {
    // Keep existing mock data as fallback
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
        txHash: '0x1234...abcd',
        verified: true,
        nftTokenId: 1
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
      }
    ]

    setDonations(mockDonations)
    setRequests(mockRequests)
  }

  const connectWallet = async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      const success = await ICPService.login()
      if (success) {
        setIsConnected(true)
        const principalText = ICPService.getPrincipalText()
        setPrincipal(principalText)
        await loadData()
        toast.success('Wallet connected successfully!')
        return true
      } else {
        toast.error('Failed to connect wallet')
        return false
      }
    } catch (error) {
      toast.error('Wallet connection failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await ICPService.logout()
      setIsConnected(false)
      setPrincipal(null)
      setDonations([])
      setRequests([])
      toast.success('Wallet disconnected')
    } catch (error) {
      toast.error('Failed to disconnect wallet')
    }
  }

  const registerDonor = async (name: string, bloodType: string, location: string): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return false
    }

    setIsLoading(true)
    try {
      const result = await ICPService.registerDonor(name, bloodType, location)
      if ('ok' in result) {
        toast.success('Donor registered successfully!')
        return true
      } else {
        toast.error(result.err)
        return false
      }
    } catch (error) {
      toast.error('Failed to register donor')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const recordDonation = async (donation: Omit<BloodDonation, 'id' | 'timestamp' | 'txHash' | 'verified' | 'nftTokenId'>): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return false
    }

    setIsLoading(true)
    try {
      const result = await ICPService.recordDonation(
        donation.recipientId || null,
        donation.bloodType,
        donation.amount,
        donation.location
      )

      if ('ok' in result) {
        await loadData() // Reload data to get the new donation with NFT
        toast.success('Donation recorded on blockchain and NFT certificate minted!')
        return true
      } else {
        toast.error(result.err)
        return false
      }
    } catch (error) {
      toast.error('Failed to record donation')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const createBloodRequest = async (request: Omit<BloodRequest, 'id' | 'timestamp'>): Promise<boolean> => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return false
    }

    setIsLoading(true)
    try {
      const result = await ICPService.createBloodRequest(
        request.bloodType,
        request.amount,
        request.urgency,
        request.location,
        request.description
      )

      if ('ok' in result) {
        await loadData()
        toast.success('Blood request created successfully!')
        return true
      } else {
        toast.error(result.err)
        return false
      }
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
      const result = await ICPService.fulfillBloodRequest(requestId, donorId)
      
      if ('ok' in result) {
        await loadData()
        toast.success('Blood request fulfilled!')
        return true
      } else {
        toast.error(result.err)
        return false
      }
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
    registerDonor,
    isLoading
  }

  return (
    <ICPContext.Provider value={value}>
      {children}
    </ICPContext.Provider>
  )
}