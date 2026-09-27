# 06 Learn session

Status: done
Blocked by: 05

## What
Implement the Learn session from the spec for one Batch.

1. First exposure: Expression display, Normal Clip autoplay, Slow button, and a "say it aloud" prompt.
2. One listen-and-pick check per Expression: 4 English options from the same Batch or Catalog, with immediate feedback.
3. 2–3 Speak attempts per Expression, spread through the session. A Missed attempt comes back later in the same session.

- Quitting partway: shown Expressions count as introduced and enter FSRS. The rest return to the queue.
- Ends with a session summary.

## Done when
- A full Batch can be completed on a phone. Progress, XP and the answer log are written correctly.

## Comments

- 2026-09-27: Implemented. It passed the unit tests and a headless-Chrome end-to-end run at iPhone size: a full Learn session, a Review session, all tabs, Phrasebook search and the Show view, with no console errors.
