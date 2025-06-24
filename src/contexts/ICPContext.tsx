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
  canisterIds: { bloodDonation: string; nft: string; internetIdentity: string }
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
  const [canisterIds, setCanisterIds] = useState({ bloodDonation: '', nft: '', internetIdentity: '' })

  useEffect(() => {
    initializeICP()
  }, [])

  const initializeICP = async () => {
    try {
      console.log('🔄 Initializing ICP Context...')
      setIsLoading(true)
      
      const success = await ICPService.initialize()
      if (success) {
        const connected = ICPService.isConnected()
        setIsConnected(connected)
        
        if (connected) {
          const principalText = ICPService.getPrincipalText()
          setPrincipal(principalText)
          await loadData()
        }
        
        // Get canister IDs
        const ids = ICPService.getCanisterIds()
        setCanisterIds(ids)
        
        console.log('✅ ICP Context initialized')
      }
    } catch (error) {
      console.error('❌ Failed to initialize ICP Context:', error)
      toast.error('Failed to initialize blockchain connection')
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    try {
      console.log('📊 Loading blockchain data...')
      
      const [donationsData, requestsData] = await Promise.all([
        ICPService.getDonations(),
        ICPService.getBloodRequests()
      ])

      // Transform the data to match our interface
      const transformedDonations: BloodDonation[] = donationsData.map((d: any, index: number) => ({
        id: d.id || `donation-${index}`,
        donorId: d.donorId?.toText() || 'unknown',
        recipientId: d.recipientId?.[0]?.toText() || '',
        bloodType: d.bloodType || 'O+',
        amount: Number(d.amount) || 450,
        timestamp: new Date(Number(d.timestamp) / 1000000 || Date.now()),
        location: d.location || 'Unknown Location',
        status: d.verified ? 'completed' : 'pending',
        txHash: d.txHash,
        verified: d.verified || false,
        nftTokenId: d.nftTokenId ? Number(d.nftTokenId) : undefined
      }))

      const transformedRequests: BloodRequest[] = requestsData.map((r: any, index: number) => ({
        id: r.id || `request-${index}`,
        recipientId: r.recipientId?.toText() || 'unknown',
        bloodType: r.bloodType || 'O+',
        amount: Number(r.amount) || 1,
        urgency: r.urgency as any || 'medium',
        location: r.location || 'Unknown Location',
        timestamp: new Date(Number(r.timestamp) / 1000000 || Date.now()),
        status: r.status as any || 'open',
        description: r.description?.[0] || undefined
      }))

      setDonations(transformedDonations)
      setRequests(transformedRequests)
      
      console.log('✅ Data loaded:', { donations: transformedDonations.length, requests: transformedRequests.length })
    } catch (error) {
      console.error('❌ Failed to load data from ICP:', error)
      // Keep existing data or use empty arrays
      if (donations.length === 0 && requests.length === 0) {
        loadMockData()
      }
    }
  }

  const loadMockData = () => {
    console.log('📝 Loading mock data for demo...')
    
    const mockDonations: BloodDonation[] = [
      {
        id: 'demo-1',
        donorId: 'demo-donor-1',
        recipientId: 'demo-recipient-1',
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
        id: 'demo-req-1',
        recipientId: 'demo-recipient-2',
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
      console.log('🔐 Connecting wallet...')
      
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
      console.error('❌ Wallet connection failed:', error)
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
      console.error('❌ Failed to disconnect wallet:', error)
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
      console.log('📝 Registering donor...')
      
      const result = await ICPService.registerDonor(name, bloodType, location)
      if (result.ok) {
        toast.success('Donor registered successfully!')
        return true
      } else {
        toast.error(result.err || 'Failed to register donor')
        return false
      }
    } catch (error) {
      console.error('❌ Failed to register donor:', error)
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
      console.log('🩸 Recording donation...')
      
      const result = await ICPService.recordDonation(
        donation.recipientId || null,
        donation.bloodType,
        donation.amount,
        donation.location
      )

      if (result.ok) {
        await loadData() // Reload data to get the new donation with NFT
        toast.success('Donation recorded on blockchain and NFT certificate minted!')
        return true
      } else {
        toast.error(result.err || 'Failed to record donation')
        return false
      }
    } catch (error) {
      console.error('❌ Failed to record donation:', error)
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
      console.log('🆘 Creating blood request...')
      
      const result = await ICPService.createBloodRequest(
        request.bloodType,
        request.amount,
        request.urgency,
        request.location,
        request.description
      )

      if (result.ok) {
        await loadData()
        toast.success('Blood request created successfully!')
        return true
      } else {
        toast.error(result.err || 'Failed to create blood request')
        return false
      }
    } catch (error) {
      console.error('❌ Failed to create blood request:', error)
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
      console.log('✅ Fulfilling blood request...')
      
      const result = await ICPService.fulfillBloodRequest(requestId, donorId)
      
      if (result.ok) {
        await loadData()
        toast.success('Blood request fulfilled!')
        return true
      } else {
        toast.error(result.err || 'Failed to fulfill request')
        return false
      }
    } catch (error) {
      console.error('❌ Failed to fulfill request:', error)
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
    isLoading,
    canisterIds
  }

  return (
    <ICPContext.Provider value={value}>
      {children}
    </ICPContext.Provider>
  )
}