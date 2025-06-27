import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  MapPinIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import MatchingEngine from '../components/matching/MatchingEngine';
import MatchingVisualizer from '../components/matching/MatchingVisualizer';

const MatchingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'engine' | 'visualizer' | 'settings'>('engine');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to access the matching dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">AI Matching Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Find optimal matches based on blood type, location, and other factors
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 max-w-3xl"
        >
          {[
            { key: 'engine', label: 'Matching Engine', icon: UserGroupIcon },
            { key: 'visualizer', label: 'Compatibility Visualizer', icon: ArrowsRightLeftIcon },
            { key: 'settings', label: 'Matching Settings', icon: Cog6ToothIcon }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                activeTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <div>
          {activeTab === 'engine' && (
            <MatchingEngine mode={user.role as 'donor' | 'recipient'} />
          )}
          
          {activeTab === 'visualizer' && (
            <MatchingVisualizer />
          )}
          
          {activeTab === 'settings' && (
            <MatchingSettings />
          )}
        </div>
      </div>
    </div>
  );
};

// Matching Settings Component
const MatchingSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    maxDistance: 50,
    prioritizeUrgency: true,
    considerDonorHistory: true,
    autoNotify: true,
    matchThreshold: 70,
    refreshInterval: 'daily'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to Supabase
    alert('Settings saved successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Matching Preferences</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Match Distance: {settings.maxDistance}km
            </label>
            <input
              type="range"
              name="maxDistance"
              min="5"
              max="100"
              value={settings.maxDistance}
              onChange={handleChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum distance to consider for potential matches
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Match Score Threshold: {settings.matchThreshold}%
            </label>
            <input
              type="range"
              name="matchThreshold"
              min="0"
              max="100"
              value={settings.matchThreshold}
              onChange={handleChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only show matches above this score threshold
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="prioritizeUrgency"
                  checked={settings.prioritizeUrgency}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Prioritize urgent requests</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Give higher priority to critical and high urgency requests
              </p>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="considerDonorHistory"
                  checked={settings.considerDonorHistory}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Consider donation history</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Factor in previous donation frequency and reliability
              </p>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="autoNotify"
                  checked={settings.autoNotify}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Auto-notify about matches</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Receive notifications when new matches are found
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Refresh Interval
              </label>
              <select
                name="refreshInterval"
                value={settings.refreshInterval}
                onChange={handleChange}
                className="input-field"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How often to refresh your matches
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Preferences
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">AI Matching Engine</h3>
        <p className="text-gray-600 mb-6">
          Our AI matching engine uses TensorFlow.js to analyze multiple factors and find optimal matches between donors and recipients.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <ChartBarIcon className="h-5 w-5 text-primary-600" />
              <h4 className="font-medium text-gray-900">Scoring Algorithm</h4>
            </div>
            <p className="text-sm text-gray-600">
              Uses machine learning to score potential matches based on multiple factors including blood compatibility, location, and urgency.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <MapPinIcon className="h-5 w-5 text-primary-600" />
              <h4 className="font-medium text-gray-900">Geographic Processing</h4>
            </div>
            <p className="text-sm text-gray-600">
              Analyzes location data to find nearby matches, reducing transportation time and increasing donation efficiency.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <UserGroupIcon className="h-5 w-5 text-primary-600" />
              <h4 className="font-medium text-gray-900">Real-time Recommendations</h4>
            </div>
            <p className="text-sm text-gray-600">
              Continuously updates match recommendations as new donors and recipients join the platform.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchingDashboard;