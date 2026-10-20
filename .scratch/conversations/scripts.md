# Conversations: draft scripts

Status: draft content for tickets 02–12. Every new Heard Expression still needs an id, a Tier, Romanization (ADR 0001), the second-model review and a native check when its ticket adds it to the Catalog.

How to read these:

- **Speaker lines.** **Clerk:** (or barista, driver...) is a Line: Hangul, then English. A `code-id` means the Line is an existing Expression; otherwise it's a new Heard Expression.
- **You — *intent*:** a Reply Turn. The intent is shown only in Guided play.
  - ✓ marks an accepted Reply, with the Expression id and, after →, where it leads.
  - ✗ marks an authored distractor and why it's wrong. These carry most of the teaching.
  - **NEW** marks an Expression to add to the Catalog (listed at the end).
- **Catch:** the question, ✓ the right answer, then the wrong ones.
- ***Variant (½)***: the step happens on about half of runs.

## Which situations, and why

Ranked for a month-long first trip: how often it happens, and what a misunderstanding costs.

| # | Conversation | Topic | How often | Stakes | Ticket |
| --- | --- | --- | --- | --- | --- |
| 1 | Convenience store | Money & shopping | Daily | Low | 02, 03 (pilot) |
| 2 | Café | Café & drinks | Daily | Low | 07 (pilot) |
| 3 | Restaurant | Food & ordering | Daily | Medium | 09 |
| 4 | Finding your way in the subway | Transport | Daily | Medium | 10 |
| 5 | Taxi | Transport | Weekly | Medium | 09 |
| 6 | Hotel check-in | Hotel | Once per stay | High | 09 |
| 7 | Topping up a T-money card | Transport | Weekly | Medium | 10 |
| 8 | Asking the way | Directions & places | Several a week | Medium | 10 |
| 9 | Clothes shop | Money & shopping | Weekly | Low | 11 |
| 10 | Market stall | Food & ordering | Weekly | Low | 11 |
| 11 | Small talk | Small talk | Weekly | Low | 11 |
| 12 | Pharmacy | Health & emergencies | Rare | High | 12 |
| 13 | Hotel check-out | Hotel | Once per stay | Low | 12 |

The two pilots come first because they're the most frequent, they're short, and almost every Reply they need is already in the Catalog.

---

## 1. Convenience store (편의점)

*Setting:* you put a triangle kimbap and a bottle of water on the counter. *Other person:* the clerk.

1. **Clerk:** 어서 오세요. — Welcome! `welcome-heard`
2. **You** — *Greet the clerk.*
   - ✓ 안녕하세요 `hello`
3. ***Variant (½)*** **Clerk:** 데워 드릴까요? — Shall I heat it up?
   - **You** — *Ask them to heat it up.* (Free: either answer.)
     - ✓ 네, 데워 주세요 **NEW** `heat-it-up` → **Clerk:** 잠깐만요. — One moment. `just-a-moment`
     - ✓ 괜찮아요 `its-okay`
     - ✓ 아니요 `no`
     - ✗ 포장해 주세요 `to-go`: that's "to go" in a restaurant.
4. ***Variant (½)*** **Clerk:** 봉투 필요하세요? — Do you need a bag?
   - **You** — *Say you don't need a bag.*
     - ✓ 봉투 필요 없어요 `no-bag`
     - ✓ 아니요 `no`
     - ✓ 봉투 주세요 `bag-please` → **Clerk:** 봉투는 백 원이에요. — Bags are 100 won.
       - **Catch:** How much is a bag? ✓ 100 won · 1,000 won · 10 won · Free
     - ✗ 영수증 주세요 `receipt`: wrong question.
5. **Clerk:** 사천오백 원입니다. — That's 4,500 won. *(Variants: 삼천이백 / 사천오백 / 육천팔백.)*
   - **Catch:** How much is it? ✓ 4,500 · 5,400 · 4,050 · 45,000
6. **You** — *Ask if you can pay by card.*
   - ✓ 카드 돼요? `card-ok` → **Clerk:** 네, 카드 꽂아 주세요. — Yes, please insert your card.
   - ✓ 현금으로 할게요 `pay-cash` → **Clerk:** 거스름돈 여기 있습니다. — Here's your change.
