import { ethers } from 'ethers';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { BLOCKCHAIN_CONFIG, CONTRACT_ADDRESSES, GAS_OPTIMIZATION } from '../config/blockchain';

export type SupportedChain = 'polygon' | 'solana';

interface ChainProvider {
  chain: SupportedChain;
  provider: ethers.BrowserProvider | Connection;
  isConnected: boolean;
}

class MultiChainService {
  private providers: Map<SupportedChain, ChainProvider> = new Map();
  private currentChain: SupportedChain = 'polygon';

  async initialize() {
    try {
      console.log('🔄 Initializing multi-chain service...');
      
      // Initialize Polygon
      await this.initializePolygon();
      
      // Initialize Solana as fallback
      await this.initializeSolana();
      
      console.log('✅ Multi-chain service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize multi-chain service:', error);
      return false;
    }
  }

  private async initializePolygon() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      this.providers.set('polygon', {
        chain: 'polygon',
        provider,
        isConnected: false
      });

      console.log('✅ Polygon provider initialized');
    } catch (error) {
      console.warn('⚠️ Polygon initialization failed:', error);
    }
  }

  private async initializeSolana() {
    try {
      const connection = new Connection(
        BLOCKCHAIN_CONFIG.solana.rpcUrl,
        'confirmed'
      );

      // Test connection
      await connection.getVersion();

      this.providers.set('solana', {
        chain: 'solana',
        provider: connection,
        isConnected: true
      });

      console.log('✅ Solana provider initialized');
    } catch (error) {
      console.warn('⚠️ Solana initialization failed:', error);
    }
  }

  async connectWallet(chain: SupportedChain = 'polygon'): Promise<boolean> {
    try {
      const chainProvider = this.providers.get(chain);
      if (!chainProvider) {
        throw new Error(`Chain ${chain} not initialized`);
      }

      if (chain === 'polygon') {
        return await this.connectPolygonWallet();
      } else if (chain === 'solana') {
        return await this.connectSolanaWallet();
      }

      return false;
    } catch (error) {
      console.error(`❌ Failed to connect ${chain} wallet:`, error);
      return false;
    }
  }

  private async connectPolygonWallet(): Promise<boolean> {
    try {
      const chainProvider = this.providers.get('polygon');
      if (!chainProvider) return false;

      const provider = chainProvider.provider as ethers.BrowserProvider;
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to Polygon network
      await this.switchToPolygonNetwork();

      chainProvider.isConnected = true;
      this.currentChain = 'polygon';
      
      console.log('✅ Polygon wallet connected');
      return true;
    } catch (error) {
      console.error('❌ Polygon wallet connection failed:', error);
      return false;
    }
  }

  private async connectSolanaWallet(): Promise<boolean> {
    try {
      // Check if Phantom wallet is available
      if (typeof window.solana === 'undefined') {
        throw new Error('Solana wallet not found');
      }

      const response = await window.solana.connect();
      
      const chainProvider = this.providers.get('solana');
      if (chainProvider) {
        chainProvider.isConnected = true;
        this.currentChain = 'solana';
      }

      console.log('✅ Solana wallet connected:', response.publicKey.toString());
      return true;
    } catch (error) {
      console.error('❌ Solana wallet connection failed:', error);
      return false;
    }
  }

  private async switchToPolygonNetwork() {
    const chainId = BLOCKCHAIN_CONFIG.polygon.chainId;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: BLOCKCHAIN_CONFIG.polygon.name,
            nativeCurrency: BLOCKCHAIN_CONFIG.polygon.nativeCurrency,
            rpcUrls: [BLOCKCHAIN_CONFIG.polygon.rpcUrl],
            blockExplorerUrls: [BLOCKCHAIN_CONFIG.polygon.blockExplorer],
          }],
        });
      }
    }
  }

  async switchChain(chain: SupportedChain): Promise<boolean> {
    try {
      const chainProvider = this.providers.get(chain);
      if (!chainProvider || !chainProvider.isConnected) {
        return await this.connectWallet(chain);
      }

      this.currentChain = chain;
      console.log(`✅ Switched to ${chain} chain`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to switch to ${chain}:`, error);
      return false;
    }
  }

  getCurrentChain(): SupportedChain {
    return this.currentChain;
  }

  isChainConnected(chain: SupportedChain): boolean {
    const chainProvider = this.providers.get(chain);
    return chainProvider?.isConnected || false;
  }

  getProvider(chain: SupportedChain) {
    return this.providers.get(chain)?.provider;
  }

  async estimateGas(chain: SupportedChain, transaction: any): Promise<bigint> {
    if (chain === 'polygon') {
      const provider = this.getProvider('polygon') as ethers.BrowserProvider;
      const signer = await provider.getSigner();
      
      try {
        const gasEstimate = await signer.estimateGas(transaction);
        
        // Apply optimization multiplier
        const optimizedGas = gasEstimate * BigInt(Math.floor(GAS_OPTIMIZATION.estimationMultiplier * 100)) / BigInt(100);
        
        return optimizedGas;
      } catch (error) {
        console.warn('Gas estimation failed, using default:', error);
        return BigInt(GAS_OPTIMIZATION.gasLimit);
      }
    }
    
    // Solana gas estimation would go here
    return BigInt(0);
  }

  async getOptimizedGasPrice(chain: SupportedChain): Promise<{
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    gasPrice?: bigint;
  }> {
    if (chain === 'polygon') {
      const provider = this.getProvider('polygon') as ethers.BrowserProvider;
      
      try {
        const feeData = await provider.getFeeData();
        
        return {
          maxFeePerGas: feeData.maxFeePerGas || BigInt(GAS_OPTIMIZATION.maxFeePerGas),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(GAS_OPTIMIZATION.maxPriorityFeePerGas)
        };
      } catch (error) {
        console.warn('Failed to get fee data, using defaults:', error);
        return {
          maxFeePerGas: BigInt(GAS_OPTIMIZATION.maxFeePerGas),
          maxPriorityFeePerGas: BigInt(GAS_OPTIMIZATION.maxPriorityFeePerGas)
        };
      }
    }
    
    return {};
  }

  getContractAddresses(chain: SupportedChain) {
    return CONTRACT_ADDRESSES[chain];
  }

  async disconnect(chain?: SupportedChain) {
    if (chain) {
      const chainProvider = this.providers.get(chain);
      if (chainProvider) {
        chainProvider.isConnected = false;
      }
    } else {
      // Disconnect all chains
      this.providers.forEach(provider => {
        provider.isConnected = false;
      });
    }
  }
}

// Export singleton instance
export default new MultiChainService();