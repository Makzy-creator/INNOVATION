import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  FunnelIcon,
  HeartIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import SupabaseService from '../../services/supabaseService';
import toast from 'react-hot-toast';

interface BloodRequest {
  id: string;
  recipientName: string;
  bloodType: string;
  amount: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  distance: number;
  description: string;
  hospital: string;
  requestedAt: Date;
  compatibility: number;
}

const RequestDiscovery: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    urgency: '',
    bloodType: '',
    maxDistance: 50,
    sortBy: 'urgency'
  });

  useEffect(() => {
    loadBloodRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters]);

  const loadBloodRequests = async () => {
    try {
      // In a real app, this would fetch from smart contracts via Supabase
      // For now, we'll simulate with mock data
      const mockRequests: BloodRequest[] = [
        {
          id: '1',
          recipientName: 'Sarah Johnson',
          bloodType: 'O-',
          amount: 2,
          urgency: 'critical',
          location: 'General Hospital, Downtown',
          distance: 2.3,
          description: 'Emergency surgery patient needs immediate blood transfusion',
          hospital: 'General Hospital',
          requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          compatibility: 100
        },
        {
          id: '2',
          recipientName: 'Michael Chen',
          bloodType: 'A+',
          amount: 1,
          urgency: 'high',
          location: 'City Medical Center',
          distance: 5.7,
          description: 'Cancer treatment requires blood support',
          hospital: 'City Medical Center',
          requestedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          compatibility: 85
        },
        {
          id: '3',
          recipientName: 'Emma Davis',
          bloodType: 'B+',
          amount: 3,
          urgency: 'medium',
          location: 'Regional Medical',
          distance: 12.1,
          description: 'Scheduled surgery preparation',
          hospital: 'Regional Medical',
          requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          compatibility: 70
        }
      ];

      setRequests(mockRequests);
    } catch (error) {
      console.error('Failed to load blood requests:', error);
      toast.error('Failed to load blood requests');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Filter by urgency
    if (filters.urgency) {
      filtered = filtered.filter(r => r.urgency === filters.urgency);
    }

    // Filter by blood type
    if (filters.bloodType) {
      filtered = filtered.filter(r => r.bloodType === filters.bloodType);
    }

    // Filter by distance
    filtered = filtered.filter(r => r.distance <= filters.maxDistance);

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        case 'distance':
          return a.distance - b.distance;
        case 'compatibility':
          return b.compatibility - a.compatibility;
        case 'time':
          return b.requestedAt.getTime() - a.requestedAt.getTime();
        default:
          return 0;
      }
    });

    setFilteredRequests(filtered);
  };

  const handleOfferHelp = async (requestId: string) => {
    try {
      // Record the offer in transaction history
      await SupabaseService.recordTransaction({
        user_id: user!.id,
        transaction_hash: `offer_${requestId}_${Date.now()}`,
        transaction_type: 'donation',
        status: 'pending',
        metadata: {
          type: 'blood_offer',
          requestId,
          offeredAt: new Date().toISOString()
        }
      });

      toast.success('Offer submitted! The recipient will be notified.');
    } catch (error) {
      console.error('Failed to submit offer:', error);
      toast.error('Failed to submit offer');
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

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Requests</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency
            </label>
            <select
              value={filters.urgency}
              onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
              className="input-field"
            >
              <option value="">All Urgencies</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Type
            </label>
            <select
              value={filters.bloodType}
              onChange={(e) => setFilters(prev => ({ ...prev, bloodType: e.target.value }))}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Distance: {filters.maxDistance}km
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={filters.maxDistance}
              onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="input-field"
            >
              <option value="urgency">Urgency</option>
              <option value="distance">Distance</option>
              <option value="compatibility">Compatibility</option>
              <option value="time">Time Posted</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Request Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-3 rounded-full">
                  <HeartIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{request.recipientName}</h4>
                  <p className="text-sm text-gray-600">{request.hospital}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(request.urgency)}`}>
                  {request.urgency.toUpperCase()}
                </span>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">{request.bloodType}</div>
                  <div className="text-sm text-gray-600">{request.amount} unit{request.amount > 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {request.location} • {request.distance}km away
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-2" />
                Posted {getTimeAgo(request.requestedAt)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon className="h-4 w-4 mr-2" />
                {request.compatibility}% compatibility with your profile
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
              {request.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {request.urgency === 'critical' && (
                  <div className="flex items-center text-red-600 text-xs">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    URGENT
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleOfferHelp(request.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  request.urgency === 'critical'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                Offer to Help
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No requests match your filters
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more blood requests in your area.
          </p>
        </div>
      )}
    </div>
  );
};

export default RequestDiscovery;