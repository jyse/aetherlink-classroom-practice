#!/usr/bin/env node
// Small local MCP server for the AetherBot Library practice repo.
//
// This is a hand-rolled MCP server — NOT built on @modelcontextprotocol/sdk
// — implementing just the slice of the MCP spec these two tools need
// (initialize, tools/list, tools/call) directly over stdio JSON-RPC. This
// means the repo has ZERO npm dependencies: `npm install` needs no
// internet access at all, which matters if a participant's machine can't
// reach the public npm registry. If a future change needs more of the MCP
// spec than this covers, switching back to the official SDK is one file.
//
// Stdio transport, two read-only tools — explain-only, per Assignment 9
// ("do not submit or change anything"). No write tools are exposed here.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = join(__dirname, "data");

const SERVER_INFO = { name: "aetherlink-classroom-practice", version: "1.0.0" };

// --- Tool implementations -------------------------------------------------

async function getMission() {
  const full = await readFile(join(DATA_DIR, "mission.md"), "utf8");
  const day = process.env.CLASSROOM_DAY;

  let text = full;
  if (day === "1" || day === "2") {
    const heading = day === "1" ? "## Day 1" : "## Day 2";
    const otherHeading = day === "1" ? "## Day 2" : "## Day 1";
    const startIndex = full.indexOf(heading);
    if (startIndex !== -1) {
      const afterStart = full.slice(startIndex);
      const nextIndex = afterStart.indexOf(otherHeading);
      text = nextIndex === -1 ? afterStart : afterStart.slice(0, nextIndex);
    }
  }

  return { content: [{ type: "text", text: text.trim() }] };
}

async function searchKnowledge(args) {
  // Hand-rolled equivalent of the old zod schema: query is an optional
  // string, max 200 chars, defaulting to "".
  let query = args && typeof args.query === "string" ? args.query : "";
  if (query.length > 200) {
    throw new McpError(-32602, "query must be 200 characters or fewer");
  }

  const raw = await readFile(join(DATA_DIR, "glossary.json"), "utf8");
  const terms = JSON.parse(raw);
  const needle = query.trim().toLowerCase();

  const matches = needle
    ? terms.filter((entry) =>
        [entry.term, entry.definition, entry.example].some((field) =>
          String(field || "").toLowerCase().includes(needle)
        )
      )
    : terms;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ query: needle, count: matches.length, matches }, null, 2),
      },
    ],
  };
}

const TOOLS = [
  {
    name: "get_mission",
    title: "Get today's mission",
    description:
      "Read today's mission for this classroom practice repo. Returns markdown describing the current assignment context. Set CLASSROOM_DAY=1 or 2 to scope to one day; unset returns the whole mission.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: getMission,
  },
  {
    name: "search_knowledge",
    title: "Search the glossary",
    description:
      "Case-insensitively search data/glossary.json across term, definition and example fields. An empty query returns every term.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", maxLength: 200, default: "" } },
      additionalProperties: false,
    },
    handler: searchKnowledge,
  },
];

// --- Minimal JSON-RPC 2.0 / MCP stdio wire protocol ------------------------
// Just enough of the spec for a client (Claude Code) to: initialize, list
// tools, and call a tool. Messages are newline-delimited JSON on stdin/stdout.

class McpError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function send(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handleRequest(msg) {
  const { id, method, params } = msg;

  try {
    if (method === "initialize") {
      // Echo back whatever protocol version the client asked for — this
      // server only implements a narrow slice of MCP, so there's no real
      // version negotiation to do; matching the client's own version is
      // the most compatible thing to return.
      const protocolVersion = params?.protocolVersion || "2024-11-05";
      sendResult(id, {
        protocolVersion,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
      return;
    }

    if (method === "tools/list") {
      sendResult(id, {
        tools: TOOLS.map(({ name, title, description, inputSchema }) => ({
          name,
          title,
          description,
          inputSchema,
        })),
      });
      return;
    }

    if (method === "tools/call") {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) {
        sendError(id, -32602, `Unknown tool: ${params?.name}`);
        return;
      }
      try {
        const result = await tool.handler(params?.arguments || {});
        sendResult(id, result);
      } catch (err) {
        if (err instanceof McpError) {
          sendError(id, err.code, err.message);
        } else {
          // Tool-level failure: MCP convention is a successful envelope
          // with isError:true, not a JSON-RPC error, so the model sees
          // the failure as a normal tool result it can reason about.
          sendResult(id, {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true,
          });
        }
      }
      return;
    }

    if (method === "ping") {
      sendResult(id, {});
      return;
    }

    // Unknown method. Notifications (no `id`) get no response at all,
    // per JSON-RPC — anything else is an unsupported-method error.
    if (id !== undefined) {
      sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    if (id !== undefined) {
      sendError(id, -32603, `Internal error: ${err.message}`);
    }
  }
}

// Buffer stdin and split on newlines — a chunk may contain zero, one, or
// several complete JSON-RPC messages.
let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue; // Not valid JSON — ignore rather than crash the server.
    }
    handleRequest(msg);
  }
});

process.stdin.on("end", () => process.exit(0));
