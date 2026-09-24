# Aether Library — Technical Specification

**Repo:** [github.com/jyse/aetherlink-classroom-practice](https://github.com/jyse/aetherlink-classroom-practice)
**Status:** Working demo, verified end to end (see "Verification" below). One open product decision remains — see "Known open decision."

## 1. Purpose

Aether Library is the hands-on practice project for the AetherLink × Worldline Wave 2 two-day classroom. Each participant clones their own copy and works alone (no pairing, no shared state — that comes later, in the separate five-day support programme). Across the two days they use Claude Code to grow a small AI knowledge library: add a profile, contribute glossary terms, enrich terms into full "concept cards," build two reusable Claude Code skills, and play a learning game that gets real AI feedback with no external API calls.

## 2. Architecture at a glance

| Layer | Choice | Why |
|---|---|---|
| Server | Plain Node (`http`/`fs` built-ins only) | No framework, no build step — `npm start` and it's running |
| Frontend | Static HTML/CSS/vanilla JS, no framework | Zero build tooling; a participant can read the whole client in one sitting |
| Data | Flat JSON files in `data/` | No database — matches a solo, single-machine, disposable practice environment |
| State (the game) | Two files, single slot each | `data/latest-submission.json` / `data/latest-feedback.json` — no history, resets each round (by design, not a limitation) |
| Auth | None | Intentional — no accounts, no secrets, nothing to compromise |

**Dependencies: zero.** `package.json`'s `dependencies` is an empty object, so `npm install` needs no internet access at all — matters on a locked-down corporate network.

**No MCP anywhere in this repo, on purpose.** An earlier draft had a small local MCP server here (used by an earlier version of Assignment 11). The curriculum was revised and nothing in the final version ever calls it — Slide 70 says explicitly "the repository itself does not require MCP" — so it was removed rather than left as unexplained clutter that Claude Code would still prompt participants to trust on first run. The curriculum's real MCP work (Part 5, Assignment 12) connects to Worldline's actual Jira/GitLab/Confluence systems, configured separately, outside this repo.

## 3. Data model

### `data/profiles.json`
```json
{
  "name": "string",
  "role": "string",
  "team": "string",
  "experience": "string",
  "learningGoal": "string",
  "workflowToImprove": "string"
}
```
Assignment 2's target — participants add their own entry.

### `data/glossary.json`
```json
{
  "term": "string",
  "definition": "string"
}
```
Deliberately minimal — just a term and a plain-language definition. The richer detail (example, misconception, resources, etc.) belongs to a concept card, built by *enriching* a glossary term rather than duplicated at the glossary level. Seeded with 25 real terms pulled directly from the slide deck's own vocabulary across both days. Assignment 3's target — participants add one more.

### `data/concept-cards.json`
```json
{
  "term": "string",
  "explanation": "string",
  "example": "string",
  "commonMisunderstanding": "string",
  "essentialPoints": ["string", "..."],
  "relatedConcepts": ["string", "..."],
  "resources": [{ "label": "string", "url": "string" }]
}
```
An enriched, "graduated" version of a glossary term. Seeded with one fully-filled example (`Context window`) so participants see the target shape before building their own (Assignment 4), then process the rest of the glossary through the `create-concept-card` skill in one bounded run (Assignment 10).

### `data/fixtures/`
`glossary-complete.json` and `glossary-incomplete.json` — used only by `npm run validate:fixtures` to demonstrate the validator actually catches a broken entry (a deliberately missing field), not to seed the app itself.

## 4. Frontend pages

All four pages live in one static SPA-style shell (`public/index.html` + `public/app.js`), client-side routed by nav clicks — no page reloads, no router library.

| Page | Renders | Backing endpoint |
|---|---|---|
| **Profiles** | `data/profiles.json` as cards | `GET /api/profiles` |
| **Glossary** | `data/glossary.json` as cards | `GET /api/glossary` |
| **Library** | `data/concept-cards.json` as full cards (explanation, example, misunderstanding, essential points, related concepts, clickable resource links) | `GET /api/concept-cards` |
| **Game** ("Explain It Back") | One random glossary term, a free-text explanation box, Submit / Check feedback / Reveal | see §6 |

Deliberately **absent** from Profiles/Glossary/Library: search, filtering, an empty-state message, any "contribution status" indicator. This isn't a gap — Assignment 4 has each participant pick exactly one of these and build it themselves.

Dark navy / cyan / violet visual system, matching the live Academy app's own palette (`--bg:#06111e`, `--cyan:#69e2f2`, `--violet:#b99aff`), plus a light theme (toggle button, persisted to `localStorage`). Inter font. The **Aether Library** wordmark in the top-left carries the transparent-background AetherBOT logo mark (`public/assets/aether-logo.png`); the mascot also appears sparingly elsewhere (Library page header, Game's "waiting for feedback" state) — always with backgrounds removed, never as a white box.

## 5. Server API

| Route | Method | Behaviour |
|---|---|---|
| `/api/profiles`, `/api/glossary`, `/api/concept-cards` | GET | Streams the matching file in `data/` as-is |
| `/api/submissions` | POST | Body `{term, explanation}` (both required, trimmed, non-empty) → writes `data/latest-submission.json` with a server-set `submittedAt` timestamp; also deletes any stale `data/latest-feedback.json` so a new round never shows an old verdict. 20KB request-body cap. |
| `/api/feedback` | GET | Reads `data/latest-feedback.json` if present → `{available: true, feedback: {...}}`; otherwise `{available: false}` (200 either way — absence is a normal state, not an error) |
| anything else | GET | Serves the matching file under `public/`, falling back to `index.html` for unknown paths (SPA-style) |

