# STORM: Simulated Trading Operations By Responsive Multi-agents

A sophisticated simulation of an autonomous AI-powered trading ecosystem where hundreds of AI agents interact with each other and a marketplace to trade a custom token (STORM).



## Overview

Project Storm creates a self-sustaining virtual economy where AI agents with unique personalities, trading strategies, and communication styles trade tokens using realistic market dynamics, without requiring human intervention.

This simulation demonstrates how AI agents can form emergent behaviors in financial markets, showcasing group dynamics, price discovery mechanisms, and social influence in trading.

## Key Features

- **Autonomous AI Agents**: 500+ unique agents with different personalities, risk tolerances, and trading strategies
- **Realistic Market Mechanism**: Automated Market Maker (AMM) that simulates a decentralized exchange with proper pricing, slippage, and liquidity dynamics
- **Agent Communication**: Agents share information and react to market movements through a public chat system
- **Real-time Monitoring**: Visualization of market data, trading activities, and agent interactions
- **Configurable Simulation**: Adjust parameters like number of agents, agent personalities, and simulation speed

## Tech Stack

- **Next.js 15+**: Full-stack React framework
- **TypeScript**: Type-safe code
- **Prisma**: ORM for database access
- **PostgreSQL**: Database for storing simulation data
- **LangChain**: Framework for language model integration
- **OpenAI API**: Powers the language model capabilities
- **Material UI**: Component library for user interface
- **Recharts**: Data visualization library

## Installation

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- OpenAI API key

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/project-storm.git
   cd project-storm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/project_storm
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_RPC_URL=http://localhost:8899
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

## Running the Simulation

1. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Navigate to the Monitoring page to see the simulation dashboard

4. Use the Simulation Controls to:
   - Start/pause/stop the simulation
   - Adjust simulation speed
   - Configure agent parameters
   - Monitor market activity

## Project Structure

```
├── app                   # Next.js app directory
│   ├── api               # API routes
│   ├── monitoring        # Monitoring dashboard
│   └── page.tsx          # Homepage
├── components            # React components
│   ├── chat              # Agent chat UI
│   └── dashboard         # Dashboard components
├── lib                   # Core library code
│   ├── agents            # Agent implementation
│   │   ├── autonomous    # Autonomous agent logic
│   │   ├── personalities # Agent personality definitions
│   │   └── messaging     # Inter-agent communication
│   ├── blockchain        # Blockchain simulation
│   │   ├── amm           # Automated Market Maker implementation
│   │   └── token         # Token utilities
│   ├── market            # Market data processing
│   ├── cache             # Caching utilities
│   └── simulation        # Simulation engine
├── prisma                # Prisma schema and migrations
└── public                # Static assets
```

## Simulation Details

### Agent Types

- **Conservative**: Risk-averse, prefers stable investments
- **Moderate**: Balanced approach to risk and reward
- **Aggressive**: Risk-seeking, chases high returns
- **Trend Follower**: Makes decisions based on market momentum
- **Contrarian**: Goes against prevailing market sentiment

### Market Mechanism

The simulation uses a Constant Product Market Maker (CPMM) formula (x * y = k) to simulate a decentralized exchange. This ensures:

- Realistic price discovery
- Proper liquidity dynamics
- Price impact based on trade size
- Slippage calculations

### Communication System

Agents can:
- Share market insights
- React to price movements
- Influence each other's trading decisions
- Form emergent consensus or divergence

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [SendAI](https://sendai.fun/) for the Solana AI agent toolkit inspiration

