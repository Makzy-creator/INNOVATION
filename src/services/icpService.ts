import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Type definitions for our canisters
interface BloodDonationBackend {
  registerDonor: (name: string, bloodType: string, location: string) => Promise<{ ok?: any; err?: string }>;
  recordDonation: (recipientId: [] | [Principal], bloodType: string, amount: bigint, location: string) => Promise<{ ok?: any; err?: string }>;
  createBloodRequest: (bloodType: string, amount: bigint, urgency: string, location: string, description: [] | [string]) => Promise<{ ok?: any; err?: string }>;
  getDonations: () => Promise<any[]>;
  getBloodRequests: () => Promise<any[]>;
  getDonorProfile: (donorId: Principal) => Promise<[] | [any]>;
  fulfillBloodRequest: (requestId: string, donationId: string) => Promise<{ ok?: string; err?: string }>;
  getPlatformStats: () => Promise<{
    totalDonations: bigint;
    totalRequests: bigint;
    totalDonors: bigint;
    verifiedDonations: bigint;
  }>;
}

interface DonationNFT {
  mintDonationCertificate: (request: {
    to: Principal;
    donationId: string;
    bloodType: string;
    amount: bigint;
    location: string;
    timestamp: bigint;
  }) => Promise<{ ok?: bigint; err?: string }>;
  getTokenMetadata: (tokenId: bigint) => Promise<[] | [any]>;
  getTokensByOwner: (owner: Principal) => Promise<bigint[]>;
  getAllTokens: () => Promise<any[]>;
  transferToken: (tokenId: bigint, to: Principal) => Promise<{ ok?: string; err?: string }>;
  getTotalSupply: () => Promise<bigint>;
}

class ICPService {
  private authClient: AuthClient | null = null;
  private agent: HttpAgent | null = null;
  private bloodDonationActor: BloodDonationBackend | null = null;
  private nftActor: DonationNFT | null = null;
  private isAuthenticated = false;
  private principal: Principal | null = null;

  // Canister IDs - will be set after deployment
  private BLOOD_DONATION_CANISTER_ID = '';
  private NFT_CANISTER_ID = '';
  private INTERNET_IDENTITY_CANISTER_ID = 'rdmx6-jaaaa-aaaah-qdrqq-cai';

