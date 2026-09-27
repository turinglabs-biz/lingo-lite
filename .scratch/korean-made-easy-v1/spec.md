# Korean Made Easy v1: spec

Status: open

Vocabulary follows `CONTEXT.md`. Decisions are recorded in `docs/adr/0001-pronunciation-first-romanization.md` and `docs/adr/0002-flashcards-over-exercise-mix.md`.

## Goal

A free, offline PWA that teaches about 300 survival Korean Expressions to one traveller before and during a month in Korea. Expressions are shown romanized first, with audio at normal and slow speed everywhere. There are no accounts and no network use after the first load.

## Non-goals

- Login, sync, backup, export/import. Progress is device-only, and losing it is accepted.
- Teaching the Hangul alphabet, grammar, or casual speech.
- Speech recognition or pronunciation scoring.
- Generating content at runtime. The Catalog and Clips are fixed at build time.
- Number drills with generated prices (a noted idea for later).
- Leaderboards, badges, lives, hearts.

## Catalog

- About 300 Expressions in 12 Topics:
  1. Greetings & courtesy
  2. Basics & survival
  3. Numbers
  4. Money & shopping
  5. Food & ordering
  6. Café & drinks
  7. Directions & places
  8. Transport
  9. Hotel & accommodation
  10. Time & days
  11. Health & emergencies
  12. Small talk
- Each Expression has these fields:
  - stable `id`
  - `topic`
  - `romanization`: pronunciation-first, hyphenated by syllable (ADR 0001)
  - `hangul`
  - `english`
  - optional `usageNote`
  - `order`: its position in the Catalog order
- Politeness: *-yo* speech by default, *-mnida* only for fixed set phrases, never casual.
- Numbers cover the Sino-Korean and native Korean systems as ordinary Expressions (1–10, 100, 1,000, 10,000), with Usage notes saying when each system is used.
- Catalog order: ordered by usefulness and interleaved across Topics. No Batch of 15 contains more than 3 Numbers Expressions.
- The Catalog is a single source file in the repo. It is checked by a second, independent model for naturalness, politeness and Romanization. Disagreements are flagged to the user, who decides.
- Progress is keyed by Expression `id`. When an Expression is edited, its Progress is kept. When one is removed, its Progress is dropped.

## Audio

- Two Voices, one female and one male, chosen by the user from a listening test of OpenRouter TTS models (`POST /api/v1/audio/speech`).
- For each Expression and each Voice:
  - Normal Clip: mp3 from OpenRouter.
  - Slow Clip: the Normal Clip time-stretched to 0.75× with ffmpeg `atempo`, pitch unchanged.
- That makes about 1,200 files, roughly 20 MB, all precached for offline use.
- Generation runs as a local script with `OPENROUTER_API_KEY` from the environment. The key never goes into the app. The script is idempotent: it only regenerates missing or changed Expressions.
- Fallback if no OpenRouter model is acceptable: a local Supertonic 3 or MeloTTS run through the same pipeline.

Playback rules:

| Where | Normal Clip | Slow Clip |
|---|---|---|
| Speak card | Silent prompt; autoplays on reveal | Button after reveal |
| Listen card | Autoplays as the prompt; replay button | Button |
| First exposure, Phrasebook | Tap to play | Button |

- Each Normal playback picks a Voice at random.
- A Slow playback uses the Voice that was just heard.

## Learning

- **Directions:** each Expression has Speak and Listen, and each is scheduled independently with FSRS (`ts-fsrs`, target retention about 0.9).
  - Listen unlocks after the first Speak answer graded Hard or Got it.
- **Grades:** Missed / Hard / Got it, which map to FSRS Again / Hard / Good.
- **Learn session** (one Batch, the next 15 Expressions in Catalog order):
  1. First exposure, one Expression at a time: English, Romanization (large), Hangul (subtle) and Usage note are shown. The Normal Clip autoplays, with a "say it aloud" prompt.
  2. One listen-and-pick check per Expression: hear the Clip and pick the English from 4 options, with immediate feedback.
  3. 2–3 Speak attempts per Expression, spread through the session.
  - Quitting partway: every Expression already shown counts as introduced and enters FSRS. The rest return to the queue.