7. ***Variant (⅓)*** **Clerk:** 포인트 카드 있으세요? — Do you have a points card?
   - **You** — *Say you don't.*
     - ✓ 없어요 `there-isnt`
     - ✓ 아니요 `no`
     - ✗ 있어요 `there-is`: you'd then be expected to hand one over.
8. **Clerk:** 영수증 드릴까요? — Would you like the receipt?
   - **You** — *Ask them to throw it away.*
     - ✓ 버려 주세요 **NEW** `throw-it-away`
     - ✓ 괜찮아요 `its-okay`
     - ✓ 영수증 주세요 `receipt`
     - ✓ 네 `yes`
9. **Clerk:** 감사합니다. 안녕히 가세요. — Thank you. Goodbye. `goodbye-leaving`
10. **You** — *Say goodbye; you're the one leaving.*
    - ✓ 안녕히 계세요 `goodbye-staying`
    - ✓ 감사합니다 `thank-you`
    - ✗ 안녕히 가세요 `goodbye-leaving`: that's said *to* someone who leaves. You leave and the clerk stays.

## 2. Café (카페)

*Setting:* a small café where you order at the counter. *Other person:* the barista.

1. **Barista:** 어서 오세요. 주문하시겠어요? — Welcome! Ready to order?
2. **You** — *Order an americano.*
   - ✓ 아메리카노 한 잔 주세요 **NEW** `americano` → 3
   - ✓ 아이스 아메리카노 한 잔 주세요 `iced-americano` → 4
   - ✗ 물 한 병 `bottle-of-water`: a bottle of water.
3. **Barista:** 따뜻한 거요, 아이스요? — Hot or iced?
   - **You** — *Say you'd like it hot.*
     - ✓ 따뜻한 거 `hot-one`
     - ✓ 아이스 `iced`
4. ***Variant (½)*** **Barista:** 사이즈는 어떻게 해 드릴까요? — What size would you like?
   - **You** — *Ask for a large.*
     - ✓ 큰 사이즈로 주세요 `large-size`
     - ✓ 레귤러로 주세요 **NEW** `regular-size`
5. **Barista:** 드시고 가세요? — For here? `for-here-heard`
   - **You** — *Say you'll take it with you.*
     - ✓ 가져갈게요 `take-away`
     - ✓ 포장해 주세요 `to-go`
     - ✓ 먹고 갈게요 `for-here`
     - ✓ 여기서 먹을게요 `eat-here`
     - ✗ 배고파요 `hungry`
6. **Barista:** 사천오백 원입니다. 카드 꽂아 주세요. — 4,500 won. Please insert your card.
   - **Catch:** How much? ✓ 4,500 · 4,050 · 5,400 · 450
7. ***Variant (½)*** **Barista:** 영수증 드릴까요? — Would you like the receipt?
   - Replies as in Convenience store, step 8.
8. **Barista:** 진동벨 울리면 가지러 와 주세요. — Please come and collect it when the buzzer goes off.
   - **Catch:** What do you do? ✓ Collect it at the counter when the buzzer goes off · Wait; they'll bring it to your table · Pay when the buzzer goes off · Come back in ten minutes
   - **You** — *Say you understand.*
     - ✓ 네, 알겠어요 `got-it`
     - ✓ 네 `yes`
9. **You** — *Ask for the Wi-Fi password.* (Free: optional, or just thank them.)
   - ✓ 와이파이 비밀번호 뭐예요? `wifi-password` → **Barista:** 영수증 아래에 있어요. — It's at the bottom of the receipt.
   - ✓ 감사합니다 `thank-you`
10. **Barista:** 맛있게 드세요. — Enjoy!

## 3. Restaurant (식당)

*Built as two Conversations, **Restaurant: ordering** (steps 1–10) and **Restaurant: paying** (steps 9, 11–14): the whole meal ran past the 20-Turn limit, and the two moments come separately in real life.*

*Setting:* lunch at a small Korean restaurant with a friend. *Other person:* the server.

1. **Server:** 어서 오세요. 몇 분이세요? — Welcome. How many? `how-many-heard`
2. **You** — *Say there are two of you.*
   - ✓ 두 명이에요 `two-people`
   - ✗ 두 개 주세요 `two-of-them`: 개 counts things, not people.
