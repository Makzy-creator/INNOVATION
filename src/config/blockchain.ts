export const BLOCKCHAIN_CONFIG = {
  // Polygon Mainnet
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorer: 'https://polygonscan.com/',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  // Polygon Mumbai Testnet
  mumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    blockExplorer: 'https://mumbai.polygonscan.com/',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  // Solana Mainnet (Fallback)
  solana: {
    name: 'Solana',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    blockExplorer: 'https://explorer.solana.com/',
    nativeCurrency: {
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9,
    },
  },
};

export const CONTRACT_ADDRESSES = {
  polygon: {
    userRegistry: import.meta.env.VITE_USER_REGISTRY_ADDRESS || '',
    donationProcessor: import.meta.env.VITE_DONATION_PROCESSOR_ADDRESS || '',
    requestManager: import.meta.env.VITE_REQUEST_MANAGER_ADDRESS || '',
    accessControl: import.meta.env.VITE_ACCESS_CONTROL_ADDRESS || '',
    nft: import.meta.env.VITE_NFT_CONTRACT_ADDRESS || '',
  },
  solana: {
    program: import.meta.env.VITE_SOLANA_PROGRAM_ID || '',
  },
};

export const GAS_OPTIMIZATION = {
  // EIP-1559 settings for Polygon
  maxFeePerGas: '100000000000', // 100 gwei
  maxPriorityFeePerGas: '30000000000', // 30 gwei
  gasLimit: 6000000,
  
  // Gas estimation multipliers
  estimationMultiplier: 1.2,
  priorityMultiplier: 1.1,
};