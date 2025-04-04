import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function TestAI() {
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Get the current AI provider on page load
  useEffect(() => {
    async function checkProvider() {
      try {
        const response = await fetch('/api/generate-strategy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assets: [] }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setProvider(data.aiProvider || 'unknown');
        }
      } catch (err) {
        console.error('Error checking provider:', err);
      }
    }
    
    checkProvider();
  }, []);
  
  // Test generating a strategy
  const testGenerateStrategy = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
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
      
      const response = await fetch('/api/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assets: testAssets }),
      });
      
      const data = await response.json();
      setResult({
        type: 'strategy',
        data
      });
    } catch (err) {
      setError(`Error generating strategy: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Test explaining a strategy
  const testExplainStrategy = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const testStrategy = {
        name: "ETH Staking Plus",
        description: "Stake ETH while using derivatives for additional yield",
        risk: "Medium",
        expectedAPY: "5-8%",
        platforms: ["Lido", "Curve", "Convex"],
        steps: [
          "Stake ETH with Lido to receive stETH",
          "Provide stETH/ETH liquidity on Curve",
          "Stake LP tokens on Convex for boosted rewards"
        ]
      };
      
      const testAssets = [
        {
          name: 'Ethereum',
          symbol: 'ETH',
          balance: 2.5,
          value: 5000
        }
      ];
      
      const response = await fetch('/api/explain-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          strategy: testStrategy,
          assets: testAssets
        }),
      });
      
      const data = await response.json();
      setResult({
        type: 'explanation',
        data
      });
    } catch (err) {
      setError(`Error explaining strategy: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <Head>
        <title>Test AI Providers</title>
        <meta name="description" content="Test the multi-provider AI integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">Test AI Providers</h1>
        
        <div className="provider-info">
          <h2>Current AI Provider: <span className="provider-name">{provider || 'Loading...'}</span></h2>
          <p className="description">
            This page allows you to test the multi-provider AI integration.
          </p>
        </div>
        
        <div className="card">
          <div className="test-buttons">
            <button 
              onClick={testGenerateStrategy} 
              disabled={loading}
              className="button"
            >
              Test Generate Strategy
            </button>
            
            <button 
              onClick={testExplainStrategy} 
              disabled={loading}
              className="button"
            >
              Test Explain Strategy
            </button>
          </div>
          
          {loading && (
            <div className="loading">
              <p>Loading... This may take a few moments.</p>
            </div>
          )}
          
          {error && (
            <div className="error">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}
          
          {result && result.type === 'strategy' && (
            <div className="result">
              <h3>Generated Strategies</h3>
              <p>AI Provider: {result.data.aiProvider}</p>
              
              {result.data.strategies && result.data.strategies.length > 0 ? (
                <div className="strategies">
                  {result.data.strategies.map((strategy, index) => (
                    <div key={index} className="strategy">
                      <h4>{strategy.name}</h4>
                      <p><strong>Description:</strong> {strategy.description}</p>
                      <p><strong>Risk:</strong> {strategy.risk}</p>
                      <p><strong>Expected APY:</strong> {strategy.expectedAPY}</p>
                      <p><strong>Platforms:</strong> {strategy.platforms.join(', ')}</p>
                      
                      <div className="steps">
                        <strong>Steps:</strong>
                        <ol>
                          {strategy.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No strategies were generated.</p>
              )}
              
              <details>
                <summary>Raw Response</summary>
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </details>
            </div>
          )}
          
          {result && result.type === 'explanation' && (
            <div className="result">
              <h3>Strategy Explanation</h3>
              <p>AI Provider: {result.data.aiProvider}</p>
              
              <div className="explanation">
                <div dangerouslySetInnerHTML={{ __html: result.data.explanation.replace(/\n/g, '<br/>') }} />
              </div>
              
              <details>
                <summary>Raw Response</summary>
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 800px;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 3rem;
          text-align: center;
        }

        .provider-info {
          margin: 2rem 0;
          text-align: center;
        }

        .provider-name {
          color: #0070f3;
          text-transform: uppercase;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
          text-align: center;
        }

        .card {
          margin: 1rem;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
          width: 100%;
        }

        .test-buttons {
          display: flex;
          justify-content: space-around;
          margin-bottom: 2rem;
        }

        .button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.15s ease;
        }

        .button:hover {
          background-color: #0051a2;
        }

        .button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .loading, .error {
          margin: 1rem 0;
          padding: 1rem;
          border-radius: 5px;
          text-align: center;
        }

        .loading {
          background-color: #f0f0f0;
        }

        .error {
          background-color: #ffebee;
          color: #d32f2f;
        }

        .result {
          margin-top: 2rem;
        }

        .strategy {
          margin-bottom: 2rem;
          padding: 1rem;
          border: 1px solid #eaeaea;
          border-radius: 5px;
        }

        .steps {
          margin-top: 1rem;
        }

        .explanation {
          margin-top: 1rem;
          padding: 1rem;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          background-color: #f9f9f9;
        }

        details {
          margin-top: 1rem;
        }

        summary {
          cursor: pointer;
          color: #0070f3;
        }

        pre {
          background-color: #f0f0f0;
          padding: 1rem;
          border-radius: 5px;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