3. **Server:** 이쪽으로 앉으세요. — Please sit over here.
4. **You** — *Ask for an English menu.*
   - ✓ 영어 메뉴 있어요? `english-menu`
     - ***Variant (½)*** **Server:** 네, 여기 있어요. — Yes, here you are. → 6
     - ***Variant (½)*** **Server:** 죄송해요, 영어 메뉴는 없어요. — Sorry, we don't have an English menu. → 5
   - ✓ 메뉴판 주세요 `menu-please` → 6
5. **You** — *Ask what's good.*
   - ✓ 뭐가 맛있어요? `what-is-good` → **Server:** 김치찌개가 제일 잘 나가요. — The kimchi stew is the most popular.
     - **Catch:** What do they recommend? ✓ The kimchi stew is the most popular · The kimchi stew is sold out · The kimchi stew is very spicy · Kimchi is free
     - **You** — *Order that.*
       - ✓ 그걸로 주세요 **NEW** `that-one-please` → 7
6. **Server:** 주문하시겠어요? — Ready to order?
   - **You** — *Point at a dish and order one.*
     - ✓ 이거 하나 주세요 `one-of-this`
     - ✓ 이거 주세요 `this-one-please`
7. ***Variant (½)*** **Server:** 맵게 해 드릴까요? — Shall I make it spicy?
   - **You** — *Ask for it not spicy.*
     - ✓ 안 맵게 해 주세요 `not-spicy`
     - ✓ 네 `yes`
     - ✓ 매워요? `is-it-spicy` → **Server:** 조금 매워요. — It's a little spicy. → **You:** ✓ `not-spicy` · ✓ `its-okay`
8. **Server:** 물은 셀프예요. — Water is self-service.
   - **Catch:** What about water? ✓ You get it yourself · They'll bring it · It costs extra · There's none
9. **You** — *Call the server over.*
   - ✓ 저기요! `excuse-me-attention` → **Server:** 네, 손님. — Yes?
   - ✗ 잠시만요 `excuse-me-passing`: that's for squeezing past someone, or "one moment".
10. **You** — *Ask for more side dishes.*
    - ✓ 반찬 더 주세요 `more-side-dishes`
    - ✓ 물 주세요 `water-please`
    - ✓ 하나 더 주세요 `one-more`
    - ***Variant (½)*** **Server:** 반찬은 셀프예요. — Side dishes are self-service.
    - ***Variant (½)*** **Server:** 네, 갖다 드릴게요. — Sure, I'll bring some.
11. **You** — *Ask for the bill.*
    - ✓ 계산해 주세요 `bill-please` → **Server:** 계산은 카운터에서 해 주세요. — Please pay at the counter.
    - **Catch:** Where do you pay? ✓ At the counter · At the table · At the kiosk · Next time
12. **Server:** 같이 계산해 드릴까요? — All together?
    - ✓ 네 `yes` → **Server:** 이만 삼천 원입니다. — 23,000 won.
    - ✓ 따로 계산할게요 **NEW** `pay-separately` → **Server:** 한 분당 만 천오백 원이에요. — 11,500 won each.
    - **Catch:** the amount.
13. **You** — *Thank them for the meal.*
    - ✓ 잘 먹었습니다 `after-meal`
    - ✗ 잘 먹겠습니다 `before-meal`: that's said *before* eating.
14. **Server:** 감사합니다. 안녕히 가세요. `goodbye-leaving`
    - **You:** ✓ 안녕히 계세요 `goodbye-staying` · ✗ 안녕히 가세요

## 4. Finding your way in the subway (지하철)

*Setting:* at Seoul Station, heading for Myeongdong. *Other person:* a station worker, then the train announcement.

1. **You** — *Get the worker's attention.*
   - ✓ 저기요 `excuse-me-attention` → **Worker:** 네, 말씀하세요. — Yes, go ahead.
2. **You** — *Point at Myeongdong on your map and ask how to get there.*
   - ✓ 여기 어떻게 가요? `how-do-i-get-here`
   - ✗ 여기서 세워 주세요 `stop-here`: that's for a taxi.
