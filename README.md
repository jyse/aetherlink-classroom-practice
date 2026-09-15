# Aether Library

A solo practice repository for the AetherLink Worldline Wave 2 classroom
(Teaching Days 1-2). This is a safe repository, not a toy prompt: a genuinely
small, real, runnable project with clean git status and no real data or
secrets, that you explore, change, test, and review with Claude Code.

The practical project you build here is the **Aether Library** — a small
AI knowledge library that grows across the two teaching days: participant
profiles, an AI glossary, enriched concept cards, and a learning game.

Each participant clones their own copy and works alone — no pairing, no shared
state, no real-time collaboration. That comes later, in the separate five-day
support programme.

## Setup

```bash
npm install
npm start
```

**`npm install` needs no internet access.** This repo has zero npm
dependencies — the MCP server (`mcp-server.mjs`) is a small hand-rolled
implementation of the slice of the MCP spec it needs, not built on
`@modelcontextprotocol/sdk`. That matters on a locked-down corporate
network: cloning/copying this folder and running `npm install && npm start`
works completely offline, with no package registry required at any point.

Then open http://localhost:3000. You'll see four pages reachable from the
sidebar:

- **Profiles** and **Glossary** — render real data from `data/profiles.json`
  and `data/glossary.json`.
- **Library** — renders `data/concept-cards.json` as a card grid. Ships with
  one fully-filled example card (`Context window`) so you can see the target
  shape before building your own in Assignment 4.
- **Game** ("Explain It Back") — the learning game described below.

## Reset to a known-good state

If you get stuck or want to start a task over, discard local changes and
return to the last commit:

```bash
npm run reset
```

This runs `git checkout -- .`, which restores every tracked file. It will not
touch new files you've created (like `notes/day1-learning-note.md`), only
files that were already committed. It also won't touch
`data/latest-submission.json` or `data/latest-feedback.json` — those are
git-ignored round state for the game, not tracked files; delete them by hand
if you want a completely clean slate for the game specifically.

## Validating the data files

```bash
npm run validate
```

Checks `data/profiles.json`, `data/glossary.json`, and
`data/concept-cards.json` against basic shape requirements — required fields
present and non-empty, required lists non-empty, `resources` entries shaped
correctly. Exits non-zero if anything fails, with a list of what's wrong.

To see it catch a genuinely broken entry, there are two fixture files under
`data/fixtures/`: one complete, one deliberately missing a field. Run:

```bash
npm run validate:fixtures
```

This validates both fixtures against the glossary schema and prints PASS for
the complete one and FAIL (with the specific missing field) for the
incomplete one. That command always exits 0 — the incomplete fixture failing
is the expected, correct outcome, not a bug — it's there so you can see the
validator actually catch something before relying on it.

You can also point the validator at any single file directly:

```bash
node scripts/validate.js data/fixtures/glossary-incomplete.json glossary
```

## The Explain It Back game and the submission/feedback file bridge

The Game page shows one random glossary term, an answer box, and a Submit
button. This is Assignment 9's required behaviour, and it works like this:

1. You read the term, write your own explanation, and click **Submit**. The
   app `POST`s it to the local server, which writes it to
   `data/latest-submission.json` — a single slot, no history. Submitting
   again overwrites it and clears any previous feedback file, since that
   feedback belonged to the previous round.
2. You tell your own Claude Code session (running in your terminal, in this
   same repo) to check it — for example: *"Check my latest submission using
   the term-checker skill."*
3. Claude Code reads `data/latest-submission.json` and `checklist.md`
   directly (plain local file reads — no network call, no MCP needed for
   this), applies the `term-checker` skill
   (`.claude/skills/term-checker/SKILL.md`), and writes structured feedback
   to `data/latest-feedback.json`.
4. Back in the app, you click the **Check feedback** button — it is
   deliberately manual, not auto-polling, so every step stays visibly
   human-triggered. It `GET`s `/api/feedback`, which reads
   `data/latest-feedback.json` if present. Before that file exists, the panel
   clearly says it's waiting for you to ask Claude Code to check it, rather
   than looking broken or silently empty.
