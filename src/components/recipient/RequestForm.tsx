import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import SupabaseService from '../../services/supabaseService';
import toast from 'react-hot-toast';

interface RequestFormProps {
  onRequestCreated: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ onRequestCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bloodType: '',
    amount: 1,
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    location: '',
    hospital: '',
    description: '',
    contactInfo: '',
    medicalCondition: '',
    doctorName: '',
    expectedDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'low', label: 'Low', description: 'Planned procedure, flexible timing' },
    { value: 'medium', label: 'Medium', description: 'Scheduled surgery within weeks' },
    { value: 'high', label: 'High', description: 'Urgent medical need within days' },
    { value: 'critical', label: 'Critical', description: 'Emergency, immediate need' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Record the blood request
      await SupabaseService.recordTransaction({
        user_id: user.id,
        transaction_hash: `blood_request_${Date.now()}`,
        transaction_type: 'request',
        blood_type: formData.bloodType,
        status: 'pending',
        metadata: {
          type: 'blood_request',
          ...formData,
          requestedAt: new Date().toISOString()
        }
      });

      toast.success('Blood request created successfully! Donors will be notified.');
      onRequestCreated();
      
      // Reset form
      setFormData({
        bloodType: '',
        amount: 1,
        urgency: 'medium',
        location: '',
        hospital: '',
        description: '',
        contactInfo: '',
        medicalCondition: '',
        doctorName: '',
        expectedDate: ''
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Failed to create blood request:', error);
      toast.error('Failed to create blood request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'border-primary-600 bg-primary-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 ${
                  currentStep > step ? 'bg-primary-600' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-sm text-gray-600">
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Basic Information' :
              currentStep === 2 ? 'Medical Details' :
              'Review & Submit'
            }
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 space-y-6"
          >
            <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Type Needed *
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units Needed *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Urgency Level *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {urgencyLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      formData.urgency === level.value 
                        ? getUrgencyColor(level.value)
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level.value}
                      checked={formData.urgency === level.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      {level.value === 'critical' && (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{level.label}</div>
                        <div className="text-sm text-gray-600">{level.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Medical Facility *
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Name of hospital or clinic"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="City, State"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
                disabled={!formData.bloodType || !formData.hospital || !formData.location}
              >
                Next Step
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Medical Details */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 space-y-6"
          >
            <h3 className="text-xl font-bold text-gray-900">Medical Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Condition/Reason *
              </label>
              <textarea
                name="medicalCondition"
                value={formData.medicalCondition}
                onChange={handleInputChange}
                className="input-field"
                rows={3}
                placeholder="Brief description of medical condition requiring blood transfusion"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attending Doctor *
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Date
                </label>
                <input
                  type="date"
                  name="expectedDate"
                  value={formData.expectedDate}
                  onChange={handleInputChange}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                rows={4}
                placeholder="Any additional information that might help donors understand your situation..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information
              </label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Phone number or email for urgent contact"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="btn-outline"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
                disabled={!formData.medicalCondition || !formData.doctorName}
              >
                Review Request
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 space-y-6"
          >
            <h3 className="text-xl font-bold text-gray-900">Review Your Request</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Blood Type:</span>
                  <span className="ml-2 text-gray-900">{formData.bloodType}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Units Needed:</span>
                  <span className="ml-2 text-gray-900">{formData.amount}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Urgency:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    formData.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                    formData.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                    formData.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {formData.urgency.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Hospital:</span>
                  <span className="ml-2 text-gray-900">{formData.hospital}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="ml-2 text-gray-900">{formData.location}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Doctor:</span>
                  <span className="ml-2 text-gray-900">{formData.doctorName}</span>
                </div>
              </div>
              
              {formData.medicalCondition && (
                <div>
                  <span className="font-medium text-gray-700">Medical Condition:</span>
                  <p className="mt-1 text-gray-900">{formData.medicalCondition}</p>
                </div>
              )}
              
              {formData.description && (
                <div>
                  <span className="font-medium text-gray-700">Additional Details:</span>
                  <p className="mt-1 text-gray-900">{formData.description}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">What happens next?</h4>
                  <ul className="text-sm text-blue-800 mt-1 space-y-1">
                    <li>• Your request will be posted to the platform</li>
                    <li>• Compatible donors in your area will be notified</li>
                    <li>• You'll receive updates when donors respond</li>
                    <li>• All communications are secure and verified</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="btn-outline"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Request...' : 'Submit Request'}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default RequestForm;