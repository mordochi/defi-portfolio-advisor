/**
 * Generate investment strategies using AI via the server-side API
 * @param {Array} assets - User's assets
 * @param {Array} protocols - Available DeFi protocols
 * @returns {Promise<Object>} - Object containing strategies and AI provider info
 */
export async function generateAIStrategies(assets, protocols) {
  try {
    // Call the server-side API route instead of using OpenAI directly
    const response = await fetch('/api/generate-strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        assets,
        protocols: protocols.slice(0, 15) // Only send the top 15 protocols to keep the payload smaller
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate strategies: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      strategies: data.strategies || [],
      aiProvider: data.aiProvider || 'unknown'
    };
  } catch (error) {
    console.error('Error generating AI strategies:', error);
    // Return an empty array to indicate no strategies are available
    return {
      strategies: [],
      aiProvider: 'error'
    };
  }
}
/**
 * Generate an explanation for a specific strategy using AI
 * @param {Object} strategy - Strategy to explain
 * @param {Array} assets - User's assets
 * @returns {Promise<Object>} - Object containing AI-generated explanation and provider info
 */
export async function generateStrategyExplanation(strategy, assets) {
  try {
    // Call the server-side API route instead of using OpenAI directly
    const response = await fetch('/api/explain-strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        strategy,
        assets
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate explanation: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      explanation: data.explanation,
      aiProvider: data.aiProvider || 'unknown'
    };
  } catch (error) {
    console.error('Error generating strategy explanation:', error);
    
    // Fallback explanation
    const fallbackExplanation = `
## Implementation of ${strategy.name}

This strategy focuses on ${strategy.description.toLowerCase()}

### Steps to Implement
1. Connect your wallet to the recommended platforms: ${strategy.platforms.join(', ')}
2. Allocate your assets according to the recommended percentages
3. Monitor your investments regularly and rebalance as needed

### Benefits and Risks
- Benefits: Potential for ${strategy.expectedAPY} APY, diversification across reputable protocols
- Risks: ${strategy.risk} risk profile, potential for smart contract vulnerabilities, market volatility

### How This Fits Your Portfolio
This strategy provides a balanced approach for your current asset mix.
    `;
    
    return {
      explanation: fallbackExplanation,
      aiProvider: 'fallback-client'
    };
  }
}

/**
 * Get the name of the current AI provider being used
 * @returns {Promise<string>} - Name of the AI provider
 */
export async function getCurrentAIProvider() {
  try {
    // Make a lightweight call to check which provider is being used
    const response = await fetch('/api/generate-strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        assets: [] // Empty assets to minimize processing
      }),
    });
    
    if (!response.ok) {
      return 'unknown';
    }
    
    const data = await response.json();
    return data.aiProvider || 'unknown';
  } catch (error) {
    console.error('Error checking AI provider:', error);
    return 'unknown';
  }
}
