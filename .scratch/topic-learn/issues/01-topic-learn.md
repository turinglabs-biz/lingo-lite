# 01 Learn a Topic

Status: done
Blocked by: none

## What
All of the spec in one ticket: the learner picks a Topic on the Topics screen and learns its next Topic Batch in a Learn session, and those Expressions then come back in Review.

- **Domain:** `topicBatch` picks up to 15 not-yet-introduced Expressions of one Topic. It works like a Batch (up to 5 Focus at random, then Catalog order) but without the Numbers cap, and shares its picker with `nextBatch`.
- **Topics screen:** a "Learn N new" pill under each Topic's Stars, shown while N > 0. The rest of the row still opens the Phrasebook.
- **Session:** the existing Learn session, started with the Topic Batch.

## Done when
- [x] The Topic Batch tests from the spec pass, and every existing test (including the Batch tests) still passes.
- [x] An end-to-end run covers:
  - learning Hotel from the Topics screen to the end
  - its Expressions introduced and in the schedule
  - the next Batch skipping them

## Comments

- 2026-10-17: Done.
  - **Domain:**
    - `topicBatch` and `nextBatch` share one picker. The Numbers cap is a parameter, off for a Topic Batch.
    - 5 new tests (4 Topic Batch, 1 Ignored); 79 in total pass, the Batch tests unchanged.
  - **Topics screen:** each row is now a list item holding two buttons: the main part opens the Phrasebook as before, and a "Learn N new" pill sits under the Stars.
  - **End-to-end run** (headless Chrome, 390px, production build, fresh Progress):
    - Before: Hotel offered "Learn 11 new"; Basics & survival and Numbers both offered "Learn 15 new" (no Numbers cap).
    - Learning Hotel from the Topics screen ran a full Learn session. Afterwards the learner was back on Topics: Hotel read 11/11 introduced and its Learn button was gone.
    - Progress: all 11 Hotel Expressions introduced, each with a Speak card in the schedule, and one finished `learn` session.
    - The next Batch from Home matched `nextBatch` exactly. It skipped `have-reservation` (Catalog position 8) and took `bill-please` instead.
    - No page errors.
