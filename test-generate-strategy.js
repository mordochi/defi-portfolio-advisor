// Script to test the generate-strategy API endpoint with multi-provider AI support
import fetch from 'node-fetch';

async function testGenerateStrategy() {
  console.log('Testing generate-strategy API endpoint...');
  
  const testAssets = [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      balance: 0.0248,
      value: 40
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      balance: 1,
      value: 1
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      balance: 2.16,
      value: 2.16
    }
  ];

  // Sample protocols to include in the request
  const testProtocols = [
    { name: 'Aave', description: 'Lending and borrowing protocol' },
    { name: 'Uniswap', description: 'Decentralized exchange' },
    { name: 'Curve', description: 'Stablecoin exchange' }
  ];

  try {
    // Use port 3001 as Next.js is running on this port
    const port = 3001;
    console.log(`Connecting to API on port ${port}...`);
    
    const response = await fetch(`http://localhost:${port}/api/generate-strategy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        assets: testAssets,
        protocols: testProtocols
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Display which AI provider was used
    if (data.aiProvider) {
      console.log(`\nAI Provider used: ${data.aiProvider}`);
    }
    
    // Display strategies if available
    if (data.strategies && data.strategies.length > 0) {
      console.log(`\nGenerated ${data.strategies.length} strategies`);
      data.strategies.forEach((strategy, index) => {
        console.log(`\nStrategy ${index + 1}: ${strategy.name}`);
        console.log(`Risk: ${strategy.risk}, Expected APY: ${strategy.expectedAPY}`);
        console.log(`Platforms: ${strategy.platforms.join(', ')}`);
      });
    } else {
      console.log('\nNo strategies were generated');
    }
  } catch (error) {
    console.error('Error calling API:', error);
    
    // If we got a response but couldn't parse it as JSON, show the raw response
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      try {
        const port = 3001;
        const rawResponse = await fetch(`http://localhost:${port}/api/generate-strategy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assets: testAssets }),
        });
        const text = await rawResponse.text();
        console.error('Raw response:', text.substring(0, 500) + '...');
      } catch (e) {
        console.error('Failed to get raw response:', e);
      }
    }
  }
}

testGenerateStrategy();
