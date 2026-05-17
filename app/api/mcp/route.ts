import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema, 
  ListPromptsRequestSchema,
  ListResourcesRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import crypto from "crypto";

// Ensure this route is evaluated dynamically (no static caching)
export const dynamic = "force-dynamic";

// Global cache to maintain session transports across requests 
// Note: In stateless Vercel edge/serverless, memory does not strictly persist across different container instances.
// For production multi-node deployments, consider a persistent transport layer.
const activeSessions = new Map<string, SSEServerTransport>();

// Initialize MCP Server
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

//
// Next.js App Router specific route handlers (named exports)
//

// GET handles the SSE connection
export async function GET(request: Request) {
  const sessionId = crypto.randomUUID();
  
  // Create a Web API stream for the SSE response
  let controllerRef: ReadableStreamDefaultController;
  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
    },
    cancel() {
      activeSessions.delete(sessionId);
    }
  });

  // Polyfill the SSEServerTransport locally targeting the Next.js Stream
  const transport = new SSEServerTransport(`/api/mcp?sessionId=${sessionId}`, null as any);
  
  // Override transport send methods to push to our ReadableStream
  transport.send = async (message) => {
    const data = `event: message\ndata: ${JSON.stringify(message)}\n\n`;
    controllerRef!.enqueue(new TextEncoder().encode(data));
  };
  
  transport.close = async () => {
    controllerRef!.close();
    activeSessions.delete(sessionId);
  };

  activeSessions.set(sessionId, transport);

  // Send the endpoint event immediately per protocol
  const endpointUrl = new URL(request.url);
  endpointUrl.searchParams.set("sessionId", sessionId);
  const endpointEvent = `event: endpoint\ndata: ${endpointUrl.toString()}\n\n`;
  controllerRef!.enqueue(new TextEncoder().encode(endpointEvent));

  // Await the MCP server attachment
  mcp.connect(transport).catch(console.error);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}

// POST handles the JSON-RPC messages from the client
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");
    
    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const transport = activeSessions.get(sessionId);
    if (!transport) {
      return Response.json({ error: "Session not found or expired" }, { status: 404 });
    }

    const message = await request.json();
    
    // Process incoming JSON-RPC using the established transport
    if (transport.onmessage) {
      transport.onmessage(message);
    }
    
    return Response.json({ status: "Accepted" }, { status: 202 });
  } catch (error: any) {
    console.error("MCP POST Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
