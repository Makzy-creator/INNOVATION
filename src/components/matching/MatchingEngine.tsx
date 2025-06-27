import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  MapPinIcon, 
  ChartBarIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import AIMatchingService from '../../services/aiMatchingService';
import { getCompatibleDonorTypes, getCompatibleRecipientTypes, getBloodTypeDescription } from '../../utils/bloodTypeUtils';

interface MatchingEngineProps {
  mode?: 'donor' | 'recipient';
}

const MatchingEngine: React.FC<MatchingEngineProps> = ({ mode = 'donor' }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchStats, setMatchStats] = useState({
    averageMatchTime: 0,
    successRate: 0,
    averageDistance: 0,
    criticalRequestsMatched: 0
  });
  const [filters, setFilters] = useState({
    minCompatibility: 70,
    maxDistance: 50,
    sortBy: 'score'
  });

  useEffect(() => {
    if (user) {
      loadMatches();
      loadMatchingStatistics();
    }
  }, [user]);

  const loadMatches = async () => {
    try {
      const recommendations = await AIMatchingService.getMatchingRecommendations(
        user!.id,
        user!.bloodType || 'O+',
        user!.location || 'Unknown'
      );
      
      setMatches(recommendations);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMatchingStatistics = async () => {
    try {
      const stats = await AIMatchingService.getMatchingStatistics();
      setMatchStats(stats);
    } catch (error) {
      console.error('Failed to load matching statistics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...matches];
    
    // Filter by compatibility
    filtered = filtered.filter(match => match.compatibility * 100 >= filters.minCompatibility);
    
    // Filter by distance
    filtered = filtered.filter(match => match.distance <= filters.maxDistance);
    
    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return b.score - a.score;
        case 'compatibility':
          return b.compatibility - a.compatibility;
        case 'distance':
          return a.distance - b.distance;
        case 'urgency':
          return b.urgencyScore - a.urgencyScore;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredMatches = applyFilters();

  const getCompatibilityColor = (compatibility: number) => {
    const percent = compatibility * 100;
    if (percent >= 90) return 'text-green-600';
    if (percent >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDistanceLabel = (distance: number) => {
    if (distance < 1) return 'Less than 1 km';
    if (distance < 10) return `${distance.toFixed(1)} km`;
    return `${Math.round(distance)} km`;
  };

  const getCompatibleTypes = () => {
    if (!user?.bloodType) return [];
    
    return mode === 'donor'
      ? getCompatibleRecipientTypes(user.bloodType)
      : getCompatibleDonorTypes(user.bloodType);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading matching engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Blood Type Compatibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Blood Type Compatibility</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <ArrowsRightLeftIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {user?.bloodType || 'Unknown'} Blood Type
                </h4>
                <p className="text-sm text-gray-600">
                  {getBloodTypeDescription(user?.bloodType || '')}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">
                {mode === 'donor' ? 'You can donate to:' : 'You can receive from:'}
              </h5>
              <div className="flex flex-wrap gap-2">
                {getCompatibleTypes().map(type => (
                  <span key={type} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">AI-Powered Matching</h4>
            <p className="text-sm text-blue-800">
              Our AI matching engine considers multiple factors to find the best matches:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Blood type compatibility</li>
              <li>• Geographic proximity</li>
              <li>• Urgency level</li>
              <li>• Donor availability</li>
              <li>• Donation history</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Matching Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{matchStats.successRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Match Time</p>
              <p className="text-2xl font-bold text-gray-900">{matchStats.averageMatchTime}h</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <MapPinIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Distance</p>
              <p className="text-2xl font-bold text-gray-900">{matchStats.averageDistance}km</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Matched</p>
              <p className="text-2xl font-bold text-gray-900">{matchStats.criticalRequestsMatched}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center mb-4">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Match Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Compatibility: {filters.minCompatibility}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minCompatibility}
              onChange={(e) => setFilters(prev => ({ ...prev, minCompatibility: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Distance: {filters.maxDistance}km
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
              <option value="score">Overall Match Score</option>
              <option value="compatibility">Blood Compatibility</option>
              <option value="distance">Distance</option>
              <option value="urgency">Urgency</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Match Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          {mode === 'donor' ? 'Recommended Recipients' : 'Potential Donors'}
        </h3>
        
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <UserGroupIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {mode === 'donor' ? 'Recipient' : 'Donor'} #{index + 1}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{getDistanceLabel(match.distance)} away</span>
                        <span className={getCompatibilityColor(match.compatibility)}>
                          {Math.round(match.compatibility * 100)}% compatible
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">
                      {Math.round(match.score * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500">Compatibility</div>
                    <div className={`font-medium ${getCompatibilityColor(match.compatibility)}`}>
                      {Math.round(match.compatibility * 100)}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500">Distance</div>
                    <div className="font-medium text-gray-900">
                      {getDistanceLabel(match.distance)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500">Urgency</div>
                    <div className="font-medium text-gray-900">
                      {match.urgencyScore >= 0.75 ? 'High' : 
                       match.urgencyScore >= 0.5 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500">Availability</div>
                    <div className="font-medium text-gray-900">
                      {match.availabilityScore >= 0.8 ? 'Excellent' : 
                       match.availabilityScore >= 0.5 ? 'Good' : 'Limited'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button className="btn-primary text-sm">
                    {mode === 'donor' ? 'Offer to Donate' : 'Contact Donor'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new matches.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MatchingEngine;