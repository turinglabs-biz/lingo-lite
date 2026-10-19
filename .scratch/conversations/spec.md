# Conversations: spec

Status: built (tickets 01–07, 09–12); ticket 08, the pilot, waits for the learner

Vocabulary follows `CONTEXT.md`. New and changed terms are in **Domain language** below. The full draft of every Conversation is in `scripts.md` next to this file. The tickets are in `issues/`.

## Problem Statement

The app teaches Expressions one at a time, and Speak, Listen and See check each one in isolation. On the trip, Expressions come inside exchanges that follow a script the learner doesn't know yet:

- The clerk asks whether you want your food heated, whether you need a bag, and whether you want the receipt.
- The server says water is self-service and that you pay at the counter.
- The taxi meter reads 12,000 won and the driver asks you to tap your card.

Three things go wrong there that flashcards don't train:

1. **Listening is the bottleneck.** A traveller can prepare what they will say, but not what they will hear. The Catalog is almost entirely things the learner says: only a handful of its 241 Expressions are things they hear. Staff questions, instructions and prices come fast, in honorific forms the learner never uses.
2. **Choosing the right reply in the moment.** Knowing 안녕히 계세요 and 안녕히 가세요 on cards is not the same as picking the right one while walking out of a shop.
3. **Recovering when lost.** 네?, 천천히 말해 주세요 and 다시 한 번 말해 주세요 are in the Catalog, but they're never practised at the moment they're needed.

## Solution

Two connected changes.

### Heard Expressions join the Catalog

What the other person says becomes part of what the learner learns. A **Heard Expression** is an Expression the learner only ever hears: a staff question, an instruction, an announcement, a price.

- It is in the Catalog, the Catalog order, Batches, the Phrasebook, Focus and Ignore like any other Expression.
- It has a single Direction, **Listen**: hear it and pick its meaning. The learner is never asked to say it, it has no Illustration, and Echo is off for it.
- In a Learn session it gets the exposure and the listen-and-pick check, then repeated Listen attempts in place of Speak attempts.
- It is Learned when its Listen Direction is expected to be remembered for at least 7 days, and counts toward its Topic's Stars like any Expression.
- Expressions already in the Catalog that a traveller only ever hears become Heard Expressions: 어서 오세요, 몇 분이세요?, 드시고 가세요?, 이번 역은 and 안녕하십니까.

About 90 Heard Expressions come with the Conversations, together with 11 new Expressions the learner says.

### Conversations

Short scripted exchanges, one per everyday travel situation. The learner plays themself, and the other person (clerk, barista, driver) speaks with the app's Voices. Thirteen are drafted in `scripts.md`, chosen by how often a tourist in Korea meets them and how much a misunderstanding costs. They're reached from a **Conversations** button on Home.

Each Conversation is a small learning path:

1. **Prepare.** The Conversation's Expressions that aren't introduced yet are learned in ordinary Learn sessions, up to 15 at a time: first the Replies needed to play, then the rest.
2. **Watch.** The whole exchange plays once with everything visible: Hangul, Romanization, English, both sides.
3. **Guided play.** The learner takes their part.
   - The other person's Lines play as audio, with the text hidden.
   - At each Reply, an English intent says what to say ("Tell them you don't need a bag").
   - The learner says it aloud, taps "I said it", and picks it from four Korean options, exactly like Speak.
4. **Free play.** No intents. Several Replies may fit, and they lead to different branches. Random Variants change what the other person asks, so a run can't be memorised.
5. **Catch.** At the moments that carry information (a price, a time, a room number, an instruction), the learner picks what they understood from four English options.

Throughout, **Repair** is at hand under every Line:

- 네? makes the other person repeat.
- 천천히 말해 주세요 makes them repeat slowly.
- 영어 하세요? shows the text, as a last resort.

Using Repair is never a mistake.

Conversations come back by spaced repetition, as whole exchanges:

- A Conversation enters its own schedule when the learner first finishes it in Guided play.
- From then on it's played in Free play, and every finished Free run grades it. A **clean** run (no Missed Reply or Catch, no text shown; Repair allowed) counts as Good; anything else counts as Missed.
- Due Conversations are counted on the Home button.
- A Conversation is **Fluent** when it's expected to be remembered for at least 7 days.

**Playing a Conversation never changes any Expression's schedule.** Expressions are scheduled only by Learn, Review and Focus sessions, as now. Answers given in a Conversation count for XP, Streak, Practice time and Stats.

