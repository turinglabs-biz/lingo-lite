# 01 Focus

Status: done
Blocked by: none

## What
All of the spec in one ticket: the learner puts Expressions in Focus, they're practised more, and a Focus page starts a Focus session.

- **The mark:**
  - A pin toggle wherever an Expression is shown: first exposure, every Speak, Listen and See question and the listen-and-pick check (before and after answering), the Phrasebook list, and the Focus page. Never the Show view.
  - It's stored in Progress (a new Dexie version) and cleared by Reset Progress.
- **Scheduling:**
  - Focus Directions use a 95% recall target instead of 90%.
  - Setting or clearing Focus immediately recomputes the due dates of the Expression's review-state cards.
- **Review session:** due Focus Directions come first, still up to 20.
- **Batches:** up to 5 not-yet-introduced Focus Expressions, picked at random, then Catalog order. The Numbers cap (3) applies to the whole Batch.
- **Home:** a secondary "Focus (N)" button that opens the Focus page.
- **Focus page:**
  - every Focus Expression with play buttons and the pin
  - "Not met yet" on the ones not introduced
  - "Start", disabled until one is introduced
- **Focus session:**
  - a third session type: up to 20 Directions of introduced Focus Expressions, due or not, lowest retrievability first
  - graded into the schedule with the Focus target
  - a Missed question comes back once
  - it counts for XP, Streak, Practice time and Stats like any session

## Done when
- [x] The domain tests from the spec pass (scheduling, Review selection, Batch picking, Focus queue), and every existing test still passes.
- [x] An end-to-end run covers:
  - putting Expressions in Focus from a question, first exposure and the Phrasebook (one not yet met)
  - the Focus page, including "Not met yet"
  - a full Focus session counted in XP and Stats
  - the not-yet-met Focus Expression turning up in a new Batch
  - Reset Progress clearing Focus
- [x] Existing Progress survives the Dexie upgrade: an app with Progress from before Focus opens with no Focus and nothing lost.

## Comments

- 2026-09-27: Done.
  - **Domain:**
    - `gradeCard` takes Focus (95% target), and `refocusCard` re-dates review-state cards.
    - `dueCards` puts Focus first, and `nextBatch` picks up to 5 Focus Expressions at random under the Numbers cap for the whole Batch.
    - The new `focusQueue` orders by retrievability.
    - 12 new tests; 69 in total pass.
  - **Storage:** a `focus` table (Dexie v4). `setFocus` re-dates the Expression's cards in the same transaction, grading reads Focus, and Reset Progress clears it.
  - **The pin:** in every prompt's header (first exposure, Speak, Listen, See, the listen-and-pick check), in Phrasebook rows (in a two-line control group with the play buttons and the Echo mic) and on the Focus page. One live query feeds every pin.
  - **Focus page:** opened from a "Focus · N Expressions" button on Home.
  - **Focus session:** a third session type that reuses the Review session's flow. After it, the learner is back on the Focus page.
  - **End-to-end run** (headless Chrome, production build):
    - An Expression far down the Catalog (`good-night`, position 195) went into Focus from the Phrasebook. It showed "Not met yet" on the Focus page with Start disabled, then joined the next Batch.
    - Pinning worked at first exposure, and on a Listen check before answering.
    - A 5-question Focus session was graded (9 answers including retries), finished, and gave 14 XP. It was stored as a `focus` session with Practice time, and the learner returned to the Focus page.
    - Unpinning from the Focus page removed the Expression, and Reset Progress cleared Focus.
  - **Upgrade:** Progress made with the build before Focus (IndexedDB v30: 10 introduced, 10 cards, 8 answers) opened with the new build as v40 with an empty `focus` table. Every other table was unchanged.
