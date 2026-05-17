import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const app = express();
const PORT = 3000;

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
    },
  }
);

// Add MCP Tools
mcp.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_race_status",
        description: "Get the current status of the warp race.",
        inputSchema: {
          type: "object",
          properties: {
            raceId: { type: "string", description: "The ID of the race" },
          },
          required: ["raceId"],
        },
      },
      {
        name: "optimize_performance",
        description: "Analyze and optimize racing performance.",
        inputSchema: {
          type: "object",
          properties: {
            trackId: { type: "string" },
          },
          required: ["trackId"],
        },
      }
    ],
  };
});

mcp.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "get_race_status") {
    return {
      content: [{ type: "text", text: `Race ${args.raceId} is currently in progress. Warp drive at 90%.` }],
    };
  }
  
  if (name === "optimize_performance") {
    return {
      content: [{ type: "text", text: `Performance for track ${args.trackId} optimized. Speed increased by 15%. ` }],
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

// Add MCP Prompts
mcp.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "racing_strategy",
        description: "Generate a racing strategy for a specific track",
        arguments: [
          {
            name: "trackType",
            description: "The type of the track (e.g. desert, neon, cyber)",
            required: true,
          }
        ]
      },
    ]
  };
});

mcp.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "racing_strategy") {
    return {
      description: "Racing Strategy",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Provide a detailed warp racing strategy for a ${args?.trackType} track, taking into account drift optimizations and momentum.`
          }
        }
      ]
    };
  }
  
  throw new Error(`Prompt not found: ${name}`);
});

// Transport state for SSE
let transport: SSEServerTransport | null = null;

// The endpoint where MCP clients connect to receive SSE events
app.get("/api/mcp", async (req, res) => {
  transport = new SSEServerTransport("/api/mcp/message", res);
  // Send the appropriate headers and keep connection open
  await mcp.connect(transport);
});

// The endpoint where MCP clients POST messages to the server
app.post("/api/mcp/message", express.json(), async (req, res) => {
  if (!transport) {
    res.status(400).send("No active MCP session");
    return;
  }
  
  try {
    await transport.handlePostMessage(req, res);
  } catch (error) {
    console.error("Error handling MCP message:", error);
    if (!res.headersSent) {
      res.status(500).send("Internal Server Error");
    }
  }
});

// Dummy API endpoint for agent
app.get("/api/agent", (req, res) => {
  res.json({ status: "Agent is online and running warp racing protocol." });
});

async function startServer() {
  // Serve .well-known directly to avoid dot-folder blocks
  app.use("/.well-known", express.static(path.join(process.cwd(), "public", ".well-known")));

  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for development
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa", // Fix React refresh conflicts
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Error creating vite server:", e);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
