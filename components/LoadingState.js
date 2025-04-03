import styles from '../styles/Components.module.css';

export default function LoadingState({ step }) {
  const loadingMessages = [
    "Connecting to wallet...",
    "Analyzing your portfolio assets...",
    "Searching DeFi protocols for opportunities...",
    "Generating optimal portfolio strategies..."
  ];

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.card}>
        <div className={styles.loadingSpinner}></div>
        <h3 className={styles.loadingMessage}>{loadingMessages[step - 1]}</h3>
        <p className={styles.loadingDescription}>
          {step === 1 && "Securely connecting to your MetaMask wallet"}
          {step === 2 && "Analyzing token balances across supported chains"}
          {step === 3 && "Scanning DeFi protocols on DefiLlama for the best opportunities"}
          {step === 4 && "Our AI is creating personalized strategies based on your assets"}
        </p>
      </div>
    </div>
  );
}
