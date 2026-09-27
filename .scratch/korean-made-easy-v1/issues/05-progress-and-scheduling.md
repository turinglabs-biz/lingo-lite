# 05 Progress model and scheduling

Status: done
Blocked by: 04

## What
- A Dexie schema for Progress:
  - per Expression: introduced timestamp
  - per Direction: FSRS card state, keyed by Expression `id` + Direction
  - an answer log: timestamp, Expression, Direction, Grade, and whether it was a listen-and-pick check
  - session records: type, start, end, practice ms
  - earned Stars per Topic
  - settings
- FSRS through `ts-fsrs`, target retention about 0.9. Grade mapping: Missed → Again, Hard → Hard, Got it → Good.
- Listen unlocks after the first Speak answer graded Hard or Got it.
- Pure domain functions, unit tested:
  - `nextBatch` (next 15 by Catalog order, skipping introduced Expressions)
  - `dueDirections`
  - `isLearned` (Speak stability at least 7 days)
  - `starsFor(topic)` (never decreases)
  - XP calculation
  - Streak (local days)
  - Practice time (gaps longer than 60 s excluded)
- Removed Catalog Expressions: ignore their Progress rows.

## Done when
- The unit tests cover all the functions above, including Streak across midnight and Stars never dropping.

## Comments

- 2026-09-27: Implemented. It passed the unit tests and a headless-Chrome end-to-end run at iPhone size: a full Learn session, a Review session, all tabs, Phrasebook search and the Show view, with no console errors.
