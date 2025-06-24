import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  WalletIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { useICP } from '../contexts/ICPContext';
import toast from 'react-hot-toast';

interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onConnectionChange }) => {
  const { isConnected, principal, connectWallet, disconnectWallet, isLoading, canisterIds } = useICP();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success) {
      toast.success('🎉 Wallet connected! You can now use all blockchain features.');
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    toast.success('Wallet disconnected');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
  };

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Wallet Connected</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-green-700">{formatPrincipal(principal || '')}</p>
                {principal && (
                  <button
                    onClick={() => copyToClipboard(principal, 'Principal ID')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <ClipboardDocumentIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-green-700 hover:text-green-900 font-medium"
            >
              <InformationCircleIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDisconnect}
              className="text-sm text-green-700 hover:text-green-900 font-medium"
            >
              Disconnect
            </button>
          </div>
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-green-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium text-green-900 mb-1">Blockchain Status</p>
                <p className="text-green-700">✅ Connected to Internet Computer</p>
                <p className="text-green-700">✅ Smart contracts accessible</p>
                <p className="text-green-700">✅ NFT minting enabled</p>
              </div>
              <div>
                <p className="font-medium text-green-900 mb-1">Canister IDs</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Blood Donation:</span>
                    <button
                      onClick={() => copyToClipboard(canisterIds.bloodDonation, 'Blood Donation Canister ID')}
                      className="text-green-600 hover:text-green-800 font-mono text-xs"
                    >
                      {canisterIds.bloodDonation.slice(0, 8)}...
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">NFT System:</span>
                    <button
                      onClick={() => copyToClipboard(canisterIds.nft, 'NFT Canister ID')}
                      className="text-green-600 hover:text-green-800 font-mono text-xs"
                    >
                      {canisterIds.nft.slice(0, 8)}...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
    >
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-900">
            Connect Your Internet Computer Wallet
          </h3>
          <p className="text-sm text-yellow-700 mt-1">
            Connect your wallet to record donations on the blockchain, mint NFT certificates, 
            and access all platform features.
          </p>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-xs text-yellow-700">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              <span>Immutable donation records</span>
            </div>
            <div className="flex items-center text-xs text-yellow-700">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              <span>Automatic NFT certificate minting</span>
            </div>
            <div className="flex items-center text-xs text-yellow-700">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              <span>Transparent blockchain verification</span>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <WalletIcon className="h-4 w-4" />
                  <span>Connect Internet Identity</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mt-3 text-xs text-yellow-600">
            <p>
              <strong>New to Internet Computer?</strong> Internet Identity is a secure, 
              passwordless authentication system. No extensions needed!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletConnection;