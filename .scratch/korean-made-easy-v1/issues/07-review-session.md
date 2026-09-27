# 07 Review session

Status: done
Blocked by: 05

## What
- Up to 20 due Directions, most overdue first, with Speak and Listen mixed.
- Speak card: English → tap reveal → Romanization and Hangul, Normal Clip autoplays, Slow button → Grade (Missed / Hard / Got it).
- Listen card: Normal Clip autoplays, with replay and Slow → tap reveal → English → Grade.
- Session summary: accuracy, XP, Streak, newly Learned Expressions.
- Home: the Continue button starts a Review session if anything is due, otherwise a Learn session. New Batch is a secondary button. When more than 50 Directions are due, show a soft suggestion to review first.

## Done when
- Due Directions reschedule correctly after grading, and Home reflects the due count.

## Comments

- 2026-09-27: Implemented. It passed the unit tests and a headless-Chrome end-to-end run at iPhone size: a full Learn session, a Review session, all tabs, Phrasebook search and the Show view, with no console errors.
