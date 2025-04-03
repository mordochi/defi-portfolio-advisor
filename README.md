# DeFi Portfolio Advisor

A web application that connects to MetaMask wallet, analyzes user assets, and recommends optimal DeFi strategies by searching through various protocols.

## Features

- MetaMask wallet integration for secure access to user's blockchain assets
- Asset analysis for multiple blockchains and tokens
- DeFi protocol discovery using data from sources like DefiLlama
- AI-powered portfolio strategy recommendations
- Beautiful and modern UI with best UX practices

## Tech Stack

- Next.js for the web application framework
- Web3.js/Ethers.js for blockchain interactions
- OpenAI API for intelligent strategy recommendations
- Next-auth for authentication

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the root directory with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_INFURA_ID=your_infura_id (optional)
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Connect your MetaMask wallet
2. The application will analyze your assets
3. AI will search for and analyze DeFi protocols
4. Review and implement suggested portfolio strategies

## License

ISC
