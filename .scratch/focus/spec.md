# Focus: spec

Status: done

Vocabulary follows `CONTEXT.md` (see **Focus**, **Focus session**, **Batch**, **Review session** and **Phrasebook**).

## Problem Statement

Some Expressions matter more to the learner than others: the ones they know they'll need on the trip, or the ones that keep slipping. Today the schedule treats every Expression the same, so the learner can't say "make sure I really learn this one". They can only hope it comes up often enough.

## Solution

The learner can put any Expression in **Focus**, and take it out again, wherever an Expression is shown: in every exercise (before or after answering), at first exposure, and in the Phrasebook. A pin icon marks it. For a Focus Expression:

- **Scheduling:** all its Directions aim for 95% recall instead of 90%, so they come up about 2–3× as often. This takes effect immediately.
- **Review session:** when due, they go first.
- **Not yet introduced:** it joins an upcoming Batch early. Each Batch takes up to 5 such Expressions, picked at random.
- **Focus page:** opened from Home, it lists every Focus Expression and starts a **Focus session**.
  - The session has up to 20 questions from Focus Expressions, due or not, least likely to be remembered first.
  - It's graded and counted like a Review session.

Focus stays until the learner takes it off. There's no limit, and the count is always visible.

## User Stories

### Marking

1. As a learner, I want to put an Expression in Focus with one tap wherever I see it, so that I can mark a phrase the moment I realise it matters.
2. As a learner, I want to put an Expression in Focus while answering a question, even before I answer, so that I don't have to remember to do it later.
3. As a learner, I want to put an Expression in Focus at its first exposure, so that I can flag a phrase I know I'll need as soon as I meet it.
4. As a learner, I want to put Expressions in Focus from the Phrasebook, so that I can pick the phrases I'll need for the trip while browsing.
5. As a learner, I want to put an Expression in Focus that I haven't met yet, so that I can plan ahead for situations I know are coming.
6. As a learner, I want the pin to show whether an Expression is already in Focus, so that I can tell at a glance.
7. As a learner, I want to take an Expression out of Focus the same way I put it in, so that I can undo a mistake or stop drilling a phrase I've got.
8. As a learner, I want Focus to stay until I take it off, so that a phrase doesn't quietly drop out because some threshold decided I know it.
9. As a learner, I want the pin to look different from a Topic's Stars, so that I never confuse "I want to practise this" with "I've earned this".
10. As a learner, I want the pin kept out of the Phrasebook's Show view, so that the screen I show to other people stays clean.

### Scheduling

11. As a learner, I want the Directions of a Focus Expression scheduled for higher recall, so that they come up more often and I really learn them.
12. As a learner, I want all three Directions (Speak, Listen and See) of a Focus Expression practised more, so that I can both say the phrase and understand it when I hear it.
13. As a learner, I want putting an Expression in Focus to bring its next review forward right away, so that I don't wait weeks for it to have any effect.
14. As a learner, I want taking an Expression out of Focus to move its next review back to the normal schedule, so that I'm not over-practising it.
15. As a learner, I want Focus Directions first in a Review session when they're due, so that a busy day's 20-question cap never pushes them out.
16. As a learner, I want not-yet-introduced Focus Expressions to join my upcoming Batches early, a few at a time and at random, so that I meet them soon without a Batch made only of them.
17. As a learner, I want each Batch to still hold at most 3 Numbers Expressions, Focus picks included, so that Numbers stay spread out.

### Focus page and Focus session

18. As a learner, I want a "Focus" button on Home that shows how many Expressions are in Focus, so that I can see how many I've chosen and get to them quickly.
19. As a learner, I want a Focus page that lists all my Focus Expressions, so that I can review my choices in one place.
20. As a learner, I want to play each Focus Expression and take it out of Focus from that page, so that I can manage the list without going elsewhere.
21. As a learner, I want Focus Expressions I haven't met yet marked "Not met yet" on the Focus page, so that I know why they aren't in the Focus session.
22. As a learner, I want to start a Focus session from the Focus page, so that I can drill the phrases I care about whenever I have a few minutes.
23. As a learner, I want a Focus session to give me up to 20 questions from my Focus Expressions, least likely to be remembered first, so that the time goes where it helps most.
24. As a learner, I want a Focus session to use every Direction I've unlocked, so that I practise saying, hearing and seeing the phrase.
25. As a learner, I want a question I miss in a Focus session to come back once at the end, like in a Review session, so that I get a second go while it's fresh.
26. As a learner, I want my Focus session answers to update the schedule, so that a miss makes the phrase come back sooner.
27. As a learner, I want a Focus session to count for XP, Streak, Practice time and Stats like any other session, so that extra practice is rewarded the same way.
28. As a learner, I want to be able to quit a Focus session partway and keep the answers I gave, so that a short session is never wasted.
29. As a learner, I want the Start button disabled until at least one Focus Expression has been introduced, so that I never start an empty session.

### Housekeeping