## Domain language (to add to CONTEXT.md as the tickets land)

- **Heard Expression:** an Expression the learner only ever hears (a staff question, an instruction, an announcement, a price). It has one Direction, Listen, and no Illustration. _Avoid_: Heard line, staff phrase, passive Expression.
- **Conversation:** a scripted exchange in one everyday travel situation, in which the learner plays themself. It belongs to one Topic, and has its own schedule. _Avoid_: Scenario, dialogue, role-play, scene, simulation.
- **Turn:** one step of a Conversation: a Line, a Reply or a Catch.
- **Line:** the other person says an Expression, usually a Heard Expression, sometimes an ordinary one (감사합니다).
- **Reply:** the learner says an Expression (never a Heard one). It is checked like Speak; several Replies may be accepted, each leading on in its own way.
- **Catch:** the learner picks what they understood from a Line (a price, a time, an instruction) from four English options. _Avoid_: comprehension check, quiz.
- **Variant:** one of several alternatives the other person may take at a point in a Conversation, chosen at random each run.
- **Repair:** asking the other person to repeat, slow down or switch to English. It is available under every Line, and never counts as Missed.
- **Watch**, **Guided play**, **Free play:** the three ways through a Conversation.
- **Clean run:** a finished run with no Missed Reply or Catch and no text shown. Repair is allowed.
- **Fluent:** a Conversation expected to be remembered for at least 7 days.

Changes to existing terms:

- **Direction:** every Expression has Speak, Listen and See, except Heard Expressions, which have only Listen.
- **Listen:** for Heard Expressions it is available from introduction, not unlocked by Speak.
- **Learned:** for Heard Expressions, it's based on Listen.
- **Illustration:** every Expression except Heard Expressions has one.
- **Politeness:** it governs what the learner says. Heard Expressions are what staff really say, including honorific (-시-) and formal (-ㅂ니다) forms.
- **Learn session:** it introduces a Batch, a Topic Batch, or a Conversation's missing Expressions. Heard Expressions get Listen attempts instead of Speak attempts.
- **Voice:** within a Conversation, each speaker keeps one Voice for the whole run.
- **Session types:** they gain the Conversation run.
- **Progress:** it gains each Conversation's schedule and runs.

## User Stories

### Heard Expressions

1. As a learner, I want the questions and announcements I'll hear in my phrase list, so that I learn to understand them, not only to say things.
2. As a learner, I want to practise Heard Expressions by listening only, so that I'm never asked to say something only staff say.
3. As a learner, I want Heard Expressions in my Batches, Reviews and Phrasebook like everything else, so that they're scheduled and findable.
4. As a learner, I want the Phrasebook to mark which Expressions I'll hear rather than say, so that I know which side of the counter each one is on.
5. As a learner, I want Expressions I already learned that are only ever heard (어서 오세요...) to switch to listening practice without losing my Progress, so that nothing I did is wasted.

### Choosing and preparing

6. As a learner, I want a Conversations button on Home that shows how many are due, so that I can find them and know when to come back.
7. As a learner, I want a list of everyday situations (convenience store, café, taxi, hotel...) with their status, so that I can rehearse the ones I'll meet first.
8. As a learner, I want each Conversation to show which of its Expressions I haven't learned yet, so that I know whether I'm ready.
9. As a learner, I want to learn a Conversation's missing Expressions in Learn sessions before playing it, so that I'm never asked to say something I've never seen.

### Watching and playing

10. As a learner, I want to watch the whole exchange once with text, translation and audio for both sides, so that I know what happens in that situation in Korea.
11. As a learner, I want the other person's Lines played as audio with the text hidden, so that I practise understanding by ear.
12. As a learner, I want to replay a Line by saying 네? and hear it slowly by saying 천천히 말해 주세요, so that asking for help becomes a habit and not a failure.
13. As a learner, I want to see the text as a last resort, so that I'm never stuck.
14. As a learner, I want to say my reply aloud before seeing options, as in Speak, so that I practise producing it.
15. As a learner, I want Echo available on my Replies, so that I can check how close I sound.
16. As a learner, I want more than one sensible reply accepted, each leading somewhere different, so that the Conversation responds to what I chose.
17. As a learner, when I pick a reply that doesn't fit, I want to see and hear one that does and carry on, so that a mistake teaches me without ending the run.
18. As a learner, I want the other person to ask different things on different runs, so that I learn to listen rather than memorise.
19. As a learner, I want to pick what I understood when I'm told a price, time, room number or instruction, so that I practise catching key information, especially numbers.
20. As a learner, I want intents the first time and none afterwards, so that the help fades as I improve.
21. As a learner, I want to hear my Reply in the other Voice after picking it, so that each exchange sounds whole.

