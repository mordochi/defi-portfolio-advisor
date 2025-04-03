import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Strategy.module.css';
import { generateStrategyExplanation } from '../../utils/aiUtils';

export default function StrategyDetail({ walletConnected, walletAddress, provider }) {
  const router = useRouter();
  const { id } = router.query;
  
  const [strategy, setStrategy] = useState(null);
  const [assets, setAssets] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Redirect to home if wallet is not connected
    if (!walletConnected) {
      router.push('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        // Fetch strategy and assets from API
        if (id) {
          // Here we would typically fetch the strategy data from an API endpoint
          // For now, we'll need to pass the strategy data via props or context
          // since we're removing localStorage
          
          // This is a placeholder - in a real implementation, you would fetch the data from your API
          // const response = await fetch(`/api/strategies/${id}`);
          // const strategyData = await response.json();
          
          // For now, we'll just show a message that the data needs to be fetched from API
          const strategyData = { 
            name: 'Strategy data needs to be fetched from API', 
            description: 'Since localStorage has been removed, this data should be fetched from an API endpoint.' 
          };
          setStrategy(strategyData);
          
          // Generate explanation for the strategy - this would use actual data in production
          const explanationText = await generateStrategyExplanation(strategyData, []);
          setExplanation(explanationText);
        }
      } catch (error) {
        console.error("Error fetching strategy data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id, walletConnected, router]);
  
  if (loading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Loading Strategy | DeFi Portfolio Advisor</title>
        </Head>
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h3>Loading strategy details...</h3>
          </div>
        </main>
      </div>
    );
  }
  
  if (!strategy) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Strategy Not Found | DeFi Portfolio Advisor</title>
        </Head>
        <main className={styles.main}>
          <h1>Strategy Not Found</h1>
          <p>The requested strategy could not be found.</p>
          <Link href="/" className={styles.backButton}>
            Go Back Home
          </Link>
        </main>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>{strategy.name} | DeFi Portfolio Advisor</title>
      </Head>
      
      <main className={styles.main}>
        <div className={styles.header}>
          <Link href="/" className={styles.backButton}>
            ← Back to Strategies
          </Link>
          <h1 className={styles.title}>{strategy.name}</h1>
          <span className={`${styles.riskBadge} ${styles[`risk${strategy.risk.replace('-', '')}`]}`}>
            {strategy.risk} Risk
          </span>
        </div>
        
        <div className={styles.content}>
          <div className={styles.strategyOverview}>
            <div className={styles.card}>
              <h2>Strategy Overview</h2>
              <p className={styles.description}>{strategy.description}</p>
              
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Expected APY</div>
                  <div className={styles.statValue}>{strategy.expectedAPY}</div>
                </div>
                
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Platforms</div>
                  <div className={styles.statValue}>{strategy.platforms.join(', ')}</div>
                </div>
                
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Suitability</div>
                  <div className={styles.statValue}>{strategy.suitability}</div>
                </div>
              </div>
            </div>
            
            <div className={styles.card}>
              <h2>Recommended Allocation</h2>
              <div className={styles.allocationContainer}>
                {strategy.allocation && Object.entries(strategy.allocation).map(([asset, percentage], index) => (
                  <div key={index} className={styles.allocationItem}>
                    <div className={styles.allocationLabel}>{asset}</div>
                    <div className={styles.allocationBar}>
                      <div 
                        className={styles.allocationFill} 
                        style={{ width: percentage }}
                      ></div>
                    </div>
                    <div className={styles.allocationValue}>{percentage}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className={styles.strategyExplanation}>
            <div className={styles.card}>
              <h2>Implementation Guide</h2>
              <div className={styles.explanationContent}>
                {explanation ? (
                  <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br>') }} />
                ) : (
                  <p>Loading explanation...</p>
                )}
              </div>
            </div>
            
            <div className={styles.actionButtons}>
              <button className={styles.primaryButton}>Implement Strategy</button>
              <button className={styles.secondaryButton}>Save to Portfolio</button>
            </div>
            
            <div className={styles.disclaimerBox}>
              <h3>Risk Disclaimer</h3>
              <p>
                This strategy recommendation is generated by AI based on your current portfolio and market data.
                It is not financial advice. Always do your own research (DYOR) before investing in any DeFi protocol.
                DeFi investments carry risks including smart contract vulnerabilities, impermanent loss, and market volatility.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
