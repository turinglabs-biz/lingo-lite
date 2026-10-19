# 06 Free play and the Conversation schedule

Status: done
Blocked by: 03

## What
Help fades and Conversations come back by spaced repetition as whole exchanges, without ever touching an Expression's schedule.

- **Free play:**
  - No intents. Up to two accepted Replies may appear among the four options, each leading to its own branch.
- **Clean run:** finished with no Missed Reply or Catch and no text shown. Repair is allowed.
- **Schedule:**
  - Each Conversation has one schedule card, using the same FSRS scheduler as Directions at the standard 90% target.
  - The first finished Guided run creates the card and grades it: clean = Good, otherwise Missed.
  - From then on, Play opens in Free play, and every finished Free run grades the card the same way.
  - Guided play stays available for practice and doesn't grade. A quit run doesn't grade.
- **Home and Conversations page:**
  - The Home button reads "Conversations · N due" when any are due.
  - Due Conversations come first on the Conversations page.
  - Rows show Due, Played or Fluent. Fluent means expected to be remembered for at least 7 days.
- **Storage:** a Dexie upgrade adds the Conversation-card and run tables. Reset Progress clears them.
- **`CONTEXT.md`:** gains **Free play**, **Clean run** and **Fluent**, and Progress gains each Conversation's schedule.

## Done when
- [x] Domain tests pass for:
  - the first finished Guided run creates the card, and later Guided runs don't grade;
  - Free runs grade clean = Good, otherwise Missed, and a quit run doesn't grade;
  - Fluent at 7 days;
  - the clean-run rule (Repair allowed, text shown not);
  - no Conversation run changes an Expression's card.
- [x] An end-to-end run (with the browser clock moved forward) covers:
  - after a clean Guided run the Convenience store is scheduled and not due;
  - days later it's due, and Home reads "Conversations · 1 due";
  - a Free run with a miss makes it due again soon;
  - Reset Progress clears it.

## Comments

- 2026-10-19: Done.
  - **Domain:**
    - `scheduleAfterRun` (the first finished Guided run creates the card; then only Free runs grade it), `isClean`, `conversationStatus`, and Free-play `replyOptions` with up to two accepted Replies (met ones first).
    - Conversation cards use their own FSRS scheduler **without short-term steps**, so a Conversation comes back in days, never minutes. The first end-to-end run showed a 15-minute due with the Expressions' scheduler.
    - 6 new tests; 112 in total pass.
  - **Storage:** Dexie v7 adds `conversationCards` and `conversationRuns` (mode, missed, text shown, repairs). Reset Progress clears both.
  - **Screens:**
    - Before scheduling, the Conversation page offers "Play with hints". After, it offers "Play" (Free) and "Practise with hints" (Guided, not graded), with a one-line explanation.
    - Labels: Due, Played, Fluent; due Conversations sort first.
    - Home reads "Conversations · N due".
    - Reply panels carry `data-turn`, for tests.
  - **End-to-end run** (production build, browser clock fixed then moved):
    - After Prepare, a clean Guided run scheduled the Convenience store 3 days out ("Played").
    - 30 days later, Home read "Conversations · 1 due", and Play ran Free ("What do you say?").
    - A miss at the door brought it back in 24 hours (one lapse).
    - Expression cards were byte-for-byte unchanged by both runs, and Reset Progress cleared the Conversation's card and runs.
    - No page errors.
