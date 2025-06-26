const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting infrastructure deployment...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  const deployedContracts = {};

  try {
    // 1. Deploy AccessControl first
    console.log("\n🔐 Deploying AccessControl...");
    const AccessControl = await hre.ethers.getContractFactory("AccessControl");
    const accessControl = await hre.upgrades.deployProxy(
      AccessControl,
      [deployer.address],
      { initializer: 'initialize' }
    );
    await accessControl.waitForDeployment();
    const accessControlAddress = await accessControl.getAddress();
    deployedContracts.accessControl = accessControlAddress;
    console.log("✅ AccessControl deployed to:", accessControlAddress);

    // 2. Deploy UserRegistry
    console.log("\n👥 Deploying UserRegistry...");
    const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
    const userRegistry = await hre.upgrades.deployProxy(
      UserRegistry,
      [deployer.address],
      { initializer: 'initialize' }
    );
    await userRegistry.waitForDeployment();
    const userRegistryAddress = await userRegistry.getAddress();
    deployedContracts.userRegistry = userRegistryAddress;
    console.log("✅ UserRegistry deployed to:", userRegistryAddress);

    // 3. Deploy existing contracts (BloodDonationPlatform and NFT)
    console.log("\n🩸 Deploying BloodDonationPlatform...");
    const BloodDonationPlatform = await hre.ethers.getContractFactory("BloodDonationPlatform");
    const platform = await BloodDonationPlatform.deploy();
    await platform.waitForDeployment();
    const platformAddress = await platform.getAddress();
    deployedContracts.platform = platformAddress;
    console.log("✅ BloodDonationPlatform deployed to:", platformAddress);

    console.log("\n🎨 Deploying BloodDonationNFT...");
    const BloodDonationNFT = await hre.ethers.getContractFactory("BloodDonationNFT");
    const nft = await BloodDonationNFT.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    deployedContracts.nft = nftAddress;
    console.log("✅ BloodDonationNFT deployed to:", nftAddress);

    // Authorize platform contract to mint NFTs
    console.log("\n🔗 Setting up contract permissions...");
    const authTx = await nft.addAuthorizedMinter(platformAddress);
    await authTx.wait();
    console.log("✅ Platform authorized to mint NFTs");

    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      deployer: deployer.address,
      contracts: deployedContracts,
      timestamp: new Date().toISOString(),
      blockNumber: await hre.ethers.provider.getBlockNumber()
    };

    console.log("\n📊 Deployment Summary:");
    console.log("=".repeat(60));
    console.log("Network:", deploymentInfo.network);
    console.log("Chain ID:", deploymentInfo.chainId);
    console.log("Deployer:", deploymentInfo.deployer);
    console.log("AccessControl:", deploymentInfo.contracts.accessControl);
    console.log("UserRegistry:", deploymentInfo.contracts.userRegistry);
    console.log("BloodDonationPlatform:", deploymentInfo.contracts.platform);
    console.log("BloodDonationNFT:", deploymentInfo.contracts.nft);
    console.log("Block Number:", deploymentInfo.blockNumber);
    console.log("=".repeat(60));

    // Environment variables for frontend
    console.log("\n🔧 Add these to your .env file:");
    console.log(`VITE_ACCESS_CONTROL_ADDRESS=${deployedContracts.accessControl}`);
    console.log(`VITE_USER_REGISTRY_ADDRESS=${deployedContracts.userRegistry}`);
    console.log(`VITE_PLATFORM_CONTRACT_ADDRESS=${deployedContracts.platform}`);
    console.log(`VITE_NFT_CONTRACT_ADDRESS=${deployedContracts.nft}`);
    console.log(`VITE_CHAIN_ID=${deploymentInfo.chainId}`);
    console.log(`VITE_NETWORK_NAME=${deploymentInfo.network}`);

    // Verification instructions
    if (hre.network.name !== "hardhat") {
      console.log("\n🔍 To verify contracts on Polygonscan:");
      console.log(`npx hardhat verify --network ${hre.network.name} ${deployedContracts.platform}`);
      console.log(`npx hardhat verify --network ${hre.network.name} ${deployedContracts.nft}`);
      console.log("Note: Proxy contracts will be verified automatically");
    }

    console.log("\n🎉 Infrastructure deployment completed successfully!");
    
    return deployedContracts;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  });