  async initialize() {
    try {
      console.log('🔄 Initializing ICP Service...');
      
      // Create auth client
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true
        }
      });
      
      // Check if already authenticated
      const isAuthenticated = await this.authClient.isAuthenticated();
      if (isAuthenticated) {
        console.log('✅ Already authenticated, setting up agent...');
        await this.setupAgent();
        this.isAuthenticated = true;
      }

      // Try to get canister IDs from environment or local
      await this.loadCanisterIds();
      
      console.log('✅ ICP Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize ICP service:', error);
      return false;
    }
  }

  private async loadCanisterIds() {
    try {
      // Try to load from environment variables first
      this.BLOOD_DONATION_CANISTER_ID = import.meta.env.VITE_BLOOD_DONATION_CANISTER_ID || '';
      this.NFT_CANISTER_ID = import.meta.env.VITE_NFT_CANISTER_ID || '';

      // If not in env, try to load from local dfx
      if (!this.BLOOD_DONATION_CANISTER_ID || !this.NFT_CANISTER_ID) {
        try {
          const response = await fetch('/.well-known/ic-domains');
          if (response.ok) {
            const data = await response.json();
            this.BLOOD_DONATION_CANISTER_ID = data.blood_donation_backend || 'rrkah-fqaaa-aaaah-qcuiq-cai';
            this.NFT_CANISTER_ID = data.donation_nft || 'rno2w-sqaaa-aaaah-qcuwa-cai';
          }
        } catch (e) {
          // Use default local canister IDs
          this.BLOOD_DONATION_CANISTER_ID = 'rrkah-fqaaa-aaaah-qcuiq-cai';
          this.NFT_CANISTER_ID = 'rno2w-sqaaa-aaaah-qcuwa-cai';
        }
      }

      console.log('📋 Canister IDs loaded:', {
        bloodDonation: this.BLOOD_DONATION_CANISTER_ID,
        nft: this.NFT_CANISTER_ID,
        internetIdentity: this.INTERNET_IDENTITY_CANISTER_ID
      });
    } catch (error) {
      console.warn('⚠️ Could not load canister IDs, using defaults');
    }
  }

  async login(): Promise<boolean> {
    try {
      if (!this.authClient) {
        await this.initialize();
      }

      console.log('🔐 Starting login process...');

      return new Promise((resolve) => {
        const identityProvider = window.location.hostname === 'localhost' 
          ? `http://localhost:4943/?canisterId=${this.INTERNET_IDENTITY_CANISTER_ID}`
          : 'https://identity.ic0.app';

        console.log('🌐 Using identity provider:', identityProvider);

        this.authClient!.login({
          identityProvider,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
          onSuccess: async () => {
            console.log('✅ Login successful, setting up agent...');
            await this.setupAgent();
            this.isAuthenticated = true;
            resolve(true);
          },
          onError: (error) => {
            console.error('❌ Login failed:', error);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  }

  async logout() {
    try {
      if (this.authClient) {
        await this.authClient.logout();
        this.isAuthenticated = false;
        this.agent = null;
        this.bloodDonationActor = null;
        this.nftActor = null;
        this.principal = null;
        console.log('✅ Logged out successfully');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  private async setupAgent() {
    try {
      if (!this.authClient) throw new Error('Auth client not initialized');

      const identity = this.authClient.getIdentity();
      this.principal = identity.getPrincipal();
      
      console.log('👤 Principal:', this.principal.toText());

      // Create agent
      const host = window.location.hostname === 'localhost' 
        ? 'http://localhost:4943' 
        : 'https://ic0.app';

      this.agent = new HttpAgent({
        identity,
        host
      });

      // Fetch root key for local development
      if (window.location.hostname === 'localhost') {
        console.log('🔑 Fetching root key for local development...');
        await this.agent.fetchRootKey();
      }

      // Create actors
      await this.createActors();
      
      console.log('✅ Agent setup complete');
    } catch (error) {
      console.error('❌ Agent setup failed:', error);
      throw error;
    }
  }

  private async createActors() {
    if (!this.agent) throw new Error('Agent not initialized');

    try {
      // Blood Donation Backend Actor
      this.bloodDonationActor = Actor.createActor<BloodDonationBackend>(
        ({ IDL }) => IDL.Service({
          registerDonor: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Variant({ ok: IDL.Record({}), err: IDL.Text })], []),
          recordDonation: IDL.Func([IDL.Opt(IDL.Principal), IDL.Text, IDL.Nat, IDL.Text], [IDL.Variant({ ok: IDL.Record({}), err: IDL.Text })], []),
          createBloodRequest: IDL.Func([IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Opt(IDL.Text)], [IDL.Variant({ ok: IDL.Record({}), err: IDL.Text })], []),
          getDonations: IDL.Func([], [IDL.Vec(IDL.Record({}))], ['query']),
          getBloodRequests: IDL.Func([], [IDL.Vec(IDL.Record({}))], ['query']),
          getDonorProfile: IDL.Func([IDL.Principal], [IDL.Opt(IDL.Record({}))], ['query']),
          fulfillBloodRequest: IDL.Func([IDL.Text, IDL.Text], [IDL.Variant({ ok: IDL.Text, err: IDL.Text })], []),
          getPlatformStats: IDL.Func([], [IDL.Record({
            totalDonations: IDL.Nat,
            totalRequests: IDL.Nat,
            totalDonors: IDL.Nat,
            verifiedDonations: IDL.Nat
          })], ['query']),
        }),
        {
          agent: this.agent,
          canisterId: this.BLOOD_DONATION_CANISTER_ID,
        }
      );

      // NFT Actor
      this.nftActor = Actor.createActor<DonationNFT>(
        ({ IDL }) => IDL.Service({
          mintDonationCertificate: IDL.Func([IDL.Record({
            to: IDL.Principal,
            donationId: IDL.Text,
            bloodType: IDL.Text,
            amount: IDL.Nat,
            location: IDL.Text,
            timestamp: IDL.Int
          })], [IDL.Variant({ ok: IDL.Nat, err: IDL.Text })], []),
          getTokenMetadata: IDL.Func([IDL.Nat], [IDL.Opt(IDL.Record({}))], ['query']),
          getTokensByOwner: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat)], ['query']),
          getAllTokens: IDL.Func([], [IDL.Vec(IDL.Record({}))], ['query']),
          transferToken: IDL.Func([IDL.Nat, IDL.Principal], [IDL.Variant({ ok: IDL.Text, err: IDL.Text })], []),
          getTotalSupply: IDL.Func([], [IDL.Nat], ['query']),
        }),
        {
          agent: this.agent,
          canisterId: this.NFT_CANISTER_ID,
        }
      );

      console.log('✅ Actors created successfully');
    } catch (error) {
      console.error('❌ Failed to create actors:', error);
      throw error;
    }
  }

  // Public API methods
  async registerDonor(name: string, bloodType: string, location: string) {
    if (!this.bloodDonationActor) throw new Error('Not authenticated');
    
    try {
      console.log('📝 Registering donor:', { name, bloodType, location });
      const result = await this.bloodDonationActor.registerDonor(name, bloodType, location);
      console.log('✅ Donor registration result:', result);
      return result;
    } catch (error) {
      console.error('❌ Donor registration failed:', error);
      throw error;
    }
  }

  async recordDonation(recipientId: string | null, bloodType: string, amount: number, location: string) {
    if (!this.bloodDonationActor) throw new Error('Not authenticated');
    
    try {
      console.log('🩸 Recording donation:', { recipientId, bloodType, amount, location });
      
      const recipient = recipientId ? [Principal.fromText(recipientId)] : [];
      const result = await this.bloodDonationActor.recordDonation(recipient, bloodType, BigInt(amount), location);
      
      console.log('✅ Donation recorded:', result);
      
      // If donation recorded successfully, mint NFT certificate
      if (result.ok) {
        try {
          await this.mintDonationNFT(bloodType, amount, location);
        } catch (nftError) {
          console.warn('⚠️ NFT minting failed, but donation was recorded:', nftError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Donation recording failed:', error);
      throw error;
    }
  }

  async createBloodRequest(bloodType: string, amount: number, urgency: string, location: string, description?: string) {
    if (!this.bloodDonationActor) throw new Error('Not authenticated');
    
    try {
      console.log('🆘 Creating blood request:', { bloodType, amount, urgency, location, description });
      
      const desc = description ? [description] : [];
      const result = await this.bloodDonationActor.createBloodRequest(
        bloodType, 
        BigInt(amount), 
        urgency, 
        location, 
        desc
      );
      
      console.log('✅ Blood request created:', result);
      return result;
    } catch (error) {
      console.error('❌ Blood request creation failed:', error);
      throw error;
    }
  }

  async getDonations() {
    if (!this.bloodDonationActor) throw new Error('Not authenticated');
    
    try {
      const donations = await this.bloodDonationActor.getDonations();
      console.log('📊 Retrieved donations:', donations.length);
      return donations;
    } catch (error) {
      console.error('❌ Failed to get donations:', error);
      return [];
    }
  }

  async getBloodRequests() {
    if (!this.bloodDonationActor) throw new Error('Not authenticated');
    
    try {
      const requests = await this.bloodDonationActor.getBloodRequests();
      console.log('📊 Retrieved blood requests:', requests.length);
      return requests;
    } catch (error) {
      console.error('❌ Failed to get blood requests:', error);
      return [];
    }
  }

  async fulfillBloodRequest(requestId: string, donationId: string) {
    if (!this.bloodDonationActor) throw new Error('Not authenticated');
    
    try {
      const result = await this.bloodDonationActor.fulfillBloodRequest(requestId, donationId);
      console.log('✅ Blood request fulfilled:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to fulfill blood request:', error);
      throw error;
    }
  }

  async getPlatformStats() {
    if (!this.bloodDonationActor) throw new Error('Not authenticated');
    
    try {
      const stats = await this.bloodDonationActor.getPlatformStats();
      console.log('📈 Platform stats:', stats);
      return {
        totalDonations: Number(stats.totalDonations),
        totalRequests: Number(stats.totalRequests),
        totalDonors: Number(stats.totalDonors),
        verifiedDonations: Number(stats.verifiedDonations)
      };
    } catch (error) {
      console.error('❌ Failed to get platform stats:', error);
      return {
        totalDonations: 0,
        totalRequests: 0,
        totalDonors: 0,
        verifiedDonations: 0
      };
    }
  }

  // NFT Methods
  async mintDonationNFT(bloodType: string, amount: number, location: string) {
    if (!this.nftActor || !this.principal) throw new Error('Not authenticated');
    
    try {
      console.log('🎨 Minting NFT certificate...');
      
      const mintRequest = {
        to: this.principal,
        donationId: `donation-${Date.now()}`,
        bloodType,
        amount: BigInt(amount),
        location,
        timestamp: BigInt(Date.now() * 1000000) // Convert to nanoseconds
      };

      const result = await this.nftActor.mintDonationCertificate(mintRequest);
      console.log('✅ NFT minted:', result);
      return result;
    } catch (error) {
      console.error('❌ NFT minting failed:', error);
      throw error;
    }
  }

  async getUserNFTs() {
    if (!this.nftActor || !this.principal) throw new Error('Not authenticated');
    
    try {
      const tokenIds = await this.nftActor.getTokensByOwner(this.principal);
      console.log('🎨 User NFTs:', tokenIds.length);
      
      // Get metadata for each token
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const metadata = await this.nftActor!.getTokenMetadata(tokenId);
            return { tokenId: Number(tokenId), metadata: metadata[0] || null };
          } catch (error) {
            console.warn('Failed to get metadata for token:', tokenId);
            return { tokenId: Number(tokenId), metadata: null };
          }
        })
      );

      return nfts.filter(nft => nft.metadata !== null);
    } catch (error) {
      console.error('❌ Failed to get user NFTs:', error);
      return [];
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.isAuthenticated && this.principal !== null;
  }

  getPrincipal(): Principal | null {
    return this.principal;
  }

  getPrincipalText(): string | null {
    return this.principal ? this.principal.toText() : null;
  }

  getCanisterIds() {
    return {
      bloodDonation: this.BLOOD_DONATION_CANISTER_ID,
      nft: this.NFT_CANISTER_ID,
      internetIdentity: this.INTERNET_IDENTITY_CANISTER_ID
    };
  }
}

// Export singleton instance
export default new ICPService();