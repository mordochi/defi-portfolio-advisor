import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import styles from '../styles/Home.module.css';
import WalletConnect from '../components/WalletConnect';
import AssetDisplay from '../components/AssetDisplay';
import StrategyRecommendation from '../components/StrategyRecommendation';
import LoadingState from '../components/LoadingState';
import WalletConnectingState from '../components/WalletConnectingState';
import NetworkSwitch from '../components/NetworkSwitch';
import { checkDebankAddress, checkCommonTokens } from '../utils/tokenUtils';

export default function Home({ 
  walletConnected, 
  walletAddress, 
  provider,
  network,
  refreshNetwork,
  setWalletConnected,
  setWalletAddress 
}) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState([]);
  const [loadingStrategies, setLoadingStrategies] = useState(true); // Start with loading state true
  const [activeStep, setActiveStep] = useState(0);
  
  // Steps for the portfolio advisor process
  const steps = [
    "Connect your wallet",
    "Analyzing assets",
    "Discovering DeFi opportunities",
    "Generating strategies"
  ];

  // Function to fetch assets
  const fetchAssets = async () => {
    if (walletConnected && provider) {
      setLoading(true);
      setActiveStep(1);
      try {
        let assetList = [];
        
        // Get network information to determine which chain we're on
        let networkInfo;
        let chainId;
        
        // Add a small delay to ensure network change is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          // Create a fresh provider to ensure we get the latest network state
          if (typeof window !== 'undefined' && window.ethereum) {
            const freshProvider = new ethers.BrowserProvider(window.ethereum);
            networkInfo = await freshProvider.getNetwork();
            chainId = networkInfo.chainId;
          } else if (network) {
            // Use the network from props if available
            networkInfo = network;
            chainId = network.chainId;
          } else {
            // Try to get network info from the current provider as a last resort
            networkInfo = await provider.getNetwork();
            chainId = networkInfo.chainId;
          }
        } catch (networkError) {
          console.error("Error getting network info:", networkError);
          
          // If we can't get the network info, try to refresh the provider
          if (refreshNetwork) {
            try {
              // Add another delay before refreshing network
              await new Promise(resolve => setTimeout(resolve, 500));
              const refreshedNetwork = await refreshNetwork();
              if (refreshedNetwork) {
                networkInfo = refreshedNetwork;
                chainId = refreshedNetwork.chainId;
              } else {
                // Default to Ethereum mainnet if we can't get network info
                chainId = 1;
              }
            } catch (refreshError) {
              console.error("Error refreshing network:", refreshError);
              chainId = 1; // Default to Ethereum mainnet
            }
          } else {
            // Default to Ethereum mainnet if we can't get network info
            chainId = 1;
          }
        }
        
        // Option 1: Check connected wallet for common tokens based on the network
        assetList = await checkCommonTokens(provider, walletAddress, chainId);
        
        // Option 2: Check the specific DeBank address
        // Uncomment the line below to check the DeBank address instead of the connected wallet
        // assetList = await checkDebankAddress(provider, '0x50504Ab483C9BDE3af9700B5fe77a860D81B3E4f', chainId);
        
        setAssets(assetList);
        return assetList;
      } catch (error) {
        console.error("Error fetching assets:", error);
        // Return empty array if there's an error
        return [];
      } finally {
        setLoading(false);
      }
    }
    return [];
  };
  
  // Handle network change
  const handleNetworkChange = async () => {
    setLoading(true);
    setActiveStep(1);
    setStrategies([]); // Clear strategies immediately
    
    try {
      // Add a longer delay before refreshing to allow the network change to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a fresh provider
      let newProvider;
      let newNetwork;
      
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          newProvider = new ethers.BrowserProvider(window.ethereum);
          // Get the new network information
          newNetwork = await newProvider.getNetwork();
        } catch (error) {
          console.log("Error creating new provider, trying refreshNetwork", error);
        }
      }
      
      // If direct provider creation failed, try refreshNetwork
      if (!newNetwork && refreshNetwork) {
        newNetwork = await refreshNetwork();
      }
      
      // Only proceed if we successfully got the new network
      if (newNetwork) {
        // Wait a bit more to ensure stability
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch assets for the new network
        try {
          const assetList = await fetchAssets();
          
          // Generate strategies for the new network
          if (assetList && assetList.length > 0) {
            setActiveStep(3);
            generateStrategies(assetList);
          } else {
            setActiveStep(0);
          }
        } catch (fetchError) {
          console.error("Error fetching assets after network change:", fetchError);
          setActiveStep(0);
        }
      } else {
        // If we couldn't get the network, clear strategies
        setActiveStep(0);
      }
    } catch (error) {
      console.error("Error handling network change:", error);
      // Reset UI state on error
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };
  
  // No need for a separate useEffect to set loading state since it's true by default

  // Fetch assets when wallet is connected
  useEffect(() => {
    const initAssets = async () => {
      if (walletConnected && provider) {
        try {
          const assetList = await fetchAssets();
          
          setActiveStep(2);
          
          // Now we fetch DeFi protocols and generate strategies
          setTimeout(() => {
            // No need to set loading state again as it's already set
            setActiveStep(3);
            generateStrategies(assetList);
          }, 2000);
        } catch (error) {
          console.error("Error initializing assets:", error);
          setLoadingStrategies(false);
        }
      }
    };
    
    initAssets();
  }, [walletConnected, walletAddress, provider]);
  
  // Add event listener for network changes
  useEffect(() => {
    // Only add the listener if we have access to ethereum
    if (typeof window !== 'undefined' && window.ethereum) {
      // Define the handler for network changes
      const handleChainChanged = (chainId) => {
        console.log(`Network changed to chain ID: ${chainId}, refreshing assets...`);
        // Clear current state immediately
        setAssets([]);
        setStrategies([]);
        
        // Wait a moment before handling the change
        setTimeout(() => {
          handleNetworkChange();
        }, 1000);
      };
      
      // Add the event listener
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Clean up the listener when the component unmounts
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider, walletConnected]);
  
  // Generate strategies based on user's assets
  const generateStrategies = async (assetList) => {
    if (assetList.length === 0) return;
    
    setLoadingStrategies(true);
    setActiveStep(3); // Set to 'Generating strategies' step
    try {
      // Make API call to get job_id
      const response = await fetch('/api/generate-strategy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assets: assetList }),
        });
        
        if (!response.ok) throw new Error('Failed to generate strategies');
        
        const data = await response.json();
        
        // Check if we have a job_id in the response
        if (data.job_id) {
          console.log(`Job ID received: ${data.job_id}. Starting polling...`);
          
          // Set a message to show user that we're processing
          setStrategies([{ name: 'Processing your request...', description: 'Please wait while we analyze your portfolio and generate strategies.' }]);
          
          // Use a more reliable polling approach with async/await and setTimeout
          const pollJobStatus = async (jobId) => {
            let jobComplete = false;
            let attempts = 0;
            const maxAttempts = 30; // Maximum number of polling attempts
            const baseInterval = 1000; // Start with 1 second
            const maxInterval = 30000; // Cap at 30 seconds
            let timeoutId = null; // To keep track of the timeout
            
            // Define the polling function
            const poll = async () => {
              if (jobComplete || attempts >= maxAttempts) {
                // Clear any pending timeouts to ensure polling stops completely
                if (timeoutId) {
                  clearTimeout(timeoutId);
                  timeoutId = null;
                }
                return;
              }
              
              attempts++;
              // Calculate exponential backoff with a small amount of jitter
              const exponentialInterval = Math.min(baseInterval * Math.pow(1.5, attempts - 1), maxInterval);
              const jitter = Math.random() * 0.3 * exponentialInterval; // Add up to 30% jitter
              const pollInterval = Math.floor(exponentialInterval + jitter);
              
              console.log(`Waiting ${pollInterval}ms before polling attempt ${attempts}`);
              
              try {
                const statusResponse = await fetch(`/api/crawl-status/${jobId}`);
                
                if (!statusResponse.ok) {
                  console.error(`Failed to fetch job status: ${statusResponse.status}`);
                  // Schedule next poll
                  if (!jobComplete) { // Double-check to prevent race conditions
                    timeoutId = setTimeout(poll, pollInterval);
                  }
                  return;
                }
                
                const statusData = await statusResponse.json();
                console.log(`Polling attempt ${attempts}:`, statusData);
                
                // Check if job is complete
                if (statusData.status === 'completed') {
                  console.log('Job completed successfully');
                  // Check if strategies exist in the response
                  if (statusData.strategies && Array.isArray(statusData.strategies)) {
                    console.log('Strategies found in response:', statusData.strategies.length);
                    setStrategies(statusData.strategies);
                  } else if (statusData.data && Array.isArray(statusData.data)) {
                    // Try to find strategies in data field
                    console.log('Strategies found in data field:', statusData.data.length);
                    setStrategies(statusData.data);
                  } else {
                    console.log('No strategies found in response, using empty array');
                    setStrategies([]);
                  }
                  
                  setLoadingStrategies(false); // Remove loading state
                  jobComplete = true;
                  // Clear any pending timeouts
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                  }
                  return; // Exit polling loop
                } else if (statusData.status === 'failed') {
                  console.error('Job processing failed');
                  setLoadingStrategies(false); // Remove loading state even on failure
                  setStrategies([{ 
                    name: 'Strategy generation failed', 
                    description: 'The backend service reported a failure. Please try again later.', 
                    risk: 'Medium' 
                  }]);
                  jobComplete = true;
                  // Clear any pending timeouts
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                  }
                  return; // Exit polling loop
                } else {
                  // Job still in progress, continue polling
                  if (!jobComplete) { // Double-check to prevent race conditions
                    timeoutId = setTimeout(poll, pollInterval);
                  }
                }
              } catch (pollError) {
                console.error('Error polling job status:', pollError);
                // Even on error, continue polling until max attempts
                if (!jobComplete) { // Double-check to prevent race conditions
                  timeoutId = setTimeout(poll, pollInterval);
                }
              }
            };
            
            // Start the first poll immediately
            await poll();
            
            // If we've reached max attempts without completion
            if (!jobComplete && attempts >= maxAttempts) {
              console.error('Job polling timed out');
              setLoadingStrategies(false); // Ensure loading state is removed on timeout
              setStrategies([{ 
                name: 'Request timed out', 
                description: 'The strategy generation process took too long. Please try again later.', 
                risk: 'Medium' 
              }]);
            }
          };
          
          // Start polling
          await pollJobStatus(data.job_id);
        } else {
          // If no job_id, assume strategies are directly in the response
          setStrategies(data.strategies || []);
        }
    } catch (error) {
      console.error("Error generating strategies:", error);
      // Display a user-friendly error message
      setStrategies([{ 
        name: 'Error generating strategies', 
        description: `We encountered an error: ${error.message}. Please try again later.`,
        risk: 'Medium'
      }]);
    } finally {
      setLoadingStrategies(false);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>DeFi Portfolio Advisor</title>
        <meta name="description" content="AI-powered DeFi portfolio strategy advisor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>
            DeFi Portfolio Advisor
          </h1>
          {walletConnected && (
            <div className={styles.networkSwitchWrapper}>
              <NetworkSwitch 
                network={network} 
                provider={provider} 
                onNetworkChange={handleNetworkChange} 
              />
            </div>
          )}
        </div>
        
        <div 
          className={styles.stepIndicator}
          style={{ '--active-step-index': activeStep }}
        >
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`${styles.step} ${activeStep >= index ? styles.activeStep : ''} ${activeStep === index ? styles.currentStep : ''}`}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepLabel}>{step}</div>
              {activeStep === index && <div className={styles.currentStepIndicator}>Current</div>}
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          {!walletConnected ? (
            <WalletConnect 
              walletConnected={walletConnected}
              setWalletConnected={setWalletConnected}
              setWalletAddress={setWalletAddress}
              provider={provider}
              network={network}
            />
          ) : (
            <>
              {loading ? (
                activeStep === 1 ? (
                  <WalletConnectingState />
                ) : (
                  <LoadingState step={activeStep} />
                )
              ) : (
                <AssetDisplay assets={assets} network={network} />
              )}
              <StrategyRecommendation strategies={strategies} isLoading={loadingStrategies} />
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/yourusername/defi-portfolio-advisor"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by AI & Blockchain
        </a>
      </footer>
    </div>
  );
}
