import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useICP } from '../contexts/ICPContext'
import { 
  HeartIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const DonationHistory: React.FC = () => {
  const { user } = useAuth()
  const { donations, requests } = useICP()
  const [activeTab, setActiveTab] = useState<'donations' | 'requests'>('donations')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your history.</p>
        </div>
      </div>
    )
  }

  const userDonations = donations.filter(d => 
    d.donorId === user.id || d.recipientId === user.id
  )
  const userRequests = requests.filter(r => r.recipientId === user.id)

  const filteredDonations = userDonations.filter(donation => {
    if (statusFilter && donation.status !== statusFilter) return false
    if (dateFilter) {
      const donationDate = format(donation.timestamp, 'yyyy-MM')
      if (donationDate !== dateFilter) return false
    }
    return true
  })

  const filteredRequests = userRequests.filter(request => {
    if (statusFilter && request.status !== statusFilter) return false
    if (dateFilter) {
      const requestDate = format(request.timestamp, 'yyyy-MM')
      if (requestDate !== dateFilter) return false
    }
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'fulfilled':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'pending':
      case 'open':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
      case 'expired':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'fulfilled':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">History</h1>
          <p className="mt-2 text-gray-600">
            Track your donations and requests over time
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 max-w-md mx-auto"
        >
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'donations'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Donations ({userDonations.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'requests'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Requests ({userRequests.length})
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                {activeTab === 'requests' && (
                  <>
                    <option value="open">Open</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="expired">Expired</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('')
                  setDateFilter('')
                }}
                className="btn-outline"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {activeTab === 'donations' ? (
            <div className="space-y-4">
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation, index) => (
                  <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary-100 p-3 rounded-full">
                          <HeartIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {user.role === 'donor' ? 'Donation to' : 'Received from'} {donation.bloodType} {user.role === 'donor' ? 'recipient' : 'donor'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <HeartIcon className="h-4 w-4 mr-2" />
                              {donation.amount}ml of {donation.bloodType} blood
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-2" />
                              {donation.location}
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {format(donation.timestamp, 'MMM dd, yyyy')}
                            </div>
                          </div>
                          {donation.txHash && (
                            <div className="mt-2">
                              <p className="text-xs text-blue-600">
                                Blockchain Transaction: {donation.txHash}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(donation.status)}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}>
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No donations found
                  </h3>
                  <p className="text-gray-600">
                    {statusFilter || dateFilter 
                      ? 'Try adjusting your filters to see more results.'
                      : 'Your donation history will appear here once you start donating.'
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-secondary-100 p-3 rounded-full">
                          <ClockIcon className="h-6 w-6 text-secondary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Blood Request - {request.bloodType}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <HeartIcon className="h-4 w-4 mr-2" />
                              {request.amount} {request.amount === 1 ? 'unit' : 'units'} needed
                            </div>
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-2" />
                              {request.location}
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {format(request.timestamp, 'MMM dd, yyyy')}
                            </div>
                          </div>
                          {request.description && (
                            <p className="text-sm text-gray-700 mt-2">
                              {request.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.toUpperCase()}
                        </span>
                        {getStatusIcon(request.status)}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No requests found
                  </h3>
                  <p className="text-gray-600">
                    {statusFilter || dateFilter 
                      ? 'Try adjusting your filters to see more results.'
                      : 'Your blood requests will appear here once you create them.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default DonationHistory