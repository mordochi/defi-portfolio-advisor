/**
 * API endpoint to generate explanations for DeFi investment strategies
 * This endpoint uses AI to create detailed explanations for investment strategies
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { strategy, assets } = req.body;

    if (!strategy) {
      return res.status(400).json({ error: 'Strategy is required' });
    }

    // In a production environment, this would call an AI service like OpenAI
    // For now, we'll generate a structured explanation based on the strategy data
    
    // Create a detailed explanation based on the strategy properties
    const explanation = generateExplanation(strategy, assets);
    
    return res.status(200).json({ explanation });
  } catch (error) {
    console.error('Error generating strategy explanation:', error);
    return res.status(500).json({ error: 'Failed to generate explanation' });
  }
}

/**
 * Generate a detailed explanation for a strategy
 * @param {Object} strategy - The strategy object
 * @param {Array} assets - User's assets
 * @returns {String} - Markdown formatted explanation
 */
function generateExplanation(strategy, assets) {
  // Get asset names for personalization
  const assetNames = assets?.map(asset => asset.symbol).join(', ') || 'your assets';
  
  // Generate platform-specific advice
  const platformAdvice = strategy.platforms.map(platform => {
    switch(platform.toLowerCase()) {
      case 'aave':
        return `**Aave**: Deposit your assets to earn interest and potentially use them as collateral`;
      case 'compound':
        return `**Compound**: Supply assets to the protocol to earn COMP tokens on top of the base interest rate`;
      case 'curve':
        return `**Curve**: Provide liquidity to stable pairs for low-risk yields enhanced by CRV rewards`;
      case 'uniswap':
        return `**Uniswap**: Create or join liquidity pools to earn trading fees`;
      case 'lido':
        return `**Lido**: Stake ETH to receive stETH while maintaining liquidity`;
      case 'yearn':
        return `**Yearn Finance**: Deposit into Yearn vaults for automated yield optimization`;
      case 'convex':
        return `**Convex**: Boost your Curve yields by staking LP tokens`;
      case 'gmx':
        return `**GMX**: Provide liquidity to earn fees from leveraged trading`;
      case 'dydx':
        return `**dYdX**: Participate in the liquidity mining program while trading perpetuals`;
      default:
        return `**${platform}**: Integrate this platform into your strategy for diversification`;
    }
  }).join('\n- ');
  
  // Generate risk-specific advice
  let riskAdvice;
  switch(strategy.risk.toLowerCase()) {
    case 'low':
      riskAdvice = `This low-risk strategy focuses on capital preservation. Monitor your positions weekly, but drastic adjustments should rarely be needed.`;
      break;
    case 'medium':
      riskAdvice = `This medium-risk strategy balances growth and safety. Review your positions at least weekly and be prepared to adjust allocations if market conditions change significantly.`;
      break;
    case 'high':
      riskAdvice = `This high-risk strategy aims for maximum growth. Daily monitoring is recommended, and you should be prepared to exit positions quickly if market conditions deteriorate.`;
      break;
    default:
      riskAdvice = `Monitor your positions regularly and adjust based on changing market conditions.`;
  }
  
  // Format allocation advice if available
  let allocationSection = '';
  if (strategy.allocation) {
    const allocationList = Object.entries(strategy.allocation)
      .map(([asset, percentage]) => `- **${asset}**: ${percentage}`)
      .join('\n');
    
    allocationSection = `
### Recommended Allocation
${allocationList}
`;
  }
  
  // Generate steps if not provided
  const implementationSteps = strategy.steps || [
    `Research and connect your wallet to these platforms: ${strategy.platforms.join(', ')}`,
    `Allocate your assets according to the recommended percentages`,
    `Set up regular monitoring and rebalancing intervals`,
    `Stay informed about protocol updates and governance proposals`
  ];
  
  const stepsSection = implementationSteps
    .map((step, index) => `${index + 1}. ${step}`)
    .join('\n');
  
  // Construct the full explanation in markdown format
  return `
## Implementation of ${strategy.name}

This strategy focuses on ${strategy.description.toLowerCase()} It's designed to generate approximately ${strategy.expectedAPY} APY with a ${strategy.risk.toLowerCase()} risk profile.

### Key Platforms
- ${platformAdvice}

### Steps to Implement
${stepsSection}
${allocationSection}
### Risk Management
${riskAdvice}

### Benefits and Risks
- **Benefits**: Potential for ${strategy.expectedAPY} APY, diversification across reputable protocols, exposure to ${strategy.platforms.length > 1 ? 'multiple DeFi ecosystems' : 'a major DeFi ecosystem'}
- **Risks**: ${strategy.risk} risk profile, potential for smart contract vulnerabilities, market volatility, and impermanent loss in liquidity positions

### How This Fits Your Portfolio
This strategy is well-suited for ${assetNames}, providing a ${strategy.risk.toLowerCase()}-risk approach to generating yield in the current market conditions.
  `;
}
