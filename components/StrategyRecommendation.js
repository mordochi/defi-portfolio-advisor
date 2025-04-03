import { useState, useEffect } from 'react';
import styles from '../styles/Components.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function StrategyRecommendation({ strategies, isLoading = false }) {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [savedStrategies, setSavedStrategies] = useState([]);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className={styles.strategyContainer}>
        <h2>Generating Strategies</h2>
        <div className={styles.loadingPlaceholder}>
          <div className={styles.loadingSpinner}></div>
          <p>Our AI is analyzing your portfolio and generating personalized strategies...</p>
          <p>This may take a few moments.</p>
        </div>
      </div>
    );
  }
  
  if (!strategies || strategies.length === 0) {
    return (
      <div className={styles.strategyContainer}>
        <h2>No Strategies Available</h2>
        <div className={styles.noStrategiesPlaceholder}>
          <p>We couldn't generate personalized strategies at this time.</p>
          <p>This could be due to:</p>
          <ul>
            <li>API service limitations</li>
            <li>Insufficient portfolio data</li>
            <li>Temporary service disruption</li>
          </ul>
          <p>Please try again later or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.strategyContainer}>
      <h2>Recommended DeFi Strategies</h2>
      <p className={styles.strategyIntro}>
        Our AI has analyzed your portfolio and current DeFi opportunities to recommend the following strategies:
      </p>
      
      <div className={styles.strategyCards}>
        {strategies.map((strategy, index) => (
          <div 
            key={index} 
            className={`${styles.strategyCard} ${selectedStrategy === index ? styles.selectedStrategy : ''}`}
            onClick={() => setSelectedStrategy(index)}
          >
            <div className={styles.strategyHeader}>
              <h3>{strategy.name}</h3>
              <span className={`${styles.riskBadge} ${styles[`risk${(strategy.risk || strategy.riskLevel || 'Medium').replace(/[- ]/g, '')}`]}`}>
                {strategy.risk || strategy.riskLevel || 'Medium'}
              </span>
            </div>
            
            <div className={styles.strategyBody}>
              <p>{strategy.description}</p>
              
              <div className={styles.strategyDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Expected APY:</span>
                  <span className={styles.detailValue}>{strategy.expectedAPY || strategy.expectedApy || '3-5%'}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Platforms:</span>
                  <span className={styles.detailValue}>
                    {(strategy.platforms || strategy.recommendedPlatforms || []).join(', ') || 'Various DeFi platforms'}
                  </span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Suitability:</span>
                  <span className={styles.detailValue}>{strategy.suitability || 'General portfolio'}</span>
                </div>
              </div>
            </div>
            
            {(strategy.allocation || strategy.assetAllocation) && (
              <div className={styles.allocationContainer}>
                <h4>Suggested Asset Allocation:</h4>
                <div className={styles.allocationGrid}>
                  {Object.entries(strategy.allocation || strategy.assetAllocation || {}).map(([asset, percentage], i) => (
                    <div key={i} className={styles.allocationItem}>
                      <div className={styles.allocationBar} style={{ 
                        width: typeof percentage === 'string' ? percentage : `${percentage}%`,
                        backgroundColor: `hsl(${i * 60}, 70%, 60%)`
                      }}></div>
                      <div className={styles.allocationLabel}>
                        <span className={styles.assetName}>{asset}</span>
                        <span className={styles.assetPercentage}>{typeof percentage === 'string' ? percentage : `${percentage}%`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className={styles.strategyFooter}>
              <Link href={`/strategy/${index}`} className={styles.learnMoreBtn}>Learn More</Link>
              <button 
                className={styles.implementBtn}
                onClick={() => router.push(`/strategy/${index}`)}
              >
                Implement
              </button>
              {savedStrategies.some(s => s.name === strategy.name) ? (
                <button 
                  className={`${styles.saveBtn} ${styles.saved}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Remove strategy from saved list
                    const updated = savedStrategies.filter(s => s.name !== strategy.name);
                    setSavedStrategies(updated);
                    console.log('Strategy unsaved:', strategy.name);
                  }}
                >
                  ★ Saved
                </button>
              ) : (
                <button 
                  className={styles.saveBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add strategy to saved list
                    const updated = [...savedStrategies, strategy];
                    setSavedStrategies(updated);
                    console.log('Strategy saved:', strategy.name);
                  }}
                >
                  ☆ Save
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.disclaimerSection}>
        <h4>Important Disclaimer</h4>
        <p>
          These recommendations are generated by AI based on your current portfolio and market data. 
          They are not financial advice. Always do your own research (DYOR) before investing.
          DeFi investments carry risks including smart contract vulnerabilities, impermanent loss, and market volatility.
        </p>
      </div>
    </div>
  );
}
