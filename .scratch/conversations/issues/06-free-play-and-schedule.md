# 06 Free play and the Conversation schedule

Status: open
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
- [ ] Domain tests pass for:
  - the first finished Guided run creates the card, and later Guided runs don't grade;
  - Free runs grade clean = Good, otherwise Missed, and a quit run doesn't grade;
  - Fluent at 7 days;
  - the clean-run rule (Repair allowed, text shown not);
  - no Conversation run changes an Expression's card.
- [ ] An end-to-end run (with the browser clock moved forward) covers:
  - after a clean Guided run the Convenience store is scheduled and not due;
  - days later it's due, and Home reads "Conversations · 1 due";
  - a Free run with a miss makes it due again soon;
  - Reset Progress clears it.
