const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🚀 Deploying Encrypted Insider-Trading Detector...");
  
  // Get the contract factory
  const InsiderDetectorFHE = await ethers.getContractFactory("InsiderDetectorFHE");
  
  // Deploy the contract
  const detector = await InsiderDetectorFHE.deploy();
  await detector.waitForDeployment();
  
  const address = await detector.getAddress();
  console.log("✅ Contract deployed to:", address);
  
  // Verify contract on explorer (if configured)
  console.log("⏳ Waiting for block confirmations...");
  await detector.deploymentTransaction().wait(5);
  
  console.log("🔍 Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract already verified");
    } else {
      console.log("⚠️ Verification failed:", error.message);
    }
  }
  
  console.log("\n📋 Deployment Summary:");
  console.log("====================");
  console.log("Contract: InsiderDetectorFHE");
  console.log("Address:", address);
  console.log("Network:", hre.network.name);
  console.log("\n🔒 Contract Features:");
  console.log("- FHE encrypted metrics storage");
  console.log("- Encrypted comparison operations");
  console.log("- Private risk calculation");
  console.log("- Encrypted result generation");
  console.log("\n⚡ Ready for encrypted insider-trading detection!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
