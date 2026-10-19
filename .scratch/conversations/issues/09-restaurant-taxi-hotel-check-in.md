# 09 Restaurant, Taxi, Hotel check-in

Status: done
Blocked by: 08

## What
Three Conversations from `scripts.md`: §3 Restaurant, §5 Taxi and §6 Hotel check-in, each with its Catch Turns and Variants.

- **Their new Heard Expressions** each get a Tier, Romanization, Clips and review. The shared payment and price Lines already exist.
- **New ordinary Expressions:**
  - 그걸로 주세요 `that-one-please`
  - 따로 계산할게요 `pay-separately`
  - 수고하세요 `keep-up-good-work`
  - 여기 있어요 `here-you-are`

  Each needs an Illustration and Clips.
- **Reality checks flagged in `scripts.md`:**
  - 수고하세요: is it polite enough to say to a taxi driver?
  - Restaurant: the "pay at the counter" and "self-service" Lines.

## Done when
- [ ] All three pass validation, and `catalog:check` and `audio:check` pass. *(Validation and `catalog:check` pass; `audio:check` waits for `npm run audio`.)*
- [x] An end-to-end run plays each to the end in Guided play.
- [x] A seeded test shows every Variant of each is reachable.
- [x] The native check is done, or the remaining doubts are listed under Comments. *(Doubts listed; not checked.)*

## Comments

- 2026-10-19: Done, except the Clips and the native check.
  - **The Restaurant is two Conversations.** Its full draft ran 24 Turns, past the 20-Turn limit, so it's split into "Restaurant: ordering" and "Restaurant: paying". They're shorter runs, and the two moments come separately in real life. `scripts.md` notes the split.
  - **Catalog:** 4 new ordinary Expressions with drawings (`here-you-are`, `that-one-please`, `pay-separately`, `keep-up-good-work`) and 23 Heard ones (restaurant 11, taxi 6, front desk 8).
  - **Prices:** reused the shared price Lines (23,000, 11,500, 12,000).
  - **Test fix:** the Variant-coverage test used small seeds whose first draw is always near 0, so a Conversation whose first Variant comes early never varied. Its seeds are now spread out. All 113 tests pass.
  - **End-to-end run** (production build, fresh Progress, one browser): each of Restaurant: ordering, Restaurant: paying, Taxi and Hotel check-in needed one Prepare session, then played to the end in Guided play (6, 7, 7 and 10 answers) and became scheduled. No page errors.
  - **Doubts for a native speaker:**
    - 수고하세요 to a taxi driver.
    - 김치찌개가 제일 잘 나가요.
    - 네, 손님 as the reply to 저기요.
    - The Romanization of 이십 분쯤 (i-sip ppun-jjeum), following the Catalog's "myeot ssi" style.
    - 방은 칠 층, 칠백삼 호입니다.
  - **Clips:** `npm run audio`, then `npm run echo:reference`.
