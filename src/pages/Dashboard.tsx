import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useICP } from '../contexts/ICPContext'
import { 
  HeartIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import WalletConnection from '../components/WalletConnection'
import NFTCertificates from '../components/NFTCertificates'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { donations, requests, isConnected } = useICP()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    )
  }

  const userDonations = donations.filter(d => 
    d.donorId === user.id || d.recipientId === user.id
  )
  const userRequests = requests.filter(r => r.recipientId === user.id)
  const completedDonations = userDonations.filter(d => d.status === 'completed')
  const pendingRequests = requests.filter(r => r.status === 'open')
  const nftCertificates = completedDonations.filter(d => d.nftTokenId).length

  const stats = [
    {
      name: user.role === 'donor' ? 'Total Donations' : 'Received Donations',
      value: completedDonations.length,
      icon: HeartIcon,
      color: 'text-red-600 bg-red-100'
    },
    {
      name: 'Active Requests',
      value: pendingRequests.length,
      icon: ClockIcon,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      name: 'NFT Certificates',
      value: nftCertificates,
      icon: GiftIcon,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      name: 'Lives Impacted',
      value: completedDonations.length * 3, // Assuming each donation can save 3 lives
      icon: UserGroupIcon,
      color: 'text-green-600 bg-green-100'
    }
  ]

  const quickActions = [
    {
      name: user.role === 'donor' ? 'Find Blood Requests' : 'Create Blood Request',
      description: user.role === 'donor' 
        ? 'Browse urgent blood requests in your area' 
        : 'Request blood for yourself or someone else',
      href: user.role === 'donor' ? '/blood-requests' : '/blood-requests',
      icon: PlusIcon,
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      name: 'View Profile',
      description: 'Update your information and preferences',
      href: user.role === 'donor' ? '/donor-profile' : '/recipient-profile',
      icon: UserGroupIcon,
      color: 'bg-secondary-600 hover:bg-secondary-700'
    },
    {
      name: 'Donation History',
      description: 'View your complete donation history',
      href: '/donation-history',
      icon: ClockIcon,
      color: 'bg-green-600 hover:bg-green-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              {user.role === 'donor' 
                ? 'Thank you for being a life-saver. Here\'s your impact summary.'
                : 'Here\'s your dashboard overview and recent activity.'
              }
            </p>
          </motion.div>
        </div>

        {/* Wallet Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <WalletConnection />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className={`block p-4 rounded-lg text-white transition-all duration-200 transform hover:scale-105 ${action.color}`}
                  >
                    <div className="flex items-center">
                      <action.icon className="h-6 w-6 mr-3" />
                      <div>
                        <h3 className="font-semibold">{action.name}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              
              {userDonations.length > 0 || userRequests.length > 0 ? (
                <div className="space-y-4">
                  {/* Recent Donations */}
                  {userDonations.slice(0, 3).map((donation) => (
                    <div key={donation.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        donation.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <HeartIcon className={`h-5 w-5 ${
                          donation.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {user.role === 'donor' ? 'Donation to' : 'Received from'} {donation.bloodType} {user.role === 'donor' ? 'recipient' : 'donor'}
                          </p>
                          {donation.nftTokenId && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">
                              NFT #{donation.nftTokenId}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {donation.location} • {donation.timestamp.toLocaleDateString()}
                        </p>
                        {donation.txHash && (
                          <p className="text-xs text-blue-600 mt-1">
                            Blockchain: {donation.txHash}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        donation.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donation.status}
                      </span>
                    </div>
                  ))}

                  {/* Recent Requests */}
                  {userRequests.slice(0, 2).map((request) => (
                    <div key={request.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        request.urgency === 'critical' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <ClockIcon className={`h-5 w-5 ${
                          request.urgency === 'critical' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Blood Request - {request.bloodType}
                        </p>
                        <p className="text-xs text-gray-600">
                          {request.location} • {request.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.urgency === 'critical' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.urgency}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.status === 'open' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {user.role === 'donor' 
                      ? 'Start by browsing blood requests in your area'
                      : 'Create your first blood request to get started'
                    }
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* NFT Certificates Section */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8"
          >
            <div className="card p-6">
              <NFTCertificates />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard