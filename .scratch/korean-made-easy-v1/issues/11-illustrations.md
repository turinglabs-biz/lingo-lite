# 11 Illustrations

Status: done
Blocked by: none

## What
- Draw an Illustration for all 241 Expressions in `catalog/illustrations.ts`, using the shared visual language in the spec.
  - Build them from a small set of drawing primitives so the style stays consistent.
  - Expressions that show the same thing share a drawing key.
- An `<Illustration>` component that renders one inline, so it follows the theme colors.
- Show Illustrations at first exposure, after reveal (Speak, Listen, See), and in the Phrasebook list and Show view.
- A coverage test: every Expression has an Illustration, and every drawing key resolves.
- My own visual QA: render a contact sheet of all 241 and redraw anything broken or illegible. The user skipped the review step.

## Done when
- The coverage test passes, and the contact sheet has been checked and fixed.

## Comments

- 2026-09-27: 241 Expressions map onto about 225 drawings in `catalog/illustrations.ts`, built from shared primitives. Coverage tests pass.
  - Contact-sheet QA found and fixed:
    - the cupped-hands shape read as lips, so it's now a palm-up hand
    - text overflowing banknotes and the ₩₩₩ tag
    - a stray line, a clipped figure, and an arrow overlapping a head
  - Shown at exposure, after reveal (Speak, Listen, See), and in the Phrasebook list and Show view.
