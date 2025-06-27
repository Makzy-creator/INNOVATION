import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  BeakerIcon,
  TruckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface RequestProgressProps {
  requests: any[];
}

const RequestProgress: React.FC<RequestProgressProps> = ({ requests }) => {
  const activeRequest = requests.find(r => r.status === 'open' || r.status === 'matched');
  
  if (!activeRequest) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No active requests
        </h3>
        <p className="text-gray-600">
          You don't have any active blood requests to track.
        </p>
      </div>
    );
  }

  // Define the steps in the blood request process
  const steps = [
    {
      id: 'request_created',
      title: 'Request Created',
      description: 'Your blood request has been submitted and verified',
      icon: CheckIcon,
      completed: true,
      date: activeRequest.createdAt.toLocaleDateString()
    },
    {
      id: 'donor_matching',
      title: 'Donor Matching',
      description: 'Finding compatible donors in your area',
      icon: UserIcon,
      completed: activeRequest.matchedDonors.length > 0,
      date: activeRequest.matchedDonors.length > 0 ? new Date().toLocaleDateString() : null
    },
    {
      id: 'donation_scheduled',
      title: 'Donation Scheduled',
      description: 'Donor has scheduled their donation appointment',
      icon: ClockIcon,
      completed: activeRequest.status === 'matched',
      date: activeRequest.status === 'matched' ? new Date().toLocaleDateString() : null
    },
    {
      id: 'blood_collected',
      title: 'Blood Collected',
      description: 'Donor has completed their blood donation',
      icon: BeakerIcon,
      completed: activeRequest.status === 'fulfilled',
      date: activeRequest.status === 'fulfilled' ? new Date().toLocaleDateString() : null
    },
    {
      id: 'delivery',
      title: 'Delivery',
      description: 'Blood is being transported to your location',
      icon: TruckIcon,
      completed: activeRequest.status === 'fulfilled',
      date: activeRequest.status === 'fulfilled' ? new Date().toLocaleDateString() : null
    },
    {
      id: 'completed',
      title: 'Completed',
      description: 'Blood has been delivered and transfusion can proceed',
      icon: HeartIcon,
      completed: activeRequest.status === 'fulfilled',
      date: activeRequest.status === 'fulfilled' ? new Date().toLocaleDateString() : null
    }
  ];

  // Find the current active step
  const activeStepIndex = steps.findIndex(step => !step.completed);
  const currentStep = activeStepIndex === -1 ? steps.length : activeStepIndex + 1;

  return (
    <div className="space-y-8">
      {/* Request Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Blood Type</div>
            <div className="text-xl font-bold text-primary-600">{activeRequest.bloodType}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Units Needed</div>
            <div className="text-xl font-bold text-gray-900">{activeRequest.amount}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Urgency</div>
            <div className={`text-xl font-bold ${
              activeRequest.urgency === 'critical' ? 'text-red-600' :
              activeRequest.urgency === 'high' ? 'text-orange-600' :
              activeRequest.urgency === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {activeRequest.urgency.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Location</div>
          <div className="text-gray-900">{activeRequest.location}</div>
        </div>
      </motion.div>

      {/* Progress Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Tracker</h3>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-start">
                <div className={`absolute left-8 top-8 bottom-0 w-0.5 ${
                  index === steps.length - 1 ? 'bg-transparent' : 
                  index < activeStepIndex ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
                
                <div className={`z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : index === activeStepIndex
                      ? 'bg-white border-primary-600 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                
                <div className="ml-6 pb-8">
                  <div className="flex items-center">
                    <h4 className={`font-semibold ${
                      step.completed || index === activeStepIndex ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    
                    {step.completed && (
                      <span className="ml-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    )}
                    
                    {index === activeStepIndex && (
                      <span className="ml-3 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mt-1 ${
                    step.completed || index === activeStepIndex ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                  
                  {step.date && (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.date}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Estimated Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Estimated Timeline</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Estimated Completion</h4>
              <p className="text-sm text-blue-800">
                {activeRequest.urgency === 'critical' 
                  ? 'Within 24 hours' 
                  : activeRequest.urgency === 'high'
                    ? 'Within 2-3 days'
                    : activeRequest.urgency === 'medium'
                      ? 'Within 1 week'
                      : 'Within 2 weeks'
                }
              </p>
            </div>
          </div>
        </div>
        
        {activeRequest.urgency === 'critical' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Critical Request</h4>
                <p className="text-sm text-red-800">
                  Your request has been flagged as critical. Our team is actively reaching out to 
                  compatible donors in your area. You should receive updates very soon.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RequestProgress;