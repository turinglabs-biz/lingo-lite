# 08 Pilot check

Status: open (waiting for the learner)
Blocked by: 04, 05, 06, 07

## What
The go/no-go before the other eleven Conversations get written. No code.

The learner plays both pilot Conversations (Convenience store and Café) on their phone over at least three days, going through:

- Prepare, Watch and Guided play;
- Free play;
- at least one return when a Conversation is due.

Things to watch for:

- **Pace:** run length, and how fast the Lines are.
- **Help:** whether Repair is used naturally, and whether the text hint is needed too often.
- **Difficulty:** of Catches (especially prices) and of the options.
- **Voices.**
- **Schedule:** whether the due timing feels right.

## Done when
- [ ] Notes from the pilot are written under Comments: what helped, and what felt off.
- [ ] A decision is recorded: go ahead, adjust first (as new tickets), or stop.
- [ ] `spec.md` and `scripts.md` are updated with anything that changes.

## Comments

- 2026-10-19: Not done. This ticket needs the learner, on a phone, over several days, so no agent can close it.
  - Tickets 09–12 were built anyway, at the learner's request ("implement all tickets").
  - If the pilot asks for changes, they come as new tickets on top. The content is data in `catalog/conversations.ts`, so it's cheap to adjust.
  - **Before the pilot,** generate the Clips: `npm run audio`, then `npm run echo:reference`. Until then, Lines play with the device's voice.
