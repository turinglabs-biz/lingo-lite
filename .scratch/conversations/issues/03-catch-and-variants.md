# 03 Catch and Variants

Status: done
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
- [x] Domain tests pass for:
  - seeded runs reach every Variant of the Convenience store over a few seeds;
  - Catch checking;
  - the Catch and Variant validation rules fire on broken fixtures.
- [x] An end-to-end run covers:
  - two runs with different seeds take different Variants;
  - a Catch answered wrong is Missed, shows the right answer, and counts in Stats.

## Comments

- 2026-10-19: Done.
  - **Engine:**
    - Catch and Variant Turns.
    - `pickVariant` (by weight), `resolveVariants`, `walkIntended` and `longestIntendedPath` (the progress bar, and the 20-Turn rule over every Variant).
    - New validation: a Catch has three different wrong answers, none of them the right one; a Variant has two or more ways on, all with positive weights.
  - **Price Lines:** 12 Heard Expressions, `price-2000-heard` to `price-35000-heard` ("… 원입니다"), in Money & shopping.
  - **The Convenience store** now varies:
    - the heating question (½);
    - the bag (½);
    - the total (3,200, 4,500 or 6,800 won), each with its own Catch;
    - the points card (⅓).

    Asking for a bag leads to the bag-price Catch.
  - **Play:**
    - A Catch shows "Did you catch it?" with four English options; a miss highlights the right one and replays the Line.
    - Answers are of kind `catch`, and a "Catches" tile joins Stats.
  - **Tests:** 6 new; 101 in total pass.
  - **End-to-end run** (production build): three runs took different totals (4,500, 6,800, 6,800). A Catch answered wrong on purpose (4,050 for 4,500) was Missed. Stats showed "67% Catches · 3". No page errors.
  - **Clips:** the 12 price Lines need `npm run audio` too.
