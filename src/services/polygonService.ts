import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Contract ABIs (simplified for key functions)
const PLATFORM_ABI = [
  "function registerDonor(string memory _name, string memory _bloodType, string memory _location) external",
  "function recordDonation(address _recipient, string memory _bloodType, uint256 _amount, string memory _location) external",
  "function createBloodRequest(string memory _bloodType, uint256 _amount, string memory _urgency, string memory _location, string memory _description) external",
  "function fulfillBloodRequest(uint256 _requestId, uint256 _donationId) external",
  "function getDonation(uint256 _donationId) external view returns (tuple(uint256 id, address donor, address recipient, string bloodType, uint256 amount, string location, uint256 timestamp, bool verified, string txHash, uint256 nftTokenId, bool nftMinted))",
  "function getBloodRequest(uint256 _requestId) external view returns (tuple(uint256 id, address recipient, string bloodType, uint256 amount, string urgency, string location, uint256 timestamp, string status, string description, bool isActive))",
  "function getDonorProfile(address _donor) external view returns (tuple(uint256 id, address donorAddress, string name, string bloodType, string location, bool verified, uint256 totalDonations, uint256 lastDonationTime, bool isRegistered))",
  "function getDonorDonations(address _donor) external view returns (uint256[])",
  "function getRecipientRequests(address _recipient) external view returns (uint256[])",
  "function getOpenBloodRequests() external view returns (uint256[])",
  "function getPlatformStats() external view returns (uint256 totalDonations, uint256 totalRequests, uint256 totalDonors, uint256 verifiedDonations)",
  "event DonorRegistered(address indexed donor, string name, string bloodType, string location)",
  "event DonationRecorded(uint256 indexed donationId, address indexed donor, string bloodType, uint256 amount, string location)",
  "event BloodRequestCreated(uint256 indexed requestId, address indexed recipient, string bloodType, uint256 amount, string urgency)"
];

