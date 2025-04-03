import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="description" content="DeFi Portfolio Advisor - AI-powered investment strategies for your crypto assets" />
        <meta name="theme-color" content="#3b82f6" />
        <meta property="og:title" content="DeFi Portfolio Advisor" />
        <meta property="og:description" content="Analyze your crypto assets and get AI-powered DeFi investment strategies" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
