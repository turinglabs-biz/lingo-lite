# 05 Prepare

Status: done
Blocked by: 02

## What
The learner is never asked to say something they've never seen. A Conversation's missing Expressions are learned first, in ordinary Learn sessions.

- **Conversation page:**
  - Lists the Expressions the Conversation uses, with the not-yet-introduced ones marked.
  - "Prepare · N new" appears while any are missing.
- **Prepare:**
  - Starts a Learn session on up to 15 not-yet-introduced, non-Ignored Expressions of the Conversation, in Catalog order.
  - It takes the Replies Play needs first, then the rest, including Heard Expressions (Learn sessions handle them since ticket 01).
- **Play:**
  - It is disabled until every Reply Turn has at least one introduced, non-Ignored accepted Reply.
  - A Reply Turn whose accepted Replies are all Ignored is played as in Watch: shown, not asked.
- **Conversations page:** rows show "Needs N new" or Ready.

## Done when
- [x] Domain tests pass for:
  - the readiness rule;
  - Prepare's order (needed Replies first), its size (at most 15), and that it skips Ignored Expressions.
- [x] An end-to-end run on fresh Progress covers:
  - the Convenience store shows "Needs N new" with Play disabled;
  - Prepare runs a Learn session;
  - afterwards Play is enabled and the row reads Ready.

## Comments

- 2026-10-19: Done.
  - **Domain:** `canPlay`, `newExpressionsOf` and `prepareBatch`, with 5 new tests; 106 in total pass.
  - **Conversation page:**
    - Lists the Expressions it uses, with the new ones marked.
    - "Prepare · N new" starts an ordinary Learn session; Heard Expressions get Listen attempts there.
    - Play stays disabled, with a one-line reason, until `canPlay`.
  - **Navigation:** the open Conversation now lives in the app shell, so Prepare's summary returns to its page.
  - **Ignored Replies:** a Reply Turn whose accepted Replies are all Ignored is shown and played, not asked.
  - **End-to-end run** (production build, fresh Progress):
    - The row read "Needs 27 new", Play was disabled, and Prepare offered 15.
    - The Learn session introduced the 7 needed Replies first (hello, heat-it-up, no-bag, card-ok, there-isnt, throw-it-away, goodbye-staying), then 8 more.
    - Back on the page, Play was enabled with 12 still New, and the row read "Ready".
    - No page errors.
