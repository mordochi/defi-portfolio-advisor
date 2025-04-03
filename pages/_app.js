import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState(null);

  // Function to refresh network information
  const refreshNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Create a new provider instance to ensure we get fresh network info
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethProvider);
        
        // Get updated network information
        const network = await ethProvider.getNetwork();
        setNetwork(network);
        
        // Verify account connection is still valid
        const accounts = await ethProvider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address);
          setWalletConnected(true);
        }
        
        return network;
      } catch (error) {
        console.error("Error refreshing network:", error);
        // Don't throw the error, just return null
      }
    }
    return null;
  };

  // Initialize and save provider as global state
  useEffect(() => {
    const initWeb3 = async () => {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Request account access
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethProvider);
          
          // Check if already connected
          const accounts = await ethProvider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].address);
            setWalletConnected(true);
            
            // Get network information
            const network = await ethProvider.getNetwork();
            setNetwork(network);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setWalletAddress(accounts[0]);
              setWalletConnected(true);
              
              // Update network when accounts change
              ethProvider.getNetwork().then(network => setNetwork(network));
            } else {
              setWalletAddress('');
              setWalletConnected(false);
              setNetwork(null);
            }
          });
          
          // Listen for network changes
          window.ethereum.on('chainChanged', async () => {
            try {
              // Create a new provider when the chain changes
              const newProvider = new ethers.BrowserProvider(window.ethereum);
              setProvider(newProvider);
              
              // Get the new network information
              const newNetwork = await newProvider.getNetwork();
              setNetwork(newNetwork);
              
              // Re-check accounts
              const accounts = await newProvider.listAccounts();
              if (accounts.length > 0) {
                setWalletAddress(accounts[0].address);
              }
            } catch (error) {
              console.error("Error handling chain change:", error);
            }
          });
        } catch (error) {
          console.error("Error initializing web3", error);
        }
      }
    };

    initWeb3();
  }, []);

  return (
    <SessionProvider session={session}>
      <Component 
        {...pageProps} 
        walletConnected={walletConnected} 
        walletAddress={walletAddress} 
        provider={provider}
        network={network}
        refreshNetwork={refreshNetwork}
        setWalletConnected={setWalletConnected}
        setWalletAddress={setWalletAddress}
      />
    </SessionProvider>
  );
}

export default MyApp;
