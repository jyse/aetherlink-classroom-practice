---
name: create-concept-card
description: Use when turning a glossary entry in this repository into a complete, enriched concept card in data/concept-cards.json. Applies to one term at a time or a batch of approved terms.
---

# Create Concept Card

This skill is **intentionally incomplete**. It gives you the shape of the
method from Day 1's concept-card work, but leaves out the specifics that
Assignment 7 asks you to add yourself, based on the card(s) already approved
in this repository by that point (the seeded example, plus whatever you and
the class created in Assignments 4 and 6). Read those approved cards first —
they are your evidence for what "good" looks like here, more than this file
is.

## When to use this skill

When asked to turn one (or more) glossary term(s) from `data/glossary.json`
into an entry in `data/concept-cards.json`, following the existing
concept-card shape.

## Rough procedure

1. Read the target glossary entry in `data/glossary.json`.
2. Read `data/concept-cards.json` to see the existing card(s) and match
   their structure and tone exactly — field names, list-vs-string fields,
   how `resources` are shaped.
3. Draft the new card's content.
4. **OPEN — Assignment 7:** what sources are required or acceptable before a
   factual claim in a card can be trusted? (Currently undefined. Decide
   this and write it here: which sources count, and what to do when Claude
   cannot verify a claim against one.)
5. **OPEN — Assignment 7:** the exact required structure and field-level
   validation for a card is not written down here. Look at
   `data/concept-cards.json` and infer it, then make it explicit: field
   names, which fields are required, which are lists vs. strings, minimum
   content for something to count as "filled in" rather than a stub.
6. **OPEN — Assignment 7:** how should this skill verify facts before
   writing them into a card? "Verify the factual explanation" is asked for
   in Assignment 4's prompt panel, but this skill doesn't yet say how —
   define a concrete method (e.g. what counts as a reliable source, how to
   handle a claim that can't be checked).
7. **OPEN — Assignment 7:** what should happen when the glossary entry
   doesn't have enough information to fill in a required field? Silently
   inventing content is not acceptable — define how missing information
   should be represented instead (an `OPEN` marker, a note asking the human
   for the missing detail, or something else).
8. **OPEN — Assignment 7:** define the validation step this skill must run
   before treating a card as finished — ideally by using (or extending) the
   repo's `npm run validate` command rather than inventing a separate check.
9. **OPEN — Assignment 7:** define the stop condition. At minimum, this
   skill should never write to `data/concept-cards.json` without showing the
   proposed card and its implementation plan to a human first and getting
   explicit approval — but the exact wording of that stop condition, and
   what "approval" looks like in this repo, needs to be written here.
10. Once approved, write the card into `data/concept-cards.json`.
11. Run the project's checks and report the result.

## Boundaries (already fixed, not part of the assignment)

- Only ever write to `data/concept-cards.json`. Never edit `data/glossary.json`
  or `data/profiles.json` as a side effect of this skill.
- Never invent a source, a statistic, or a resource URL. If you cannot find
  or verify one, say so instead of filling the field with something
  plausible-sounding.
