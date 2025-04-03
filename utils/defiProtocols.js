import axios from 'axios';

/**
 * Fetch DeFi protocols from DefiLlama API
 * @returns {Promise<Array>} - Array of DeFi protocols
 */
export async function fetchDefiProtocols() {
  try {
    const response = await axios.get('https://api.llama.fi/protocols');
    
    // Process and filter the data to get relevant protocols
    const filteredProtocols = response.data
      .filter(protocol => protocol.tvl > 100000000) // Only protocols with >$100M TVL
      .map(protocol => ({
        name: protocol.name,
        category: protocol.category,
        tvl: protocol.tvl,
        chains: protocol.chains,
        url: protocol.url,
        description: protocol.description || '',
        logo: protocol.logo,
        twitter: protocol.twitter || null,
        audit_links: protocol.audit_links || [],
        listedAt: protocol.listedAt
      }))
      .slice(0, 50); // Take top 50 protocols
      
    return filteredProtocols;
  } catch (error) {
    console.error('Error fetching DeFi protocols:', error);
    // Return an empty array instead of sample data
    return [];
  }
}

/**
 * Get APY data for a specific protocol
 * @param {string} protocolName - Name of the protocol
 * @returns {Promise<Object>} - APY data for the protocol
 */
export async function getProtocolAPY(protocolName) {
  try {
    // In a production app, you would fetch APY data from an API
    // For demo purposes, we'll return some sample APY data
    const apyData = {
      'Aave': {
        supplyAPY: {
          'USDC': 3.2,
          'DAI': 3.1,
          'ETH': 1.5,
          'WBTC': 1.2
        },
        borrowAPY: {
          'USDC': 4.5,
          'DAI': 4.3,
          'ETH': 2.8,
          'WBTC': 2.5
        }
      },
      'Compound': {
        supplyAPY: {
          'USDC': 2.7,
          'DAI': 2.6,
          'ETH': 1.3,
          'WBTC': 1.0
        },
        borrowAPY: {
          'USDC': 3.9,
          'DAI': 3.8,
          'ETH': 2.5,
          'WBTC': 2.2
        }
      },
      'Uniswap': {
        pairs: {
          'ETH-USDC': 8.5,
          'ETH-DAI': 7.8,
          'WBTC-ETH': 6.2,
          'ETH-USDT': 8.2
        }
      },
      'Curve': {
        pools: {
          '3pool': 4.5,
          'stETH': 5.8,
          'tricrypto': 9.2
        }
      },
      'Lido': {
        staking: {
          'ETH': 3.8
        }
      }
    };
    
    return apyData[protocolName] || { average: 5.0 };
  } catch (error) {
    console.error(`Error getting APY data for ${protocolName}:`, error);
    return { average: 5.0 };
  }
}

/**
 * Calculate suitable strategies based on user assets and available protocols
 * @param {Array} assets - User's assets
 * @param {Array} protocols - Available DeFi protocols
 * @returns {Array} - Array of recommended strategies
 */
export function calculateStrategies(assets, protocols) {
  // This would typically be an AI-generated strategy
  // For demo purposes, we'll return some sample strategies
  
  // Check if user has stablecoins
  const hasStables = assets.some(asset => 
    ['USDC', 'DAI', 'USDT', 'BUSD'].includes(asset.symbol)
  );
  
  // Check if user has ETH
  const hasETH = assets.some(asset => 
    ['ETH', 'WETH'].includes(asset.symbol)
  );
  
  // Check if user has BTC
  const hasBTC = assets.some(asset => 
    ['BTC', 'WBTC'].includes(asset.symbol)
  );
  
  // Calculate total portfolio value
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  const strategies = [];
  
  // Conservative strategy
  strategies.push({
    name: "Stable Yield Farming",
    description: hasStables 
      ? "Utilize your stablecoins in lending platforms like Aave or Compound for stable yields."
      : "Convert 30% of your assets to stablecoins and deposit them in lending platforms.",
    expectedAPY: "3-5%",
    risk: "Low",
    platforms: ["Aave", "Compound"],
    suitability: hasStables ? "High" : "Medium",
    allocation: {
      "Stablecoins": "70%",
      "ETH": "20%",
      "Other": "10%"
    }
  });
  
  // Moderate strategy
  strategies.push({
    name: "Liquidity Provision",
    description: hasETH
      ? "Provide liquidity with your ETH paired with stablecoins on Uniswap or Curve."
      : "Convert some assets to ETH and provide liquidity on DEXes.",
    expectedAPY: "8-15%",
    risk: "Medium",
    platforms: ["Uniswap", "Curve", "Balancer"],
    suitability: hasETH ? "High" : "Medium",
    allocation: {
      "Liquidity Pairs": "50%",
      "Stablecoins": "30%",
      "Other": "20%"
    }
  });
  
  // Growth strategy
  strategies.push({
    name: hasETH ? "ETH Staking" : "Yield Farming",
    description: hasETH
      ? "Stake your ETH directly or through liquid staking derivatives like Lido."
      : "Engage in yield farming across multiple protocols for higher returns.",
    expectedAPY: hasETH ? "3.5-4.5%" : "10-25%",
    risk: hasETH ? "Low-Medium" : "High",
    platforms: hasETH ? ["Lido", "Rocket Pool"] : ["Yearn", "Convex", "Harvest"],
    suitability: hasETH ? "High" : "Medium",
    allocation: hasETH
      ? {
          "Staked ETH": "70%",
          "Stablecoins": "20%",
          "Other": "10%"
        }
      : {
          "Yield Farms": "60%",
          "Stablecoins": "25%",
          "ETH": "15%"
        }
  });
  
  return strategies;
}

/**
 * Get sample DeFi protocols for demonstration
 * @returns {Array} - Array of sample DeFi protocols
 */
function getSampleProtocols() {
  return [
    { 
      name: 'Aave', 
      category: 'Lending', 
      tvl: 6100000000, 
      chains: ['Ethereum', 'Polygon', 'Avalanche'],
      url: 'https://aave.com',
      description: 'Decentralized non-custodial liquidity protocol where users can participate as depositors or borrowers.',
      logo: 'https://defillama.com/icons/aave.webp'
    },
    { 
      name: 'Curve', 
      category: 'DEX', 
      tvl: 1900000000, 
      chains: ['Ethereum', 'Polygon', 'Fantom'],
      url: 'https://curve.fi',
      description: 'Exchange liquidity pool designed for extremely efficient stablecoin trading.',
      logo: 'https://defillama.com/icons/curve.webp'
    },
    { 
      name: 'Uniswap', 
      category: 'DEX', 
      tvl: 5800000000, 
      chains: ['Ethereum', 'Polygon', 'Arbitrum'],
      url: 'https://uniswap.org',
      description: 'Decentralized trading protocol known for its role in facilitating automated trading.',
      logo: 'https://defillama.com/icons/uniswap.webp'
    },
    { 
      name: 'Compound', 
      category: 'Lending', 
      tvl: 2400000000, 
      chains: ['Ethereum'],
      url: 'https://compound.finance',
      description: 'Algorithmic, autonomous interest rate protocol built for developers.',
      logo: 'https://defillama.com/icons/compound.webp'
    },
    { 
      name: 'Lido', 
      category: 'Staking', 
      tvl: 14200000000, 
      chains: ['Ethereum'],
      url: 'https://lido.fi',
      description: 'Liquid staking solution for Ethereum and other PoS blockchains.',
      logo: 'https://defillama.com/icons/lido.webp'
    }
  ];
}
