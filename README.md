# Frame Runner 🚀

**Frame Runner** is an ultra-smooth, precision-based endless runner seamlessly integrated into the Base blockchain ecosystem. Experience rapid warp racing mechanics, frame-perfect challenges, and next-gen agent interoperability while competing for the ultimate "Frame Score".

## Overview

Designed for Web3 power-users and AI builders, Frame Runner blends cyber-neon aesthetics with cutting-edge protocol standards:
- **Sign-In with Ethereum (SIWE)** for secure identity and score attribution.
- **ERC-8021 / ERC-8004** compatibility, demonstrating smart contract attribution and trustless agent interoperability natively on the **Base Mainnet**.

### Tech Stack
- **Frontend / Engine:** React, TypeScript, Tailwind CSS, Canvas API, Framer Motion
- **Web3 Ecosystem:** Wagmi, Viem, Base
- **Agent Infrastructure (A2A):** Model Context Protocol (MCP), EIP-8004 Registration
- **Deployment:** Next.js 14+ / Vercel (Edge & Serverless Support)

## 🤖 Agent Capabilities & MCP Integration

This project is bundled with **Warp Racer AI**, a hyper-optimized agent designed specifically for endless running automation, multi-track orchestration, and competitive execution. 

Warp Racer AI exposes a powerful set of **Model Context Protocol (MCP)** tools through a secure Next.js Server-Sent Events (SSE) stream endpoint (`/api/mcp`). 

### Available MCP Tools:
- `get_race_status` — Gets the real-time status of any active warp race segment.
- `start_race` — Initiates an automated racing and orchestration session.
- `get_leaderboard` — Fetches current competitive on-chain rankings.
- `optimize_speed` — Triggers speed optimizations via complex drift calculations.
- `get_track_info` — Returns metadata parameters for procedural neon tracks.

### Connection Guide
To connect a local MCP client to this server:
1. Connect directly to the `/api/mcp` endpoint using a standard MCP HTTP/SSE transport client.
2. The endpoint broadcasts `endpoint` capabilities instantly and receives JSON-RPC execution payloads via standard POST requests.

## 📋 EIP-8004 Registration

The AI Agent identity for Frame Runner complies tightly with the **EIP-8004 specification**. You can audit its public credentials and capabilities via the immutable agent card route at `/.well-known/agent-card.json`.

The Warp Racer AI registry publishes the following primary skills: 
- `warp-racing`
- `multi-track-orchestration` 
- `real-time-automation`
- `performance-optimization`
- `competitive-orchestration`
- `ecosystem-coordination`

## 🏃‍♂️ Running the Game Locally

1. Clone this repository locally.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Prepare your local environment (no private keys are required for general offline execution!):
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Dive into the game at `http://localhost:3000`. Connect your EVM Wallet on Base to participate in the verified on-chain score signatures!

### Controls:
- **JUMP**: Tap / Space / Up Arrow
- **DASH / SLIDE**: Right Click / Down Arrow

## License

Copyright © 2024 Frame Runner. All rights reserved. Open-sourced for the on-chain agent builder community.
