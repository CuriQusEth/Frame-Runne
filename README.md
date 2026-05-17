# Frame Runner

**Frame Runner** is an ultra-smooth, precision-based endless runner where perfect timing and frame-perfect inputs are everything. You control a sleek digital runner who sprints through ever-changing neon cyber worlds, dodging obstacles with split-second timing while chasing the highest "Frame Score".

## Features

- **High-Performance Canvas Engine:** Runs at a buttery smooth 60fps with responsive inputs.
- **Frame-Perfect Mechanics:** Hitting inputs in a very tight timing window gives massive multipliers and satisfying visual effects.
- **Cyber-Neon Aesthetic:** Clean, ultra-modern visuals with vibrant colors, glowing trails, and particle bursts.
- **On-Chain Integration:**
  - **Base Mainnet Support:** Connect your Web3 wallet via Wagmi and Viem.
  - **ERC-8021 Attribution:** Built-in protocol specification support for smart contract attribution (Builder Code & Attribution Code).
  - **ERC-8004 Trustless Agents:** Infrastructure ready for trustless agent task delegation.
  - **SIWE Signatures:** Submit high scores securely off-chain via "Sign-In with Ethereum".
  - **Say GM:** Example on-chain transaction feature to demonstrate ERC-8021 integration.
- **Model Context Protocol (MCP) Server:** Features an embedded Agent mapping via MCP (A2A Ready) running via an Express server for Warp Racer AI.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Copy `.env.example` to `.env` and fill in any required configuration variables.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server including the Game and MCP Express Server:
```bash
npm run dev
```
The game will be available at `http://localhost:3000`.

### Building for Production

Compile the client and server assets for deployment:
```bash
npm run build
```

Then start the production server:
```bash
npm run start
```

## How to Play

- **Jump:** Tap the screen or press the `Space` / `Arrow Up` key.
- **Dash/Slide:** Right-click the screen or press the `Arrow Down` key.
- **Frame Perfect:** Time your jumps and slides perfectly right before an obstacle to rack up major multiplier points!
- **Connect Wallet:** Enhance your experience and record your runs securely.

## Agent Architecture (A2A)

The project includes an A2A (Agent-to-Agent) compatible `.well-known/agent-card.json` configuration and an active MCP Server exposed at `/api/mcp`. These elements define "Warp Racer AI", enabling interoperability, system prompts, performance optimization, and multi-track orchestration tools.

## Supported Networks

- **Base Mainnet:** Connect with your Web3 wallet to sign runs and perform light transactions.

## License

Copyright © 2024 Frame Runner. All rights reserved.
