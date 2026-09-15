# Aether Library

## Purpose

This is a solo practice repository for the AetherLink classroom (Teaching Days 1-2).
It is a small, self-contained stand-in for the AetherLink Academy: a place to
practise exploring a project, making a plan, changing it, testing the result, and
having a human review the evidence — all with Claude Code. The practical project
built here is called the Aether Library.

There is no database, no authentication, and no shared or real-time state. Each
participant works in their own local copy.

## Structure

- `server.js` — a tiny Node server (built-in `http`/`fs` only) that serves the
  frontend in `public/` and exposes read endpoints (`/api/profiles`,
  `/api/glossary`, `/api/concept-cards`, `/api/feedback`) plus one write
  endpoint (`POST /api/submissions`), backed by the JSON files in `data/`.
- `public/` — the frontend: plain HTML, CSS, and vanilla JS. No framework, no
  build step. `index.html` loads `style.css` and `app.js` directly.
  `public/assets/` holds the AetherBOT mascot images.
- `data/profiles.json` — participant profiles, shown on the Profiles page.
- `data/glossary.json` — AI terminology entries, shown on the Glossary page.
- `data/concept-cards.json` — enriched concept cards, shown on the Library page.
- `data/latest-submission.json` / `data/latest-feedback.json` — the Explain It
  Back game's single-slot round state (git-ignored; regenerated each round).
- `data/fixtures/` — example glossary entries (one complete set, one
  deliberately incomplete) used to exercise `npm run validate`.
- `scripts/validate.js` — basic shape validation for the JSON data files.
- `checklist.md` — the class's own criteria for a good "explain this term
  back" answer, read by the `term-checker` skill.
- `.claude/skills/create-concept-card/` — the skill used to turn a glossary
  term into a concept card (intentionally incomplete; see the skill file).
- `.claude/skills/term-checker/` — the skill used to check an Explain It Back
  submission against `checklist.md`.
- `notes/` — where a participant's own learning notes live (not pre-filled).

## Data shape

A profile entry has: `name`, `role`, `team`, `experience`, `learningGoal`,
`workflowToImprove`.

A glossary entry has: `term`, `definition`, `example`, `commonMisconception`,
`relevance`.

A concept card entry has: `term`, `explanation`, `example`,
`commonMisunderstanding`, `essentialPoints` (list), `relatedConcepts` (list),
`resources` (list of `{ label, url }`).

Keep new entries consistent with this shape and with the existing tone —
plain language, no invented facts.