3. **Worker:** 사호선 타세요. — Take line 4.
   - **Catch:** Which line? ✓ Line 4 · Line 3 · Line 10 · Line 1
4. ***Variant (½)*** **Worker:** 사호선은 저쪽이에요. — Line 4 is over there.
5. **You** — *Ask which exit to take.*
   - ✓ 몇 번 출구예요? `which-exit` → **Worker:** 육 번 출구로 나가세요. — Take exit 6.
   - **Catch:** Which exit? ✓ 6 · 9 · 16 · 60
6. **You** — *Thank them.*
   - ✓ 감사합니다 `thank-you`
7. **Announcement:** 이번 역은 명동, 명동역입니다. 내리실 문은 오른쪽입니다. — This station is Myeongdong. The doors will open on the right. *(Begins with `this-station-heard`.)*
   - **Catch:** What did you hear? ✓ This is Myeongdong; doors open on the right · Next is Myeongdong; doors on the left · This is Myeongdong; doors on the left · Change here for line 4

## 5. Taxi (택시)

*Setting:* you get into a taxi outside your hotel. *Other person:* the driver.

1. **Driver:** 안녕하세요. 어디로 가세요? — Hello. Where to?
2. **You** — *Ask to go to Seoul Station.*
   - ✓ 서울역까지 가 주세요 `to-seoul-station` → **Driver:** 네, 알겠습니다. — Certainly.
   - ✓ 이 주소로 가 주세요 `to-this-address` (showing your phone) → same.
   - ✗ 여기서 세워 주세요 `stop-here`: "stop here".
3. **You** — *Ask how long it takes.*
   - ✓ 얼마나 걸려요? `how-long` → **Driver:** 이십 분쯤 걸려요. — About twenty minutes.
   - **Catch:** How long? ✓ About 20 minutes · About 2 minutes · About 12 minutes · About 2 hours
4. ***Variant (½)*** **Driver:** 지금 길이 좀 막혀요. — Traffic's a bit heavy right now.
   - **You:** ✓ 괜찮아요 `its-okay`
5. **Driver:** 어디서 내려 드릴까요? — Where shall I drop you off?
   - **You** — *Ask them to stop here.*
     - ✓ 여기서 세워 주세요 `stop-here`
     - ✓ 저기 `over-there`
     - ✗ 쭉 가세요 `go-straight`: that's "keep going".
6. **Driver:** 만 이천 원 나왔습니다. — That's 12,000 won.
   - **Catch:** ✓ 12,000 · 20,000 · 2,000 · 10,200
7. **You** — *Ask if you can pay by card.*
   - ✓ 카드 돼요? `card-ok` → **Driver:** 네, 카드 여기 대 주세요. — Sure, tap it here.
   - ✓ 현금으로 할게요 `pay-cash`
8. ***Variant (⅓)*** **Driver:** 영수증 드릴까요? — Replies as in Convenience store, step 8.
9. **Driver:** 안녕히 가세요. `goodbye-leaving`
   - **You:**
     - ✓ 감사합니다 `thank-you`
     - ✓ 수고하세요 **NEW** `keep-up-good-work` *(native check: very common to drivers and staff, though some consider it impolite to elders)*
     - ✗ 안녕히 가세요

## 6. Hotel check-in (체크인)

*Setting:* you reach the front desk at 1 p.m. *Other person:* the receptionist.

1. **Receptionist:** 안녕하십니까. `hello-formal-heard`
   - **You:** ✓ 안녕하세요 `hello`
2. **You** — *Say you'd like to check in.*
   - ✓ 체크인할게요 `check-in`
   - ✗ 체크아웃할게요 `check-out`
3. **Receptionist:** 예약하셨어요? — Do you have a reservation?
   - **You:** ✓ 예약했어요 `have-reservation` · ✓ 네 `yes`
4. **Receptionist:** 여권 보여 주시겠어요? — May I see your passport?
   - **You** — *Hand it over.*
     - ✓ 여기 있어요 **NEW** `here-you-are`
     - ✓ 네 `yes`