- **Review session:**
  - Up to 20 due Directions, most overdue first, with Speak and Listen mixed.
  - Speak: English is shown; the learner says it aloud, taps reveal, sees the Romanization and Hangul, hears the Clip, then grades.
  - Listen: the Clip plays; the learner recalls the meaning, taps reveal, sees the English, then grades.
- **Batches:** there's no daily cap, and the learner may start as many Batches as they want. When more than 50 Directions are due, the app suggests reviewing first but still allows a new Batch.
- **Learned:** an Expression is Learned when its Speak FSRS stability is at least 7 days.

## Gamification & Stats

- XP:
  - +1 per graded answer, including the listen-and-pick check
  - +2 when an Expression becomes Learned
  - +5 per finished session
- Streak: consecutive local days with at least one finished session.
- Stars per Topic:
  - ★ when all Expressions in the Topic are introduced
  - ★★ at 80% Learned
  - ★★★ at 100% Learned
  - Stars never drop once earned.
- Stats screen:
  - total answers, answers graded correct (Hard or Got it), accuracy shown separately for Speak and Listen
  - Practice time: time spent actively answering, excluding any gap of more than 60 s without input
  - current and longest Streak
  - Expressions introduced and Learned
  - a daily activity heatmap
  - per-Topic progress
- Session summary: accuracy, XP gained, Streak, newly Learned Expressions.

## Screens

- **Home:**
  - A **Continue** button: a Review session if anything is due, otherwise a Learn session.
  - A secondary **New Batch** button.
  - "N reviews due" as a hint.
  - Streak and XP in the header.
- **Topics:** each Topic with its Stars and progress. Tapping one opens its Expressions in the Phrasebook.
- **Phrasebook:**
  - Search by English or Romanization, grouped by Topic, with Normal and Slow playback.
  - A "Show" view with large Hangul and Romanization, for showing to other people.
  - Using it never changes Progress.
- **Stats:** as described above.
- **Settings:** a toggle to show Hangul first instead of Romanization first. A reset-Progress button with confirmation.

## Tech

- Vite + React + TypeScript.
- Dexie (IndexedDB) for Progress.
- `ts-fsrs` for scheduling.
- `vite-plugin-pwa` (Workbox) to precache the app, the Catalog and all Clips.
- Call `navigator.storage.persist()` to ask the browser not to evict stored data.
- Mobile-first layout. It must work installed on iOS Safari and Android Chrome.
- Hosting: static build served by nginx on the turinglabs VPS (Docker, behind Traefik).
- Tests: unit tests for scheduling, Learned/Stars/XP/Streak/Practice-time logic, and the Catalog-order constraints.

## Illustrations and See (added 2026-09-27)

- Every Expression has an **Illustration**: a hand-drawn single-color line SVG on a 48×48 grid, 2px round strokes in `currentColor`. They live in `catalog/illustrations.ts`, keyed by Expression id.
  - Expressions that show the same thing share a drawing. Those siblings are the "also correct" answers for See.
- Shared visual language:
  - A speech bubble means "saying": a heart inside for thanks, a bowing figure for sorry, a waving hand for hello/goodbye.
  - Corner markers: ? for questions, ✕ for not / no, + for more, → for go / take me to.
  - Sino-Korean numbers are a digit on a price tag; native Korean numbers are counted dots or objects.
- Where Illustrations appear: first exposure, after reveal on Speak, Listen and See cards, and the Phrasebook list and Show view. Never on a Speak or Listen prompt, and not in the listen-and-pick check.
- **See** is a third Direction on every Expression:
  - The prompt is the Illustration plus four Korean options (Romanization, with Hangul subtle). You pick one, the app checks it, and the phrase plays. Right first time = Got it, wrong = Missed.
  - Distractors come from the same Topic first, then from introduced Expressions. Expressions sharing the Illustration are never distractors.
  - It unlocks with Listen on the first Speak answer graded Hard or Got it.
  - See doesn't count toward Learned, but it counts for XP, answers and Stats, with its own accuracy line.
- Existing Progress gets See cards for every Expression that already has Listen unlocked (a Dexie upgrade).
- A "name what you see" card with pictures alone as the only prompt for Speak was rejected; the English prompt stays for Speak.

## Tickets

See `issues/`. Tickets 01 and 02 can run in parallel. Everything else depends on them or on ticket 04.
