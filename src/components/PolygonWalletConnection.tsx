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
import { usePolygon } from '../contexts/PolygonContext';
import toast from 'react-hot-toast';

interface PolygonWalletConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

const PolygonWalletConnection: React.FC<PolygonWalletConnectionProps> = ({ onConnectionChange }) => {
  const { isConnected, userAddress, connectWallet, disconnectWallet, isLoading, contractAddresses } = usePolygon();
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

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openPolygonscan = () => {
    const baseUrl = contractAddresses.chainId === 80001 
      ? 'https://mumbai.polygonscan.com' 
      : 'https://polygonscan.com';
    window.open(`${baseUrl}/address/${userAddress}`, '_blank');
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
              <p className="text-sm font-medium text-green-900">MetaMask Connected</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-green-700">{formatAddress(userAddress || '')}</p>
                {userAddress && (
                  <button
                    onClick={() => copyToClipboard(userAddress, 'Wallet Address')}
                    className="text-green-600 hover:text-green-800"
                  >
                    <ClipboardDocumentIcon className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={openPolygonscan}
                  className="text-xs text-green-600 hover:text-green-800 underline"
                >
                  View on Polygonscan
                </button>
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
                <p className="text-green-700">✅ Connected to Polygon {contractAddresses.chainId === 80001 ? 'Mumbai' : 'Mainnet'}</p>
                <p className="text-green-700">✅ Smart contracts accessible</p>
                <p className="text-green-700">✅ NFT minting enabled</p>
                <p className="text-green-700">✅ Gas fees: ~$0.001 per transaction</p>
              </div>
              <div>
                <p className="font-medium text-green-900 mb-1">Contract Addresses</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Platform:</span>
                    <button
                      onClick={() => copyToClipboard(contractAddresses.platform, 'Platform Contract')}
                      className="text-green-600 hover:text-green-800 font-mono text-xs"
                    >
                      {contractAddresses.platform.slice(0, 8)}...
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">NFT:</span>
                    <button
                      onClick={() => copyToClipboard(contractAddresses.nft, 'NFT Contract')}
                      className="text-green-600 hover:text-green-800 font-mono text-xs"
                    >
                      {contractAddresses.nft.slice(0, 8)}...
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
      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
    >
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900">
            Connect Your MetaMask Wallet
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Connect MetaMask to record donations on Polygon blockchain, mint NFT certificates, 
            and access all platform features with minimal gas fees.
          </p>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-xs text-blue-700">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              <span>Immutable donation records on Polygon</span>
            </div>
            <div className="flex items-center text-xs text-blue-700">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              <span>Automatic NFT certificate minting</span>
            </div>
            <div className="flex items-center text-xs text-blue-700">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              <span>Ultra-low gas fees (~$0.001 per transaction)</span>
            </div>
            <div className="flex items-center text-xs text-blue-700">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              <span>Instant transaction confirmations</span>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <WalletIcon className="h-4 w-4" />
                  <span>Connect MetaMask</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mt-3 text-xs text-blue-600">
            <p>
              <strong>Don't have MetaMask?</strong>{' '}
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >
                Install it here
              </a>{' '}
              - it's free and takes 2 minutes!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PolygonWalletConnection;