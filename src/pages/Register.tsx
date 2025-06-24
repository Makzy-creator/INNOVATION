import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useICP } from '../contexts/ICPContext'
import { EyeIcon, EyeSlashIcon, WalletIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor' as 'donor' | 'recipient',
    bloodType: '',
    location: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'form' | 'wallet' | 'blockchain'>('form')
  
  const { register, isLoading } = useAuth()
  const { connectWallet, registerDonor, isConnected } = useICP()
  const navigate = useNavigate()

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.bloodType) {
      newErrors.bloodType = 'Blood type is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Step 1: Register user account
    const success = await register(formData)
    if (success) {
      setStep('wallet')
      toast.success('Account created! Now let\'s connect your blockchain wallet.')
    }
  }

  const handleWalletConnect = async () => {
    // Step 2: Connect wallet
    const connected = await connectWallet()
    if (connected) {
      setStep('blockchain')
      toast.success('Wallet connected! Registering on blockchain...')
      
      // Step 3: Register on blockchain (for donors)
      if (formData.role === 'donor') {
        try {
          const blockchainSuccess = await registerDonor(
            formData.name,
            formData.bloodType,
            formData.location
          )
          
          if (blockchainSuccess) {
            toast.success('🎉 Registration complete! Welcome to LIFEFLOW!')
            navigate('/dashboard')
          } else {
            toast.error('Blockchain registration failed, but account was created')
            navigate('/dashboard')
          }
        } catch (error) {
          console.error('Blockchain registration error:', error)
          toast.error('Blockchain registration failed, but account was created')
          navigate('/dashboard')
        }
      } else {
        // Recipients don't need blockchain registration
        toast.success('🎉 Registration complete! Welcome to LIFEFLOW!')
        navigate('/dashboard')
      }
    }
  }

  const handleSkipWallet = () => {
    toast.success('Account created! You can connect your wallet later from the dashboard.')
    navigate('/dashboard')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Join LIFEFLOW
          </h2>
          <p className="mt-2 text-gray-600">
            Create your account and start saving lives today
          </p>
          
          {/* Progress Indicator */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step === 'form' ? 'text-primary-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  step === 'form' ? 'border-primary-600 bg-primary-600 text-white' : 'border-green-600 bg-green-600 text-white'
                }`}>
                  {step === 'form' ? '1' : '✓'}
                </div>
                <span className="ml-2 text-sm font-medium">Account</span>
              </div>
              <div className={`w-8 h-0.5 ${step === 'wallet' || step === 'blockchain' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step === 'wallet' ? 'text-primary-600' : step === 'blockchain' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  step === 'wallet' ? 'border-primary-600 bg-primary-600 text-white' : 
                  step === 'blockchain' ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'
                }`}>
                  {step === 'blockchain' ? '✓' : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">Wallet</span>
              </div>
              <div className={`w-8 h-0.5 ${step === 'blockchain' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step === 'blockchain' ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  step === 'blockchain' ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
                }`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Blockchain</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          {step === 'form' && (
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="donor"
                      checked={formData.role === 'donor'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === 'donor' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="text-center">
                        <div className="text-lg font-semibold">Donate Blood</div>
                        <div className="text-sm text-gray-600">Help save lives</div>
                      </div>
                    </div>
                  </label>
                  <label className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="recipient"
                      checked={formData.role === 'recipient'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === 'recipient' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="text-center">
                        <div className="text-lg font-semibold">Find Blood</div>
                        <div className="text-sm text-gray-600">Get help when needed</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                    Blood Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleInputChange}
                      className={`input-field ${errors.bloodType ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select blood type</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.bloodType && (
                      <p className="mt-1 text-sm text-red-600">{errors.bloodType}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+234 123 456 7890"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="mt-1">
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                    placeholder="City, State, Country"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {step === 'wallet' && (
            <div className="text-center space-y-6">
              <div>
                <WalletIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Connect Your Blockchain Wallet
                </h3>
                <p className="text-gray-600">
                  Connect your Internet Computer wallet to enable blockchain features like 
                  immutable donation records and NFT certificates.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Why connect a wallet?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Record donations permanently on blockchain</li>
                  <li>• Receive NFT certificates for each donation</li>
                  <li>• Verify donation authenticity</li>
                  <li>• Access advanced platform features</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleWalletConnect}
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isLoading ? 'Connecting...' : 'Connect Internet Identity'}
                </button>
                
                <button
                  onClick={handleSkipWallet}
                  className="w-full btn-outline"
                >
                  Skip for Now (Connect Later)
                </button>
              </div>

              <p className="text-xs text-gray-500">
                You can always connect your wallet later from your dashboard
              </p>
            </div>
          )}

          {step === 'blockchain' && (
            <div className="text-center space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Registering on Blockchain
                </h3>
                <p className="text-gray-600">
                  Creating your secure donor profile on the Internet Computer blockchain...
                </p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-primary-600 rounded-lg shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 transition-colors duration-200"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Register