import fetch from 'node-fetch';
import { generateDeFiStrategies } from '../../utils/aiService';
import { getAIProvider } from '../../utils/aiService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { assets, protocols } = req.body;
    
    if (!assets || assets.length === 0) {
      return res.status(400).json({ message: 'No assets provided' });
    }

    console.log('Received assets:', JSON.stringify(assets, null, 2));
    
    // Get the current AI provider being used
    const aiProvider = getAIProvider();
    console.log(`Using AI provider: ${aiProvider}`);
    
    // Option 1: Use the AI service directly for strategy generation
    const strategies = await generateDeFiStrategies(assets, protocols || []);
    
    // Option 2: If external portfolio analysis service is available, use it
    // This is the original implementation that calls an external service
    let portfolioData = { strategies };
    
    try {
      // Transform assets to the required format for external service
      const transformedAssets = assets.map(asset => ({
        asset_id: asset.symbol.toLowerCase(),
        amount: asset.balance,
        asset_name: asset.name
      }));
      
      const requestBody = {
        blockchain_id: "ethereum",
        assets: transformedAssets,
        include_top_protocols: 10
      };
      
      // Try to call the external portfolio analysis service if it's running
      const portfolioResponse = await fetch('http://localhost:8000/api/portfolio-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        // Set a short timeout to quickly fall back to AI-only approach if service is not available
        timeout: 2000,
      }).catch(() => null);
      
      if (portfolioResponse && portfolioResponse.ok) {
        const externalData = await portfolioResponse.json();
        console.log('Portfolio analysis response:', JSON.stringify(externalData, null, 2));
        
        // Check if the external data has investment options
        const hasInvestmentOptions = 
          externalData.result && 
          externalData.result.investment_options && 
          externalData.result.investment_options.length > 0;
        
        // Merge external data with AI-generated strategies
        portfolioData = {
          ...externalData,
          // Always include our AI-generated strategies
          strategies: strategies,
          // Include the AI provider info
          aiProvider
        };
        
        // Log whether we're using AI strategies or external data
        console.log(`Using ${hasInvestmentOptions ? 'external investment options' : 'AI-generated strategies'}`);
      }
    } catch (serviceError) {
      console.warn('External portfolio service unavailable, using AI-only approach', serviceError);
      // Continue with AI-generated strategies only
    }
    
    return res.status(200).json({
      ...portfolioData,
      aiProvider
    });
  } catch (error) {
    console.error('Error generating strategy:', error);
    return res.status(500).json({ message: 'Error generating strategy', error: error.message });
  }
}




