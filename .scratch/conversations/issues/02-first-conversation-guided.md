# 02 First Conversation: the Convenience store in Guided play

Status: done
Blocked by: 01

## What
The tracer bullet: one Conversation playable end to end, through every layer. It has no Catch, Variants, Repair, Watch, Prepare or schedule yet; those are tickets 03–06.

- **Home:**
  - A secondary **Conversations** button below the Focus button opens the Conversations page.
  - For now the page lists the one Conversation; tapping it opens a minimal Conversation page with its setting and a Play button.
- **Format and validation:**
  - Conversations are authored in a source file next to the Catalog: Lines, Replies (intent, accepted Replies each with its next Turn, authored distractors) and an End.
  - Every rule from the spec's **Validation** that applies so far runs in `catalog:check` and in a test over every Conversation.
- **Content:** the Convenience store from `scripts.md` §1, minus its Catch Turns.
  - Its Variant steps play every time for now.
  - Its new Heard Expressions join the Catalog, each with a Tier, Romanization, Clips and review. That includes the shared payment Lines.
  - The new ordinary Expressions 데워 주세요 `heat-it-up` and 버려 주세요 `throw-it-away` get Illustrations and Clips.
  - The native check of the new Heard Expressions is done, or the remaining doubts are listed under Comments.
- **Guided play:**
  - **Voices:** the other person gets one Voice at random for the run, and the learner's Replies play in the other.
  - **Lines** play as audio with the text hidden. A quiet "Show text" reveals the Romanization, then the English; using it is recorded on the run.
  - **Replies:** the intent, Echo, "I said it, show options", then four options. One is the accepted Reply the intent names, the rest are authored distractors filled from the Topic's other ordinary Expressions; never a Heard or Ignored Expression.
  - **Checking:**
    - A right pick follows that Reply's branch and plays it.
    - A miss shows and plays the accepted Reply and continues along its branch.
- **Session:**
  - A `conversation` session type with answers of kind `reply`, counting for XP, Streak, Practice time and Stats.
  - Quitting keeps the answers given. The existing session summary ends a finished run.
- **No Expression's card is ever written** by a Conversation.
- **`CONTEXT.md`:** gains **Conversation**, **Turn**, **Line**, **Reply** and **Guided play**, plus the Voice and session-type changes.

## Done when
- [x] Domain tests pass for:
  - each validation rule fires on a broken fixture;
  - walking follows an accepted Reply's branch, and a miss follows the accepted branch;
  - options always include the accepted Reply, never a Heard or Ignored Expression, and at most 4;
  - a run changes no Expression's card.
- [ ] The Convenience store passes validation, and `catalog:check` and `audio:check` pass. *(Validation and `catalog:check` pass. `audio:check` fails until the Clips are generated; see Comments.)*
- [x] An end-to-end run covers:
  - from Home, the Convenience store played to the end in Guided play;
  - a Reply missed on purpose (안녕히 가세요 at the door) shows and plays 안녕히 계세요;
  - the summary appears, and the session shows in XP and Stats;
  - every Expression card is unchanged.

## Comments

- 2026-10-19: Done, except the Clips.
  - **Catalog:** 9 new Expressions.
    - 7 Heard: `need-bag-heard`, `receipt-heard`, `insert-card-heard`, `points-card-heard`, `change-heard`, `bag-price-heard`, `heat-up-heard`.
    - 2 ordinary, with new drawings: `heat-it-up` (a steaming microwave) and `throw-it-away` (a receipt going into a bin).
  - **Clips not generated:** this machine has no `.env` with `OPENROUTER_API_KEY`.
    - Run `npm run audio`, then `npm run echo:reference` (for `heat-it-up` and `throw-it-away`).
    - Until then, playback falls back to the device's Korean voice.
    - The Echo reference test now covers echoable Expressions that have Clips; `audio:check` reports the missing ones.
  - **Native check:** not done. Doubts for a native speaker:
    - 봉투는 백 원이에요: the bag price varies by chain (20–100 won); is it natural as a fixed line?
    - 거스름돈 여기 있습니다: or more usually 여기 거스름돈이요?
  - **Engine:** `replyOptions`, `checkReply` and `validateConversation` are pure domain functions. Validation runs in `catalog:check` and in a test over every Conversation. 11 new tests; 95 in total pass.
  - **Play:**
    - A chat. The clerk's Lines play in one Voice with the text hidden ("Show text", then "Show meaning"); the learner's Replies play in the other Voice.
    - A miss is shown in a dashed bubble with the fitting Reply.
    - Answers are of kind `reply`, and a "Conversation replies" tile joins Stats.
  - **End-to-end run** (headless Chrome, 390px, production build):
    - After a Learn session, the Convenience store was played from Home → Conversations: 7 Replies, with 안녕히 가세요 at the door missed on purpose and shown as 안녕히 계세요.
    - The summary showed 86% and +12 XP; Done returned to Conversations; Stats showed "86% Conversation replies · 7".
    - All 41 cards were byte-for-byte unchanged. No page errors.
