import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  UserGroupIcon, 
  TrophyIcon,
  ChartBarIcon,
  CalendarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface ImpactVisualizationProps {
  stats: {
    totalDonations: number;
    livesImpacted: number;
    nftCertificates: number;
    totalVolume: number;
    streakDays: number;
  };
}

const ImpactVisualization: React.FC<ImpactVisualizationProps> = ({ stats }) => {
  const achievements = [
    {
      id: 'first_donation',
      title: 'First Drop',
      description: 'Made your first blood donation',
      icon: HeartIcon,
      unlocked: stats.totalDonations >= 1,
      color: 'bg-red-500'
    },
    {
      id: 'life_saver',
      title: 'Life Saver',
      description: 'Helped save 5 lives',
      icon: UserGroupIcon,
      unlocked: stats.livesImpacted >= 5,
      color: 'bg-green-500'
    },
    {
      id: 'regular_donor',
      title: 'Regular Donor',
      description: 'Made 5 donations',
      icon: CalendarIcon,
      unlocked: stats.totalDonations >= 5,
      color: 'bg-blue-500'
    },
    {
      id: 'nft_collector',
      title: 'NFT Collector',
      description: 'Earned 3 NFT certificates',
      icon: TrophyIcon,
      unlocked: stats.nftCertificates >= 3,
      color: 'bg-purple-500'
    },
    {
      id: 'hero',
      title: 'Hero',
      description: 'Helped save 15 lives',
      icon: GlobeAltIcon,
      unlocked: stats.livesImpacted >= 15,
      color: 'bg-yellow-500'
    }
  ];

  const impactMetrics = [
    {
      label: 'Lives Potentially Saved',
      value: stats.livesImpacted,
      description: 'Each donation can save up to 3 lives',
      icon: UserGroupIcon,
      color: 'text-green-600'
    },
    {
      label: 'Blood Volume Donated',
      value: `${stats.totalVolume}ml`,
      description: 'Total blood contributed to save lives',
      icon: HeartIcon,
      color: 'text-red-600'
    },
    {
      label: 'Donation Streak',
      value: `${stats.streakDays} days`,
      description: 'Consistent contribution to the community',
      icon: CalendarIcon,
      color: 'text-blue-600'
    },
    {
      label: 'NFT Certificates',
      value: stats.nftCertificates,
      description: 'Blockchain-verified donation records',
      icon: TrophyIcon,
      color: 'text-purple-600'
    }
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-8">
      {/* Impact Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Your Life-Saving Impact</h2>
          <p className="text-lg opacity-90">
            Through your generosity, you've made a real difference in the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.totalDonations}</div>
            <div className="text-sm opacity-90">Total Donations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.livesImpacted}</div>
            <div className="text-sm opacity-90">Lives Impacted</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.totalVolume}ml</div>
            <div className="text-sm opacity-90">Blood Donated</div>
          </div>
        </div>
      </motion.div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {impactMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg bg-gray-100 ${metric.color}`}>
                <metric.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{metric.label}</h3>
                <div className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</div>
                <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.unlocked
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  achievement.unlocked ? achievement.color : 'bg-gray-400'
                } text-white`}>
                  <achievement.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
              
              {achievement.unlocked && (
                <div className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Unlocked
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Progress Towards Next Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Towards Next Goals</h3>
        
        <div className="space-y-6">
          {/* Next Donation Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Next Donation Milestone (10 donations)
              </span>
              <span className="text-sm text-gray-600">
                {stats.totalDonations}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(stats.totalDonations, 10)}%` }}
              ></div>
            </div>
          </div>

          {/* Lives Saved Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Lives Saved Milestone (30 lives)
              </span>
              <span className="text-sm text-gray-600">
                {stats.livesImpacted}/30
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(stats.livesImpacted, 30)}%` }}
              ></div>
            </div>
          </div>

          {/* Volume Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Volume Milestone (5000ml)
              </span>
              <span className="text-sm text-gray-600">
                {stats.totalVolume}/5000ml
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(stats.totalVolume, 5000)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Social Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Impact</h3>
        <p className="text-gray-600 mb-6">
          Inspire others by sharing your life-saving achievements on social media.
        </p>
        
        <div className="flex space-x-4">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Share on Twitter
          </button>
          <button className="flex-1 bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition-colors">
            Share on Facebook
          </button>
          <button className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors">
            Share on LinkedIn
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ImpactVisualization;