30. As a learner, I want Focus to be part of my Progress, so that it survives closing the app and is cleared by Reset Progress like everything else.
31. As a learner, I want Focus kept when an Expression's text is edited in the Catalog, so that fixing a typo doesn't lose my choice.
32. As a learner, I want taking an Expression out of Focus during a session to leave that session's remaining questions alone, so that the session doesn't shift under me.

## Implementation Decisions

- **Storage.** Focus is stored in Progress as one record per Expression id, with the time it was set. It needs a Dexie version upgrade that adds the table; nothing else migrates. As with the rest of Progress, Focus for an Expression no longer in the Catalog is ignored.
- **The Progress summary** gains the set of Focus Expression ids. Everything below reads from it.
- **Scheduling (the scheduler module).**
  - Grading takes whether the Expression is in Focus. Focus cards use a second FSRS scheduler with 95% requested retention; all others keep 90%. Fuzz and short-term steps stay as they are.
  - A new refocus function recomputes a card's due date when its Expression enters or leaves Focus. The due date becomes the last review plus the interval FSRS gives for the card's stability at the new target.
  - Refocusing only changes cards in the review state that have been reviewed at least once. New cards and cards in (re)learning steps are left alone, because their next step is minutes away anyway.
  - Setting and clearing Focus both refocus all of the Expression's existing Direction cards in one transaction.
- **Review session.** The due-card selection takes the Focus set. Due Focus Directions come first (most overdue first among them), then the other due Directions (most overdue first), up to 20. The "N reviews due" count on Home is unchanged.
- **Batches.** The Batch picker takes the Focus set and the random source.
  1. It picks up to 5 not-yet-introduced Focus Expressions at random.
  2. It fills the rest of the 15 in Catalog order, skipping any Numbers Expression that would take the Batch past 3 Numbers (Focus picks count toward the cap).
  3. Batch size and ordering stay otherwise as today.
- **Focus session.**
  - It's a third session type, next to Learn and Review, so Stats, XP and the Streak count it with no special case.
  - A new queue function picks up to 20 existing Direction cards of introduced Focus Expressions, due or not, ordered by FSRS retrievability now (lowest first).
  - The session reuses the Review session's flow: checked questions, graded into the schedule with the Focus target, and a Missed question comes back once at the end.
- **The pin.**
  - A pin toggle component shows the current state and flips it.
  - It appears at first exposure, on every Speak, Listen and See question and the Learn session's listen-and-pick check (both before and after answering), in the Phrasebook list and on the Focus page.
  - It never appears in the Phrasebook's Show view.
  - The icon is a pin, never a star.
- **Home and the Focus page.**
  - Home gets a secondary "Focus (N)" button that opens the Focus page. It shows even when N is 0, so the learner can find the feature.
  - The Focus page lists every Focus Expression (introduced ones first, in the order they were put in Focus), each with its play buttons and pin. Not-yet-introduced ones carry a "Not met yet" label.
  - "Start" launches a Focus session. It's disabled until at least one Focus Expression is introduced.
- **The Phrasebook** gets the pin on each row, and no Focus filter.

## Testing Decisions

- A good test checks what the domain functions return for plain inputs (cards, sets, a fixed "now", an injected random source), never how they get there. The existing domain tests for Progress and scheduling show the style.
- **Scheduling tests:**
  - A Focus card graded Good gets a shorter interval than the same card outside Focus.
  - Refocusing a review card brings its due date forward, and taking it out of Focus moves it back.
  - Refocusing leaves new and learning cards unchanged.
- **Review selection tests:**
  - Due Focus Directions come before other due Directions, even when less overdue.
  - The 20 limit still holds.
  - Not-yet-due Focus Directions are not selected.
- **Batch tests:**
  - At most 5 Focus Expressions per Batch, chosen via the random source.
  - Focus Expressions already introduced are never picked again.
  - The rest follows Catalog order.
  - The Numbers cap holds for the whole Batch, Focus picks included.
  - With no Focus Expressions, a Batch is exactly what it was before.
- **Focus queue tests:**
  - Only introduced Focus Expressions' existing cards are included.
  - Lowest retrievability comes first.
  - At most 20.
  - Due and not-due cards are both eligible.
- **End-to-end run:**
  - Put Expressions in Focus from a question, from first exposure and from the Phrasebook, including one not yet met.
  - Open the Focus page and see the "Not met yet" label.
  - Run a Focus session to the end and see it counted in XP and Stats.
  - Start a new Batch and see the not-yet-met Focus Expression in it.
  - Check that Reset Progress clears Focus.

## Out of Scope

- A separate Focus tab, and a Focus filter in the Phrasebook (the Focus page replaces both).
- Focus ending by itself (e.g. once Learned).
- A limit on how many Expressions can be in Focus.
- A different recall target per Direction, or one the learner can set.
- Focus-specific statistics beyond the count.
- Focus in the Echo lab.

## Further Notes

- 95% instead of 90% makes FSRS intervals roughly 40% as long, which is where "about 2–3× as often" comes from. The Focus session adds on-demand practice on top.
- Focus changes Learned only through the answers the learner gives. It has no direct effect on Learned, Stars or XP.
- No ADR: every decision here is easy to reverse (the target is a constant, and the Focus table can be dropped).
