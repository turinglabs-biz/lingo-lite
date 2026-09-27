# 12 See Direction

Status: done
Blocked by: 11

## What
- A third Direction, `see`, scheduled with FSRS like the others.
  - It unlocks together with Listen on the first correct Speak answer.
  - A Dexie upgrade adds See cards for Expressions that already have Listen.
- See card in the Review session: the Illustration is the prompt, then "Say it aloud, then reveal", then the Expression and audio, the "also correct" siblings, and a hint: "Said one of the others? Grade Hard."
- See doesn't count toward Learned. It counts for XP and answers, and has its own accuracy line in Stats.

## Done when
- The unit tests cover unlocking and accuracy, and the end-to-end run reaches a See card.

## Comments

- 2026-09-27: Done.
  - A Dexie v3 upgrade adds See cards wherever Listen exists.
  - The first correct Speak answer unlocks Listen and See.
  - The See card shows "also correct" siblings with a "grade Hard" hint.
  - Stats has a See accuracy line.
  - Tests: 37 pass. The end-to-end run reached and graded a See card with no errors.
  - Not tested: the v2 → v3 upgrade on a real device that already has Progress. There is none yet, since the app hasn't been deployed.
- 2026-09-27: Changed at the user's request. See is now a checked choice instead of self-graded: the Illustration plus four Korean options; picking one checks it and plays the phrase. Right = Got it, wrong = Missed.
  - `seeOptions` never offers an Expression sharing the Illustration. It prefers distractors from the same Topic, then introduced Expressions.
  - The "also correct" list and the "grade Hard" rule were removed.
