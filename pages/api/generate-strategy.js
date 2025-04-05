import fetch from 'node-fetch';

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
    
    // Call the external portfolio analysis service
    let portfolioData = {};
    
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
      });
      
      if (portfolioResponse && portfolioResponse.ok) {
        const externalData = await portfolioResponse.json();
        console.log('Portfolio analysis response:', JSON.stringify(externalData, null, 2));
        
        // Check if the external data has investment options
        const hasInvestmentOptions = 
          externalData.result && 
          externalData.result.investment_options && 
          externalData.result.investment_options.length > 0;
        
        // Use the external data directly
        portfolioData = externalData;
        
        console.log('Using external investment options');
      }
    } catch (serviceError) {
      console.warn('External portfolio service unavailable', serviceError);
      // Return an error since we're not using fallback strategies
    }
    
    return res.status(200).json(portfolioData);
  } catch (error) {
    console.error('Error generating strategy:', error);
    return res.status(500).json({ message: 'Error generating strategy', error: error.message });
  }
}




