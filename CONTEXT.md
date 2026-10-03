# Lingo Lite

A minimal, offline trainer for the few hundred Korean expressions a traveller actually needs, shown romanized first with audio at normal and slow speed.

## Language

### Content

**Expression**:
The unit of learning: one Korean word or phrase with its Romanization, Hangul, English meaning and Clips.
_Avoid_: Word, phrase, card, item, vocab

**Topic**:
A named group of Expressions for one travel situation (e.g. Greetings, Numbers, Food & ordering). Every Expression belongs to exactly one Topic.
_Avoid_: Category, unit, deck, lesson

**Catalog**:
The complete, curated, fixed set of Topics and Expressions shipped with the app. It never changes at runtime.
_Avoid_: Database, dictionary, content

**Catalog order**:
The single curated sequence in which new Expressions are introduced, ordered by usefulness and interleaved across Topics.

**Romanization**:
The pronunciation-first Latin spelling of an Expression, split by syllable with hyphens and following actual sound changes (e.g. *gam-sa-ham-ni-da*, *maek-jju*). It is the primary way an Expression is displayed.
_Avoid_: Transliteration, Revised Romanization (that is a different, official system)

**Hangul**:
The Korean-script form of an Expression, always shown as a subtle secondary line.

**Usage note**:
An optional short hint on when or to whom an Expression is said (e.g. "to staff", "when leaving a shop").

**Illustration**:
A simple single-color line drawing attached to an Expression, drawn to follow the Catalog and never the other way round. Every Expression has one. It is shown at first exposure, after reveal, in the Phrasebook and as the See prompt (with its English meaning), never on a Speak or Listen prompt.
_Avoid_: Image, icon, graphic, picture, visual

**Politeness**:
Every Expression uses polite *-yo* speech, except fixed set phrases conventionally said in formal *-mnida* form. Casual speech is never taught.

### Audio

**Clip**:
A pre-generated audio recording of one Expression in one Voice. Every Expression has a Normal Clip and a Slow Clip per Voice.
_Avoid_: Sound, recording, TTS

**Normal Clip**:
The Expression spoken at natural speed by one Voice.

**Slow Clip**:
The Normal Clip time-stretched to 0.75× speed without changing pitch. It is derived from the Normal Clip, never recorded separately.

**Voice**:
One of exactly two synthetic speakers (one female, one male) used for all Clips. Each playback uses a randomly chosen Voice.

### Learning

**Direction**:
One way of practising an Expression, with its own schedule. Every Expression has three: Speak, Listen and See.

**Speak**:
The Direction where the learner sees the English meaning, says the Korean aloud, then picks it from four Korean options; the app checks the answer and plays the phrase.
_Avoid_: Recall, production

**Listen**:
The Direction where the learner hears a Normal Clip and picks its meaning from four English options; the app checks the answer. It unlocks after the first successful Speak answer.
_Avoid_: Recognition, comprehension

**See**:
The Direction where the learner sees the Illustration with its English meaning underneath and picks the matching Korean from four options; the app checks the answer and then plays the phrase. The meaning is always shown because a line drawing alone is too often ambiguous. It unlocks after the first successful Speak answer.
_Avoid_: Picture naming, picture card

**Echo**:
An optional step where the learner says an Expression, right after hearing its Clip or from memory on a Speak question, and gets an Echo score. It is not a Direction: it has no schedule, never blocks moving on, and never changes a Grade or XP; it only counts toward Practice time.
_Avoid_: Shadowing, repeat, pronunciation check

**Echo score**:
How close the sounds of one Echo were to the Expression, as a percentage where 100% is as close as the app's own Voices. Each new Echo replaces it.
_Avoid_: Accuracy, match, pronunciation score

**Grade**:
The outcome of one answer, checked by the app: Missed or Got it. Options never include an Expression that shares the answer's Illustration.

**Batch**:
The next 15 new Expressions: up to 5 not-yet-introduced Focus Expressions picked at random, then the rest in Catalog order. The learner may take as many Batches per day as they like.

**Learn session**:
A session introducing one Batch: first exposure with audio, one listen-and-pick check, then repeated Speak attempts.
_Avoid_: Lesson

**Review session**:
A session of up to 20 due Directions, scheduled by spaced repetition, with Focus Directions first.

**Focus session**:
A session of up to 20 Directions of Focus Expressions, due or not, started on demand, least likely to be remembered first. It is graded and counted like a Review session.

**Learned**:
An Expression whose Speak Direction is expected to be remembered for at least 7 days.
_Avoid_: Known, mastered

**Focus**:
A mark the learner puts on an Expression they want to practise harder. All of a Focus Expression's Directions are scheduled for higher recall, go first in a Review session when due, and can be practised on demand. The learner can set or clear it wherever an Expression is shown.
_Avoid_: Star, favourite, bookmark, pin

**Ignored**:
A mark the learner puts on an Expression they don't want to learn. An Ignored Expression is never introduced, reviewed or practised, never offered as an option, and left out of counts and a Topic's Stars; it stays in the Phrasebook, dimmed. Its Progress is kept, so taking the mark off restores it. Ignoring an Expression takes it out of Focus, and putting it in Focus stops ignoring it. The learner can set or clear it wherever an Expression is shown.
_Avoid_: Hidden, deleted, archived, skipped, forgotten

### Progress

**Progress**:
Everything the app remembers about the learner. It lives only on the device, and losing it (e.g. by clearing browser data) is accepted.
_Avoid_: Account, profile, save

**Stars**:
A Topic's 0–3 rating: one when every Expression in it has been introduced, two at 80% Learned, three at 100% Learned. Stars never drop once earned.

**XP**:
Points earned only by practising: 1 per answer, 2 when an Expression becomes Learned, 5 per finished session.

**Streak**:
The number of consecutive days with at least one finished session.

**Practice time**:
Time spent actively answering or echoing in sessions, excluding any gap of more than 60 seconds without input.
_Avoid_: Time in app, screen time

### Reference

**Phrasebook**:
A browsable, searchable view of the whole Catalog for use on the trip, with playback and a large-text view to show to other people. Using it never changes Progress, except for putting Expressions in Focus or marking them Ignored, and taking either off.
_Avoid_: Dictionary, reference mode