5. ***Variant (½), early arrival:*** **Receptionist:** 체크인은 세 시부터예요. — Check-in is from three.
   - **Catch:** ✓ From 3 o'clock · From 4 o'clock · From 10 o'clock · In 30 minutes
   - **You** — *Ask them to keep your luggage.*
     - ✓ 짐 좀 맡아 주세요 `keep-luggage` → **Receptionist:** 네, 짐표 여기 있습니다. — Of course. Here's your luggage tag. → 7
6. ***Variant (½):*** **Receptionist:** 방은 칠 층, 칠백삼 호입니다. — Your room is 703, on the 7th floor.
   - **Catch:** ✓ Room 703, 7th floor · Room 307, 3rd floor · Room 730, 7th floor · Room 1703, 17th floor
7. **You** — *Ask what time breakfast is.*
   - ✓ 조식 몇 시예요? `breakfast-time` → **Receptionist:** 조식은 일 층에서 일곱 시부터 열 시까지예요. — Breakfast is on the first floor, from 7 to 10.
   - **Catch:** ✓ 1st floor, 7–10 · 7th floor, 1–10 · 1st floor, 7–11 · 10th floor, 7–10
8. **You** — *Ask what time check-out is.*
   - ✓ 체크아웃 몇 시예요? `checkout-time` → **Receptionist:** 체크아웃은 열한 시입니다. — Check-out is at eleven.
   - **Catch:** ✓ 11 · 1 · 10 · 12
9. **Receptionist:** 엘리베이터는 오른쪽에 있습니다. 편히 쉬세요. — The elevator is on the right. Have a good rest.
   - **You:** ✓ 감사합니다 `thank-you`

## 7. Topping up a T-money card (티머니 충전)

*Setting:* at a convenience store counter, card in hand. *Other person:* the clerk.

1. **Clerk:** 어서 오세요. `welcome-heard`
2. **You** — *Hand over your card and ask to top it up.*
   - ✓ 충전해 주세요 `top-up`
   - ✗ 계산해 주세요 `bill-please`: "the bill, please".
3. **Clerk:** 얼마 충전해 드릴까요? — How much shall I put on it?
   - **You** — *Ask for 10,000 won.*
     - ✓ 만 원 `price-10000`
     - ✓ 오만 원 `price-50000`
     - ✗ 열 `native-10`: native numbers aren't used for money.
4. ***Variant (½)*** **You** — *Ask if you can pay by card.*
   - ✓ 카드 돼요? `card-ok` → **Clerk:** 충전은 현금만 돼요. — Top-ups are cash only. *(Reality check: still true at most stores.)*
     - **You:**
       - ✓ 현금으로 할게요 `pay-cash`
       - ✓ ATM 어디 있어요? `atm-where` → **Clerk:** ATM은 저쪽에 있어요. — The ATM is over there.
5. **Clerk:** 충전됐습니다. 잔액은 만 이천 원이에요. — Done. Your balance is 12,000 won.
   - **Catch:** Your balance? ✓ 12,000 · 10,000 · 2,000 · 20,000
6. **You:** ✓ 감사합니다 → **Clerk:** 안녕히 가세요. → **You:** ✓ 안녕히 계세요

## 8. Asking the way (길 묻기)

*Setting:* you're looking for the nearest subway station and stop a passer-by. *Other person:* a passer-by.

1. **You** — *Get their attention.*
   - ✓ 저기요 `excuse-me-attention`
   - ✗ 잠시만요 `excuse-me-passing`
   - → **Passer-by:** 네? — Yes? `pardon`
2. **You** — *Ask where the subway station is.*
   - ✓ 지하철역 어디예요? **NEW** `station-where`
   - ✓ 여기 어떻게 가요? `how-do-i-get-here` (pointing at the map)
3. ***Variant (⅔):*** **Passer-by:** 쭉 가다가 사거리에서 오른쪽으로 가세요. — Go straight, then turn right at the intersection. *(This one is spoken fast: a natural place for Repair.)*
   - **Catch:** ✓ Straight, then right at the intersection · Right, then straight · Straight, then left · Back the way you came
   - **You** — *Ask if it's far.*
     - ✓ 멀어요? `is-it-far`
     - ✓ 가까워요? `is-it-close`
     - → **Passer-by:** 아니요, 걸어서 오 분쯤 걸려요. — No, about five minutes on foot.
   - **Catch:** ✓ About 5 minutes on foot · About 15 minutes · About 5 minutes by taxi · 5 stops
