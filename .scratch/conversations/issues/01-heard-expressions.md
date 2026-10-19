# 01 Heard Expressions

Status: open
Blocked by: none

## What
Expressions the learner only ever hears become their own kind, practised by listening alone. This is the groundwork for Conversations, and useful on its own: the app starts teaching what staff say, not only what the learner says. See the spec, **Heard Expressions join the Catalog**.

- **Catalog:**
  - An Expression can be marked Heard.
  - Five existing ones become Heard: 어서 오세요 `welcome-heard`, 몇 분이세요? `how-many-heard`, 드시고 가세요? `for-here-heard`, 이번 역은 `this-station-heard` and 안녕하십니까 `hello-formal-heard`.
  - 어디서 왔어요? `where-from-heard` stays ordinary: the learner can ask it back.
- **Directions:** a Heard Expression has only Listen, available from introduction (not unlocked by Speak).
- **Learn session:** exposure (an ear mark, no Illustration, no Echo), the listen-and-pick check, then Listen attempts in the same spaced rounds Speak uses. A Missed final-round attempt earns one more.
- **Learned and Stars:** Learned for a Heard Expression follows its Listen Direction. Heard Expressions count toward their Topic's Stars like any other.
- **Options:** a Heard Expression is never a Korean option on a Speak or See question. Listen options may include its meaning.
- **Phrasebook and first exposure:** an ear mark, no Illustration. The Show view is unchanged.
- **Progress upgrade:** an introduced Heard Expression without a Listen card gets one, due now. Its Speak and See cards are kept, but no longer scheduled or counted.
- **Checks:** `catalog:check` stops requiring an Illustration for Heard Expressions. `catalog:review` tells the reviewing model that Heard Expressions model staff speech, so honorific and formal forms are expected.
- **Docs:**
  - ADR 0005 records Heard Expressions and Conversations, amending ADR 0002 (see the spec's **ADR conflicts**).
  - `CONTEXT.md` gains **Heard Expression**, and updates **Direction**, **Listen**, **Learned**, **Illustration**, **Politeness** and **Learn session**.

## Done when
- [ ] Domain tests pass for:
  - the Learn plan gives a Heard Expression Listen attempts and never Speak;
  - Learned follows Listen for it;
  - Korean options never include it;
  - Stars count it;
  - the upgrade adds a missing Listen card.
- [ ] Every existing test still passes.
- [ ] An end-to-end run covers:
  - a Batch that contains 어서 오세요 introduces it with Listen attempts only;
  - in a Review session it only comes back as Listen;
  - the Phrasebook shows its ear mark and no drawing.
- [ ] Progress made before this change (with 어서 오세요 introduced and Learned by Speak) opens with a Listen card for it and nothing else lost.
- [ ] ADR 0005 and `CONTEXT.md` are updated.
