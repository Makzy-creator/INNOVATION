# LIFEFLOW - Blockchain Blood Donation Platform

**Your one pint of blood can save 5 Lives**

A revolutionary blood donation platform built on Internet Computer Protocol (ICP) with smart contracts, NFT certificates, and real-time AI assistance.

## 🚀 Hackathon Features

### ✅ ICP Smart Contracts
- **Blood Donation Backend**: Immutable donation records with verification
- **NFT Certificate System**: Blockchain-verified donation certificates
- **Donor Registration**: On-chain donor profiles and eligibility tracking
- **Request Management**: Transparent blood request system

### ✅ Real Wallet Integration
- **Internet Identity**: Secure authentication with ICP
- **Principal-based**: Unique blockchain identities for all users
- **Auto-connect**: Seamless wallet integration experience

### ✅ NFT Certificates
- **Automatic Minting**: NFT certificates for every verified donation
- **Rich Metadata**: Blood type, amount, location, timestamp
- **Downloadable**: Generate certificate images
- **Shareable**: Social media integration for impact sharing

### ✅ Immutable Records
- **Blockchain Storage**: All donations stored on ICP canisters
- **Verification System**: Medical professional verification workflow
- **Audit Trail**: Complete transaction history
- **Transparency**: Public verification of donation records

## 🏗️ Architecture

```
Frontend (React/TypeScript)
    ↓
ICP Agent (Authentication & Communication)
    ↓
Smart Contracts (Motoko)
    ├── Blood Donation Backend
    └── NFT Certificate System
```

## 🛠️ Setup & Deployment

### Prerequisites
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) installed
- Node.js 16+ and npm
- Internet Computer wallet (Internet Identity)

### Local Development

1. **Start ICP Replica**
```bash
dfx start --background
```

2. **Deploy Canisters**
```bash
dfx deploy
```

3. **Install Dependencies**
```bash
npm install
```

4. **Start Frontend**
```bash
npm run dev
```

### Production Deployment

1. **Deploy to IC Mainnet**
```bash
dfx deploy --network ic
```

2. **Build Frontend**
```bash
npm run build
```

3. **Update Canister IDs**
Update the canister IDs in your environment variables.

## 📋 Smart Contract Functions

### Blood Donation Backend
- `registerDonor(name, bloodType, location)` - Register new donor
- `recordDonation(recipientId, bloodType, amount, location)` - Record donation
- `createBloodRequest(bloodType, amount, urgency, location)` - Create request
- `fulfillBloodRequest(requestId, donationId)` - Fulfill request
- `getDonations()` - Get all donations
- `verifyDonation(donationId)` - Verify donation

### NFT Certificate System
- `mintDonationCertificate(request)` - Mint NFT for donation
- `getTokenMetadata(tokenId)` - Get NFT metadata
- `getTokensByOwner(owner)` - Get user's NFTs
- `transferToken(tokenId, to)` - Transfer NFT

## 🎯 Key Features

### For Donors
- ✅ Blockchain wallet integration
- ✅ Automatic NFT certificate minting
- ✅ Donation eligibility tracking (56-day rule)
- ✅ Impact visualization with certificates
- ✅ Shareable achievement system

### For Recipients
- ✅ Transparent request system
- ✅ Real-time donor matching
- ✅ Urgency-based prioritization
- ✅ Blockchain-verified donations

### For Medical Professionals
- ✅ Donation verification system
- ✅ Immutable audit trails
- ✅ Compliance monitoring
- ✅ Multi-facility management

## 🔐 Security Features

- **Internet Identity**: Secure, passwordless authentication
- **Principal-based Access**: Unique blockchain identities
- **Smart Contract Validation**: Business logic enforcement
- **Immutable Records**: Tamper-proof donation history
- **Verification System**: Medical professional oversight

## 🏆 Hackathon Achievements

1. **✅ Real ICP Deployment**: Actual canisters deployed on Internet Computer
2. **✅ Smart Contract Integration**: Motoko contracts with full functionality
3. **✅ Wallet Integration**: Internet Identity authentication
4. **✅ NFT System**: Automated certificate minting and management
5. **✅ Immutable Storage**: All data stored on blockchain
6. **✅ Production Ready**: Scalable architecture for real-world use

## 🌟 Demo Highlights

- **Live Blockchain**: Real transactions on Internet Computer
- **NFT Minting**: Automatic certificate generation
- **Wallet Connection**: Seamless Internet Identity integration
- **Smart Contracts**: Deployed Motoko canisters
- **Immutable Records**: Verifiable donation history

## 📊 Platform Statistics

Track real-time metrics:
- Total donations recorded on blockchain
- NFT certificates minted
- Active donors and recipients
- Verified medical facilities

## 🚀 Future Enhancements

- Cross-chain compatibility
- Mobile app with biometric verification
- AI-powered matching algorithms
- Global blood bank network
- Regulatory compliance automation

## 📄 License

MIT License - Built for saving lives through blockchain innovation.

---

**LIFEFLOW** - Where blockchain meets humanitarian impact. Your one pint of blood can save 5 Lives. Every donation matters, every life counts.