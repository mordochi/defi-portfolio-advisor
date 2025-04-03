import { ethers } from 'ethers';

// Standard ERC20 ABI for token interactions
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint amount)"
];

/**
 * Get the ETH balance for a given address
 * @param {Object} provider - Ethers provider
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} - ETH balance information
 */
export async function getEthBalance(provider, address) {
  try {
    const balance = await provider.getBalance(address);
    // In a production app, you would fetch the current ETH price
    const ethPrice = await getEthPrice();
    
    return {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: ethers.formatEther(balance),
      value: parseFloat(ethers.formatEther(balance)) * ethPrice,
      address: 'native',
      decimals: 18
    };
  } catch (error) {
    console.error("Error getting ETH balance:", error);
    throw error;
  }
}

/**
 * Get the token balance for a specific ERC20 token
 * @param {Object} provider - Ethers provider
 * @param {string} tokenAddress - Token contract address
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<Object>} - Token balance information
 */
export async function getTokenBalance(provider, tokenAddress, walletAddress) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Get token details and balance
    const [name, symbol, decimals, balance] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.balanceOf(walletAddress)
    ]);
    
    // Format balance according to token decimals
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    // In a production app, you would fetch the current token price
    const tokenPrice = await getTokenPrice(tokenAddress);
    
    return {
      symbol,
      name,
      balance: formattedBalance,
      value: parseFloat(formattedBalance) * tokenPrice,
      address: tokenAddress,
      decimals
    };
  } catch (error) {
    console.error(`Error getting token balance for ${tokenAddress}:`, error);
    return {
      symbol: 'Unknown',
      name: 'Unknown Token',
      balance: '0',
      value: 0,
      address: tokenAddress,
      decimals: 18,
      error: error.message
    };
  }
}

/**
 * Get all token balances for a wallet
 * @param {Object} provider - Ethers provider
 * @param {string} walletAddress - Wallet address
 * @param {Array} tokenList - List of token addresses to check (optional)
 * @returns {Promise<Array>} - Array of token balances
 */
export async function getAllTokenBalances(provider, walletAddress, tokenList = []) {
  try {
    // Start with ETH balance
    const ethBalance = await getEthBalance(provider, walletAddress);
    const assets = [ethBalance];
    
    // If a token list is provided, get balances for each token
    if (tokenList.length > 0) {
      const tokenPromises = tokenList.map(tokenAddress => 
        getTokenBalance(provider, tokenAddress, walletAddress)
      );
      
      const tokenBalances = await Promise.all(tokenPromises);
      
      // Filter out tokens with zero balance
      const nonZeroBalances = tokenBalances.filter(token => 
        parseFloat(token.balance) > 0
      );
      
      assets.push(...nonZeroBalances);
    }
    
    return assets;
  } catch (error) {
    console.error("Error getting all token balances:", error);
    throw error;
  }
}

/**
 * Get current ETH price in USD
 * @returns {Promise<number>} - ETH price in USD
 */
export async function getEthPrice() {
  try {
    // In a production app, you would use a price API like CoinGecko
    // Example:
    // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    // const data = await response.json();
    // return data.ethereum.usd;
    
    // For demo purposes, we'll return a fixed price
    return 3500;
  } catch (error) {
    console.error("Error getting ETH price:", error);
    return 3500; // Fallback price
  }
}

/**
 * Get token price in USD
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<number>} - Token price in USD
 */
export async function getTokenPrice(tokenAddress) {
  try {
    // In a production app, you would use a price API
    // For demo purposes, we'll return some fixed prices for common tokens
    const tokenPrices = {
      '0x6b175474e89094c44da98b954eedeac495271d0f': 1.0, // DAI
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1.0, // USDC
      '0xdac17f958d2ee523a2206206994597c13d831ec7': 1.0, // USDT
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 65000, // WBTC
      '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 200 // AAVE
    };
    
    return tokenPrices[tokenAddress.toLowerCase()] || 0;
  } catch (error) {
    console.error(`Error getting price for token ${tokenAddress}:`, error);
    return 0;
  }
}
