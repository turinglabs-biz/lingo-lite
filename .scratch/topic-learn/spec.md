# Learn a Topic: spec

Status: done

Vocabulary follows `CONTEXT.md` (see **Topic**, **Batch**, **Topic Batch**, **Learn session** and **Review session**).

## Problem Statement

New Expressions only arrive in Batches, in Catalog order, interleaved across Topics. A learner who wants a particular situation covered now (say the Hotel before check-in tomorrow, or the Basics first of all) can browse that Topic in the Phrasebook, but the Phrasebook never changes Progress, so nothing they read there is introduced or reviewed. They have to wait for the Catalog order to get round to it.

## Solution

Every Topic on the Topics screen gets a **Learn** button showing how many new Expressions it would introduce ("Learn 11 new"). It starts an ordinary Learn session on that Topic's next **Topic Batch**: up to 15 not-yet-introduced Expressions of that Topic only.

- The session is exactly a Learn session: first exposure with audio, the listen-and-pick check, then repeated Speak attempts.
- Each Expression is introduced at its first exposure, so it is in the spaced-repetition schedule and comes back in Review sessions like any other. This is what makes learning a Topic count.
- A Topic with more than 15 new Expressions takes more than one Topic Batch (Basics, 26, takes two). The button disappears once every Expression in the Topic is introduced.
- Expressions introduced this way are skipped by the next Batches, which carry on in Catalog order with whatever is left.

## User Stories

1. As a learner, I want to start learning one Topic I choose, so that I can prepare for a situation before I'm in it.
2. As a learner, I want the Learn button to show how many new Expressions it will introduce, so that I know what I'm starting.
3. As a learner, I want a Topic session to be the same Learn session I already know, so that there's nothing new to figure out.
4. As a learner, I want the Expressions I learn from a Topic to come back in my Review sessions, so that learning a Topic counts like learning a Batch.
5. As a learner, I want a long Topic split into sessions of at most 15, so that each session is as long as a Batch.
6. As a learner, I want the Learn button gone once a Topic is fully introduced, so that I can see which Topics are done.
7. As a learner, I want my next Batch to skip whatever I already learned from a Topic, so that I never meet an Expression as new twice.
8. As a learner, I want Focus Expressions of the Topic to come early, as they do in a Batch, so that the ones I marked aren't left to the last Topic Batch.
9. As a learner, I want all of a Topic's Numbers to come in one Topic Batch if I pick Numbers, so that the Batch's 3-Numbers cap doesn't make a Numbers session tiny.
10. As a learner, I want Ignored Expressions left out of a Topic Batch, so that I never learn what I chose not to.
11. As a learner, I want tapping the rest of the Topic row to still open it in the Phrasebook, so that browsing works as before.

## Implementation Decisions

- **Topic Batch picker.** `topicBatch` sits next to `nextBatch` in the Progress domain module, and both share one picker. It filters the practice catalog (Ignored already removed) to the Topic's not-yet-introduced Expressions, then picks like a Batch: up to 5 Focus Expressions at random, then Catalog order, up to 15, kept in Catalog order. The Numbers cap is off.
- **Session.** No new session type: the app starts its existing Learn session with the Topic Batch's ids. Introduction, grading, XP, Stars, Streak and Practice time all work unchanged. After the summary, the learner is back on the Topics screen.
- **Topics screen.**
  - Each row now holds two controls side by side: the main part (name, counts, meter) still opens the Topic in the Phrasebook, and a "Learn N new" pill sits under the Stars.
  - N is the size of the Topic's next Topic Batch.
  - The pill only shows when N > 0.
- **Home** is unchanged. Its Batch count is derived from how many Expressions are introduced, so it stays a rough measure of progress through the Catalog.

## Testing Decisions

- **Topic Batch tests,** in the style of the existing Batch tests, with plain inputs and a seeded random:
  - Only the chosen Topic's never-introduced Expressions, in Catalog order, up to 15.
  - A shorter final Topic Batch, then nothing.
  - Up to 5 of the Topic's Focus Expressions at random; never another Topic's Focus Expressions.
  - No Numbers cap.
  - Ignored Expressions never appear.
- The existing Batch tests must pass unchanged. They guard the shared picker.
- **End-to-end run:**
  - Learn Hotel from the Topics screen to the end.
  - See its Expressions introduced on the Topics screen and in the Speak schedule.
  - See the next regular Batch skip them.

## Out of Scope

- Learning several Topics in one session.
- Learning a whole Topic in one session regardless of size.
- A Topic-only Review session (practising a Topic's introduced Expressions on demand). The Focus session covers drilling chosen Expressions.
- A Learn button in the Phrasebook.

## Further Notes

- No ADR: the change adds an entry point and a picker, and is easy to reverse.
