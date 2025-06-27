import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowsRightLeftIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import AIMatchingService from '../../services/aiMatchingService';
import { BLOOD_COMPATIBILITY_MATRIX } from '../../utils/bloodTypeUtils';

interface MatchingVisualizerProps {
  donorBloodType?: string;
  recipientBloodType?: string;
  showControls?: boolean;
}

const MatchingVisualizer: React.FC<MatchingVisualizerProps> = ({ 
  donorBloodType: initialDonorType, 
  recipientBloodType: initialRecipientType,
  showControls = true
}) => {
  const { user } = useAuth();
  const [donorBloodType, setDonorBloodType] = useState(initialDonorType || user?.bloodType || 'O+');
  const [recipientBloodType, setRecipientBloodType] = useState(initialRecipientType || 'A+');
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    calculateCompatibility();
  }, [donorBloodType, recipientBloodType]);

  useEffect(() => {
    if (canvasRef.current) {
      drawVisualization();
    }
  }, [donorBloodType, recipientBloodType, compatibilityScore]);

  const calculateCompatibility = async () => {
    setIsLoading(true);
    try {
      const score = await AIMatchingService.getCompatibilityScore(donorBloodType, recipientBloodType);
      setCompatibilityScore(score);
    } catch (error) {
      console.error('Failed to calculate compatibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    // Draw donor circle
    ctx.beginPath();
    ctx.arc(centerX - radius / 2, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(220, 38, 38, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw recipient circle
    ctx.beginPath();
    ctx.arc(centerX + radius / 2, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw intersection based on compatibility
    if (compatibilityScore > 0) {
      // Draw intersection
      const intersectionRadius = radius * 0.8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, intersectionRadius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(22, 163, 74, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(22, 163, 74, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw check mark in intersection
      ctx.beginPath();
      ctx.moveTo(centerX - intersectionRadius / 3, centerY);
      ctx.lineTo(centerX - intersectionRadius / 10, centerY + intersectionRadius / 3);
      ctx.lineTo(centerX + intersectionRadius / 3, centerY - intersectionRadius / 3);
      ctx.strokeStyle = 'rgba(22, 163, 74, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // Draw X mark
      ctx.beginPath();
      ctx.moveTo(centerX - radius / 3, centerY - radius / 3);
      ctx.lineTo(centerX + radius / 3, centerY + radius / 3);
      ctx.moveTo(centerX + radius / 3, centerY - radius / 3);
      ctx.lineTo(centerX - radius / 3, centerY + radius / 3);
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Add blood type labels
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Donor label
    ctx.fillStyle = 'rgba(220, 38, 38, 1)';
    ctx.fillText(donorBloodType, centerX - radius / 2, centerY);
    ctx.font = '14px Arial';
    ctx.fillText('Donor', centerX - radius / 2, centerY - radius - 20);
    
    // Recipient label
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'rgba(2, 132, 199, 1)';
    ctx.fillText(recipientBloodType, centerX + radius / 2, centerY);
    ctx.font = '14px Arial';
    ctx.fillText('Recipient', centerX + radius / 2, centerY - radius - 20);
    
    // Compatibility label
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = compatibilityScore > 0 ? 'rgba(22, 163, 74, 1)' : 'rgba(220, 38, 38, 1)';
    ctx.fillText(
      compatibilityScore > 0 ? 'Compatible' : 'Not Compatible',
      centerX,
      centerY + radius + 30
    );
  };

  const getCompatibilityColor = () => {
    if (isLoading) return 'text-gray-400';
    return compatibilityScore > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Blood Type Compatibility Visualization
        </h3>
        
        <div className="flex justify-center mb-6">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={300} 
            className="border border-gray-200 rounded-lg"
          />
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            <span className="text-red-600">{donorBloodType}</span>
            <span className="mx-2">→</span>
            <span className="text-blue-600">{recipientBloodType}</span>
          </div>
          
          <div className={`text-xl font-bold ${getCompatibilityColor()}`}>
            {isLoading ? 'Calculating...' : compatibilityScore > 0 ? 'Compatible' : 'Not Compatible'}
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <ArrowsRightLeftIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Adjust Blood Types</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donor Blood Type
              </label>
              <select
                value={donorBloodType}
                onChange={(e) => setDonorBloodType(e.target.value)}
                className="input-field"
              >
                {bloodTypes.map(type => (
                  <option key={`donor-${type}`} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Blood Type
              </label>
              <select
                value={recipientBloodType}
                onChange={(e) => setRecipientBloodType(e.target.value)}
                className="input-field"
              >
                {bloodTypes.map(type => (
                  <option key={`recipient-${type}`} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Compatibility Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Blood Type Compatibility Matrix</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient ↓ / Donor →
                </th>
                {bloodTypes.map(type => (
                  <th key={type} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bloodTypes.map(recipientType => (
                <tr key={recipientType}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {recipientType}
                  </td>
                  {bloodTypes.map(donorType => (
                    <td key={`${recipientType}-${donorType}`} className="px-6 py-4 whitespace-nowrap text-center">
                      {BLOOD_COMPATIBILITY_MATRIX[recipientType]?.[donorType] ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="h-5 w-5 bg-red-100 rounded-full mx-auto"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <UserGroupIcon className="h-6 w-6 text-primary-600" />
            <h4 className="font-semibold text-gray-900">Universal Donor</h4>
          </div>
          <p className="text-gray-600">
            O- blood type is the universal donor and can donate to any recipient, making it the most valuable for emergency situations.
          </p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MapPinIcon className="h-6 w-6 text-secondary-600" />
            <h4 className="font-semibold text-gray-900">Geographic Matching</h4>
          </div>
          <p className="text-gray-600">
            Our AI prioritizes donors within close proximity to reduce transportation time, especially for critical requests.
          </p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ChartBarIcon className="h-6 w-6 text-green-600" />
            <h4 className="font-semibold text-gray-900">Matching Score</h4>
          </div>
          <p className="text-gray-600">
            The overall matching score considers blood compatibility, distance, urgency, and donor availability for optimal pairing.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchingVisualizer;