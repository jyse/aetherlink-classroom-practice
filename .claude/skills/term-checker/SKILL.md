---
name: term-checker
description: Use when asked to check the latest Explain It Back submission in this repository (for example, "check my latest submission using the term-checker skill"). Reads checklist.md and data/latest-submission.json, compares the answer against the reference material, and writes structured feedback to data/latest-feedback.json.
---

# Term checker

This skill is the engine behind the Explain It Back game's feedback. It is
deliberately generic: the criteria it checks an explanation against live in
`checklist.md`, not in this file. Editing `checklist.md` changes what the
next check looks for — this skill's own procedure does not need to change.

Unlike `create-concept-card`, this skill ships complete. The class edits
`checklist.md` together as the criteria evolve; this file is the fixed
mechanism that applies whatever `checklist.md` currently says.

## When to use this skill

When a participant asks Claude Code to check their latest Explain It Back
submission (however they phrase it — "check my submission", "run the
term-checker skill", "grade my answer").

## Required input

- `checklist.md` (repo root) — the current criteria and rating labels for a
  good explanation. Always re-read it fresh; do not rely on a cached memory
  of its contents from earlier in the session, since the class may have
  edited it.
- `data/latest-submission.json` — the single most recent submission, written
  by the app's `POST /api/submissions` endpoint. Shape:
  ```json
  { "term": "string", "explanation": "string", "submittedAt": "ISO 8601 string" }
  ```

## Reference material to compare against

For the submission's `term`, look for a matching entry (case-insensitive) in
this order:

1. `data/concept-cards.json` — if a full concept card exists for this term,
   it is the primary reference: use its `explanation`, `essentialPoints`,
   `example`, and `commonMisunderstanding` as the basis for judging
   correctness and completeness.
2. `data/glossary.json` — if there is no concept card yet for this term, use
   the glossary entry (`definition`, `example`, `commonMisconception`,
   `relevance`) instead. Note in the feedback that only a basic glossary
   entry existed, not a full concept card, so completeness expectations are
   necessarily lighter.
3. If the term matches neither file, you cannot evaluate the submission
   factually. Use the `Unable to evaluate` rating and say why in the
   feedback rather than guessing.

## Procedure

1. Read `checklist.md` in full.
2. Read `data/latest-submission.json`.
   - If the file does not exist, or `explanation` is empty/whitespace-only,
     write feedback with rating `Unable to evaluate` and a `note` explaining
     there is nothing to check yet. Stop here.
3. Find the reference material for `term` as described above.
4. Compare the submitted `explanation` against each criterion currently
   listed in `checklist.md` (do not assume the list below is exact — read
   the file each time):
   - Does it state the central meaning correctly, in the participant's own
     words?
   - Does it cover the term's important/essential elements?
   - Does it include a practical example?
   - Does it contain any claim that contradicts the reference material?
   - Does it omit something a correct explanation needs?
5. Choose one rating using the labels and thresholds defined in
   `checklist.md`'s "How to rate an explanation" section (currently: Strong
   explanation / Partially complete / Review this concept / Unable to
   evaluate — but treat `checklist.md` as the source of truth if that
   section changes).
6. Do not treat different wording as automatically incorrect — judge
   meaning, not phrasing. Only flag something as an incorrect claim if it
   actually conflicts with the reference material.
7. Write the result to `data/latest-feedback.json`, replacing any previous
   content, in this shape:
   ```json
   {
     "term": "string",
     "checkedAt": "ISO 8601 string",
     "rating": "Strong explanation | Partially complete | Review this concept | Unable to evaluate",
     "whatWasUnderstood": "string — what the explanation got right",
     "missingElements": ["string", "..."],
     "incorrectClaims": ["string", "..."],
     "recommendedResources": ["string", "..."],
     "note": "string — anything the participant should know, including any OPEN uncertainty"
   }
   ```
   Use empty arrays (not omitted keys) when there is nothing to list for
   `missingElements`, `incorrectClaims`, or `recommendedResources`.
8. Report a short summary back to the participant in the conversation as
   well — the file is what the app displays, but the participant is still
   in the loop and should see what you found.

## Boundaries

- Only write to `data/latest-feedback.json`. Never edit
  `data/latest-submission.json`, `checklist.md`, `data/glossary.json`, or
  `data/concept-cards.json` as a side effect of a check.
- Never fabricate a fact, resource, or source to fill in a field — an empty
  array or an honest `note` is correct when you don't have something to put
  there.
- No server-side model call is involved anywhere in this flow. This skill
  runs inside the participant's own authenticated Claude Code session and
  writes a local file; the web app never calls out to any AI API itself.
