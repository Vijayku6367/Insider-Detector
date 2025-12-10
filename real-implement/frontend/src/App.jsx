import React from 'react';
import EncryptedDetector from './components/EncryptedDetector';
import './App.css';

// Contract ABI (simplified for example)
const CONTRACT_ABI = [
  "function submitEncryptedMetrics(bytes calldata, bytes calldata, bytes calldata) external",
  "function runEncryptedDetection() external returns (bytes memory)",
  "function getEncryptedResult() external view returns (bytes memory)",
  "function getEncryptedRiskScore() external view returns (bytes memory)",
  "function hasSubmittedMetrics(address) external view returns (bool)",
  "function hasDetectionResult(address) external view returns (bool)",
  "event MetricsSubmitted(address indexed user, bytes32 encryptedDataHash)",
  "event DetectionCompleted(address indexed user, bytes32 resultHash)"
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x...";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>FHEVM Insider Trading Detection</h1>
          <p className="tagline">Fully Private Encrypted Computation on Blockchain</p>
          
          <div className="privacy-badges">
            <span className="badge">🔐 End-to-End Encrypted</span>
            <span className="badge">🤫 Zero Knowledge</span>
            <span className="badge">⚡ Real-time Detection</span>
            <span className="badge">🔒 On-Chain FHE</span>
          </div>
        </div>
      </header>

      <main>
        <EncryptedDetector 
          contractAddress={CONTRACT_ADDRESS}
          abi={CONTRACT_ABI}
        />
        
        <section className="info-section">
          <div className="info-card">
            <h3>How It Works</h3>
            <ol>
              <li>Encrypt trading metrics locally using FHE</li>
              <li>Submit encrypted data to FHEVM contract</li>
              <li>Contract performs encrypted computations</li>
              <li>Returns encrypted detection result</li>
              <li>Decrypt result locally - only you see it</li>
            </ol>
          </div>
          
          <div className="info-card">
            <h3>Privacy Features</h3>
            <ul>
              <li>Trading data never exposed in plain text</li>
              <li>Detection rules encrypted on-chain</li>
              <li>Results visible only to you</li>
              <li>No centralized data storage</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h3>Technical Stack</h3>
            <ul>
              <li>FHEVM for encrypted computation</li>
              <li>React + Ethers.js frontend</li>
              <li>Solidity smart contracts</li>
              <li>Fhenix FHE library</li>
            </ul>
          </div>
        </section>
      </main>

      <footer>
        <p>🕵️‍♂️ Encrypted Insider-Trading Detector - Real FHEVM Implementation</p>
        <p className="disclaimer">
          Note: This is the real implementation requiring FHEVM toolchain on laptop.
          Demo version available for environments without FHE support.
        </p>
      </footer>
    </div>
  );
}

export default App;
