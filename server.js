// Minimal static + JSON-data server for the AetherLink classroom practice repo.
// Deliberately plain: Node's built-in http/fs modules only, no framework, no build step.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = join(__dirname, "public");
const DATA_DIR = join(__dirname, "data");
const PORT = process.env.PORT || 3000;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

async function sendJsonFile(res, fileName) {
  try {
    const raw = await readFile(join(DATA_DIR, fileName), "utf8");
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(raw);
  } catch (err) {
    res.writeHead(err.code === "ENOENT" ? 404 : 500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: `Could not read ${fileName}: ${err.message}` }));
  }
}

async function sendStatic(res, requestPath) {
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(PUBLIC_DIR, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    const type = CONTENT_TYPES[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "content-type": type });
    res.end(body);
  } catch (err) {
    if (err.code === "ENOENT") {
      // SPA-style fallback: unknown paths get index.html so /profiles, /glossary work on refresh.
      try {
        const body = await readFile(join(PUBLIC_DIR, "index.html"));
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    } else {
      res.writeHead(500);
      res.end("Server error");
    }
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/profiles") {
    return sendJsonFile(res, "profiles.json");
  }
  if (url.pathname === "/api/glossary") {
    return sendJsonFile(res, "glossary.json");
  }

  return sendStatic(res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Aetherlink classroom practice app running at http://localhost:${PORT}`);
});
