import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import crypto from "crypto";

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

const activeSessions = new Map<string, SSEServerTransport>();

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Handle SSE Connection (GET)
  if (req.method === "GET") {
    // We send back an endpoint URL with NO extra query params
    const sessionTransport = new SSEServerTransport("/api/mcp", res);
    const sessionId = sessionTransport.sessionId;
    
    activeSessions.set(sessionId, sessionTransport);
    
    res.on("close", () => {
      activeSessions.delete(sessionId);
    });

    await mcp.connect(sessionTransport);
    
    // Keep the SSE connection open indefinitely until client disconnects
    await new Promise((resolve) => {
      req.on('close', resolve);
      res.on('close', resolve);
      sessionTransport.onclose = resolve as any;
    });
    return;
  }

  // Handle JSON-RPC Execution (POST)
  if (req.method === "POST") {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host || "localhost";
    const fullUrl = new URL(req.url || "", `${protocol}://${host}`);
    
    let sessionId = fullUrl.searchParams.get("sessionId");
    if (!sessionId && req.query) {
      sessionId = Array.isArray(req.query.sessionId) ? req.query.sessionId[0] : req.query.sessionId;
    }
    
    if (!sessionId) {
      res.status(422).send("Missing sessionId parameter (custom 422)");
      return;
    }

    const sessionTransport = activeSessions.get(sessionId);
    if (!sessionTransport) {
      res.status(404).send("Session not found or expired (custom 404.1)");
      return;
    }

    try {
      if (!req.body || Object.keys(req.body).length === 0) {
         res.status(415).send('Invalid message: Empty Body (custom 415)');
         return;
      }
      
      const parsedBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      
      if (sessionTransport.onmessage) {
        await sessionTransport.onmessage(parsedBody);
      }
      res.status(202).send("Accepted");
    } catch (error: any) {
      console.error("Error handling MCP message:", error);
      res.status(417).send(`Invalid message (custom 417): ${error.message || String(error)}`);
    }
  }
}