const NFT_ABI = [
  "function mintCertificate(address _to, string memory _donationId, string memory _bloodType, uint256 _amount, string memory _location, uint256 _timestamp) external returns (uint256)",
  "function getCertificate(uint256 _tokenId) external view returns (tuple(uint256 tokenId, address owner, string donationId, string bloodType, uint256 amount, string location, uint256 timestamp, string imageUrl))",
  "function getTokensByOwner(address _owner) external view returns (uint256[])",
  "function totalSupply() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

interface PolygonConfig {
  platformAddress: string;
  nftAddress: string;
  chainId: number;
  rpcUrl: string;
}

class PolygonService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private platformContract: ethers.Contract | null = null;
  private nftContract: ethers.Contract | null = null;
  private isConnected = false;
  private userAddress: string | null = null;

  // Contract addresses (will be set after deployment)
  private config: PolygonConfig = {
    platformAddress: import.meta.env.VITE_PLATFORM_CONTRACT_ADDRESS || '',
    nftAddress: import.meta.env.VITE_NFT_CONTRACT_ADDRESS || '',
    chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '80001'), // Mumbai testnet
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/'
  };

  async initialize() {
    try {
      console.log('🔄 Initializing Polygon Service...');
      
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await this.setupContracts();
        this.isConnected = true;
        this.userAddress = accounts[0];
      }

      console.log('✅ Polygon Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Polygon service:', error);
      return false;
    }
  }

  async connectWallet(): Promise<boolean> {
    try {
      if (!this.provider) {
        await this.initialize();
      }

      console.log('🔐 Connecting to MetaMask...');

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.userAddress = accounts[0];

      // Switch to correct network
      await this.switchToPolygonNetwork();

      // Setup contracts
      await this.setupContracts();
      
      this.isConnected = true;
      console.log('✅ Wallet connected:', this.userAddress);
      
      return true;
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      toast.error('Failed to connect wallet');
      return false;
    }
  }

  async switchToPolygonNetwork() {
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${this.config.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${this.config.chainId.toString(16)}`,
            chainName: this.config.chainId === 80001 ? 'Polygon Mumbai Testnet' : 'Polygon Mainnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
            rpcUrls: [this.config.rpcUrl],
            blockExplorerUrls: [
              this.config.chainId === 80001 
                ? 'https://mumbai.polygonscan.com/' 
                : 'https://polygonscan.com/'
            ],
          }],
        });
      }
    }
  }

  async setupContracts() {
    if (!this.provider) throw new Error('Provider not initialized');

    this.signer = await this.provider.getSigner();
    
    this.platformContract = new ethers.Contract(
      this.config.platformAddress,
      PLATFORM_ABI,
      this.signer
    );

    this.nftContract = new ethers.Contract(
      this.config.nftAddress,
      NFT_ABI,
      this.signer
    );

    console.log('✅ Contracts initialized');
  }

  async disconnect() {
    this.isConnected = false;
    this.userAddress = null;
    this.signer = null;
    this.platformContract = null;
    this.nftContract = null;
    console.log('✅ Wallet disconnected');
  }

  // Donor functions
  async registerDonor(name: string, bloodType: string, location: string) {
    if (!this.platformContract) throw new Error('Contract not initialized');

    try {
      console.log('📝 Registering donor:', { name, bloodType, location });
      
      const tx = await this.platformContract.registerDonor(name, bloodType, location);
      const receipt = await tx.wait();
      
      console.log('✅ Donor registered, tx:', receipt.hash);
      return { ok: true, txHash: receipt.hash };
    } catch (error: any) {
      console.error('❌ Donor registration failed:', error);
      return { err: error.reason || error.message };
    }
  }

  async recordDonation(recipientId: string | null, bloodType: string, amount: number, location: string) {
    if (!this.platformContract) throw new Error('Contract not initialized');

    try {
      console.log('🩸 Recording donation:', { recipientId, bloodType, amount, location });
      
      const recipient = recipientId || ethers.ZeroAddress;
      const tx = await this.platformContract.recordDonation(recipient, bloodType, amount, location);
      const receipt = await tx.wait();
      
      // Auto-mint NFT certificate
      try {
        await this.mintDonationNFT(bloodType, amount, location);
      } catch (nftError) {
        console.warn('⚠️ NFT minting failed:', nftError);
      }
      
      console.log('✅ Donation recorded, tx:', receipt.hash);
      return { ok: true, txHash: receipt.hash };
    } catch (error: any) {
      console.error('❌ Donation recording failed:', error);
      return { err: error.reason || error.message };
    }
  }

  async createBloodRequest(bloodType: string, amount: number, urgency: string, location: string, description?: string) {
    if (!this.platformContract) throw new Error('Contract not initialized');

    try {
      console.log('🆘 Creating blood request:', { bloodType, amount, urgency, location, description });
      
      const tx = await this.platformContract.createBloodRequest(
        bloodType, 
        amount, 
        urgency, 
        location, 
        description || ''
      );
      const receipt = await tx.wait();
      
      console.log('✅ Blood request created, tx:', receipt.hash);
      return { ok: true, txHash: receipt.hash };
    } catch (error: any) {
      console.error('❌ Blood request creation failed:', error);
      return { err: error.reason || error.message };
    }
  }

  async fulfillBloodRequest(requestId: string, donationId: string) {
    if (!this.platformContract) throw new Error('Contract not initialized');

    try {
      const tx = await this.platformContract.fulfillBloodRequest(
        parseInt(requestId), 
        parseInt(donationId)
      );
      const receipt = await tx.wait();
      
      console.log('✅ Blood request fulfilled, tx:', receipt.hash);
      return { ok: 'Request fulfilled successfully' };
    } catch (error: any) {
      console.error('❌ Failed to fulfill blood request:', error);
      return { err: error.reason || error.message };
    }
  }

  // Data retrieval functions
  async getDonations() {
    if (!this.platformContract || !this.userAddress) return [];

    try {
      const donationIds = await this.platformContract.getDonorDonations(this.userAddress);
      const donations = await Promise.all(
        donationIds.map(async (id: bigint) => {
          const donation = await this.platformContract!.getDonation(id);
          return {
            id: donation.id.toString(),
            donorId: donation.donor,
            recipientId: donation.recipient,
            bloodType: donation.bloodType,
            amount: Number(donation.amount),
            location: donation.location,
            timestamp: Number(donation.timestamp) * 1000, // Convert to milliseconds
            verified: donation.verified,
            txHash: donation.txHash,
            nftTokenId: donation.nftMinted ? Number(donation.nftTokenId) : undefined
          };
        })
      );
      
      console.log('📊 Retrieved donations:', donations.length);
      return donations;
    } catch (error) {
      console.error('❌ Failed to get donations:', error);
      return [];
    }
  }

  async getBloodRequests() {
    if (!this.platformContract) return [];

    try {
      const requestIds = await this.platformContract.getOpenBloodRequests();
      const requests = await Promise.all(
        requestIds.map(async (id: bigint) => {
          const request = await this.platformContract!.getBloodRequest(id);
          return {
            id: request.id.toString(),
            recipientId: request.recipient,
            bloodType: request.bloodType,
            amount: Number(request.amount),
            urgency: request.urgency,
            location: request.location,
            timestamp: Number(request.timestamp) * 1000,
            status: request.status,
            description: request.description
          };
        })
      );
      
      console.log('📊 Retrieved blood requests:', requests.length);
      return requests;
    } catch (error) {
      console.error('❌ Failed to get blood requests:', error);
      return [];
    }
  }

  async getPlatformStats() {
    if (!this.platformContract) return { totalDonations: 0, totalRequests: 0, totalDonors: 0, verifiedDonations: 0 };

    try {
      const stats = await this.platformContract.getPlatformStats();
      return {
        totalDonations: Number(stats.totalDonations),
        totalRequests: Number(stats.totalRequests),
        totalDonors: Number(stats.totalDonors),
        verifiedDonations: Number(stats.verifiedDonations)
      };
    } catch (error) {
      console.error('❌ Failed to get platform stats:', error);
      return { totalDonations: 0, totalRequests: 0, totalDonors: 0, verifiedDonations: 0 };
    }
  }

  // NFT functions
  async mintDonationNFT(bloodType: string, amount: number, location: string) {
    if (!this.nftContract || !this.userAddress) throw new Error('NFT contract not initialized');

    try {
      console.log('🎨 Minting NFT certificate...');
      
      const donationId = `donation-${Date.now()}`;
      const timestamp = Math.floor(Date.now() / 1000);
      
      const tx = await this.nftContract.mintCertificate(
        this.userAddress,
        donationId,
        bloodType,
        amount,
        location,
        timestamp
      );
      const receipt = await tx.wait();
      
      console.log('✅ NFT minted, tx:', receipt.hash);
      return { ok: true, txHash: receipt.hash };
    } catch (error: any) {
      console.error('❌ NFT minting failed:', error);
      throw error;
    }
  }

  async getUserNFTs() {
    if (!this.nftContract || !this.userAddress) return [];

    try {
      const tokenIds = await this.nftContract.getTokensByOwner(this.userAddress);
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          const certificate = await this.nftContract!.getCertificate(tokenId);
          return {
            tokenId: Number(tokenId),
            donationId: certificate.donationId,
            bloodType: certificate.bloodType,
            amount: Number(certificate.amount),
            location: certificate.location,
            timestamp: Number(certificate.timestamp) * 1000,
            imageUrl: certificate.imageUrl,
            attributes: [
              ['Blood Type', certificate.bloodType],
              ['Amount (ml)', certificate.amount.toString()],
              ['Location', certificate.location],
              ['Date', new Date(Number(certificate.timestamp) * 1000).toLocaleDateString()],
              ['Certificate Type', 'Blood Donation'],
              ['Verified', 'true']
            ]
          };
        })
      );
      
      console.log('🎨 Retrieved user NFTs:', nfts.length);
      return nfts;
    } catch (error) {
      console.error('❌ Failed to get user NFTs:', error);
      return [];
    }
  }

  // Utility functions
  isWalletConnected(): boolean {
    return this.isConnected && this.userAddress !== null;
  }

  getUserAddress(): string | null {
    return this.userAddress;
  }

  getContractAddresses() {
    return {
      platform: this.config.platformAddress,
      nft: this.config.nftAddress,
      chainId: this.config.chainId
    };
  }
}

// Export singleton instance
export default new PolygonService();