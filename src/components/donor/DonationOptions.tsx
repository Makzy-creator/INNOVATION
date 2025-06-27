import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  CalendarIcon, 
  GiftIcon,
  CreditCardIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import SupabaseService from '../../services/supabaseService';
import toast from 'react-hot-toast';

interface DonationOption {
  id: string;
  type: 'one-time' | 'recurring' | 'gift-match';
  title: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
}

const DonationOptions: React.FC = () => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [donationForm, setDonationForm] = useState({
    type: 'one-time',
    amount: 450,
    frequency: 'monthly',
    location: '',
    preferredDate: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const donationOptions: DonationOption[] = [
    {
      id: 'one-time',
      type: 'one-time',
      title: 'One-Time Donation',
      description: 'Make a single blood donation when you\'re available',
      icon: HeartIcon,
      color: 'bg-red-500',
      features: [
        'Flexible scheduling',
        'Immediate impact',
        'NFT certificate',
        'No commitment required'
      ]
    },
    {
      id: 'recurring',
      type: 'recurring',
      title: 'Recurring Donations',
      description: 'Set up regular donations to maximize your impact',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      features: [
        'Automated scheduling',
        'Maximum life-saving impact',
        'Priority NFT rewards',
        'Streak bonuses',
        'Reminder notifications'
      ]
    },
    {
      id: 'gift-match',
      type: 'gift-match',
      title: 'Gift Matching',
      description: 'Donate in honor of someone or match their donation',
      icon: GiftIcon,
      color: 'bg-purple-500',
      features: [
        'Honor someone special',
        'Shared NFT certificates',
        'Social impact multiplier',
        'Gift notifications'
      ]
    }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setDonationForm(prev => ({ 
      ...prev, 
      type: donationOptions.find(o => o.id === optionId)?.type || 'one-time' 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Record the donation intent
      await SupabaseService.recordTransaction({
        user_id: user.id,
        transaction_hash: `donation_intent_${Date.now()}`,
        transaction_type: 'donation',
        status: 'pending',
        metadata: {
          type: 'donation_intent',
          donationForm,
          scheduledAt: new Date().toISOString()
        }
      });

      toast.success('Donation scheduled! You will receive confirmation details shortly.');
      
      // Reset form
      setSelectedOption('');
      setDonationForm({
        type: 'one-time',
        amount: 450,
        frequency: 'monthly',
        location: '',
        preferredDate: '',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to schedule donation:', error);
      toast.error('Failed to schedule donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDonationForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Donation Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {donationOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card p-6 cursor-pointer transition-all ${
              selectedOption === option.id
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleOptionSelect(option.id)}
          >
            <div className="text-center">
              <div className={`${option.color} text-white p-4 rounded-full w-fit mx-auto mb-4`}>
                <option.icon className="h-8 w-8" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {option.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {option.description}
              </p>
              
              <ul className="text-sm text-gray-600 space-y-1">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center justify-center">
                    <SparklesIcon className="h-3 w-3 text-primary-500 mr-1" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Donation Form */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Schedule Your {donationOptions.find(o => o.id === selectedOption)?.title}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount (ml)
                </label>
                <select
                  name="amount"
                  value={donationForm.amount}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value={350}>350ml (Minimum)</option>
                  <option value={450}>450ml (Standard)</option>
                  <option value={500}>500ml (Maximum)</option>
                </select>
              </div>

              {donationForm.type === 'recurring' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={donationForm.frequency}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="monthly">Every 2 months (Recommended)</option>
                    <option value="quarterly">Every 3 months</option>
                    <option value="biannual">Every 6 months</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={donationForm.location}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Hospital or blood bank name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={donationForm.preferredDate}
                  onChange={handleInputChange}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={donationForm.notes}
                onChange={handleInputChange}
                className="input-field"
                rows={3}
                placeholder="Any special requirements or notes..."
              />
            </div>

            {/* NFT Reward Preview */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <GiftIcon className="h-6 w-6 text-purple-600" />
                <div>
                  <h4 className="font-medium text-purple-900">NFT Certificate Reward</h4>
                  <p className="text-sm text-purple-700">
                    You'll receive a blockchain-verified NFT certificate for this donation, 
                    proving your life-saving contribution forever.
                  </p>
                </div>
              </div>
            </div>

            {/* Gift Matching Options */}
            {donationForm.type === 'gift-match' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Gift Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="radio" name="giftType" value="honor" className="mr-2" />
                    <span className="text-sm text-blue-800">Donate in honor of someone</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="giftType" value="match" className="mr-2" />
                    <span className="text-sm text-blue-800">Match someone's donation</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Honoree name or donation ID to match"
                    className="input-field mt-2"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setSelectedOption('')}
                className="flex-1 btn-outline"
              >
                Back to Options
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Donation'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <UserGroupIcon className="h-6 w-6 text-green-600" />
            <h4 className="font-semibold text-gray-900">Donation Impact</h4>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• One donation can save up to 3 lives</li>
            <li>• Your blood can help cancer patients, accident victims, and surgical patients</li>
            <li>• Regular donations ensure steady blood supply for emergencies</li>
            <li>• Each donation is tracked on blockchain for transparency</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <CreditCardIcon className="h-6 w-6 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Rewards & Benefits</h4>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Unique NFT certificate for each donation</li>
            <li>• Achievement badges and milestones</li>
            <li>• Priority access to premium features</li>
            <li>• Social recognition and impact sharing</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default DonationOptions;