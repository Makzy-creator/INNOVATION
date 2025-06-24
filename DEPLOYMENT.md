# LIFEFLOW Deployment Guide

## Phase 1: ICP Smart Contract Deployment

### Prerequisites
1. Install DFX SDK: `sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"`
2. Start local replica: `dfx start --background`
3. Install dependencies: `npm install`

### Step 1: Deploy Canisters
```bash
# Deploy all canisters to local network
dfx deploy --network local

# Or deploy to IC mainnet (requires cycles)
dfx deploy --network ic
```

### Step 2: Get Canister IDs
```bash
# Get canister IDs
dfx canister id blood_donation_backend
dfx canister id donation_nft
dfx canister id internet_identity
```

### Step 3: Update Environment Variables
Create `.env` file with your canister IDs:
```env
VITE_BLOOD_DONATION_CANISTER_ID=your_blood_donation_canister_id
VITE_NFT_CANISTER_ID=your_nft_canister_id
VITE_INTERNET_IDENTITY_CANISTER_ID=rdmx6-jaaaa-aaaah-qdrqq-cai
```

### Step 4: Build and Start Frontend
```bash
npm run build
npm run dev
```

## Testing the Implementation

### 1. Wallet Connection Test
- Click "Connect Internet Identity" 
- Complete authentication flow
- Verify principal ID is displayed

### 2. Donor Registration Test
- Register as a donor
- Check blockchain registration
- Verify donor profile creation

### 3. Donation Recording Test
- Record a test donation
- Verify blockchain storage
- Check NFT certificate minting

### 4. Blood Request Test
- Create a blood request
- Verify request storage
- Test request fulfillment

## Troubleshooting

### Common Issues:
1. **Canister not found**: Ensure canisters are deployed
2. **Authentication fails**: Check Internet Identity canister ID
3. **Network errors**: Verify dfx is running
4. **Out of cycles**: Add cycles to canisters

### Debug Commands:
```bash
# Check canister status
dfx canister status blood_donation_backend

# Check cycles balance
dfx wallet balance

# View canister logs
dfx canister logs blood_donation_backend
```

## Production Deployment

### IC Mainnet Deployment:
1. Get cycles from cycles faucet or exchange
2. Deploy with: `dfx deploy --network ic --with-cycles 1000000000000`
3. Update frontend with mainnet canister IDs
4. Deploy frontend to hosting service

### Frontend Hosting Options:
- Netlify (recommended)
- Vercel
- IC Asset Canister
- Traditional web hosting

## Success Criteria

✅ **Smart contracts deployed and accessible**
✅ **Wallet connection working**
✅ **User registration functional**
✅ **Donation recording operational**
✅ **NFT minting automatic**
✅ **Data persistence verified**

## Next Steps

After successful deployment:
1. Test all user flows
2. Verify blockchain data integrity
3. Test NFT certificate generation
4. Validate wallet integration
5. Proceed to Phase 2 (AI Integration)