### Coming back

22. As a learner, I want a Conversation to come back after days, then weeks, as long as I play it cleanly, so that I stay ready without over-practising.
23. As a learner, I want a run with mistakes to bring the Conversation back sooner, so that I practise it until it's solid.
24. As a learner, I want to see which Conversations are Fluent, so that I know what I'm ready for.
25. As a learner, I want playing a Conversation to leave my Expressions' schedules alone, so that my Reviews stay as they are.
26. As a learner, I want a Conversation to count for XP, Streak, Practice time and Stats, so that this practice is rewarded like any session.
27. As a learner, I want to quit a Conversation partway and keep the answers I gave, so that a short run is never wasted (a quit run doesn't grade the Conversation).
28. As a learner, I want Ignored Expressions never offered as options, so that I'm never asked for what I chose not to learn.

## Implementation Decisions

### Decisions taken (2026-10-19)

1. **Conversations don't change Expression schedules.** Runs record answers (for XP, Streak, Practice time and Stats) and nothing else.
2. **Home button only.** There's no entry from Topics and no new tab.
3. **Heard Expressions join the Catalog**, rather than living as script-only lines.
4. **Conversations are spaced**, with their own schedule.
5. **Name:** Conversation.

Derived from these (open to change in review):

- **Heard Expressions** are Listen-only, have no Illustration and no Echo, and are never offered as Korean options on Speak or See questions, or as a Reply.
- **The five existing Expressions only ever heard become Heard.** `where-from-heard` (어디서 왔어요?) stays an ordinary Expression: the learner can ask it back.
- **Prices** a learner hears ("사천오백 원입니다") are Heard Expressions in Money & shopping, outside the Numbers cap. That gives listening practice for prices without generating numbers, so the v1 non-goal stays.
- **When a Conversation is scheduled.** It enters its schedule on the first finished Guided run, graded clean = Good, otherwise Missed. After that, only finished Free runs grade it.
- **Fluent** uses the same 7-day threshold as Learned.

### Catalog: Heard Expressions

- **Field.** An Expression gains an optional field marking it Heard. Its Progress is keyed by `id` as always.
- **Upgrade.** A Dexie upgrade gives each introduced Heard Expression that lacks one a Listen card, due now. Its Speak and See cards are kept but no longer scheduled or counted, so making it ordinary again restores them.
- **Learn plan.** Heard Expressions get exposure, the listen-and-pick check, then Listen attempts in the same spaced rounds Speak uses (a Missed final-round attempt earns one more).
- **Options.**
  - Korean options (Speak, See, Replies) exclude Heard Expressions.
  - English options (Listen, Catch) may include their meanings.
- **Display.** Phrasebook and first exposure show a Heard Expression with an ear mark and no Illustration. The Show view is unchanged.
- **Checks and review.**
  - `catalog:check` requires an Illustration for every Expression except Heard ones.
  - `catalog:review` tells the reviewing model that Heard Expressions model staff speech, so honorific and formal forms are expected there.
- **Audio.** The audio pipeline is unchanged: Heard Expressions are Catalog Expressions, so their Clips are generated like any other.

### Content: Conversations

- **Source file.** Conversations live in a source file next to the Catalog, fixed at build time.
- **What a Conversation records:** `id`, `topic`, `title`, `setting` (one line of English), the other person's role, a start Turn and a map of Turns. Every Turn refers to Expressions by `id`.
  - **Line:** an Expression id.
  - **Reply:** the English intent, the accepted Replies (each with its next Turn) and optional authored distractors.
  - **Catch:** the Line it is about, the question, the right answer and three wrong ones.
  - **Variant:** weighted alternatives for what comes next.
  - **End.**
- **Validation** (`catalog:check`, plus a test over every Conversation) fails the build when:
  - an id doesn't exist;
  - a Reply or a distractor is a Heard Expression;
  - a Turn can't be reached, or a path never ends, or a path runs past 20 Turns;
  - a Reply Turn has no accepted Reply;
  - a distractor is also accepted at that Turn;
  - a Catch's wrong answers include the right one.
- **Native check.** New Heard Expressions get a native-speaker check once, because they teach what the learner will hear.

### Engine (pure domain functions)

| Function | What it does |
| --- | --- |
| `startRun(conversation, random)` | Starts a run. |
| `advance(run, choice, random)` | Moves to the next Turn: follows the chosen Reply's branch, or picks a Variant with the random source. |
| `replyOptions(turn, catalog, ignored, random)` | Up to 4 options: one or two accepted Replies, plus authored distractors, filled from the Topic's other ordinary Expressions. Never an option that is also accepted; never a Heard or Ignored Expression. |
| `checkReply(turn, picked)` | Returns `{ correct, next, expected }`. On a miss, the conversation continues along the first accepted Reply's branch. |
| `isClean(run)` | Whether the run had no Missed Reply or Catch and no text shown; Repair is allowed. |
| `canPlay(conversation, introduced, ignored)` | True when every Reply Turn has at least one introduced, non-Ignored accepted Reply. |
| `prepareBatch(conversation, introduced, ignored)` | Up to 15 not-yet-introduced, non-Ignored Expressions of the Conversation, in Catalog order: the Replies `canPlay` needs first, then the rest. |
| `conversationStatus(card, canPlay, now)` | Needs N new, Ready, Due, Played or Fluent. |

- **A Reply Turn whose accepted Replies are all Ignored** is played as in Watch: shown, not asked.

### Schedule, sessions and storage

- **The Conversation's card.** Each Conversation has one schedule card, using the same FSRS scheduler as Directions at the standard 90% target (Focus doesn't apply).
  - **Creation:** the card is created and graded by the first finished Guided run.
  - **Grading:** every finished Free run grades it, clean = Good, otherwise Missed. Quitting doesn't grade.
