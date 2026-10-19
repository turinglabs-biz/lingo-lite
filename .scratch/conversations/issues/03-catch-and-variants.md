# 03 Catch and Variants

Status: open
Blocked by: 02

## What
Conversations stop being one fixed sequence, and start checking what the learner understood.

- **Catch Turns:**
  - Four English options: the right answer and three authored ones. The pick is checked.
  - A Missed Catch shows the right answer and replays the Line.
  - Answers are of kind `catch`, counted like Replies.
- **Variants:** weighted alternatives for what comes next, chosen by the random source each run.
- **Price Lines:** the shared set of about 12 amounts from `scripts.md` joins the Catalog as Heard Expressions in Money & shopping (outside the Numbers cap), so later Conversations reuse them.
- **The Convenience store** gains its Catch Turns (the bag price, the total) and its Variants (heating, the bag, the points card, the price).
- **Validation:** a Catch's wrong answers never include the right one; Variant weights are positive; every Variant is reachable.
- **`CONTEXT.md`:** gains **Catch** and **Variant**.

## Done when
- [ ] Domain tests pass for:
  - seeded runs reach every Variant of the Convenience store over a few seeds;
  - Catch checking;
  - the Catch and Variant validation rules fire on broken fixtures.
- [ ] An end-to-end run covers:
  - two runs with different seeds take different Variants;
  - a Catch answered wrong is Missed, shows the right answer, and counts in Stats.
