import { ethers } from 'ethers';

// Standard ERC20 ABI for balance checking
const ERC20_ABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  // decimals
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  // symbol
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  // name
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  }
];

// Common token addresses on Ethereum mainnet
const COMMON_TOKENS = {
  // Ethereum Mainnet
  1: [
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped BTC' },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'ChainLink Token' },
    { address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', symbol: 'MATIC', name: 'Polygon' },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap' },
    { address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', symbol: 'SHIB', name: 'SHIBA INU' },
  ],
  // Polygon
  137: [
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin (PoS)' },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD (PoS)' },
    { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', symbol: 'DAI', name: 'Dai Stablecoin (PoS)' },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', symbol: 'WETH', name: 'Wrapped Ether' },
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', symbol: 'WMATIC', name: 'Wrapped Matic' },
  ],
  // Arbitrum
  42161: [
    { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', symbol: 'USDC', name: 'USD Coin (Arb1)' },
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether USD (Arb1)' },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', name: 'Dai Stablecoin' },
    { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', symbol: 'WETH', name: 'Wrapped Ether' },
  ],
  // Optimism
  10: [
    { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', symbol: 'USDC', name: 'USD Coin' },
    { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT', name: 'Tether USD' },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI', name: 'Dai Stablecoin' },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether' },
  ],
  // BNB Chain
  56: [
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether USD (BSC)' },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin (BSC)' },
    { address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', symbol: 'DAI', name: 'Dai Stablecoin (BSC)' },
    { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', symbol: 'WBNB', name: 'Wrapped BNB' },
  ],
};

// Function to check specific token balance
export async function getTokenBalance(provider, tokenAddress, walletAddress) {
  try {
    // First check if the contract exists on this network by doing a code check
    const code = await provider.getCode(tokenAddress);
    
    // If there's no code at this address on this network, the token doesn't exist here
    if (code === '0x' || code === '0x0') {
      // Silent fail - token doesn't exist on this network
      return null;
    }
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Use Promise.all to fetch all token data in parallel
    const [balance, decimals, symbol, name] = await Promise.all([
      tokenContract.balanceOf(walletAddress).catch(() => ethers.parseEther('0')),
      tokenContract.decimals().catch(() => 18),
      tokenContract.symbol().catch(() => 'UNKNOWN'),
      tokenContract.name().catch(() => 'Unknown Token')
    ]);
    
    return {
      symbol,
      name,
      balance: ethers.formatUnits(balance, decimals),
      address: tokenAddress
    };
  } catch (error) {
    // Silent fail - don't log errors for tokens that don't exist on this network
    return null;
  }
}

// Function to safely get native token balance
async function getNativeBalance(provider, walletAddress) {
  // Create a fresh provider to ensure we have the latest network state
  let currentProvider = provider;
  
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Create a fresh provider to avoid network change errors
      currentProvider = new ethers.BrowserProvider(window.ethereum);
    }
    
    // Try to get the balance with the fresh provider
    return await currentProvider.getBalance(walletAddress);
  } catch (error) {
    // If that fails, try with the original provider
    try {
      return await provider.getBalance(walletAddress);
    } catch (fallbackError) {
      // If both attempts fail, return zero balance
      console.log('Could not get native balance, returning zero');
      return ethers.parseEther('0');
    }
  }
}

// Function to check a specific wallet address for common tokens based on the network
export async function checkCommonTokens(provider, walletAddress, chainId) {
  const results = [];
  
  // Get native token balance (ETH, MATIC, BNB, etc.)
  try {
    // Add a small delay to ensure network change is complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const nativeBalance = await getNativeBalance(provider, walletAddress);
    let nativeSymbol = 'ETH';
    let nativeName = 'Ethereum';
    
    // Set appropriate native token name based on chain ID
    if (chainId === 137) {
      nativeSymbol = 'MATIC';
      nativeName = 'Polygon';
    } else if (chainId === 56) {
      nativeSymbol = 'BNB';
      nativeName = 'BNB Chain';
    } else if (chainId === 42161 || chainId === 10) {
      nativeSymbol = 'ETH';
      nativeName = 'Ethereum';
    } else if (chainId === 43114) {
      nativeSymbol = 'AVAX';
      nativeName = 'Avalanche';
    } else if (chainId === 250) {
      nativeSymbol = 'FTM';
      nativeName = 'Fantom';
    }
    
    results.push({
      symbol: nativeSymbol,
      name: nativeName,
      balance: ethers.formatEther(nativeBalance),
      address: 'native'
    });
  } catch (error) {
    // Add a placeholder native token with zero balance instead of failing
    let nativeSymbol = 'ETH';
    let nativeName = 'Ethereum';
    
    // Set appropriate native token name based on chain ID
    if (chainId === 137) {
      nativeSymbol = 'MATIC';
      nativeName = 'Polygon';
    } else if (chainId === 56) {
      nativeSymbol = 'BNB';
      nativeName = 'BNB Chain';
    } else if (chainId === 42161 || chainId === 10) {
      nativeSymbol = 'ETH';
      nativeName = 'Ethereum';
    } else if (chainId === 43114) {
      nativeSymbol = 'AVAX';
      nativeName = 'Avalanche';
    } else if (chainId === 250) {
      nativeSymbol = 'FTM';
      nativeName = 'Fantom';
    }
    
    results.push({
      symbol: nativeSymbol,
      name: nativeName,
      balance: '0',
      address: 'native'
    });
    
    console.log('Error fetching native balance, added placeholder with zero balance');
  }
  
  // Only check for tokens that exist on the current network
  const tokensToCheck = COMMON_TOKENS[chainId] || [];
  
  try {
    // Create a fresh provider to ensure we have the latest network state
    let currentProvider = provider;
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        currentProvider = new ethers.BrowserProvider(window.ethereum);
      } catch (error) {
        console.log('Error creating fresh provider for token checks, using original');
      }
    }
    
    // Use Promise.all to check all tokens in parallel, but with error handling
    const tokenPromises = tokensToCheck.map(token => {
      return getTokenBalance(currentProvider, token.address, walletAddress)
        .then(tokenBalance => {
          if (tokenBalance && parseFloat(tokenBalance.balance) > 0) {
            return tokenBalance;
          }
          return null;
        })
        .catch(() => null); // Silently handle errors for individual tokens
    });
    
    // Wait for all token checks to complete with a timeout
    const tokenResults = await Promise.race([
      Promise.all(tokenPromises),
      new Promise(resolve => setTimeout(() => resolve([]), 5000)) // 5 second timeout
    ]);
    
    // Filter out null results and add valid tokens to results
    if (Array.isArray(tokenResults)) {
      tokenResults.filter(result => result !== null).forEach(token => {
        if (token) results.push(token);
      });
    }
  } catch (error) {
    console.log('Error checking tokens, continuing with native token only');
  }
  
  return results;
}

// Function to check a specific wallet address for tokens at specific addresses
export async function checkSpecificTokens(provider, walletAddress, tokenAddresses) {
  const results = [];
  
  for (const tokenAddress of tokenAddresses) {
    if (tokenAddress.toLowerCase() === 'native') {
      // Handle native token (ETH, MATIC, etc.)
      try {
        const nativeBalance = await provider.getBalance(walletAddress);
        results.push({
          symbol: 'ETH', // Default to ETH, would need to adjust based on chain
          name: 'Ethereum',
          balance: ethers.formatEther(nativeBalance),
          address: 'native'
        });
      } catch (error) {
        console.error('Error fetching native balance:', error);
      }
    } else {
      // Handle ERC20 tokens
      try {
        const tokenBalance = await getTokenBalance(provider, tokenAddress, walletAddress);
        if (tokenBalance && parseFloat(tokenBalance.balance) > 0) {
          results.push(tokenBalance);
        }
      } catch (error) {
        console.error(`Error checking token at address ${tokenAddress}:`, error);
      }
    }
  }
  
  return results;
}

// Function to check a specific address from DeBank profile
export async function checkDebankAddress(provider, debankAddress, chainId = 1) {
  return checkCommonTokens(provider, debankAddress, chainId);
}
