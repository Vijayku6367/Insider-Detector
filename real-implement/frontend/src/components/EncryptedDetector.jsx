import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FhenixClient } from '@fhenixprotocol/client';
import './EncryptedDetector.css';

const EncryptedDetector = ({ contractAddress, abi }) => {
    const [metrics, setMetrics] = useState({
        volumeSpike: 42,
        timeCluster: 18,
        velocityChange: 27
    });
    
    const [encryptedMetrics, setEncryptedMetrics] = useState(null);
    const [detectionResult, setDetectionResult] = useState(null);
    const [riskScore, setRiskScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [fheClient, setFheClient] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);

    // Initialize FHE client and contract
    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                try {
                    // Request account access
                    const accounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    setAccount(accounts[0]);
                    
                    // Initialize provider
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    
                    // Initialize FHE client
                    const client = new FhenixClient({ provider });
                    await client.init();
                    setFheClient(client);
                    
                    // Initialize contract
                    const detectorContract = new ethers.Contract(
                        contractAddress,
                        abi,
                        signer
                    );
                    setContract(detectorContract);
                    
                } catch (error) {
                    console.error('Initialization error:', error);
                }
            }
        };
        
        init();
    }, [contractAddress, abi]);

    // Handle metric changes
    const handleMetricChange = (metric, value) => {
        setMetrics(prev => ({
            ...prev,
            [metric]: parseInt(value)
        }));
    };

    // Encrypt metrics locally using FHE
    const encryptMetrics = async () => {
        if (!fheClient) {
            console.error('FHE client not initialized');
            return;
        }
        
        try {
            setIsLoading(true);
            
            // Encrypt each metric using FHE
            const encryptedVolume = await fheClient.encrypt(metrics.volumeSpike, 'uint64');
            const encryptedTime = await fheClient.encrypt(metrics.timeCluster, 'uint64');
            const encryptedVelocity = await fheClient.encrypt(metrics.velocityChange, 'uint64');
            
            setEncryptedMetrics({
                volume: encryptedVolume,
                time: encryptedTime,
                velocity: encryptedVelocity
            });
            
            // Submit to contract
            await submitToContract(encryptedVolume, encryptedTime, encryptedVelocity);
            
        } catch (error) {
            console.error('Encryption error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Submit encrypted metrics to contract
    const submitToContract = async (encryptedVolume, encryptedTime, encryptedVelocity) => {
        if (!contract) {
            console.error('Contract not initialized');
            return;
        }
        
        try {
            const tx = await contract.submitEncryptedMetrics(
                encryptedVolume,
                encryptedTime,
                encryptedVelocity
            );
            await tx.wait();
            
            console.log('Metrics submitted successfully');
            
        } catch (error) {
            console.error('Submission error:', error);
        }
    };

    // Run encrypted detection
    const runDetection = async () => {
        if (!contract || !fheClient) {
            console.error('Contract or FHE client not initialized');
            return;
        }
        
        try {
            setIsLoading(true);
            
            // Run detection on contract
            const tx = await contract.runEncryptedDetection();
            await tx.wait();
            
            // Get encrypted result
            const encryptedResult = await contract.getEncryptedResult();
            const encryptedRisk = await contract.getEncryptedRiskScore();
            
            // Decrypt locally
            const result = await fheClient.decrypt(encryptedResult, 'bool');
            const risk = await fheClient.decrypt(encryptedRisk, 'uint64');
            
            setDetectionResult(result);
            setRiskScore(Number(risk));
            
        } catch (error) {
            console.error('Detection error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="encrypted-detector">
            <div className="detector-header">
                <h1>🕵️‍♂️ Encrypted Insider-Trading Detector</h1>
                <p className="subtitle">Real FHEVM Implementation</p>
                {account && (
                    <div className="wallet-info">
                        <span>Connected: </span>
                        <code>{account.slice(0, 10)}...{account.slice(-8)}</code>
                    </div>
                )}
            </div>

            <div className="detector-body">
                {/* Metrics Input Section */}
                <div className="metrics-section">
                    <h2>Trading Metrics</h2>
                    <div className="metrics-input">
                        {Object.entries(metrics).map(([key, value]) => (
                            <div key={key} className="metric-input">
                                <label htmlFor={key}>
                                    {key.replace(/([A-Z])/g, ' $1')}
                                </label>
                                <input
                                    type="range"
                                    id={key}
                                    min="0"
                                    max="100"
                                    value={value}
                                    onChange={(e) => handleMetricChange(key, e.target.value)}
                                />
                                <span className="metric-value">{value}</span>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={encryptMetrics}
                        disabled={!fheClient || isLoading}
                        className="encrypt-btn"
                    >
                        {isLoading ? 'Encrypting...' : 'Encrypt & Submit Metrics'}
                    </button>
                    
                    {encryptedMetrics && (
                        <div className="encrypted-status">
                            <h3>Encrypted Metrics Ready</h3>
                            <div className="encrypted-values">
                                <div className="encrypted-value">
                                    <span>Volume Spike: </span>
                                    <code>{encryptedMetrics.volume.slice(0, 30)}...</code>
                                </div>
                                <div className="encrypted-value">
                                    <span>Time Cluster: </span>
                                    <code>{encryptedMetrics.time.slice(0, 30)}...</code>
                                </div>
                                <div className="encrypted-value">
                                    <span>Velocity Change: </span>
                                    <code>{encryptedMetrics.velocity.slice(0, 30)}...</code>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detection Section */}
                <div className="detection-section">
                    <h2>Encrypted Detection</h2>
                    
                    <div className="detection-rules">
                        <h3>Encrypted Rules</h3>
                        <ul>
                            <li>IF volumeSpike > 50 → +40 risk</li>
                            <li>IF timeCluster > 30 → +35 risk</li>
                            <li>IF velocityChange > 20 → +25 risk</li>
                        </ul>
                    </div>
                    
                    <button 
                        onClick={runDetection}
                        disabled={!encryptedMetrics || isLoading || !contract}
                        className="detect-btn"
                    >
                        {isLoading ? 'Processing...' : 'Run Encrypted Detection'}
                    </button>
                    
                    {/* Results Display */}
                    {detectionResult !== null && (
                        <div className="results-section">
                            <h3>Detection Results</h3>
                            
                            <div className="risk-meter">
                                <div className="meter-labels">
                                    <span>0</span>
                                    <span>25</span>
                                    <span>50</span>
                                    <span>75</span>
                                    <span>100</span>
                                </div>
                                <div className="meter-bar">
                                    <div 
                                        className="meter-fill"
                                        style={{ width: `${Math.min(riskScore, 100)}%` }}
                                    />
                                </div>
                                <div className="risk-score">
                                    Risk Score: <strong>{riskScore}</strong>/100
                                </div>
                            </div>
                            
                            <div className={`final-result ${detectionResult ? 'suspicious' : 'safe'}`}>
                                <h4>
                                    {detectionResult 
                                        ? '🚨 SUSPICIOUS ACTIVITY DETECTED' 
                                        : '✅ No Suspicious Activity'
                                    }
                                </h4>
                                <p>
                                    {detectionResult 
                                        ? `Risk score (${riskScore}) exceeds threshold (50)`
                                        : `Risk score (${riskScore}) is below threshold (50)`
                                    }
                                </p>
                            </div>
                            
                            <div className="result-details">
                                <div className="detail">
                                    <span>Privacy Level:</span>
                                    <strong>End-to-End Encrypted</strong>
                                </div>
                                <div className="detail">
                                    <span>Computation:</span>
                                    <strong>On-Chain FHE Operations</strong>
                                </div>
                                <div className="detail">
                                    <span>Data Visibility:</span>
                                    <strong>Zero Knowledge</strong>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Panel */}
            <div className="status-panel">
                <h3>System Status</h3>
                <div className="status-items">
                    <div className={`status-item ${fheClient ? 'active' : 'inactive'}`}>
                        <span className="status-dot" />
                        <span>FHE Client: {fheClient ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <div className={`status-item ${contract ? 'active' : 'inactive'}`}>
                        <span className="status-dot" />
                        <span>Smart Contract: {contract ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <div className={`status-item ${encryptedMetrics ? 'active' : 'inactive'}`}>
                        <span className="status-dot" />
                        <span>Metrics: {encryptedMetrics ? 'Encrypted' : 'Plain Text'}</span>
                    </div>
                    <div className={`status-item ${detectionResult !== null ? 'active' : 'inactive'}`}>
                        <span className="status-dot" />
                        <span>Detection: {detectionResult !== null ? 'Complete' : 'Pending'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EncryptedDetector;
