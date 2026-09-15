# Mission

## Day 1 — Working with AI and Claude Code

Today's mission: use Claude Code to explore the AetherBot Library, add your
own profile, contribute a glossary term, and turn one term into a fully
enriched concept card — the first entry on the shelf.

Working method for every task: **Explore → Plan → Create → Test → Human
review → Handoff.**

You may change: your own entry in `data/profiles.json`, one new entry in
`data/glossary.json`, and one enriched card in `data/concept-cards.json`.

You may not change: anything related to authentication, secrets, or
deployment — this repository intentionally has none of those, so if a
change seems to need them, stop and ask instead of inventing a workaround.

## Day 2 — Reusable and connected AI workflows

Today's mission: make yesterday's method repeatable and connected. Improve
`CLAUDE.md` so a fresh Claude Code session understands this project without
you explaining it; finish the intentionally incomplete `create-concept-card`
skill (Skill #1) and use it to process every approved glossary term in one
bounded run; then complete the "Explain It Back" game, where your own typed
explanation of a term is checked by the `term-checker` skill (Skill #2)
against the class's `checklist.md` — entirely through local files, no
external model calls. Connect to this local MCP server to retrieve mission
context and search the glossary — explain only, do not submit or change
anything through MCP today.

Working method stays the same: **Explore → Plan → Create → Test → Human
review → Handoff**, with the agent loop (**Observe → Decide → Act → Check
→ Repeat or stop**) now happening inside the Create + Test steps for any
bounded workflow you design.

---

_This file is served by the local MCP server's `get_mission` tool. Set the
`CLASSROOM_DAY` environment variable to `1` or `2` to have the tool return only
that day's section; leave it unset to return the whole mission._