4. ***Variant (⅓):*** **Passer-by:** 죄송해요, 저도 여기 잘 몰라요. — Sorry, I don't really know this area either.
   - **You:** ✓ 괜찮아요 `its-okay` · ✓ 감사합니다 `thank-you` → end. *(It happens.)*
5. **You** — *Thank them for their help.*
   - ✓ 도와주셔서 감사합니다 `thanks-for-help`
   - ✓ 감사합니다 `thank-you`

## 9. Clothes shop (옷 가게)

*Setting:* a small clothing shop in Myeongdong. *Other person:* the shop assistant.

1. **Assistant:** 어서 오세요. 찾으시는 거 있으세요? — Welcome. Looking for anything in particular?
   - **You** — *Say you're just looking.*
     - ✓ 그냥 구경하는 거예요 `just-looking` → **Assistant:** 네, 천천히 보세요. — Sure, take your time.
     - ✗ 이걸로 할게요 `ill-take-this`
2. **You** — *Ask how much this is.*
   - ✓ 얼마예요? `how-much` → **Assistant:** 삼만 오천 원이에요. — 35,000 won.
   - **Catch:** ✓ 35,000 · 53,000 · 3,500 · 30,500
3. **You** — *Ask if you can try it on.*
   - ✓ 입어 봐도 돼요? `try-on` → **Assistant:** 네, 탈의실은 저쪽이에요. — Sure, the fitting room is over there.
4. **You** — *Ask for a bigger one.*
   - ✓ 더 큰 거 있어요? `bigger-one`
     - ***Variant (½)*** **Assistant:** 네, 잠시만요. — Yes, one moment. → 5
     - ***Variant (½)*** **Assistant:** 죄송해요, 그 사이즈는 다 나갔어요. — Sorry, that size is sold out.
       - **Catch:** ✓ That size is sold out · It's on sale · It's in the back · It's the last one
       - **You** — *Ask for another colour.*
         - ✓ 다른 색 있어요? `another-colour` → **Assistant:** 이 색은 어떠세요? — How about this colour?
           - **You:** ✓ 좋아요 `good`
5. **You** — *Say you'll take it.*
   - ✓ 이걸로 할게요 `ill-take-this`
6. **You** — *Ask about a tax refund.*
   - ✓ 택스 리펀드 돼요? `tax-refund` → **Assistant:** 네, 여권 있으세요? — Yes. Do you have your passport?
     - **You:** ✓ 여기 있어요 **NEW** `here-you-are`
7. **Assistant:** 일시불로 해 드릴까요? — In a single payment? *(Usage note: the card-instalment question. Just say 네.)*
   - **You:**
     - ✓ 네 `yes`
     - ✗ 아니요 `no`: that asks for instalments.
8. **Assistant:** 포장해 드릴까요? — Shall I gift-wrap it? *(Usage note: in a shop, 포장 means wrapping. In a restaurant it means "to go".)*
   - **You:** ✓ 괜찮아요 `its-okay` · ✓ 네 `yes`
9. **Assistant:** 감사합니다. 또 오세요. — Thank you. Come again.
   - **You:** ✓ 안녕히 계세요 `goodbye-staying`

## 10. Market stall (시장)

*Setting:* a hotteok stall in a traditional market. *Other person:* the vendor.

1. **Vendor:** 어서 오세요! 뭐 드릴까요? — Welcome! What can I get you?
2. **You** — *Point and ask what this is.*
   - ✓ 이게 뭐예요? `what-is-this` → **Vendor:** 호떡이에요. 달아요. — It's hotteok. It's sweet.
   - **Catch:** ✓ It's sweet · It's spicy · It's sold out · It's cold
3. **You** — *Ask how much.*
   - ✓ 얼마예요? `how-much` → **Vendor:** 한 개에 이천 원이에요. — 2,000 won each.
   - **Catch:** ✓ 2,000 won each · 2 for 1,000 won · 12,000 won · 2,000 won for all
