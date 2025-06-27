import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  GiftIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import SupabaseService from '../../services/supabaseService';

interface Transaction {
  id: string;
  type: 'donation' | 'offer' | 'nft_mint';
  status: 'pending' | 'confirmed' | 'failed';
  amount?: number;
  bloodType?: string;
  recipient?: string;
  location?: string;
  txHash?: string;
  nftTokenId?: number;
  createdAt: Date;
  metadata: any;
}

const TransactionTracker: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const txHistory = await SupabaseService.getUserTransactions(user.id);
      
      const formattedTransactions: Transaction[] = txHistory.map(tx => ({
        id: tx.id,
        type: tx.transaction_type as any,
        status: tx.status,
        amount: tx.metadata?.amount,
        bloodType: tx.blood_type || tx.metadata?.bloodType,
        recipient: tx.metadata?.recipient,
        location: tx.metadata?.location,
        txHash: tx.transaction_hash,
        nftTokenId: tx.metadata?.nftTokenId,
        createdAt: new Date(tx.created_at),
        metadata: tx.metadata
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <HeartIcon className="h-5 w-5 text-red-600" />;
      case 'nft_mint':
        return <GiftIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <HeartIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'donation': return 'Blood Donation';
      case 'offer': return 'Help Offer';
      case 'nft_mint': return 'NFT Certificate';
      default: return type;
    }
  };

  const openBlockchainExplorer = (txHash: string) => {
    const explorerUrl = `https://polygonscan.com/tx/${txHash}`;
    window.open(explorerUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'failed', label: 'Failed' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  {getTypeIcon(transaction.type)}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {getTypeLabel(transaction.type)}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{transaction.createdAt.toLocaleDateString()}</span>
                    {transaction.bloodType && (
                      <span>Blood Type: {transaction.bloodType}</span>
                    )}
                    {transaction.amount && (
                      <span>Amount: {transaction.amount}ml</span>
                    )}
                  </div>
                  {transaction.location && (
                    <p className="text-sm text-gray-600 mt-1">
                      Location: {transaction.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusIcon(transaction.status)}
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
                
                {transaction.txHash && (
                  <button
                    onClick={() => openBlockchainExplorer(transaction.txHash!)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="View on blockchain explorer"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Additional Details */}
            {transaction.status === 'confirmed' && transaction.type === 'donation' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Transaction Hash:</span>
                    <p className="text-gray-600 font-mono text-xs break-all">
                      {transaction.txHash}
                    </p>
                  </div>
                  
                  {transaction.nftTokenId && (
                    <div>
                      <span className="font-medium text-gray-700">NFT Certificate:</span>
                      <p className="text-purple-600">Token #{transaction.nftTokenId}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium text-gray-700">Impact:</span>
                    <p className="text-green-600">~3 lives potentially saved</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Status Details */}
            {transaction.status === 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>
                    {transaction.type === 'donation' 
                      ? 'Donation is being processed and verified...'
                      : 'Transaction is being confirmed on the blockchain...'
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Failed Status Details */}
            {transaction.status === 'failed' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  <span>
                    Transaction failed. Please try again or contact support if the issue persists.
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Your donation history will appear here once you start helping others.'
              : `No ${filter} transactions found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionTracker;