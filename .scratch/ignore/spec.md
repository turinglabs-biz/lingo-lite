# Ignored: spec

Status: done

Vocabulary follows `CONTEXT.md` (see **Ignored**, **Focus**, **Batch**, **Review session**, **Stars** and **Phrasebook**).

## Problem Statement

Some Expressions in the Catalog aren't useful to a given learner: a situation they won't be in, a phrase they'll never say. Today there's no way to say "not this one", so it keeps coming back in Batches, reviews and as an option, and it counts against a Topic's Stars.

## Solution

The learner can mark any Expression **Ignored**, and take the mark off again, the same way they put it in Focus: a quiet toggle beside the Focus pin, wherever an Expression is shown (every question and first exposure, and the Phrasebook). An Ignored Expression:

- is never introduced in a Batch, never reviewed, never in a Focus session;
- is never offered as an option in another Expression's question;
- is left out of counts (Home, Topics, Stats) and of its Topic's Stars, so the rest of the Topic can earn them;
- stays in the Phrasebook, dimmed, so it can still be shown to someone.

Its Progress is kept, so taking the mark off brings it straight back as it was. Ignoring an Expression takes it out of Focus; putting it in Focus stops ignoring it.

## User Stories

1. As a learner, I want to mark an Expression Ignored with one tap wherever I see it, so that I can drop a phrase the moment I realise I won't need it.
2. As a learner, I want to ignore an Expression while answering a question, so that I don't have to find it again later.
3. As a learner, I want an Ignored Expression to never come up again in Batches, reviews or Focus sessions, so that my practice time goes to what I need.
4. As a learner, I want an Ignored Expression to never appear as an option, so that I'm not distracted by phrases I chose not to learn.
5. As a learner, I want the rest of a session to skip an Expression I just ignored, so that it doesn't come back minutes later.
6. As a learner, I want Ignored Expressions kept in the Phrasebook, only dimmed, so that I can still show one to someone if I need it.
7. As a learner, I want Ignored Expressions left out of my counts and a Topic's Stars, so that a phrase I chose to skip doesn't hold a Topic back.
8. As a learner, I want to take the Ignored mark off the same way I put it on, and find the phrase as I left it, so that a mistake costs nothing.
9. As a learner, I want ignoring and Focus to exclude each other, so that a phrase is never both "practise harder" and "never practise".

## Implementation Decisions

- **Storage.** One record per Expression id in a new `ignored` table (Dexie v5), with the time it was set; cleared by Reset Progress. Nothing else migrates, and no other Progress is deleted when ignoring.
- **The Progress summary** gains the Ignored set, plus `practiceCatalog` and `practiceCards`: the Catalog and Direction cards without Ignored Expressions. Batches, the due count, and Review and Focus sessions are built from these, through two pure helpers (`withoutIgnored`, `cardsWithoutIgnored`) so the domain functions themselves stay unchanged.
- **Options.** Ignored Expressions join the set already excluded from a question's options (the answer's Illustration siblings).
- **Sessions.** Moving to the next question skips any Expression ignored since the session started; the current question can still be finished.
- **Stars.** A Topic's Stars are computed over its Expressions that aren't Ignored, and recomputed when the mark changes. Stars still never drop.
- **Focus.** Ignoring removes Focus (re-dating its cards to the normal target); putting an Ignored Expression in Focus removes the Ignored mark.
- **The toggle** is a gray circle-slash beside the Focus pin, filled gray when on, never in the accent colour. Not on the Phrasebook's Show view or the Focus page.

## Testing Decisions

Domain tests on plain inputs, in the style of the Focus tests: a Batch built without Ignored Expressions skips them and fills from Catalog order; Ignored Directions are never due-selected (even in Focus) nor in a Focus session; nothing changes when nothing is Ignored; Stars computed without an Ignored Expression can reach 3.
