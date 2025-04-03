// Simple script to test the generate-strategy API endpoint
import fetch from 'node-fetch';

async function testGenerateStrategy() {
  console.log('Testing generate-strategy API endpoint...');
  
  const testAssets = [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      balance: 2.5,
      value: 5000
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      balance: 3000,
      value: 3000
    }
  ];

  try {
    const response = await fetch('http://localhost:3000/api/generate-strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assets: testAssets }),
    });

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error calling API:', error);
  }
}

testGenerateStrategy();
