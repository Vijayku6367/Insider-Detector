const hre = require("hardhat");
const { ethers } = hre;
const { FhenixClient } = require("@fhenixprotocol/client");

async function testFHEOperations() {
  console.log("🧪 Testing FHE Operations...");
  
  // Setup
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Deploy contract
  const InsiderDetectorFHE = await ethers.getContractFactory("InsiderDetectorFHE");
  const detector = await InsiderDetectorFHE.deploy();
  await detector.waitForDeployment();
  const address = await detector.getAddress();
  console.log("Contract deployed at:", address);
  
  // Initialize FHE client
  const provider = new ethers.BrowserProvider(hre.network.provider);
  const fheClient = new FhenixClient({ provider });
  await fheClient.init();
  
  // Test data
  const testMetrics = {
    volumeSpike: 42,
    timeCluster: 18,
    velocityChange: 27
  };
  
  console.log("\n📊 Test Metrics:");
  console.log("Volume Spike:", testMetrics.volumeSpike);
  console.log("Time Cluster:", testMetrics.timeCluster);
  console.log("Velocity Change:", testMetrics.velocityChange);
  
  // Encrypt metrics
  console.log("\n🔐 Encrypting metrics...");
  const encryptedVolume = await fheClient.encrypt(testMetrics.volumeSpike, 'uint64');
  const encryptedTime = await fheClient.encrypt(testMetrics.timeCluster, 'uint64');
  const encryptedVelocity = await fheClient.encrypt(testMetrics.velocityChange, 'uint64');
  
  console.log("✅ Metrics encrypted successfully");
  console.log("Encrypted Volume (first 32 chars):", encryptedVolume.slice(0, 32) + "...");
  console.log("Encrypted Time (first 32 chars):", encryptedTime.slice(0, 32) + "...");
  console.log("Encrypted Velocity (first 32 chars):", encryptedVelocity.slice(0, 32) + "...");
  
  // Submit to contract
  console.log("\n📤 Submitting encrypted metrics to contract...");
  const tx = await detector.submitEncryptedMetrics(
    encryptedVolume,
    encryptedTime,
    encryptedVelocity
  );
  await tx.wait();
  console.log("✅ Metrics submitted successfully");
  
  // Run detection
  console.log("\n⚡ Running encrypted detection...");
  const detectionTx = await detector.runEncryptedDetection();
  await detectionTx.wait();
  console.log("✅ Detection completed");
  
  // Get encrypted result
  console.log("\n🔍 Retrieving encrypted result...");
  const encryptedResult = await detector.getEncryptedResult();
  const encryptedRisk = await detector.getEncryptedRiskScore();
  
  console.log("Encrypted Result (first 32 chars):", encryptedResult.slice(0, 32) + "...");
  console.log("Encrypted Risk (first 32 chars):", encryptedRisk.slice(0, 32) + "...");
  
  // Decrypt result
  console.log("\n🔓 Decrypting results locally...");
  const result = await fheClient.decrypt(encryptedResult, 'bool');
  const riskScore = await fheClient.decrypt(encryptedRisk, 'uint64');
  
  console.log("\n🎯 Detection Results:");
  console.log("====================");
  console.log("Risk Score:", Number(riskScore));
  console.log("Is Suspicious:", result);
  console.log("Threshold:", 50);
  console.log("Result:", result ? "🚨 SUSPICIOUS ACTIVITY" : "✅ No suspicious activity");
  
  // Verify expected result
  const expectedRisk = (testMetrics.volumeSpike > 50 ? 40 : 0) +
                      (testMetrics.timeCluster > 30 ? 35 : 0) +
                      (testMetrics.velocityChange > 20 ? 25 : 0);
  
  const expectedSuspicious = expectedRisk > 50;
  
  console.log("\n✅ Test completed successfully!");
  console.log("Expected Risk:", expectedRisk);
  console.log("Expected Suspicious:", expectedSuspicious);
  console.log("Test Passed:", Number(riskScore) === expectedRisk && result === expectedSuspicious);
}

testFHEOperations().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exitCode = 1;
});
