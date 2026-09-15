# Concept explanation checklist

This is the class's own list of what a good "explain this term back" answer
should contain. It starts from the criteria in the curriculum (Slide 66,
"Concept explanation criteria") and is meant to be edited and extended by the
class as you use the Explain It Back game — it is not a fixed spec.

The `term-checker` skill (`.claude/skills/term-checker/SKILL.md`) reads this
file every time it checks a submission. It does not hardcode any of these
criteria itself — change this file and the next check reflects the change.

## What a strong explanation includes

- **Central meaning** — states, in the participant's own words, what the
  term actually means. Not a copy-pasted definition; a sign the participant
  understands it.
- **Important elements** — touches the essential points a correct
  explanation can't really skip (see the term's concept card, if one exists,
  for what those are for this specific term).
- **Practical example** — gives or references a concrete example of the
  concept in use, not only an abstract description.
- **No incorrect claims** — doesn't assert something about the term that is
  factually wrong or contradicts the approved concept card / glossary entry.
- **Acknowledges what it doesn't cover** — for a partial answer, it's better
  that the participant's phrasing doesn't overclaim completeness than that it
  silently omits something important.
- **Recommended resources** — bonus, not required: pointing at where to read
  more (the concept card's own resources are a reasonable bar).

## How to rate an explanation

Use one of these four labels, matching Slide 66:

- **Strong explanation** — central meaning is correct, the important
  elements are present, and there's a practical example. Minor omissions are
  fine.
- **Partially complete** — the central meaning is roughly right but one or
  more important elements or the example is missing.
- **Review this concept** — the central meaning is missing, vague, or
  contains an incorrect claim that would mislead someone relying on it.
- **Unable to evaluate** — there is no submission yet, the submission is
  empty, or the term being explained doesn't match any known glossary entry
  or concept card.

## Notes for the class

- Edit this file directly when you agree a criterion should be added,
  reworded, or dropped — no code change is needed for that.
- Keep criteria about the *content* of the explanation, not about writing
  style, length, or grammar.
- If a criterion turns out to be impossible for the skill to check
  automatically (for example, something highly subjective), say so here
  rather than deleting it silently — mark it `OPEN` and discuss it as a
  class.
