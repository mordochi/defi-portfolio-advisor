import { useState, useEffect } from 'react';
import styles from '../styles/Components.module.css';

export default function AssetDisplay({ assets, network }) {
  const [assetChartData, setAssetChartData] = useState([]);
  
  // Calculate chart data for asset distribution
  useEffect(() => {
    if (assets && assets.length > 0) {
      // Show equal distribution for assets
      const chartData = assets.map((asset, index) => ({
        name: asset.symbol,
        percentage: (100 / assets.length).toFixed(2)
      }));
      setAssetChartData(chartData);
    }
  }, [assets]);
  if (!assets || assets.length === 0) {
    return (
      <div className={styles.card}>
        <h2>Your Assets</h2>
        <p className={styles.noAssets}>No assets found in your wallet.</p>
      </div>
    );
  }

  // We're not calculating portfolio value anymore

  // Helper function to get network name from chainId
  const getNetworkName = (network) => {
    if (!network) return 'Unknown Network';
    
    const chainId = network.chainId;
    const networkMap = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon',
      80001: 'Mumbai Testnet',
      42161: 'Arbitrum One',
      10: 'Optimism',
      56: 'BNB Chain',
      43114: 'Avalanche',
      250: 'Fantom',
      100: 'Gnosis Chain',
      42220: 'Celo',
      1088: 'Metis',
      1101: 'Polygon zkEVM'
    };
    
    return networkMap[chainId] || `Chain ID: ${chainId}`;
  };

  return (
    <div className={styles.card}>
      <h2>Your Assets {network && <span className={styles.networkBadge}>{getNetworkName(network)}</span>}</h2>
      <div className={styles.portfolioSummary}>
        <p className={styles.portfolioValue}>
          Total Assets: <span>{assets.length}</span>
        </p>
        
        {assetChartData.length > 0 && (
          <div className={styles.portfolioComposition}>
            <h3>Portfolio Composition</h3>
            <div className={styles.assetDistribution}>
              {assetChartData.map((item, index) => (
                <div key={index} className={styles.distributionItem} style={{ width: `${item.percentage}%` }}>
                  <div 
                    className={styles.distributionBar} 
                    style={{ 
                      backgroundColor: `hsl(${index * 30}, 70%, 50%)`,
                      width: '100%'
                    }}
                    title={`${item.name}: ${item.percentage}%`}
                  ></div>
                </div>
              ))}
            </div>
            <div className={styles.distributionLegend}>
              {assetChartData.map((item, index) => (
                <div key={index} className={styles.legendItem}>
                  <div 
                    className={styles.legendColor} 
                    style={{ backgroundColor: `hsl(${index * 30}, 70%, 50%)` }}
                  ></div>
                  <span className={styles.legendName}>{item.name}</span>
                  <span className={styles.legendPercentage}>{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.assetList}>
        {assets.map((asset, index) => (
          <div key={index} className={styles.assetItem}>
            <div className={styles.assetIcon}>
              {asset.symbol.slice(0, 2).toUpperCase()}
            </div>
            <div className={styles.assetDetails}>
              <div className={styles.assetName}>
                {asset.name} ({asset.symbol})
              </div>
              <div className={styles.assetBalance}>
                {parseFloat(asset.balance).toFixed(4)} {asset.symbol}
              </div>
            </div>
            <div className={styles.assetValue}>
              {asset.balance} {asset.symbol}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.assetNote}>
        <p>This data is fetched directly from your connected wallet and the blockchain.</p>
        <div className={styles.assetActions}>
          <button className={styles.refreshButton} onClick={() => window.location.reload()}>
            Refresh Assets
          </button>
          <button className={styles.scanButton}>
            Scan for Tokens
          </button>
        </div>
      </div>
    </div>
  );
}
