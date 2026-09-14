# AetherLink Classroom Practice

A solo practice repository for the AetherLink Worldline Wave 2 classroom
(Teaching Days 1-2). This is a safe repository, not a toy prompt: a genuinely
small, real, runnable project with clean git status and no real data or
secrets, that you explore, change, test, and review with Claude Code.

Each participant clones their own copy and works alone — no pairing, no shared
state, no real-time collaboration. That comes later, in the separate five-day
support programme.

## Setup

```bash
npm install
npm start
```

Then open http://localhost:3000. You'll see two pages — **Profiles** and
**Glossary** — reachable from the sidebar, both rendering real data from the
JSON files in `data/`.

## Reset to a known-good state

If you get stuck or want to start a task over, discard local changes and
return to the last commit:

```bash
npm run reset
```

This runs `git checkout -- .`, which restores every tracked file. It will not
touch new files you've created (like `notes/day1-learning-note.md`), only
files that were already committed.

## Project structure

- `server.js` — a tiny Node server (built-in `http`/`fs` only, no framework)
  that serves `public/` and exposes `/api/profiles` and `/api/glossary`.
- `public/` — the frontend: plain HTML, CSS, and vanilla JS. No build step.
- `data/profiles.json` — participant profiles (Assignment 2 target).
- `data/glossary.json` — AI terminology entries (Assignment 3 target).
- `data/mission.md` — source for the MCP server's `get_mission` tool.
- `mcp-server.mjs` — a local MCP server (Assignment 9).
- `notes/day1-learning-note-template.md` — copy this to
  `notes/day1-learning-note.md` and fill it in at the end of Day 1. You'll use
  it again on Day 2.
- `CLAUDE.md` — project instructions for Claude Code. You'll review and
  improve this yourself in Assignment 5.

## Connecting Claude Code to the local MCP server (Assignment 9)

This repo ships with a project-scoped `.mcp.json` pointing at the bundled MCP
server, so opening Claude Code in this folder should offer the connection
automatically:

```json
{
  "mcpServers": {
    "academy-practice": {
      "command": "node",
      "args": ["mcp-server.mjs"]
    }
  }
}
```

To check it's connected, run `/mcp` inside a Claude Code session started in
this project. It exposes exactly two tools, both read-only:

- `get_mission` — returns today's mission as markdown (reads `data/mission.md`;
  set `CLASSROOM_DAY=1` or `CLASSROOM_DAY=2` in your shell to scope it to one
  day).
- `search_knowledge` — takes `{ query: string }` and searches `data/glossary.json`
  case-insensitively across `term`, `definition`, and `example`; an empty
  query returns every term.

Per Assignment 9: use this connection to explain what you find. Do not submit
or change anything through it — there is nothing to submit here anyway; these
two tools have no write path.

You can also run the MCP server directly to sanity-check it outside Claude
Code:

```bash
npm run mcp
```

It talks stdio JSON-RPC, so running it directly won't print anything visible
on its own — that's expected.

## Notes for the facilitator

`CLAUDE.md` in this repo is intentionally minimal — it covers the project's
purpose and structure but leaves out approved commands, privacy boundaries,
validation expectations, and the human-approval boundary on purpose.
Assignment 5 has each participant add those themselves and then prove it with
a fresh-session test. Please don't pre-fill it before the class.

The Profiles and Glossary pages likewise ship with no search box, no
role/team or category filter, no empty-state message, and no
contribution-status indicator. That's deliberate: Assignment 4 has each
participant choose one of those seven ideas and add it themselves. If you spot
one of these "missing" during a dry run, that's expected — it isn't a bug.
