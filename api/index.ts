import express from "express";
import cors from "cors";
import crypto from "crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

const app = express();
app.use(cors());

// Setup MCP Server
const mcp = new Server(
  {
    name: "WarpRacerMCP",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
      resources: {}
    },
  }
);

// Register Tools
mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_race_status",
      description: "Get the current status of the warp race.",
      inputSchema: {
        type: "object",
        properties: { raceId: { type: "string", description: "The ID of the race" } },
        required: ["raceId"],
      },
    },
    {
      name: "start_race",
      description: "Initiates a warp race session.",
      inputSchema: {
        type: "object",
        properties: { player: { type: "string" }, trackId: { type: "string" } },
        required: ["player", "trackId"],
      },
    },
    {
      name: "get_leaderboard",
      description: "Fetches competitive rankings.",
      inputSchema: {
        type: "object",
        properties: { limit: { type: "number", default: 10 } },
      },
    },
    {
      name: "optimize_speed",
      description: "Triggers performance optimization logic.",
      inputSchema: {
        type: "object",
        properties: { trackId: { type: "string" } },
        required: ["trackId"],
      },
    },
    {
      name: "get_track_info",
      description: "Returns metadata about a specific track.",
      inputSchema: {
        type: "object",
        properties: { trackId: { type: "string" } },
        required: ["trackId"],
      },
    }
  ],
}));

mcp.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const anyArgs = args as any;
  
  switch (name) {
    case "get_race_status":
      return { content: [{ type: "text", text: `Race ${anyArgs?.raceId || "unknown"} is currently in progress. Warp drive at 90%.` }] };
    case "start_race":
      return { content: [{ type: "text", text: `Race session initiated for player ${anyArgs?.player} on track ${anyArgs?.trackId}.` }] };
    case "get_leaderboard":
      return { content: [{ type: "text", text: `Leaderboard: 1. krypt0.eth, 2. 0x82...f92, 3. basegod.cb` }] };
    case "optimize_speed":
      return { content: [{ type: "text", text: `Performance for track ${anyArgs?.trackId} optimized. Speed increased by 15%. ` }] };
    case "get_track_info":
      return { content: [{ type: "text", text: `Track ${anyArgs?.trackId}: Neon Cyber World, length 1500m, high difficulty.` }] };
    default:
      throw new Error(`Tool not found: ${name}`);
  }
});

mcp.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [] }));
mcp.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: [] }));

// Need to keep transports for SSE
const activeSessions = new Map<string, SSEServerTransport>();

app.get("/api/mcp", async (req, res) => {
  const sessionId = crypto.randomUUID();
  const sessionTransport = new SSEServerTransport(`/api/mcp/message?sessionId=${sessionId}`, res);
  
  activeSessions.set(sessionId, sessionTransport);
  
  res.on("close", () => {
    activeSessions.delete(sessionId);
  });

  await mcp.connect(sessionTransport);
});

app.post("/api/mcp/message", express.json(), async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const sessionTransport = activeSessions.get(sessionId);
  if (!sessionTransport) {
    res.status(404).send("Session not found");
    return;
  }
  try {
    await sessionTransport.handlePostMessage(req, res);
  } catch (error) {
    console.error("Error handling MCP message:", error);
    if (!res.headersSent) res.status(500).send("Internal Server Error");
  }
});

app.get("/api/agent", (req, res) => {
  res.json({ status: "Agent is online and running warp racing protocol." });
});

export default app;
