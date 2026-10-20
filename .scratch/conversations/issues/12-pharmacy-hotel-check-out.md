# 12 Pharmacy, Hotel check-out

Status: done
Blocked by: 08

## What
Two Conversations from `scripts.md`: §12 Pharmacy and §13 Hotel check-out, each with its Catch Turns and Variants.

- **Their new Heard Expressions** each get a Tier, Romanization, Clips and review. This includes the dosage instruction 하루에 세 번, 식후에 드세요.
- **New ordinary Expressions:**
  - 어제부터요 `since-yesterday`
  - 여기 있어요 `here-you-are`, unless ticket 09 or 11 already added it

  Each needs an Illustration and Clips.
- **Pharmacy branch:** the vague answer 아파요 must lead to the follow-up question and back.

## Done when
- [ ] Both pass validation, and `catalog:check` and `audio:check` pass. *(Validation and `catalog:check` pass; `audio:check` waits for `npm run audio`.)*
- [x] An end-to-end run plays each to the end in Guided play, including the Pharmacy's vague-answer loop.
- [x] A seeded test shows every Variant of each is reachable.
- [x] The native check is done, or the remaining doubts are listed under Comments. *(Doubts listed; not checked.)*

## Comments

- 2026-10-19: Done, except the Clips and the native check.
  - **Catalog:**
    - 1 new ordinary Expression, `since-yesterday` (a calendar with an arrow from yesterday).
    - 10 Heard ones: pharmacy 7, check-out 3.
  - **Pharmacy:** the vague 아파요 is accepted but leads to 어디가 아프세요? and back.
  - **Free-play fix (found here):** Free play used to offer the *first two* accepted Replies the learner had met, so a later one (like 아파요) could never come up. Now it offers the first plus one other at random, so every branch can appear. A new test checks every accepted Reply of the Pharmacy's first question comes up; 114 in total pass.
  - **End-to-end run** (production build, fresh Progress):
    - Pharmacy (6 answers) and Hotel check-out (6) each needed one Prepare session, played to the end in Guided play, and became scheduled.
    - In Free play, the second run offered 아파요. Picking it brought the follow-up, and "headache" got back on track.
    - No page errors.
  - **Doubts for a native speaker:**
    - 어디가 불편하세요?
    - 이 약 하루에 세 번, 식후에 드세요.
    - 졸릴 수 있어요 (Romanization joined, "jol-lil-ssu", per ADR 0001).
    - 몇 시에 찾으러 오세요?
  - **Clips:** `npm run audio`, then `npm run echo:reference`.
