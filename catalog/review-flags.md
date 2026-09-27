# Catalog review flags

Reviewer: independent model. Status: open. Resolved by the user; do not edit catalog.ts from here.

## Corrections

| id | field | current | suggested | why | confidence (high/med/low) |
|---|---|---|---|---|---|
| atm-where | hangul | `ATM 어디 있어요?` | `에이티엠 어디 있어요?` | Latin letters in the Hangul field; a Korean TTS voice reading "ATM" raw will likely mispronounce it or code-switch. Every other loanword in the catalog (와이파이, 콘센트, 택스 리펀드, 카드키…) is fully spelled out in Hangul — this is the one exception. | high |
| yes / counter-four | hangul + romanization | both are `네` / `ne` | no single-field fix — flag for the two entries together | Identical Hangul and romanization for two different meanings ("Yes" vs. "four before a counter"). The `counter-four` usage note already warns about this for the Speak direction, but the Listen direction (hear audio, recall meaning) gets no context at all, so this pair is genuinely ambiguous by ear. | medium |
| help / help-me-please | hangul | `도와주세요!` vs `좀 도와주세요` | consider a more distinct phrase for one of them | The two entries differ only by the word "좀," which is easy to miss when spoken aloud. An emergency "Help!" card and a routine "could you help me" card sounding almost identical is a real risk in the Listen direction. | medium |
| to-go (food) / take-away (cafe) | english | `To go, please` vs `To go (I will take it)` | e.g. reword the food one to `Pack it up, please` | Two different Korean phrases (포장해 주세요 vs 가져갈게요) both glossed with "to go" wording. In the Speak direction, a learner shown "To go, please" could reasonably produce either phrase. | low |
| call-ambulance / call-police | hangul / romanization | `구급차 불러 주세요` / `경찰 불러 주세요` (no `!`) | `구급차 불러 주세요!` / `경찰 불러 주세요!` | English glosses ("Call an ambulance!", "Call the police!") carry urgency via `!`, but the Hangul/romanization don't, unlike `help`, which has `!` in all three fields. Minor, cosmetic. | low |

## Consistency notes

- Cross-word sound changes are applied inconsistently at word boundaries. `못 해요` is fused into one romanized unit with aspiration (`mo-tae-yo`, in `dont-speak-korean`/`i-dont-understand`), but the same kind of cross-word liaison before `있어요`/없어요 is *not* applied in `another-colour` (`다른 색 있어요?` → `saek i-sseo-yo`, not `sae-gi-sseo-yo`) or `good-restaurant-nearby` (`맛집 있어요?` → `mat-jjip i-sseo-yo`, not `mat-jji-bi-sseo-yo`), even though natural connected speech would liaise there too. This may be a deliberate choice (obligatory aspiration/tensing gets merged, optional liaison across a looser word boundary doesn't), but that rule isn't stated anywhere, so a future contributor extending the catalog has no way to apply it consistently.
- Related to the above: numeral+counter phrases keep the Hangul word-space in the romanization when no sound change occurs (`cheon won`, `han jan`, `du gae`, `mul han byeong`), but the space disappears when tensing occurs (`myeot-ppu-ni-se-yo`, `sam-sip-ppun`, `yeong-eop-jjung`). Internally consistent once you see the pattern, but worth adding a line to the ADR/header comment so it's documented rather than implicit.
- No politeness violations found: every one of the 242 Expressions checked out as polite `-yo` or a defensible fixed `-mnida`/`-ㅂ니까` set phrase (안녕하십니까, 감사합니다, 잘 먹겠습니다/잘 먹었습니다, 고맙습니다). No casual/반말 forms anywhere.
- No other stray digits/Latin letters found in any Hangul field besides `atm-where`.
- No duplicate `id`s; no duplicate English prompts (exact-string check); the only exact Hangul/romanization duplicate is the `네` pair noted above.

## Missing (suggested additions)

| romanization | hangul | english | topic | why |
|---|---|---|---|---|
| yeo-gwon-eul i-reo-beo-ryeo-sseo-yo | 여권을 잃어버렸어요 | I lost my passport | health | One of the most common real tourist emergencies; lost-phone and lost-wallet exist but not this. |
| taek-ssi jom bul-leo ju-se-yo | 택시 좀 불러 주세요 | Could you call me a taxi? | transport | "Taxi" is only taught as a noun; asking staff to call one is a very common need. |
| hwan-jeon eo-di-seo hae-yo? | 환전 어디서 해요? | Where can I exchange money? | shopping | Cash is still needed at markets/temples; no currency-exchange phrase exists. |
| yu-sim eo-di-seo sa-yo? | 유심 어디서 사요? | Where can I buy a SIM card? | transport | Near-universal airport-arrival need for a first-timer, currently absent. |
| yo-geu-mi eol-ma-e-yo? | 요금이 얼마예요? | How much is the fare? | transport | Generic "How much is it?" exists, but fare-specific phrasing for bus/taxi/subway comes up constantly. |
| ui-sa-ga pil-ryo-hae-yo | 의사가 필요해요 | I need a doctor | health | Distinct from the pharmacy/hospital nouns already present; no direct request phrase exists. |
| pyeon-do-ro ju-se-yo | 편도로 주세요 | One-way, please | transport | Needed at any ticket counter/machine for trains and intercity buses. |
| beo-seu jeong-nyu-jang eo-di-e-yo? | 버스 정류장 어디예요? | Where is the bus stop? | directions | Subway-station location is covered; bus-stop location, just as common, is not. |
| hwan-bu-pae ju-se-yo | 환불해 주세요 | I'd like a refund, please | shopping | Tax-refund (for tourists leaving) is covered but an ordinary product return/refund is not. |
| wa-i-pa-i i-sseo-yo? | 와이파이 있어요? | Is there Wi-Fi? | cafe | Only "what's the password" exists; the more basic "is there Wi-Fi at all" question is missing. |
| i-geo eo-tteo-ke hae-yo? | 이거 어떻게 해요? | How do I use this? | basics | Self-order kiosks are now standard in Korean restaurants/cafes; tourists need a phrase to ask for help with one. |
| ye-ya-ka-go si-peo-yo | 예약하고 싶어요 | I'd like to make a reservation | food | Only "I have a reservation" (already booked) exists; booking on the spot is equally common. |

## Could cut

- youre-welcome (천만에요): rarely used by native speakers in everyday conversation now; `not-at-all` (아니에요) already fills the reply-to-thanks slot.
- counter-four (네, before a counter word): never actually used in any other Expression (no "four o'clock"/"four items" phrase exists to justify it), and it collides with `yes`.
- hello-formal-heard (안녕하십니까): passive-recognition-only register; 안녕하세요 already covers nearly everything a tourist will actually need to say or hear.
- this-station-heard (이번 역은…): a dangling sentence fragment with no predicate; odd as a standalone flashcard.
- the-best (최고예요): fun extra, not survival-critical.
- its-pretty (예뻐요): fun extra, not survival-critical.
- key-card (카드키): a noun a tourist receives, essentially never needs to say aloud.
- map (지도): low real-world utility now that most tourists navigate by phone.