- **Never Expression cards.** No Conversation code path writes an Expression's card.
- **Session type.** A new `conversation` session type counts for XP (1 per Reply or Catch, 5 per finished run), Streak, Practice time and Stats with no special case.
- **Answers** gain the kinds `reply` and `catch`, with Conversation and Turn ids.
- **Storage.** A Dexie upgrade adds a Conversation-card table and a run table. Reset Progress clears both.

### Screens

- **Home** gets a secondary "Conversations" button, "Conversations · 2 due" when any are due, below the Focus button.
- **Conversations page.**
  - All Conversations in curated order (as ranked in `scripts.md`), due ones first.
  - Each row shows the title, the setting and the status label: "Needs 3 new", Ready, Due, Played or Fluent.
- **Conversation page.**
  - Shows the setting and the role, plus the Expressions it uses, with the new ones marked.
  - Actions: "Prepare · N new" (while any are missing), Watch, and Play.
  - Play runs Guided until the Conversation is scheduled, then Free; the learner can choose Guided again for practice, which doesn't grade.
- **Play screen.**
  - **Layout:** a chat. The other person is on the left, with a role drawing in the Illustration style; the learner is on the right.
  - **Lines** arrive as a play bubble, text hidden. Under each are the Repair chips and a quiet "Show text" (Romanization, then English).
  - **Reply Turns** reuse the Speak question's flow: the intent (Guided only), EchoBar, "I said it, show options", four options, the checked result, and then the learner's line plays in the other Voice.
  - **Catch Turns** reuse the Listen question's options.
  - **The end** shows the existing session summary.

## Testing Decisions

- **Domain tests** in the existing style (plain inputs, a fixed "now", an injected random source):
  - **Heard Expressions:**
    - The Learn plan gives them Listen attempts, never Speak.
    - Learned for them follows Listen.
    - Korean options never include them.
    - Stars count them.
    - The upgrade adds a Listen card to an introduced one that lacked it.
  - **Validation:** every authored Conversation passes; a broken fixture shows each rule fires.
  - **Walking a Conversation:** seeded runs reach every Variant; accepted Replies follow their branches; a miss follows the first accepted branch; every path ends.
  - **Options:** at least one accepted Reply is always offered, and no accepted one is marked wrong. Never a Heard or Ignored Expression, and at most 4 options.
  - **Readiness and Prepare:** `canPlay` follows the "one introduced accepted Reply per Turn" rule. `prepareBatch` puts the needed Replies first, takes up to 15, and skips Ignored ones.
  - **Schedule:**
    - The first finished Guided run creates the Conversation's card.
    - Free runs grade it, clean = Good, otherwise Missed; a quit run doesn't.
    - Fluent at 7 days.
    - No Conversation run changes an Expression's card.
