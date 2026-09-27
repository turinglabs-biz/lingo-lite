# 13 Checked answers for every question

Status: done
Blocked by: 12

## What
Replace self-grading with questions the app checks (ADR 0003):
- Speak: say it aloud, tap "I said it, show options", then pick the Korean from four options. The phrase plays afterwards.
- Listen: pick the English from four options.
- See: pick the Korean from four options.

## Comments

- 2026-09-27: Done.
  - Shared question components live in `src/session/questions.tsx`, and options come from `choiceOptions`, which never offers Expressions that share the answer's Illustration.
  - Learn checks now use the same option picker.
  - `Grade` is now Missed | Got it, and the grade buttons are gone.
  - 39 tests pass. The end-to-end run answered every Learn and Review question type through its options with no errors.