4. **You** — *Order two.*
   - ✓ 두 개 주세요 `two-of-them`
   - ✗ 두 명이에요 `two-people`: 명 counts people.
5. ***Free play only:*** **You** — *Ask for a discount.*
   - ✓ 좀 깎아 주세요 `discount` → **Vendor:** 그럼 두 개에 삼천오백 원 해 드릴게요. — All right, two for 3,500.
6. **You** — *Ask if you can pay by card.*
   - ✓ 카드 돼요? `card-ok` → **Vendor:** 죄송해요, 현금만 돼요. — Sorry, cash only.
     - **You:**
       - ✓ 현금으로 할게요 `pay-cash`
       - ✓ ATM 어디 있어요? `atm-where`
7. **Vendor:** 맛있게 드세요! — Enjoy!
   - **You:**
     - ✓ 감사합니다 `thank-you`
     - ✓ 잘 먹겠습니다 `before-meal`: a warm touch at a food stall.

## 11. Small talk (이야기)

*Setting:* an older guest at your guesthouse starts chatting over breakfast. *Other person:* a local.

1. **Local:** 어디서 왔어요? — Where are you from? `where-from-heard`
   - **You:**
     - ✓ 유럽에서 왔어요 `from-europe`
     - ✗ 어디예요? `where-is-it`: that asks where something is.
2. **Local:** 한국은 처음이에요? — Is this your first time in Korea?
   - **You:** ✓ 한국은 처음이에요 `first-time-korea` · ✓ 네 `yes`
3. **Local:** 한국어 잘하시네요! — Your Korean is good!
   - **You:**
     - ✓ 아니에요 `not-at-all` *(the modest answer)*
     - ✓ 한국어 조금 해요 `a-little-korean`
     - ✓ 감사합니다 `thank-you`
4. **Local:** 한국 어때요? — How do you like Korea?
   - **You:**
     - ✓ 한국 너무 좋아요 `like-korea`
     - ✓ 재미있어요 `its-fun`
     - ✓ 최고예요 `the-best`
     - ✗ 배고파요 `hungry`
5. **Local:** 한국에 얼마나 있어요? — How long are you in Korea?
   - **You:** ✓ 한 달 있어요 **NEW** `staying-a-month`
6. **You** — *Ask them to take a photo of you.*
   - ✓ 사진 찍어 주실 수 있어요? `take-our-photo` → **Local:** 네. 하나, 둘, 셋! … 한 장 더 찍을게요. — Sure. One, two, three! … One more.
   - **Catch:** What did they say at the end? ✓ They'll take one more · They're done · Smile · Move closer
7. **Local:** 즐거운 여행 되세요! — Enjoy your trip!
   - **You:** ✓ 감사합니다 `thank-you`

## 12. Pharmacy (약국)

*Setting:* you've had a headache since yesterday. *Other person:* the pharmacist.

1. **Pharmacist:** 어서 오세요. 어디가 불편하세요? — What seems to be the problem?
2. **You** — *Say you have a headache.*
   - ✓ 머리가 아파요 `headache`
   - ✓ 배가 아파요 `stomach-ache`
   - ✓ 열이 나요 `fever`
   - ✓ 아파요 `it-hurts`: accepted but vague → **Pharmacist:** 어디가 아프세요? — Where does it hurt? → ask again. *(A vague answer gets a follow-up question, as in real life.)*
3. **Pharmacist:** 언제부터 아프셨어요? — Since when?
   - **You:**
     - ✓ 어제부터요 **NEW** `since-yesterday`
     - ✗ 내일 `tomorrow`
4. **Pharmacist:** 알레르기 있으세요? — Do you have any allergies?
   - **You:**
     - ✓ 없어요 `there-isnt`
     - ✓ 아니요 `no`
     - ✓ 땅콩 알레르기 있어요 `peanut-allergy` → **Pharmacist:** 이 약은 괜찮아요. — This medicine is fine.
5. **Pharmacist:** 이 약 하루에 세 번, 식후에 드세요. — Take this three times a day, after meals.
   - **Catch:** ✓ 3 times a day, after meals · 3 times a day, before meals · Once every 3 days · 3 tablets at once
