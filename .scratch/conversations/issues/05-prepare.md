# 05 Prepare

Status: open
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
- [ ] Domain tests pass for:
  - the readiness rule;
  - Prepare's order (needed Replies first), its size (at most 15), and that it skips Ignored Expressions.
- [ ] An end-to-end run on fresh Progress covers:
  - the Convenience store shows "Needs N new" with Play disabled;
  - Prepare runs a Learn session;
  - afterwards Play is enabled and the row reads Ready.
