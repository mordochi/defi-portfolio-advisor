import { useState } from 'react';
import styles from '../styles/Components.module.css';
import { ethers } from 'ethers';

export default function WalletConnect({ 
  walletConnected, 
  setWalletConnected, 
  setWalletAddress,
  provider 
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
      }

      const ethProvider = provider || new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await ethProvider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      } else {
        throw new Error('No accounts found. Please make sure MetaMask is configured correctly.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className={styles.walletConnectContainer}>
      <div className={styles.card}>
        <h2>Connect Your Wallet</h2>
        <p>Connect your MetaMask wallet to get personalized DeFi portfolio recommendations</p>
        
        <div className={styles.buttonContainer}>
          <button 
            className={styles.connectButton} 
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.walletInfo}>
          <h3>Why connect your wallet?</h3>
          <ul>
            <li>Get accurate asset analysis tailored to your portfolio</li>
            <li>Receive personalized DeFi strategy recommendations</li>
            <li>Monitor your portfolio performance over time</li>
          </ul>
          <p className={styles.privacyNote}>
            <strong>Privacy note:</strong> We only read your public address and asset information. 
            We never request transaction approval or access to your private keys.
          </p>
        </div>
      </div>
    </div>
  );
}
