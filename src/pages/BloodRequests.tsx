import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useICP } from '../contexts/ICPContext'
import { 
  ClockIcon, 
  MapPinIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const BloodRequests: React.FC = () => {
  const { user } = useAuth()
  const { requests, fulfillRequest, createBloodRequest, isLoading } = useICP()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filterBloodType, setFilterBloodType] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')
  const [newRequest, setNewRequest] = useState({
    bloodType: '',
    amount: 1,
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    location: '',
    description: ''
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const urgencyLevels = ['low', 'medium', 'high', 'critical']

  const filteredRequests = requests.filter(request => {
    if (request.status !== 'open') return false
    if (filterBloodType && request.bloodType !== filterBloodType) return false
    if (filterUrgency && request.urgency !== filterUrgency) return false
    return true
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleFulfillRequest = async (requestId: string) => {
    if (!user) return
    await fulfillRequest(requestId, user.id)
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const success = await createBloodRequest({
      ...newRequest,
      recipientId: user.id,
      status: 'open'
    })

    if (success) {
      setShowCreateForm(false)
      setNewRequest({
        bloodType: '',
        amount: 1,
        urgency: 'medium',
        location: '',
        description: ''
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'donor' 
                ? 'Find people who need your help and save lives'
                : 'Browse available blood requests or create your own'
              }
            </p>
          </motion.div>

          {user && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={() => setShowCreateForm(true)}
              className="btn-primary mt-4 sm:mt-0"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Request
            </motion.button>
          )}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
              </label>
              <select
                value={filterBloodType}
                onChange={(e) => setFilterBloodType(e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency
              </label>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="input-field"
              >
                <option value="">All Levels</option>
                {urgencyLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                onClick={() => {
                  setFilterBloodType('')
                  setFilterUrgency('')
                }}
                className="btn-outline"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full mr-3">
                    <span className="text-primary-600 font-bold text-lg">
                      {request.bloodType}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {request.amount} {request.amount === 1 ? 'Unit' : 'Units'} Needed
                    </h3>
                    <p className="text-sm text-gray-600">
                      {format(request.timestamp, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(request.urgency)}`}>
                  {request.urgency.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {request.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Posted {format(request.timestamp, 'MMM dd, yyyy')}
                </div>
              </div>

              {request.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {request.description}
                </p>
              )}

              {user?.role === 'donor' && (
                <button
                  onClick={() => handleFulfillRequest(request.id)}
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Offer to Help'}
                </button>
              )}

              {request.urgency === 'critical' && (
                <div className="mt-3 flex items-center text-red-600 text-sm">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Critical - Immediate attention needed
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No blood requests found
            </h3>
            <p className="text-gray-600 mb-6">
              {filterBloodType || filterUrgency 
                ? 'Try adjusting your filters to see more requests.'
                : 'Be the first to create a blood request in your area.'
              }
            </p>
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Create Request
              </button>
            )}
          </motion.div>
        )}

        {/* Create Request Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Create Blood Request
              </h2>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Type
                    </label>
                    <select
                      value={newRequest.bloodType}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, bloodType: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="">Select</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units Needed
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newRequest.amount}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, urgency: e.target.value as any }))}
                    className="input-field"
                    required
                  >
                    {urgencyLevels.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newRequest.location}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
                    className="input-field"
                    placeholder="Hospital or city name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Additional details about the request..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Request'}
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

export default BloodRequests