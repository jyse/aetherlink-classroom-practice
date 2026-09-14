#!/usr/bin/env node
// Small local MCP server for the AetherLink classroom practice repo.
// Stdio transport, two read-only tools — explain-only, per Assignment 9
// ("do not submit or change anything"). No write tools are exposed here.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = join(__dirname, "data");

const server = new McpServer({
  name: "aetherlink-classroom-practice",
  version: "1.0.0",
});

server.registerTool(
  "get_mission",
  {
    title: "Get today's mission",
    description:
      "Read today's mission for this classroom practice repo. Returns markdown describing the current assignment context. Set CLASSROOM_DAY=1 or 2 to scope to one day; unset returns the whole mission.",
    inputSchema: {},
  },
  async () => {
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

    return {
      content: [{ type: "text", text: text.trim() }],
    };
  }
);

server.registerTool(
  "search_knowledge",
  {
    title: "Search the glossary",
    description:
      "Case-insensitively search data/glossary.json across term, definition and example fields. An empty query returns every term.",
    inputSchema: {
      query: z.string().max(200).default(""),
    },
  },
  async ({ query }) => {
    const raw = await readFile(join(DATA_DIR, "glossary.json"), "utf8");
    const terms = JSON.parse(raw);
    const needle = (query || "").trim().toLowerCase();

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
);

const transport = new StdioServerTransport();
await server.connect(transport);
