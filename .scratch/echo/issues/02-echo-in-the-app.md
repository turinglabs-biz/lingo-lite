# 02 Echo in the app

Status: done
Blocked by: 01

## What
Stage 2 of the spec, after the Echo lab passed (see `## Answer` in 01). The user changed the plan in two ways: the Echo lab stays, and there is no debug toggle.

- Settings gets an Echo row: the setup from the Echo lab (size, download, mic permission, turn off).
  - It's its own switch; the Echo lab keeps its own.
  - Both share the downloaded files. Turning one off deletes them only if the other is off too.
- A hold-to-talk mic appears:
  - at first exposure
  - in the feedback after every answer (Speak, Listen and See, and the Learn session's checks)
  - in the Phrasebook list
- It is never on a question before answering (including the Listen prompt) or in the Show view. It's hidden while Echo is off.
- The mic shows the latest Echo score or "Didn't catch that, try again". Each new Echo replaces it.
- In sessions, an Echo counts as learner input for Practice time. In the Phrasebook it changes nothing.
- Nothing is stored: no attempts, no scores, no audio. There is no XP, and no Grade or schedule changes.
- Keep only the native-speech model and its reference points. There is no tuning (none was requested).
- The Echo lab stays in Settings as the detail view. Only its model switch goes, since there is one model.
- Mark ADR 0004 *accepted*, and update the README's Echo section.

## Done when
- [x] All tests pass. The Docker build checks the one model and its reference table.
- [x] An end-to-end run covers:
  - turning Echo on in Settings
  - echoing at first exposure, in the feedback after an answer, and in the Phrasebook list
  - no mic before answering or in the Show view
  - turning Echo off hides every mic
- [x] Practice time grows in a session where the learner only echoes.
- [x] Only one model is in the build output. The Echo lab still works, with its own switch.

## Comments

- 2026-09-27: Done.
  - **Settings:** the Echo row and the Echo lab share one setup flow (download, then the mic) but keep separate switches. The setting is `echo`; the lab keeps its flag in localStorage.
  - **Loading:** the model loads only when the first mic button appears, and then stays loaded while the app is open.
  - **Clean-up:** when setup runs, phones delete stored files the build no longer uses, which removes the dropped learner model.
  - **The mic:** a full-width button with the score below it at first exposure and in the answer feedback, and a round button next to the play buttons in the Phrasebook, showing the score in its place.
  - **End-to-end run** (headless Chrome, production build, a fake microphone replaying the last Clip):
    - Echo off: no mic anywhere.
    - Settings: download 270 MB, then allow the mic, then Echo is on.
    - Echo lab: finds the files already downloaded; turning it off keeps them.
    - First exposure: 99%. A Listen question before answering has no mic. Answer feedback: 89%.
    - The Learn session had 10 s of Practice time from the Echoes.
    - Phrasebook: the round mic shows 91%, and there's no mic in the Show view.
    - Turning Echo off in Settings deletes the files (it offers 270 MB again), and every mic disappears.
    - No request went to any other host.
  - **Not covered by the run:** the feedback after a Speak or See answer. It uses the same answer component as the Listen check that was tested.
