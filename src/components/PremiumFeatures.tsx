import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  StarIcon, 
  CheckIcon, 
  CreditCardIcon,
  ShieldCheckIcon,
  BoltIcon,
  GlobeAltIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface PricingPlan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
  color: string
}

interface AddOnService {
  id: string
  name: string
  price: number
  description: string
  icon: any
  category: string
}

const PremiumFeatures: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const pricingPlans: PricingPlan[] = [
    {
      id: 'basic-plus',
      name: 'Basic Plus',
      price: billingPeriod === 'monthly' ? 9.99 : 99.99,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Enhanced features for regular donors',
      color: 'border-blue-200 bg-blue-50',
      features: [
        'Priority blood request notifications',
        'Advanced donation tracking',
        'Health insights dashboard',
        'Donation reminders',
        'Basic blockchain verification',
        'Email support'
      ]
    },
    {
      id: 'pro-donor',
      name: 'Pro Donor',
      price: billingPeriod === 'monthly' ? 19.99 : 199.99,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Professional tools for dedicated donors',
      popular: true,
      color: 'border-primary-200 bg-primary-50',
      features: [
        'AI-powered donor matching',
        'Emergency alert system',
        'Complete blockchain verification',
        'Advanced analytics',
        'Priority customer support',
        'Mobile app premium features',
        'Donation impact reports',
        'Multi-location tracking'
      ]
    },
    {
      id: 'healthcare-pro',
      name: 'Healthcare Pro',
      price: billingPeriod === 'monthly' ? 49.99 : 499.99,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Enterprise solution for healthcare organizations',
      color: 'border-purple-200 bg-purple-50',
      features: [
        'Multi-facility management',
        'API access and integrations',
        'Custom reporting tools',
        'Compliance monitoring',
        'Dedicated account manager',
        'White-label options',
        'Advanced security features',
        'Bulk user management',
        'Custom workflows'
      ]
    }
  ]

  const addOnServices: AddOnService[] = [
    {
      id: 'ai-matching',
      name: 'AI-Powered Matching',
      price: 4.99,
      description: 'Advanced algorithms for optimal donor-recipient matching',
      icon: BoltIcon,
      category: 'AI & Analytics'
    },
    {
      id: 'enhanced-security',
      name: 'Enhanced Security',
      price: 7.99,
      description: 'Multi-layer blockchain verification and fraud protection',
      icon: ShieldCheckIcon,
      category: 'Security'
    },
    {
      id: 'global-network',
      name: 'Global Network Access',
      price: 9.99,
      description: 'Access to international blood banks and donors',
      icon: GlobeAltIcon,
      category: 'Network'
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      price: 6.99,
      description: 'Detailed insights and predictive analytics',
      icon: ChartBarIcon,
      category: 'AI & Analytics'
    },
    {
      id: 'real-time-alerts',
      name: 'Real-time Alerts',
      price: 3.99,
      description: 'Instant notifications for critical blood requests',
      icon: BellIcon,
      category: 'Notifications'
    }
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    )
  }

  const calculateTotal = () => {
    const planPrice = pricingPlans.find(p => p.id === selectedPlan)?.price || 0
    const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOnServices.find(a => a.id === addOnId)
      return total + (addOn?.price || 0)
    }, 0)
    return planPrice + addOnTotal
  }

  const groupedAddOns = addOnServices.reduce((groups, addOn) => {
    const category = addOn.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(addOn)
    return groups
  }, {} as Record<string, AddOnService[]>)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Premium Features
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock advanced capabilities with our premium plans and add-on services. 
          Enhanced AI, blockchain security, and professional tools for serious donors and healthcare organizations.
        </p>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'yearly'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </motion.div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            className={`relative card p-8 cursor-pointer transition-all duration-300 ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-primary-500 transform scale-105' 
                : 'hover:shadow-lg'
            } ${plan.color}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <StarIcon className="h-4 w-4 mr-1" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600 ml-1">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                selectedPlan === plan.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add-on Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-12"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Add-on Services
        </h3>
        <p className="text-gray-600 text-center mb-8">
          Enhance your plan with specialized services tailored to your needs
        </p>

        {Object.entries(groupedAddOns).map(([category, addOns]) => (
          <div key={category} className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">{category}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className={`card p-6 cursor-pointer transition-all duration-300 ${
                    selectedAddOns.includes(addOn.id)
                      ? 'ring-2 ring-primary-500 bg-primary-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleAddOn(addOn.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-2 rounded-lg mr-3">
                        <addOn.icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{addOn.name}</h5>
                        <p className="text-sm text-gray-600">${addOn.price}/month</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAddOns.includes(addOn.id)
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedAddOns.includes(addOn.id) && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{addOn.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Summary and Checkout */}
      {(selectedPlan || selectedAddOns.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card p-8 bg-gray-50"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
          
          <div className="space-y-4 mb-6">
            {selectedPlan && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {pricingPlans.find(p => p.id === selectedPlan)?.name} Plan
                </span>
                <span className="font-semibold">
                  ${pricingPlans.find(p => p.id === selectedPlan)?.price}{pricingPlans.find(p => p.id === selectedPlan)?.period}
                </span>
              </div>
            )}
            
            {selectedAddOns.map(addOnId => {
              const addOn = addOnServices.find(a => a.id === addOnId)
              return addOn ? (
                <div key={addOnId} className="flex justify-between items-center">
                  <span className="text-gray-700">{addOn.name}</span>
                  <span className="font-semibold">${addOn.price}/month</span>
                </div>
              ) : null
            })}
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">${calculateTotal().toFixed(2)}/month</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Start Free Trial
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Contact Sales
            </button>
          </div>

          <p className="text-sm text-gray-600 text-center mt-4">
            30-day money-back guarantee • Cancel anytime • No setup fees
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default PremiumFeatures