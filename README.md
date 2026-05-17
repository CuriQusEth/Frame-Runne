# Frame Runner 🚀

**Frame Runner** is a high-performance, precision-based endless runner integrated deeply into the Base blockchain ecosystem. Experience ultra-smooth racing, frame-perfect mechanics, and seamless Web3 wallet support while competing for the top "Frame Score."

## Overview

Frame Runner combines cyber-neon aesthetics and precision timing with leading-edge blockchain technology. The project integrates **Sign-In with Ethereum (SIWE)** and **ERC-8021 / ERC-8004** compatibility to offer secure score signing, smart contract attribution, and trustless agent interoperability on [Base Mainnet](https://base.org/).

### Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Canvas API, Framer Motion
- **Web3 Ecosystem:** Wagmi, Viem, Base Mainnet
- **Agent Infrastructure (A2A):** Model Context Protocol (MCP), EIP-8004 Registration
- **Build Tools:** Vite, Express, esbuild

## Agent Capabilities & MCP Integration 🤖

This project comes bundled with **Warp Racer AI**, a high-performance AI Agent mapped via the `.well-known/agent-card.json` registry. The agent is exposed securely using the **Model Context Protocol (MCP)** serving real-time events over an SSE Connection.

### Available MCP Tools:
- `get_race_status` — Gets the real-time status of a warp race segment.
- `start_race` — Initiates an automated racing session.
- `get_leaderboard` — Fetches current on-chain competitive rankings.
- `optimize_speed` — Triggers speed optimizations via drift calculations.
- `get_track_info` — Returns metadata for procedural tracks.

## EIP-8004 Registration 📋

The AI Agent identity for Frame Runner complies with EIP-8004. You can analyze its credentials at the `/.well-known/agent-card.json` route. The agent publishes specific racing skills: `warp-racing`, `multi-track-orchestration`, `real-time-automation`, `performance-optimization`, `competitive-orchestration`, and `ecosystem-coordination`.

## Playing the Game Locally 🏃‍♂️

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Create an environment file if required (no private keys are required for general execution):
   ```bash
   cp .env.example .env
   ```
3. Start the combined Vite and Express development server:
   ```bash
   npm run dev
   ```
4. Access the game at `http://localhost:3000`. 
5. Connect your Web3 wallet on the Base network to log official runs via Signature!

### Interactions:
- Tap / Space: **JUMP**
- Right Click / Down Arrow: **DASH / SLIDE**

## Deployment
For production usage, the project compiles the React client and the Express backend into a scalable Node.js package:
```bash
npm run build
npm start
```
Note: If deploying on edge functions or serverless configurations like **Vercel**, ensure you map standard `app/api/*` routes rather than deploying the standalone `server.ts` Express file.

## License

Copyright © 2024 Frame Runner. All rights reserved. Open-sourced for the on-chain agent builder community.
