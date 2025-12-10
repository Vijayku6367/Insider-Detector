// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {TFHE, euint64, ebool} from "@fhenixprotocol/contracts/FHE.sol";

/**
 * REAL FHEVM IMPLEMENTATION
 * Full encrypted insider-trading detection with FHE operations
 */
contract InsiderDetectorFHE {
    
    struct EncryptedMetrics {
        euint64 volumeSpike;
        euint64 timeCluster;
        euint64 velocityChange;
    }

    struct DetectionResult {
        ebool isSuspicious;
        euint64 riskScore;
    }

    mapping(address => EncryptedMetrics) private userMetrics;
    mapping(address => DetectionResult) private detectionResults;

    // Thresholds (encrypted in real deployment)
    euint64 private constant VOLUME_THRESHOLD = TFHE.asEuint64(50);
    euint64 private constant TIME_THRESHOLD = TFHE.asEuint64(30);
    euint64 private constant VELOCITY_THRESHOLD = TFHE.asEuint64(20);
    euint64 private constant RISK_THRESHOLD = TFHE.asEuint64(50);

    // Risk weights
    euint64 private constant VOLUME_RISK = TFHE.asEuint64(40);
    euint64 private constant TIME_RISK = TFHE.asEuint64(35);
    euint64 private constant VELOCITY_RISK = TFHE.asEuint64(25);

    event MetricsSubmitted(address indexed user, bytes32 encryptedDataHash);
    event DetectionCompleted(address indexed user, bytes32 resultHash);

    /**
     * @dev Submit encrypted metrics for detection
     * @param encryptedVolume - FHE encrypted volume spike
     * @param encryptedTime - FHE encrypted time cluster
     * @param encryptedVelocity - FHE encrypted velocity change
     */
    function submitEncryptedMetrics(
        bytes calldata encryptedVolume,
        bytes calldata encryptedTime,
        bytes calldata encryptedVelocity
    ) external {
        euint64 volume = TFHE.asEuint64(encryptedVolume);
        euint64 time = TFHE.asEuint64(encryptedTime);
        euint64 velocity = TFHE.asEuint64(encryptedVelocity);

        userMetrics[msg.sender] = EncryptedMetrics(volume, time, velocity);
        
        // Calculate hash of encrypted data for verification
        bytes32 dataHash = keccak256(abi.encodePacked(
            encryptedVolume,
            encryptedTime,
            encryptedVelocity
        ));
        
        emit MetricsSubmitted(msg.sender, dataHash);
    }

    /**
     * @dev Run encrypted detection on submitted metrics
     * Performs all comparisons and calculations on encrypted data
     */
    function runEncryptedDetection() external returns (bytes memory encryptedResult) {
        require(TFHE.isInitialized(userMetrics[msg.sender].volumeSpike), "No metrics submitted");
        
        EncryptedMetrics memory metrics = userMetrics[msg.sender];
        
        // Initialize risk score
        euint64 riskScore = TFHE.asEuint64(0);
        
        // Rule 1: Check volume spike > threshold
        ebool isVolumeHigh = TFHE.gt(metrics.volumeSpike, VOLUME_THRESHOLD);
        riskScore = TFHE.add(riskScore, TFHE.select(isVolumeHigh, VOLUME_RISK, TFHE.asEuint64(0)));
        
        // Rule 2: Check time cluster > threshold
        ebool isTimeHigh = TFHE.gt(metrics.timeCluster, TIME_THRESHOLD);
        riskScore = TFHE.add(riskScore, TFHE.select(isTimeHigh, TIME_RISK, TFHE.asEuint64(0)));
        
        // Rule 3: Check velocity change > threshold
        ebool isVelocityHigh = TFHE.gt(metrics.velocityChange, VELOCITY_THRESHOLD);
        riskScore = TFHE.add(riskScore, TFHE.select(isVelocityHigh, VELOCITY_RISK, TFHE.asEuint64(0)));
        
        // Check if risk score exceeds threshold
        ebool isSuspicious = TFHE.gt(riskScore, RISK_THRESHOLD);
        
        // Store result
        detectionResults[msg.sender] = DetectionResult(isSuspicious, riskScore);
        
        // Return encrypted result
        encryptedResult = TFHE.seal(isSuspicious);
        
        bytes32 resultHash = keccak256(encryptedResult);
        emit DetectionCompleted(msg.sender, resultHash);
    }

    /**
     * @dev Get encrypted detection result for user
     * @return encrypted boolean result
     */
    function getEncryptedResult() external view returns (bytes memory) {
        require(TFHE.isInitialized(detectionResults[msg.sender].isSuspicious), "No detection result");
        return TFHE.seal(detectionResults[msg.sender].isSuspicious);
    }

    /**
     * @dev Get encrypted risk score for user
     * @return encrypted risk score
     */
    function getEncryptedRiskScore() external view returns (bytes memory) {
        require(TFHE.isInitialized(detectionResults[msg.sender].riskScore), "No detection result");
        return TFHE.seal(detectionResults[msg.sender].riskScore);
    }

    /**
     * @dev Verify if user has submitted metrics
     */
    function hasSubmittedMetrics(address user) external view returns (bool) {
        return TFHE.isInitialized(userMetrics[user].volumeSpike);
    }

    /**
     * @dev Verify if detection has been run for user
     */
    function hasDetectionResult(address user) external view returns (bool) {
        return TFHE.isInitialized(detectionResults[user].isSuspicious);
    }
}
