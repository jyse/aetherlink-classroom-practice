# Mission

## Day 1 — From AI to your first tested change

Today's mission: use Claude Code to explore this practice repository, make a plan,
create one small change, test the result, and have a human review the evidence
before accepting it.

Working method for every task: **Explore → Plan → Change → Test → Human review.**

You may change: your own entry in `data/profiles.json`, one new entry in
`data/glossary.json`, and one small, tested improvement to the frontend in `public/`.

You may not change: anything related to authentication, secrets, or deployment —
this repository intentionally has none of those, so if a change seems to need them,
stop and ask instead of inventing a workaround.

## Day 2 — From one-off prompt to reusable agent workflow

Today's mission: make yesterday's work repeatable. Improve `CLAUDE.md` so a fresh
Claude Code session can understand this project without you explaining it, build a
small reusable skill for checking a learning note, and connect to this local MCP
server to retrieve mission context and search the glossary — explain only, do not
submit or change anything through MCP today.

Working method stays the same: **Explore → Plan → Change → Test → Human review**,
with the agent loop (**Observe → Decide → Act → Check → Repeat or stop**) now
happening inside the Change + Test steps for any bounded workflow you design.

---

_This file is served by the local MCP server's `get_mission` tool. Set the
`CLASSROOM_DAY` environment variable to `1` or `2` to have the tool return only
that day's section; leave it unset to return the whole mission._
