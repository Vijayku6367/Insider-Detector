// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * DEMO VERSION — NO REAL FHE OPERATIONS.
 * Shows how encrypted insider-trading detection works.
 * Real FHE ops added during final implementation.
 */

contract InsiderDetectorDemo {
    
    struct EncryptedMetrics {
        bytes volumeSpike;      // encrypted Uint64
        bytes timeCluster;      // encrypted Uint64
        bytes velocityChange;   // encrypted Uint64
    }

    mapping(address => EncryptedMetrics) public submitted;

    // User submits encrypted metrics
    function submitEncryptedMetrics(
        bytes calldata _vol,
        bytes calldata _time,
        bytes calldata _vel
    ) external {
        submitted[msg.sender] = EncryptedMetrics(_vol, _time, _vel);
        emit MetricsSubmitted(msg.sender);
    }

    /**
     * DEMO FUNCTION:
     * This is where encrypted comparisons would run.
     * In demo mode we just return a placeholder encrypted flag.
     */
    function runEncryptedDetection() external view returns (bytes memory) {
        require(submitted[msg.sender].volumeSpike.length > 0, "No data");

        // In real FHEVM:
        // ct risk = 0;
        // if (ct_volumeSpike > 50) risk += 40;
        // if (ct_timeCluster > 30) risk += 35;
        // if (ct_velocityChange > 20) risk += 25;
        // return encrypted(risk > threshold);

        // Demo placeholder
        return hex"DEMO_ENCRYPTED_FLAG";
    }

    event MetricsSubmitted(address indexed user);
}
