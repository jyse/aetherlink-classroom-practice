# AetherLink Classroom Practice

## Purpose

This is a solo practice repository for the AetherLink classroom (Teaching Days 1-2).
It is a small, self-contained stand-in for the AetherLink Academy: a place to
practise exploring a project, making a plan, changing it, testing the result, and
having a human review the evidence — all with Claude Code.

There is no database, no authentication, and no shared or real-time state. Each
participant works in their own local copy.

## Structure

- `server.js` — a tiny Node server (built-in `http`/`fs` only) that serves the
  frontend in `public/` and exposes two read endpoints, `/api/profiles` and
  `/api/glossary`, backed by the JSON files in `data/`.
- `public/` — the frontend: plain HTML, CSS, and vanilla JS. No framework, no
  build step. `index.html` loads `style.css` and `app.js` directly.
- `data/profiles.json` — participant profiles, shown on the Profiles page.
- `data/glossary.json` — AI terminology entries, shown on the Glossary page.
- `data/mission.md` — the source the local MCP server's `get_mission` tool reads.
- `mcp-server.mjs` — a local MCP server (stdio) exposing `get_mission` and
  `search_knowledge`.
- `notes/` — where a participant's own learning notes live (not pre-filled).

## Data shape

A profile entry has: `name`, `role`, `team`, `experience`, `learningGoal`,
`workflowToImprove`.

A glossary entry has: `term`, `definition`, `example`, `commonMisconception`,
`relevance`.

Keep new entries consistent with this shape and with the existing tone —
plain language, no invented facts.
