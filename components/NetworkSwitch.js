import { useState } from 'react';
import styles from '../styles/Components.module.css';

// Network information with chain IDs and metadata
const NETWORKS = [
  {
    name: 'Ethereum Mainnet',
    chainId: '0x1', // 1 in hex
    icon: '🔷',
    rpcUrl: 'https://mainnet.infura.io/v3/${INFURA_ID}',
    currencySymbol: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  {
    name: 'Polygon',
    chainId: '0x89', // 137 in hex
    icon: '🟣',
    rpcUrl: 'https://polygon-rpc.com',
    currencySymbol: 'MATIC',
    blockExplorer: 'https://polygonscan.com'
  },
  {
    name: 'Arbitrum One',
    chainId: '0xA4B1', // 42161 in hex
    icon: '🔵',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    currencySymbol: 'ETH',
    blockExplorer: 'https://arbiscan.io'
  },
  {
    name: 'Optimism',
    chainId: '0xA', // 10 in hex
    icon: '🔴',
    rpcUrl: 'https://mainnet.optimism.io',
    currencySymbol: 'ETH',
    blockExplorer: 'https://optimistic.etherscan.io'
  },
  {
    name: 'BNB Chain',
    chainId: '0x38', // 56 in hex
    icon: '🟡',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    currencySymbol: 'BNB',
    blockExplorer: 'https://bscscan.com'
  },
  {
    name: 'Avalanche',
    chainId: '0xA86A', // 43114 in hex
    icon: '❄️',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    currencySymbol: 'AVAX',
    blockExplorer: 'https://snowtrace.io'
  },
  {
    name: 'Fantom',
    chainId: '0xFA', // 250 in hex
    icon: '👻',
    rpcUrl: 'https://rpc.ftm.tools',
    currencySymbol: 'FTM',
    blockExplorer: 'https://ftmscan.com'
  }
];

export default function NetworkSwitch({ network, provider, onNetworkChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState('');
  
  // Get current network info
  const currentNetwork = network ? 
    NETWORKS.find(n => parseInt(n.chainId, 16) === network.chainId) || 
    { name: network.name || `Chain ID: ${network.chainId}`, icon: '🌐' } : 
    { name: 'Unknown Network', icon: '❓' };

  const switchNetwork = async (networkInfo) => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }
    
    setSwitching(true);
    setError('');
    
    try {
      // Close dropdown before switching to avoid UI issues
      setIsOpen(false);
      
      // Request network switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkInfo.chainId }],
      });
      
      // Add a small delay before triggering onNetworkChange
      // This gives time for the network to fully switch
      setTimeout(() => {
        if (onNetworkChange) {
          onNetworkChange();
        }
      }, 500);
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const infuraId = process.env.NEXT_PUBLIC_INFURA_ID || '';
          const rpcUrl = networkInfo.rpcUrl.replace('${INFURA_ID}', infuraId);
          
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: networkInfo.chainId,
                chainName: networkInfo.name,
                nativeCurrency: {
                  name: networkInfo.currencySymbol,
                  symbol: networkInfo.currencySymbol,
                  decimals: 18,
                },
                rpcUrls: [rpcUrl],
                blockExplorerUrls: [networkInfo.blockExplorer],
              },
            ],
          });
          
          // Chain added successfully
          // Add a small delay before triggering onNetworkChange
          setTimeout(() => {
            if (onNetworkChange) {
              onNetworkChange();
            }
          }, 500);
        } catch (addError) {
          setError(`Error adding network: ${addError.message}`);
        }
      } else {
        setError(`Error switching network: ${switchError.message}`);
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className={styles.networkSwitchContainer}>
      <button 
        className={styles.networkButton} 
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
      >
        <span className={styles.networkIcon}>{currentNetwork.icon}</span>
        <span className={styles.networkName}>{currentNetwork.name}</span>
        <span className={styles.networkDropdownIcon}>▼</span>
      </button>
      
      {isOpen && (
        <div className={styles.networkDropdown}>
          <div className={styles.networkList}>
            {NETWORKS.map((networkInfo) => (
              <div 
                key={networkInfo.chainId}
                className={styles.networkOption}
                onClick={() => switchNetwork(networkInfo)}
              >
                <span className={styles.networkIcon}>{networkInfo.icon}</span>
                <span className={styles.networkOptionName}>{networkInfo.name}</span>
              </div>
            ))}
          </div>
          {error && <div className={styles.networkError}>{error}</div>}
        </div>
      )}
    </div>
  );
}
