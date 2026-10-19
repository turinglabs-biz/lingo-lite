# Heard Expressions and scripted Conversations alongside the flashcards

Status: accepted (2026-10-19). It amends ADR 0002.

On the trip, the hardest part is not what the learner says but what they hear. Staff questions, instructions, announcements and prices come fast and in honorific forms, and the Catalog held almost none of them. We add two things.

**Heard Expressions.** Anything the learner only ever hears joins the Catalog as a Heard Expression.
- It is learned, scheduled, Focused and Ignored like any Expression, but its only Direction is Listen.
- The learner is never asked to say it, it is never a Korean option or echoed, and it has no Illustration.
- Recognition is the right practice for what is only ever heard; Speak stays the recall Direction for everything the learner says.
- Five existing Expressions that a traveller only hears (어서 오세요, 몇 분이세요?, 드시고 가세요?, 이번 역은, 안녕하십니까) became Heard. Their old Speak and See cards are kept but no longer scheduled, so the change is reversible without losing Progress.

**Conversations.** These are scripted exchanges (convenience store, café, taxi, hotel...) where the learner plays themself.
- The other person's Lines are Expressions played as audio with the text hidden.
- Replies keep the Speak mechanics: say it aloud first, then a checked pick from four Korean options.
- Catches check what was understood: a price, a time, an instruction.
- Repair (네?, 천천히 말해 주세요) is always available and never counts as a mistake.
- Conversations are spaced as whole exchanges, on their own schedule. Playing one never changes an Expression's schedule.

ADR 0002 chose flashcards over a mix of exercise types. This reopens that choice for one reason: flashcards can't train listening to unscripted questions, choosing a reply in context, or recovering when lost. The amendment keeps the ADR's principles:
- recall comes before recognition on every Reply;
- every answer is checked (ADR 0003);
- the added gamification is a status label and a due count, not points or Stars.

Service exchanges are short and formulaic, so a fixed script is close to the real thing (Wray 2002), and practising in conditions that resemble later use improves transfer (Morris, Bransford & Franks 1977).

## Considered options

- **Script-only lines outside the Catalog.** This would need no Catalog changes, but staff lines would only be practised inside Conversations, never scheduled one by one. The learner chose to have them in the phrase list.
- **Heard lines as ordinary Expressions with all three Directions.** That means asking the learner to say lines only staff say, and drawing about 90 Illustrations for no See question worth asking.
- **Free conversation with a language model.** It needs the network, can't be checked reliably, and breaks the offline promise.
- **Conversation answers grading Expressions too.** Context cues the answer and the options include it, so a hit is weak evidence. The learner chose to keep Expression schedules driven by Learn, Review and Focus sessions only.

## Consequences

- The Catalog grows by about 100 Expressions, about 90 of them Heard. Heard Expressions add Clips but no Illustrations.
- "Every Expression has three Directions and an Illustration" no longer holds; Heard Expressions are the one exception.
- Prices a learner hears are fixed Heard Expressions, so listening to prices needs no runtime generation (v1 non-goal kept).
