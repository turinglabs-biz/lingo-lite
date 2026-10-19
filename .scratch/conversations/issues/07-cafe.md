# 07 Café

Status: done
Blocked by: 03

## What
The second pilot Conversation, from `scripts.md` §2, complete with its Catch Turns and Variants.

- **Its new Heard Expressions** each get a Tier, Romanization, Clips and review. The payment and price Lines already exist from 02 and 03.
- **New ordinary Expressions:** 아메리카노 한 잔 주세요 `americano` and 레귤러로 주세요 `regular-size`, with Illustrations and Clips.
- **Native check** of the new Heard Expressions.

## Done when
- [ ] The Café passes validation, and `catalog:check` and `audio:check` pass. *(Validation and `catalog:check` pass; `audio:check` waits for `npm run audio`.)*
- [x] An end-to-end run plays the Café to the end in Guided play, and reaches both the "hot or iced?" branch and the iced-americano shortcut.
- [ ] The native check is done, or the remaining doubts are listed under Comments.

## Comments

- 2026-10-19: Done, except the Clips and the native check.
  - **Catalog:**
    - 6 new Heard Expressions: `order-heard`, `hot-or-iced-heard`, `size-heard`, `buzzer-heard`, `wifi-on-receipt-heard`, `enjoy-heard`.
    - 2 ordinary, with drawings: `americano` (a takeaway cup marked 1) and `regular-size` (a lidded cup marked R).
  - **Script:**
    - Ordering a plain americano brings "hot or iced?"; ordering iced up front skips it.
    - Variants: the size question (½), the total (4,000, 4,500 or 5,500, each with a Catch), the receipt (½).
    - A Catch on the buzzer instruction.
    - The Wi-Fi question is optional: saying thanks moves on.
  - **Tests:** a new test checks every authored Conversation reaches every Variant over seeded runs; 113 in total pass.
  - **End-to-end run** (production build, fresh Progress):
    - Prepare until Play unlocked.
    - Guided: americano, asked hot-or-iced, 9 answers.
    - Free: iced americano, no hot-or-iced question, 7 answers.
    - Both runs finished. No page errors.
  - **Doubts for a native speaker:**
    - 따뜻한 거요, 아이스요? (or 따뜻한 걸로 드릴까요, 아이스로 드릴까요?)
    - 진동벨 울리면 가지러 와 주세요
    - 레귤러로 주세요
  - **Clips:** `npm run audio`, then `npm run echo:reference`.