6. ***Variant (½)*** **Pharmacist:** 졸릴 수 있어요. — It may make you drowsy.
   - **Catch:** ✓ It may make you drowsy · Take it with water · Don't drink alcohol · Keep it cold
7. **Pharmacist:** 오천 원입니다. — 5,000 won.
   - **You:** ✓ 감사합니다 → **Pharmacist:** 안녕히 가세요. → **You:** ✓ 안녕히 계세요

## 13. Hotel check-out (체크아웃)

*Setting:* the morning you leave; your train is in the afternoon. *Other person:* the receptionist.

1. **You** — *Say you'd like to check out.*
   - ✓ 체크아웃할게요 `check-out` → **Receptionist:** 카드키 주시겠어요? — Could I have your key card?
     - **You:** ✓ 여기 있어요 **NEW** `here-you-are`
2. **Receptionist:** 미니바 이용하셨어요? — Did you use the minibar?
   - **You:** ✓ 아니요 `no` · ✓ 네 `yes`
3. **You** — *Ask them to keep your luggage.*
   - ✓ 짐 좀 맡아 주세요 `keep-luggage` → **Receptionist:** 몇 시에 찾으러 오세요? — What time will you come back for it?
     - **You:**
       - ✓ 세 시 `three-oclock`
       - ✗ 삼십 분 `thirty-minutes`
4. **Receptionist:** 네, 짐표 여기 있습니다. 안녕히 가세요. — Here's your luggage tag. Goodbye.
   - **You:** ✓ 안녕히 계세요 `goodbye-staying`

---

## New Expressions the drafts need

Each one needs Romanization, an Illustration, Clips and the second-model review, like any Catalog addition.

| id | Hangul | English | Topic | Tier | Used in |
| --- | --- | --- | --- | --- | --- |
| `here-you-are` | 여기 있어요 | Here you are / Here it is | Basics & survival | 1 | Hotel check-in, Clothes shop, Hotel check-out |
| `station-where` | 지하철역 어디예요? | Where is the subway station? | Directions & places | 1 | Asking the way |
| `americano` | 아메리카노 한 잔 주세요 | One americano, please | Café & drinks | 2 | Café |
| `heat-it-up` | 데워 주세요 | Please heat it up | Food & ordering | 2 | Convenience store |
| `pay-separately` | 따로 계산할게요 | We'll pay separately | Food & ordering | 2 | Restaurant |
| `that-one-please` | 그걸로 주세요 | I'll have that one, please | Food & ordering | 2 | Restaurant |
| `keep-up-good-work` | 수고하세요 | (said when leaving someone at work) | Greetings & courtesy | 2 | Taxi (native check) |
| `regular-size` | 레귤러로 주세요 | Regular size, please | Café & drinks | 3 | Café |
| `throw-it-away` | 버려 주세요 | Please throw it away | Money & shopping | 3 | Convenience store |
| `since-yesterday` | 어제부터요 | Since yesterday | Health & emergencies | 3 | Pharmacy |
| `staying-a-month` | 한 달 있어요 | I'm staying for a month | Small talk | 3 | Small talk |

Every other Reply above is already in the Catalog: about 80 different Expressions across the thirteen Conversations, a third of the Catalog put to work in context.

## Heard Expressions, roughly

- **New:** about 90 Heard Expressions join the Catalog with these Conversations. They are Listen-only, with no Illustrations.
- **Converted (ticket 01):** five existing Expressions become Heard: `welcome-heard`, `how-many-heard`, `for-here-heard`, `this-station-heard`, `hello-formal-heard`.
- **Unchanged:** `where-from-heard` stays ordinary; you can ask it back.
- **Ordinary Expressions also used as Lines:** `goodbye-leaving`, `just-a-moment`, `pardon`, `thank-you`. The other person says them too, and they stay ordinary.
- **Shared by several Conversations,** so each is added once, by the first ticket that needs it:
  - the payment lines (영수증 드릴까요?, 카드 꽂아 주세요, 카드 여기 대 주세요, 현금만 돼요, 거스름돈 여기 있습니다);
  - the price lines.
- **Price lines:** one fixed set of about 12 amounts, as Heard Expressions in Money & shopping (outside the Numbers cap). Catches reuse them.
