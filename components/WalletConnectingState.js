import styles from '../styles/Components.module.css';

export default function WalletConnectingState() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.card}>
        <h3 className={styles.loadingMessage}>Connecting to wallet...</h3>
        <p className={styles.loadingDescription}>
          Securely connecting to your MetaMask wallet
        </p>
      </div>
    </div>
  );
}