- **End-to-end run** (headless Chrome, production build):
  - Prepare, Watch, then Guided-play the Convenience store, using Repair once.
  - Check it's now scheduled, with Expression cards unchanged.
  - Free-play it with a seed that takes the "bag" Variant, missing one Reply. Check it's due again soon, and the session shows in XP and Stats.

## Delivery

Tickets in `issues/`, in dependency order:

| # | Ticket | Blocked by |
| --- | --- | --- |
| 01 | Heard Expressions | None |
| 02 | First Conversation in Guided play (Convenience store) | 01 |
| 03 | Catch and Variants | 02 |
| 04 | Repair and Watch | 02 |
| 05 | Prepare | 02 |
| 06 | Free play and the Conversation schedule | 03 |
| 07 | Café | 03 |
| 08 | Pilot check | 04, 05, 06, 07 |
| 09 | Restaurant, Taxi, Hotel check-in | 08 |
| 10 | Subway, T-money top-up, Asking the way | 08 |
| 11 | Clothes shop, Market stall, Small talk | 08 |
| 12 | Pharmacy, Hotel check-out | 08 |

Ticket 08 is the go/no-go: if the two pilot Conversations don't help on a phone over a few days, stop before writing the other eleven.

## ADR conflicts

To be recorded as ADR 0005 in ticket 01:

- **ADR 0002 (flashcards over an exercise mix).** Conversations add a new kind of practice, which contradicts the ADR's choice against a mix of exercises. That's worth reopening here:
  - Flashcards can't train listening to unscripted questions, choosing a Reply in context, or Repair.
  - Replies keep the Speak mechanics (say it aloud before the options appear, then a checked pick), so recall still comes before recognition.
  - The gamification added is a status label and a due count, not points or Stars.
- **ADR 0002 and its addendum (every Expression gets Speak, Listen and See).** Heard Expressions have only Listen. Recognition is the right Direction for what the learner only hears; Speak stays the recall Direction for everything they say.
- **ADR 0003 (checked answers):** kept. Every Reply and Catch is checked by the app.
- **ADR 0004 (Echo):** reused on Replies, still advisory. Off for Heard Expressions.
- **v1 non-goals:** no runtime generation (scripts and prices are fixed), and no casual speech (Replies stay polite).

## Out of Scope

- **Free-form conversation with a language model.** It needs the network, can't be checked reliably, and breaks the offline promise.
- **Deciding which Reply the learner said from their voice.** Echo stays advisory, and the pick decides.
- **Conversations changing Expression schedules** (decision 1), and **Conversations in Review sessions**: they have their own schedule and button.
- **Entry points from Topics or a sixth tab** (decision 2).
- **Ordering kiosks, reading menus and signs, phone calls.**
- **More situations:** Korean barbecue, the hospital, a hair salon, reporting a lost item to the police.
- **Faster-than-normal playback** to match real staff speed.
- **Per-Conversation Stars, leaderboards, timers.**

## Further Notes

- **Why scripted Conversations work for tourists.**
  - Service exchanges are short and formulaic: the same handful of questions in roughly the same order. Formulaic sequences are learned and recalled as chunks (Wray 2002), so a scripted simulation is close to the real thing.
  - Practising retrieval in conditions that resemble its later use improves transfer to that use (Morris, Bransford & Franks 1977).
- **Korea-specific details the drafts build in on purpose.**
  - At the convenience store: the bag and receipt questions, and heating food.
  - In restaurants: water and side dishes being self-service, and paying at the counter.
  - Cash-only T-money top-ups and market stalls.
  - The card-instalment question 일시불로 해 드릴까요?, which confuses most visitors.
  - The café buzzer.
  - 포장, which means "to go" in a restaurant but "gift wrap" in a shop.
  - 안녕히 계세요 versus 안녕히 가세요, and 잘 먹었습니다 after the meal.
- **Catalog growth.** The Catalog grows from 241 to about 340 Expressions. About 90 are Heard: quicker to learn (Listen only) and adding no Illustrations. Topics grow too (Hotel from 11 to about 25); Stars already earned never drop.
- **Kiosks.** Many chain cafés and fast-food places now order through kiosks. The café draft assumes counter ordering, still common in small cafés.
- **Real speed.** Staff often speak faster than the Normal Clips. A later Free-play option could play Lines at about 1.15×.