5. You can also click **Reveal** at any time, independent of the feedback
   flow, to see the approved concept card for the current term and
   self-review your own answer against it.

**Why files instead of an API key:** the original curriculum draft gated "AI
feedback" behind a server-side model API credential. That's unnecessary here
— Claude Code, running in your own terminal, is already authenticated. There
is no server-side model call anywhere in this app; "AI feedback" is entirely
your own Claude Code session doing file-based work against `checklist.md`
and the submission file.

`checklist.md` (repo root) is the class's own, editable list of what a good
explanation should contain — seeded from the curriculum's evaluation
criteria, meant to be refined together as you use the game. The
`term-checker` skill is written generically against whatever
`checklist.md` currently says, rather than hardcoding criteria into the
skill itself.

## Skills

Two skills live under `.claude/skills/`:

- **`create-concept-card`** — turns a glossary term into a concept card.
  Ships **intentionally incomplete**: it has a real skeleton (when to use it,
  a rough procedure) but deliberately leaves out the specifics — required
  source information, exact card structure and validation, factual
  verification, handling missing information, the validation step, and the
  human-approval stop condition. Assignment 7 has you fill those in, based on
  the approved card(s) already in the repo.
- **`term-checker`** — checks an Explain It Back submission against
  `checklist.md` and writes `data/latest-feedback.json`. Ships **complete**,
  since the curriculum lists it (alongside `checklist.md`, the game page, and
  the feedback area) under "add before teaching" rather than as something an
  assignment asks you to build — the class refines `checklist.md`, not this
  skill's mechanism.

## Project structure

- `server.js` — a tiny Node server (built-in `http`/`fs` only, no framework)
  that serves `public/` and exposes:
  - `GET /api/profiles`, `GET /api/glossary`, `GET /api/concept-cards` —
    read the matching JSON file in `data/`.
  - `POST /api/submissions` — writes `data/latest-submission.json` (single
    slot) and clears `data/latest-feedback.json`.
  - `GET /api/feedback` — reads `data/latest-feedback.json` if present.
- `public/` — the frontend: plain HTML, CSS, and vanilla JS. No build step.
  `public/assets/` holds the AetherBOT mascot images, used sparingly (the
  Library page header and the game's "waiting for feedback" state).
- `data/profiles.json` — participant profiles (Assignment 2 target).
- `data/glossary.json` — AI terminology entries (Assignment 3 target).
- `data/concept-cards.json` — enriched concept cards (Assignment 4/7/8
  target). Seeded with one complete example.
- `data/fixtures/` — one complete and one deliberately incomplete glossary
  fixture, for exercising `npm run validate`.
- `data/mission.md` — source for the MCP server's `get_mission` tool.
- `mcp-server.mjs` — a local MCP server (Assignment 9 in the original
  numbering — see `.mcp.json` and the section below).
- `checklist.md` — editable, class-authored explanation criteria.
- `scripts/validate.js` — the `npm run validate` implementation.
- `.claude/skills/create-concept-card/SKILL.md` — Skill #1 (intentionally
  incomplete).
- `.claude/skills/term-checker/SKILL.md` — Skill #2 (complete).
- `notes/day1-learning-note-template.md` — copy this to
  `notes/day1-learning-note.md` and fill it in at the end of Day 1. You'll use
  it again on Day 2.
- `CLAUDE.md` — project instructions for Claude Code. You'll review and
  improve this yourself in Assignment 5.

## Connecting Claude Code to the local MCP server

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

Use this connection to explain what you find. Do not submit or change
anything through it — there is nothing to submit here anyway; these two
tools have no write path. (This local server is separate from, and much
simpler than, the real Jira/GitLab/Confluence connections covered in Part 5
of the curriculum — those are configured outside this repo, against real
Worldline systems.)

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

`.claude/skills/create-concept-card/SKILL.md` is intentionally incomplete in
the same spirit — see the "Skills" section above. `.claude/skills/term-checker/SKILL.md`
is deliberately complete instead; only `checklist.md`'s content is meant to
be edited by the class.
