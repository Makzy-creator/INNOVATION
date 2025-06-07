import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useICP } from '../contexts/ICPContext'
import { 
  UserIcon, 
  HeartIcon, 
  MapPinIcon, 
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const RecipientProfile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth()
  const { donations, requests } = useICP()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bloodType: user?.bloodType || ''
  })

  if (!user || user.role !== 'recipient') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to registered recipients.</p>
        </div>
      </div>
    )
  }

  const userRequests = requests.filter(r => r.recipientId === user.id)
  const receivedDonations = donations.filter(d => d.recipientId === user.id)
  const completedDonations = receivedDonations.filter(d => d.status === 'completed')
  const activeRequests = userRequests.filter(r => r.status === 'open')

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await updateProfile(formData)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const stats = [
    {
      name: 'Blood Received',
      value: completedDonations.length,
      icon: HeartIcon,
      color: 'text-red-600 bg-red-100'
    },
    {
      name: 'Active Requests',
      value: activeRequests.length,
      icon: ClockIcon,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      name: 'Total Requests',
      value: userRequests.length,
      icon: UserIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      name: 'Success Rate',
      value: userRequests.length > 0 ? `${Math.round((completedDonations.length / userRequests.length) * 100)}%` : '0%',
      icon: CheckBadgeIcon,
      color: 'text-green-600 bg-green-100'
    }
  ]

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Recipient Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your profile and track your blood requests
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card p-6"
            >
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-12 w-12 text-secondary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center justify-center mt-2">
                  <span className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {user.bloodType} Recipient
                  </span>
                  {user.verified && (
                    <CheckBadgeIcon className="h-5 w-5 text-green-500 ml-2" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="h-5 w-5 mr-3" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="h-5 w-5 mr-3" />
                  <span className="text-sm">{user.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-3" />
                  <span className="text-sm">{user.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-5 w-5 mr-3" />
                  <span className="text-sm">Member since 2024</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-6 btn-secondary"
              >
                Edit Profile
              </button>
            </motion.div>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={stat.name} className="card p-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Active Requests */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Requests</h3>
              
              {activeRequests.length > 0 ? (
                <div className="space-y-4">
                  {activeRequests.map((request) => (
                    <div key={request.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <ClockIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {request.bloodType} - {request.amount} {request.amount === 1 ? 'unit' : 'units'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.location} • {request.timestamp.toLocaleDateString()}
                        </p>
                        {request.description && (
                          <p className="text-xs text-gray-500 mt-1">{request.description}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active requests</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Create a new blood request when you need help
                  </p>
                </div>
              )}
            </motion.div>

            {/* Received Donations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Received Donations</h3>
              
              {completedDonations.length > 0 ? (
                <div className="space-y-4">
                  {completedDonations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <HeartIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Received {donation.amount}ml of {donation.bloodType} blood
                        </p>
                        <p className="text-sm text-gray-600">
                          {donation.location} • {donation.timestamp.toLocaleDateString()}
                        </p>
                        {donation.txHash && (
                          <p className="text-xs text-blue-600 mt-1">
                            Blockchain: {donation.txHash}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No donations received yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Create a blood request to get help from donors
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Edit Profile
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 btn-secondary disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipientProfile