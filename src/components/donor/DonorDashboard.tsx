import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  MapPinIcon, 
  ClockIcon,
  TrophyIcon,
  GiftIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import RequestDiscovery from './RequestDiscovery';
import TransactionTracker from './TransactionTracker';
import ImpactVisualization from './ImpactVisualization';
import DonationOptions from './DonationOptions';
import SupabaseService from '../../services/supabaseService';

interface DonorStats {
  totalDonations: number;
  livesImpacted: number;
  nftCertificates: number;
  nextEligibleDate: Date | null;
  totalVolume: number;
  streakDays: number;
}

const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DonorStats>({
    totalDonations: 0,
    livesImpacted: 0,
    nftCertificates: 0,
    nextEligibleDate: null,
    totalVolume: 0,
    streakDays: 0
  });
  const [activeTab, setActiveTab] = useState<'discover' | 'track' | 'impact' | 'donate'>('discover');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDonorStats();
  }, [user]);

  const loadDonorStats = async () => {
    if (!user) return;
    
    try {
      const transactions = await SupabaseService.getUserTransactions(user.id);
      const donations = transactions.filter(t => t.transaction_type === 'donation' && t.status === 'confirmed');
      
      // Calculate stats
      const totalDonations = donations.length;
      const totalVolume = donations.reduce((sum, d) => sum + (d.metadata?.amount || 450), 0);
      const livesImpacted = totalDonations * 3; // Each donation saves ~3 lives
      const nftCertificates = donations.filter(d => d.metadata?.nft_minted).length;
      
      // Calculate next eligible date (56 days after last donation)
      const lastDonation = donations.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      const nextEligibleDate = lastDonation 
        ? new Date(new Date(lastDonation.created_at).getTime() + (56 * 24 * 60 * 60 * 1000))
        : null;

      // Calculate streak (simplified)
      const streakDays = totalDonations * 7; // Rough estimate

      setStats({
        totalDonations,
        livesImpacted,
        nftCertificates,
        nextEligibleDate,
        totalVolume,
        streakDays
      });
    } catch (error) {
      console.error('Failed to load donor stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Donations',
      value: stats.totalDonations,
      icon: HeartIcon,
      color: 'bg-red-500',
      change: '+2 this month'
    },
    {
      title: 'Lives Impacted',
      value: stats.livesImpacted,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      change: `${stats.totalVolume}ml donated`
    },
    {
      title: 'NFT Certificates',
      value: stats.nftCertificates,
      icon: GiftIcon,
      color: 'bg-purple-500',
      change: 'Blockchain verified'
    },
    {
      title: 'Donation Streak',
      value: `${stats.streakDays} days`,
      icon: TrophyIcon,
      color: 'bg-yellow-500',
      change: 'Keep it up!'
    }
  ];

  const tabs = [
    { id: 'discover', label: 'Discover Requests', icon: MapPinIcon },
    { id: 'track', label: 'Track Donations', icon: ChartBarIcon },
    { id: 'impact', label: 'View Impact', icon: TrophyIcon },
    { id: 'donate', label: 'Donation Options', icon: HeartIcon }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="opacity-90">Ready to save more lives today?</p>
          </div>
          <div className="text-right">
            {stats.nextEligibleDate && (
              <div className="bg-white/20 rounded-lg p-3">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Next eligible:
                </div>
                <div className="font-semibold">
                  {stats.nextEligibleDate > new Date() 
                    ? stats.nextEligibleDate.toLocaleDateString()
                    : 'Available now!'
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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
        {activeTab === 'discover' && <RequestDiscovery />}
        {activeTab === 'track' && <TransactionTracker />}
        {activeTab === 'impact' && <ImpactVisualization stats={stats} />}
        {activeTab === 'donate' && <DonationOptions />}
      </div>
    </div>
  );
};

export default DonorDashboard;