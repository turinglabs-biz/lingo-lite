# 04 Repair and Watch

Status: done
Blocked by: 02

## What
The learner can ask for help the way they would in Korea, and can watch a Conversation before playing it.

- **Repair chips** under every Line:
  - 네? → the Line plays again.
  - 천천히 말해 주세요 → it plays the Slow Clip.
  - 영어 하세요? → the text appears, and counts as text shown.
  - Each chip first plays the learner's Expression in their Voice.
  - Repair is recorded on the run and never counts as Missed.
- **Watch:**
  - The Conversation plays Turn by Turn with all text visible for both sides, following accepted Replies and random Variants.
  - Any Line can be tapped to replay, normal or slow.
  - Nothing is graded, and it's not a session.
  - A Watch button joins the Conversation page.
- **`CONTEXT.md`:** gains **Repair** and **Watch**.

## Done when
- [x] An end-to-end run covers:
  - 네? replays a Line, and 천천히 말해 주세요 plays its Slow Clip;
  - 영어 하세요? shows the text, and the run records text shown;
  - Watch plays the Convenience store to the end with all text, and records no answers and no session.

## Comments

- 2026-10-19: Done.
  - **Repair:**
    - Three chips (네?, 천천히 말해 주세요, 영어 하세요?) under the chat whenever the other person has spoken.
    - Each plays the learner's Expression in their Voice to the end (`playClipToEnd`, a new player helper), then the other person repeats the latest Line, plays its Slow Clip, or shows its full text.
    - Repairs appear as plain bubbles. They aren't answers; 영어 하세요? counts as text shown.
  - **Watch:**
    - A Watch button on the Conversation page.
    - One run along the intended Replies with random Variants, every bubble with full text and its own play and slow buttons, Catches shown with their answer, and "Play all" playing both Voices in turn.
    - Not a session.
  - **End-to-end run** (production build, `play()` logged):
    - 네? played `male/pardon` then `female/welcome-heard`.
    - 천천히 played `male/slowly-please` then `female/welcome-heard.slow`.
    - 영어 하세요? revealed "Welcome!".
    - No answers were recorded for the three Repairs.
    - Watch showed 16 bubbles, all with English, and left no answers and no session.
    - No page errors.
