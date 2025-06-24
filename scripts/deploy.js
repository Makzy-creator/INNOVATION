const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to", hre.network.name);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  // Deploy BloodDonationPlatform
  console.log("\n📋 Deploying BloodDonationPlatform...");
  const BloodDonationPlatform = await hre.ethers.getContractFactory("BloodDonationPlatform");
  const platform = await BloodDonationPlatform.deploy();
  await platform.waitForDeployment();
  const platformAddress = await platform.getAddress();
  console.log("✅ BloodDonationPlatform deployed to:", platformAddress);
  
  // Deploy BloodDonationNFT
  console.log("\n🎨 Deploying BloodDonationNFT...");
  const BloodDonationNFT = await hre.ethers.getContractFactory("BloodDonationNFT");
  const nft = await BloodDonationNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ BloodDonationNFT deployed to:", nftAddress);
  
  // Authorize platform contract to mint NFTs
  console.log("\n🔗 Authorizing platform to mint NFTs...");
  const authTx = await nft.addAuthorizedMinter(platformAddress);
  await authTx.wait();
  console.log("✅ Platform authorized to mint NFTs");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      BloodDonationPlatform: platformAddress,
      BloodDonationNFT: nftAddress
    },
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };
  
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("BloodDonationPlatform:", deploymentInfo.contracts.BloodDonationPlatform);
  console.log("BloodDonationNFT:", deploymentInfo.contracts.BloodDonationNFT);
  console.log("Block Number:", deploymentInfo.blockNumber);
  console.log("=".repeat(50));
  
  // Environment variables for frontend
  console.log("\n🔧 Add these to your .env file:");
  console.log(`VITE_PLATFORM_CONTRACT_ADDRESS=${platformAddress}`);
  console.log(`VITE_NFT_CONTRACT_ADDRESS=${nftAddress}`);
  console.log(`VITE_CHAIN_ID=${deploymentInfo.chainId}`);
  console.log(`VITE_NETWORK_NAME=${deploymentInfo.network}`);
  
  // Verification instructions
  if (hre.network.name !== "hardhat") {
    console.log("\n🔍 To verify contracts on Polygonscan:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${platformAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${nftAddress}`);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });