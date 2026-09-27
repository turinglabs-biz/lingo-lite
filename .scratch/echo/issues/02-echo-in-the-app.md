# 02 Echo in the app, or remove the Echo lab

Status: ready-for-agent
Blocked by: 01

## What
Stage 2 of the spec. Which half applies depends on the verdict under `## Answer` in 01.

### If the Echo lab passed: move Echo into the app
- Settings gets:
  - an Echo row: the setup from the Echo lab (size, download, mic permission, turn off deletes the model)
  - a debug setting that shows the raw score under the Echo score
- A hold-to-talk mic button sits next to the play buttons at:
  - first exposure
  - the feedback after every answer (Speak, Listen and See, and the Learn session's checks)
  - the Phrasebook list
- It is never on the Listen prompt or in the Show view, and it's hidden while Echo is off.
- The button shows the latest Echo score or "Didn't catch that, try again". Each new Echo replaces it.
- In sessions, a hold counts as learner input for Practice time. In the Phrasebook it changes nothing.
- Nothing is stored: no attempts, no scores, no audio. There is no XP, and no Grade or schedule changes.
- Keep only the chosen model and its reference points. Apply any tuning from the verdict.
- Remove the Echo lab: the page, its Settings link, its storage and its test-only tools.
- Mark ADR 0004 *accepted*. Add a README section on changing the model and redoing the reference points.

### If the Echo lab failed: remove it
- Remove everything built for Echo:
  - the Echo lab
  - the fetch script and its Dockerfile layer
  - the model runner and the scorer
  - the reference-point script, table and check
  - every model file
- Mark ADR 0004 *rejected*, with a line on why.
- Remove **Echo** and **Echo score** from `CONTEXT.md`, and restore the Practice time definition.
- Change the v1 non-goal note to say Echo was tried and rejected.

## Done when
**Passed:**
- [ ] All tests pass. The Docker build runs the model and reference-table checks for the chosen model only.
- [ ] An end-to-end run covers:
  - turning Echo on in Settings
  - echoing at first exposure, after a Speak, a Listen and a See answer, and in the Phrasebook list
  - no mic button on the Listen prompt or in the Show view
  - Echo off hides every mic button
- [ ] Practice time grows during a session in which the learner only echoes for over a minute.
- [ ] No Echo lab code or page remains, and only one model is in the build output.

**Failed:**
- [ ] The build output, the Dockerfile and the dependencies match what they were before 01. All tests pass.
- [ ] `CONTEXT.md`, ADR 0004 and the v1 spec are updated as above.

## Comments
