import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { assets } = req.body;
    
    if (!assets || assets.length === 0) {
      return res.status(400).json({ message: 'No assets provided' });
    }

    console.log('Received assets:', JSON.stringify(assets, null, 2));

    // Make a request to the portfolio analysis service
    console.log('Making request to portfolio analysis service...');
    
    // Transform assets to the required format
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
    
    console.log('Transformed request body:', JSON.stringify(requestBody, null, 2));
    
    const portfolioResponse = await fetch('http://localhost:8000/api/portfolio-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!portfolioResponse.ok) {
      throw new Error(`Portfolio analysis service returned ${portfolioResponse.status}`);
    }
    
    const portfolioData = await portfolioResponse.json();
    console.log('Portfolio analysis response:', JSON.stringify(portfolioData, null, 2));
    
    return res.status(200).json(portfolioData);
  } catch (error) {
    console.error('Error generating strategy:', error);
    return res.status(500).json({ message: 'Error generating strategy', error: error.message });
  }
}




