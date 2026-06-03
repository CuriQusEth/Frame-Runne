import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

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

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // Stateless mode for Vercel Serverless
  enableJsonResponse: true, // Native JSON response returning for stateless POST requests
});

let isConnected = false;

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Connect singleton MCP server on first request handler invocation
  if (!isConnected) {
    await mcp.connect(transport);
    isConnected = true;
  }

  try {
     // StreamableHTTPServerTransport natively handles both GET (SSE) and POST (JSON-RPC)
     // Also, because it's stateless, POST responses will be sent back directly!
     await transport.handleRequest(req, res, req.body);
  } catch (error) {
     console.error("Transport error:", error);
     if (!res.headersSent) {
       res.status(500).json({ error: "Internal Server Error during MCP processing" });
     }
  }
}

