# 11 Clothes shop, Market stall, Small talk

Status: done
Blocked by: 08

## What
Three Conversations from `scripts.md`: §9 Clothes shop, §10 Market stall and §11 Small talk, each with its Catch Turns and Variants.

- **Their new Heard Expressions** each get a Tier, Romanization, Clips and review. This includes 일시불로 해 드릴까요? and 포장해 드릴까요?, with Usage notes.
- **New ordinary Expressions:**
  - 한 달 있어요 `staying-a-month`
  - 여기 있어요 `here-you-are`, unless ticket 09 already added it

  Each needs an Illustration and Clips.

## Done when
- [ ] All three pass validation, and `catalog:check` and `audio:check` pass. *(Validation and `catalog:check` pass; `audio:check` waits for `npm run audio`.)*
- [x] An end-to-end run plays each to the end in Guided play, including the Market stall's cash-only branch.
- [x] A seeded test shows every Variant of each is reachable.
- [x] The native check is done, or the remaining doubts are listed under Comments. *(Doubts listed; not checked.)*

## Comments

- 2026-10-19: Done, except the Clips and the native check.
  - **Catalog:**
    - 1 new ordinary Expression, `staying-a-month` (a calendar marked 30).
    - 18 Heard ones: clothes shop 7 (with Usage notes on 일시불 and 포장), market 5, small talk 6.
  - **The validator earned its keep:** the Clothes shop's longest path, the sold-out branch, ran past 20 Turns. It's trimmed:
    - No greeting, "take your time", "looks good" or goodbye; other Conversations practise those.
    - Its two unused Heard lines were dropped rather than left in the Catalog.
  - **Market stall:** the discount appears as a Reply ("Ask for a discount", or 좋아요 to accept the price) rather than as Free-play-only, since a Reply Turn can't exist in one mode only.
  - **Small talk:** 사진 찍어도 돼요? ("may I take a photo?") is the distractor against asking someone to take yours.
  - **End-to-end run** (production build, fresh Progress):
    - Clothes shop (12 answers), Market stall (10, through the cash-only branch) and Small talk (8) each needed one Prepare session, played to the end in Guided play, and became scheduled.
    - No page errors.
  - **Doubts for a native speaker:**
    - 그럼 두 개에 삼천오백 원 해 드릴게요.
    - 즐거운 여행 되세요 (and whether to write the n-insertion: jeul-geo-un nyeo-haeng).
    - 한국어 잘하시네요!
  - **Clips:** `npm run audio`, then `npm run echo:reference`.