No route requires authentication. No route touches anything outside `data/` and `public/`.

## 6. The Explain It Back game and the file-based feedback bridge

This is the most architecturally interesting part of the repo, because it connects a browser app to Claude Code **without any network call between them and without a server-side model API key.**

**Why this design exists:** an earlier draft of the curriculum gated "AI feedback" behind a server-side model API credential — the app itself would call a model. That's unnecessary complexity for what's actually needed: every participant already has an authenticated Claude Code session open in their own terminal. The fix was to make the *filesystem* the interface between the two processes, since they already share one (they're both running against the same repo on the same machine):

```
┌─────────────┐   POST /api/submissions   ┌──────────┐
│   Browser   │ ────────────────────────▶ │ server.js│──▶ data/latest-submission.json
└─────────────┘                            └──────────┘
                                                             │
                          (participant, in their terminal)  │ reads
                                    "Check my latest         ▼
                                     submission using   ┌──────────────┐
                                     the term-checker   │ Claude Code   │──▶ reads checklist.md
                                     skill."             │ (term-checker)│
                                                          └──────────────┘
                                                             │ writes
                                                             ▼
┌─────────────┐   GET /api/feedback       ┌──────────┐  data/latest-feedback.json
│   Browser   │ ◀──────────────────────── │ server.js│◀──────────┘
└─────────────┘  (on manual button click)  └──────────┘
```

Five explicit steps, each human-triggered on purpose (no auto-polling anywhere in this loop — a deliberate choice to keep every step visible, matching the course's whole "human in the loop" thread):

1. Participant reads the shown term, writes an explanation, clicks **Submit**.
2. The participant tells their *own* Claude Code session (already open, already authenticated, in the same repo) to check it.
3. Claude Code reads `data/latest-submission.json` and `checklist.md` as plain local files — normal file-read, not MCP — applies the `term-checker` skill, and writes `data/latest-feedback.json`.
4. The participant clicks **Check feedback**. Before that file exists, the panel explicitly says it's waiting for step 2 rather than looking broken or silently empty.
5. **Reveal** (independent of the above) shows the approved concept card for the current term at any time, for self-review.

## 7. Claude Code skills

Two skills live under `.claude/skills/`, deliberately at different completion states:

- **`create-concept-card`** — ships **intentionally incomplete**. Has a real skeleton (frontmatter, a rough procedure) but deliberately omits: required source information, exact card structure/validation, factual-verification approach, handling missing information, the validation step, and the human-approval stop condition. Assignment 9 has participants fill these in, using the one approved example card as a target.
- **`term-checker`** — ships **complete**. Reads `checklist.md` and `data/latest-submission.json`, compares, writes `data/latest-feedback.json`. Written generically against whatever `checklist.md` currently says — the criteria live in the checklist, not hardcoded into the skill. (Rationale for shipping this one complete: the curriculum lists it, alongside `checklist.md` itself, under "add before teaching" rather than as something an assignment asks participants to build — the class refines the checklist, not this skill's mechanism.)

## 8. `checklist.md`

Repo-root, plain markdown, editable by the class. Seeded with a reasonable starting checklist for what a good "explain this term back" answer should contain (central meaning, essential points, an example, no incorrect claims, no missing information, recommended resources). This is the artifact participants actually own and refine together — the whole point of separating it from the skill file is that changing what "good" means doesn't require touching code.

## 9. Validation

```bash
npm run validate            # checks profiles/glossary/concept-cards.json shape
npm run validate:fixtures   # demonstrates the validator on a known-good and a known-broken fixture
```

`scripts/validate.js` checks required fields are present and non-empty, required lists are non-empty, and `resources` entries are shaped correctly. Exits non-zero on failure with the specific problem named.

## 10. Reset

```bash
npm run reset   # git checkout -- .
```
Restores every tracked file to the last commit. Deliberately does **not** touch untracked files (like a participant's own `notes/day1-learning-note.md`) or the git-ignored round-state files (`data/latest-submission.json`, `data/latest-feedback.json`) — those are cleared by hand if a fully clean game-state is wanted.

## 11. Security / scope boundaries

- No authentication, no secrets, no real Worldline data or systems anywhere in this repo.
- No database — nothing to persist beyond the current git-ignored round state.
- No outbound network calls anywhere in the app's own code (the only external references at all are two documentation links inside the seeded example concept card, and Claude Code's own normal operation, which is outside this app's code).
- `CLAUDE.md` explicitly scopes what Claude Code may change (profile/glossary/concept-card entries) and what it may not (auth, secrets, deployment — none of which exist here, so any request touching them should be treated as a signal to stop and ask, not a workaround).

## 12. Verification performed

- Full round trip tested with real Claude Code (not simulated): submit → `claude -p "Check my latest submission using the term-checker skill."` → correct, specific feedback written and displayed in-app.
- `npm run validate` passes on real data; `npm run validate:fixtures` correctly passes the complete fixture and fails the incomplete one with the right missing field named.
- Both themes (dark/light) visually confirmed on all four pages, including the transparent mascot images.
- `npm install` confirmed to require no network access (empty `dependencies`).

## 13. Known open decision

The curriculum's own Slide 63 ("Game starter state") describes the game as shipping with visual design and an empty feedback area, expecting **participants to complete the behaviour** with Claude Code (an Assignment 11 build task) — the same pattern as `create-concept-card`. As currently shipped, the game is **fully built and working**, matching the "build the complete demo first" sequencing decision made during development. Deriving an intentionally-incomplete **starter** version of the game from this working reference (so Assignment 11 has something left to build) is a deliberate next step, not yet done.
