import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import RequestForm from './RequestForm';
import RequestProgress from './RequestProgress';
import DonorMessaging from './DonorMessaging';
import DocumentVerification from './DocumentVerification';
import SupabaseService from '../../services/supabaseService';

interface BloodRequest {
  id: string;
  bloodType: string;
  amount: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  status: 'open' | 'matched' | 'fulfilled' | 'expired';
  createdAt: Date;
  matchedDonors: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

const RecipientPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'create' | 'progress' | 'messages' | 'documents'>('requests');
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserRequests();
  }, [user]);

  const loadUserRequests = async () => {
    if (!user) return;

    try {
      const transactions = await SupabaseService.getUserTransactions(user.id);
      const requestTransactions = transactions.filter(t => t.transaction_type === 'request');
      
      // Convert transactions to blood requests
      const bloodRequests: BloodRequest[] = requestTransactions.map(tx => ({
        id: tx.id,
        bloodType: tx.blood_type || tx.metadata?.bloodType || 'O+',
        amount: tx.metadata?.amount || 1,
        urgency: tx.metadata?.urgency || 'medium',
        location: tx.metadata?.location || 'Unknown',
        description: tx.metadata?.description || '',
        status: tx.status === 'confirmed' ? 'fulfilled' : 'open',
        createdAt: new Date(tx.created_at),
        matchedDonors: tx.metadata?.matchedDonors || [],
        verificationStatus: tx.metadata?.verificationStatus || 'pending'
      }));

      setRequests(bloodRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'matched': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const tabs = [
    { id: 'requests', label: 'My Requests', icon: ClockIcon },
    { id: 'create', label: 'Create Request', icon: PlusIcon },
    { id: 'progress', label: 'Track Progress', icon: CheckCircleIcon },
    { id: 'messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading portal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
      >
        <h1 className="text-2xl font-bold">Recipient Portal</h1>
        <p className="opacity-90">Manage your blood requests and connect with donors</p>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length > 0 ? (
              requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.bloodType} Blood Request
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>Amount: {request.amount} unit{request.amount > 1 ? 's' : ''}</div>
                        <div>Location: {request.location}</div>
                        <div>Created: {request.createdAt.toLocaleDateString()}</div>
                      </div>
                      
                      {request.description && (
                        <p className="text-gray-700 mb-3">{request.description}</p>
                      )}
                      
                      {request.matchedDonors.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            {request.matchedDonors.length} donor{request.matchedDonors.length > 1 ? 's' : ''} matched!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No blood requests yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first blood request to get help from donors in your area.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn-primary"
                >
                  Create Request
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <RequestForm onRequestCreated={loadUserRequests} />
        )}

        {activeTab === 'progress' && (
          <RequestProgress requests={requests} />
        )}

        {activeTab === 'messages' && (
          <DonorMessaging />
        )}

        {activeTab === 'documents' && (
          <DocumentVerification />
        )}
      </div>
    </div>
  );
};

export default RecipientPortal;