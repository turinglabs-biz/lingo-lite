# 10 Subway, T-money top-up, Asking the way

Status: done
Blocked by: 08

## What
Three Conversations from `scripts.md`: §4 Finding your way in the subway, §7 Topping up a T-money card and §8 Asking the way, each with its Catch Turns and Variants.

- **Their new Heard Expressions** each get a Tier, Romanization, Clips and review. This includes the train announcement.
- **New ordinary Expression:** 지하철역 어디예요? `station-where`, with an Illustration and Clips.
- **Reality check flagged in `scripts.md`:** whether convenience-store T-money top-ups are still cash only.

## Done when
- [ ] All three pass validation, and `catalog:check` and `audio:check` pass. *(Validation and `catalog:check` pass; `audio:check` waits for `npm run audio`.)*
- [x] An end-to-end run plays each to the end in Guided play, including Asking the way's short "I don't know this area either" branch.
- [x] A seeded test shows every Variant of each is reachable.
- [x] The native check is done, or the remaining doubts are listed under Comments. *(Doubts listed; not checked.)*

## Comments

- 2026-10-19: Done, except the Clips and the native check.
  - **Catalog:**
    - 1 new ordinary Expression, `station-where` (the station drawing with "?").
    - 12 Heard ones: subway 5 (including the full announcement), T-money 4, asking the way 3.
  - **Romanization fix:** following ADR 0001, obligatory tensing across a word space joins the words (as `which-exit` does, "myeot-ppeon"). Ticket 09's 이십 분쯤 and the breakfast hours were corrected to match. The Catalog's older `checkout-time` / `breakfast-time` ("myeot ssi-e-yo") still keep the words apart; worth a look in the native review.
  - **Script:**
    - T-money: asking to pay by card leads to "top-ups are cash only" (with a Catch), then cash, or the ATM first.
    - Asking the way: a ⅓ Variant where the passer-by doesn't know the area ends the Conversation early.
  - **End-to-end run** (production build, fresh Progress):
    - The Subway (7 answers) and T-money (8) each needed one Prepare session, played to the end in Guided play, and became scheduled.
    - Asking the way took the short "don't know the area" branch on the first run (3 answers) and the full branch on four more (6 each).
    - No page errors.
  - **Doubts for a native speaker:**
    - 네, 말씀하세요.
    - Whether convenience-store T-money top-ups are still cash only.
    - The announcement wording.
    - 쭉 가다가 사거리에서 오른쪽으로 가세요.
  - **Clips:** `npm run audio`, then `npm run echo:reference`.
