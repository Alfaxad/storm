# STORM: Simulated Trading Operations By Responsive Multi-agents

A sophisticated simulation of an autonomous AI-powered trading ecosystem where hundreds of AI agents interact with each other and a marketplace to trade a custom token (STORM).

## Overview

Project Storm creates a self-sustaining virtual economy where AI agents with unique personalities, trading strategies, and communication styles trade tokens using realistic market dynamics, without requiring human intervention.

This simulation demonstrates how AI agents can form emergent behaviors in financial markets, showcasing group dynamics, price discovery mechanisms, and social influence in trading.

![Screenshot from 2025-03-10 21-39-37](https://github.com/user-attachments/assets/bc946ab3-9f3d-43d3-b2af-a00040f277b0)

## Key Features

- **Autonomous AI Agents**: 500+ unique agents with different personalities, risk tolerances, and trading strategies
- **Realistic Market Mechanism**: Automated Market Maker (AMM) that simulates a decentralized exchange with proper pricing, slippage, and liquidity dynamics
- **Agent Communication**: Agents share information and react to market movements through a public chat system
- **Real-time Monitoring**: Visualization of market data, trading activities, and agent interactions
- **Configurable Simulation**: Adjust parameters like number of agents, agent personalities, and simulation speed

![Screenshot from 2025-03-13 20-11-53](https://github.com/user-attachments/assets/3dbcaaf1-9229-4494-9937-ecd0b043bca6)

![Screenshot from 2025-03-13 20-11-08](https://github.com/user-attachments/assets/85843372-4a71-4852-845b-4bcde084339f)

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

### PostgreSQL Setup (First-time Users)

If you've never set up PostgreSQL before, follow these steps:

1. **Install PostgreSQL**:
   
   - **Ubuntu/Debian**:
     ```bash
     sudo apt update
     sudo apt install postgresql postgresql-contrib
     ```
   
   - **macOS** (using Homebrew):
     ```bash
     brew install postgresql
     brew services start postgresql
     ```
   
   - **Windows**: Download and install from [PostgreSQL website](https://www.postgresql.org/download/windows/)

2. **Create a Database**:
   
   ```bash
   # Log in as postgres user
   sudo -u postgres psql
   
   # Inside psql, create a database and user
   CREATE DATABASE project_storm;
   CREATE USER stormuser WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE project_storm TO stormuser;
   
   # Exit psql
   \q
   ```

3. **Test Connection**: 
   ```bash
   psql -U stormuser -d project_storm -h localhost
   # Enter your password when prompted
   ```

### Project Setup

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
   DATABASE_URL=postgresql://stormuser:your_password@localhost:5432/project_storm
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_RPC_URL=http://localhost:8899
   ```

4. Set up the database with Prisma:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Create initial database structure
   npx prisma migrate dev --name init
   ```

### Deploy Trading Token and Setup Agents

Before running the simulation, you need to deploy the trading token and create agents:

1. **Deploy Trading Token**:
   ```bash
   # This creates the STORM token on the simulated blockchain
   node deploy-token-script.js
   ```

2. **Create LLM Agents**:
   ```bash
   # Create 50 AI agents with various personalities
   node setup-llm-agents.js 50
   ```

   You can adjust the number of agents (50 in this example) based on your system's capacity.

## Prisma Schema

The project uses Prisma ORM to manage the database. Key models include:

- `Agent`: Stores agent information, personalities, and balances
- `Transaction`: Records all trading activity
- `Message`: Stores inter-agent communications
- `PoolState`: Tracks the AMM liquidity pool state
- `MarketState`: Records historical market data

The complete schema is available in `prisma/schema.prisma`.

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
├── scripts               # Utility scripts for setup
│   ├── deploy-token-script.js  # Token deployment script
│   └── setup-llm-agents.js     # Agent creation script
└── public                # Static assets
```

## Troubleshooting

Common issues and solutions:

- **Database Connection Errors**: Ensure PostgreSQL is running and credentials are correct in `.env.local`
- **Token Deployment Fails**: Check that your RPC URL is correct and accessible
- **Agent Creation Issues**: Verify your OpenAI API key is valid and has sufficient quota
- **UI Shows No Data**: Use the refresh button on the dashboard to force data synchronization

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

- [SendAI](https://sendai.fun/) for the Solana AI agent toolkit.
