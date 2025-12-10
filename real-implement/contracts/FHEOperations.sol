// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {TFHE, euint64, ebool} from "@fhenixprotocol/contracts/FHE.sol";

/**
 * Utility contract for FHE operations
 * Can be extended for more complex encrypted computations
 */
library FHEOperations {
    
    /**
     * @dev Compare two encrypted values and return encrypted boolean
     */
    function encryptedGreaterThan(euint64 a, euint64 b) internal pure returns (ebool) {
        return TFHE.gt(a, b);
    }
    
    /**
     * @dev Add encrypted values
     */
    function encryptedAdd(euint64 a, euint64 b) internal pure returns (euint64) {
        return TFHE.add(a, b);
    }
    
    /**
     * @dev Conditional addition based on encrypted boolean
     */
    function conditionalAdd(
        euint64 currentValue,
        ebool condition,
        euint64 addValue
    ) internal pure returns (euint64) {
        return TFHE.add(currentValue, TFHE.select(condition, addValue, TFHE.asEuint64(0)));
    }
    
    /**
     * @dev Calculate weighted risk score based on multiple conditions
     */
    function calculateWeightedRisk(
        euint64[] memory values,
        euint64[] memory thresholds,
        euint64[] memory weights
    ) internal pure returns (euint64) {
        require(values.length == thresholds.length, "Array length mismatch");
        require(values.length == weights.length, "Array length mismatch");
        
        euint64 totalRisk = TFHE.asEuint64(0);
        
        for (uint256 i = 0; i < values.length; i++) {
            ebool exceedsThreshold = TFHE.gt(values[i], thresholds[i]);
            totalRisk = TFHE.add(totalRisk, TFHE.select(exceedsThreshold, weights[i], TFHE.asEuint64(0)));
        }
        
        return totalRisk;
    }
    
    /**
     * @dev Check if encrypted value is within range
     */
    function isInRange(
        euint64 value,
        euint64 lowerBound,
        euint64 upperBound
    ) internal pure returns (ebool) {
        ebool greaterThanLower = TFHE.gt(value, lowerBound);
        ebool lessThanUpper = TFHE.lt(value, upperBound);
        return TFHE.and(greaterThanLower, lessThanUpper);
    }
}
