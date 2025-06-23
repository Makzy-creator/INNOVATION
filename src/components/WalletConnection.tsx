import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  WalletIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import ICPService from '../services/icpService';
import toast from 'react-hot-toast';

interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);

  useEffect(() => {
    initializeConnection();
  }, []);

  const initializeConnection = async () => {
    try {
      await ICPService.initialize();
      const connected = ICPService.isConnected();
      setIsConnected(connected);
      
      if (connected) {
        const principalText = ICPService.getPrincipalText();
        setPrincipal(principalText);
      }
      
      onConnectionChange?.(connected);
    } catch (error) {
      console.error('Failed to initialize wallet connection:', error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const success = await ICPService.login();
      if (success) {
        setIsConnected(true);
        const principalText = ICPService.getPrincipalText();
        setPrincipal(principalText);
        toast.success('Wallet connected successfully!');
        onConnectionChange?.(true);
      } else {
        toast.error('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Wallet connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await ICPService.logout();
      setIsConnected(false);
      setPrincipal(null);
      toast.success('Wallet disconnected');
      onConnectionChange?.(false);
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      toast.error('Failed to disconnect wallet');
    }
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
        className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg p-3"
      >
        <CheckCircleIcon className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">Wallet Connected</p>
          <p className="text-xs text-green-700">{formatPrincipal(principal || '')}</p>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-green-700 hover:text-green-900 font-medium"
        >
          Disconnect
        </button>
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
          <div className="mt-3">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <WalletIcon className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletConnection;