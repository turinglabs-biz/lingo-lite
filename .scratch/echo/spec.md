# Echo: spec

Status: done

The Echo lab passed on 2026-09-27. At the user's request, stage 2 keeps the Echo lab as a detail view with its own switch and drops the debug toggle; the changed lines below say so.

Vocabulary follows `CONTEXT.md` (see **Echo** and **Echo score**). The approach is recorded in ADR 0004, which stays *proposed* until the Echo lab passes. Romanization conventions are in ADR 0001.

## Problem Statement

The learner hears every Expression spoken by the app's Voices and is told to say it aloud, but nothing tells them whether what they said sounded anything like it. They can't hear their own accent, and a traveller who says *an-nyeong-hi ge-se-yo* when they meant *ga-se-yo* never finds out. The two learners (the user and their wife, each on their own iPhone) want feedback on their pronunciation without it ever getting in the way of learning, and it must keep working offline abroad.

## Solution

**Echo**: after hearing a Clip, the learner holds a mic button, says the Expression back and releases. The app scores the recording on the phone, sound by sound, against what the Expression should sound like, and shows an **Echo score** as a percentage, where 100% is as close as the app's own Voices. If nothing usable was recorded it says "Didn't catch that, try again". Echo is optional, never blocks, never changes a Grade or XP, and stores nothing.

It is built in two stages:

1. **Echo lab.** A separate page, opened from a link in Settings, where both learners try Echo on their iPhones with extra measuring tools. Everything the real feature needs (the model download, the scorer, the reference points, the setup flow, hold-to-talk) is built for real here.
2. **Then one of two things**, decided by the user after testing:
   - **It works:** Echo moves into the app (first exposure, after every answer, the Phrasebook list) and gets its own switch in Settings. The Echo lab stays, as a detail view with its own switch. *(Changed: the Echo lab was going to be removed.)*
   - **It doesn't:** the Echo lab and everything built for it is removed, and the app goes back to what it was.

## User Stories

### Echo lab (stage 1)

1. As a tester, I want to open the Echo lab from a link in Settings, so that I can try Echo without it touching my lessons.
2. As a tester, I want using the Echo lab never to change Progress, so that testing doesn't disturb my schedule, XP, Streak or Stats.
3. As a tester, I want to see how big the model is before I download it, so that I don't use up roaming data by surprise.
4. As a tester, I want a progress bar while the model downloads, so that I know it's working and how long to wait.
5. As a tester, I want the app to ask for the microphone right after the download, so that my first hold isn't interrupted by a permission dialog.
6. As a tester, I want Echo to stay off if I refuse the microphone, so that I'm never shown a button that can't work.
7. As a tester, I want the downloaded model to keep working with no connection, so that I can use Echo in airplane mode.
8. As a tester, I want to turn Echo off and get the storage back, so that a large model doesn't sit on my phone unused.
9. As a tester, I want to be told when the model has to be downloaded again (because a new one was deployed or iOS cleared it), so that I'm never left with a broken mic button.
10. As a tester, I want to enter my name once, so that results from the two phones can be told apart.
11. As a tester, I want a list of about 20 test Expressions that includes near-identical pairs and one-syllable Expressions, so that the test covers the hard cases.
12. As a tester, I want to play each test Expression's Normal and Slow Clip, so that I know what to echo.
13. As a tester, I want to hold a button while I speak and let go when I'm done, so that I control exactly what gets recorded.
14. As a tester, I want a playing Clip to stop the moment I start holding, so that the Clip isn't recorded over my voice.
15. As a tester, I want recording to stop after 10 seconds even if I keep holding, so that a stuck finger doesn't record forever.
16. As a tester, I want to see my Echo score as a percentage right after letting go, so that I get exactly the feedback a learner would.
17. As a tester, I want "Didn't catch that, try again" instead of a number when nothing usable was recorded, so that a recording problem isn't mistaken for bad pronunciation.
18. As a tester, I want to see the raw score next to the Echo score, so that I can tell whether the scale is off.
19. As a tester, I want to see how long the score took to appear, so that I can judge whether it feels instant enough.
20. As a tester, I want to play back my own recording, so that I can judge for myself whether the score was fair.
21. As a tester, I want to mark an attempt as careful, a deliberate mistake, or a different Expression, so that the results show whether mistakes score lower.
22. As a tester, I want to tap Fair, Too harsh or Too generous after an attempt, so that my judgement is kept next to the numbers.
23. As a tester, I want to echo the same Expression as often as I like, each attempt replacing the shown score, so that I can retry freely.
24. As a tester, I want my attempts kept on the phone until I clear them, so that a reload doesn't lose a test session.
25. As a tester, I want one button that copies all my attempts as text, so that I can paste them back to Claude for tuning.
26. As a tester, I want to switch between the candidate models, so that we can compare them on the same Expressions.
27. As a tester, I want one button that scores the Voices' own Clips on my phone, so that we see whether they reach about 100% and how fast the phone is.
28. As a tester, I want to see whether the model runs on WebGPU or WebAssembly and how long it took to load, so that a slow score can be explained.
29. As a tester, I want the Echo lab to work in the app installed from the Home Screen, so that we test the real setup, including mic permission there.

### Model and build (stage 1)

30. As the maintainer, I want the build to download the converted models from this repo's GitHub Release at pinned checksums, so that a changed file can't silently change scores.
31. As the maintainer, I want learners to download the model and its runtime files only from my server, so that the app never contacts GitHub, Hugging Face or a CDN.
32. As the maintainer, I want the model kept out of the offline cache that every install downloads, so that installing the app stays small and fast.
33. As the maintainer, I want the Docker build to reuse an already downloaded model, so that each deploy doesn't fetch hundreds of megabytes again.
34. As the maintainer, I want the reference points for every Expression worked out by a local script and checked in the build, so that a Catalog or Clip change can't ship with stale scores.
35. As the maintainer, I want the build to fail if any Expression can't be turned into sounds the model knows, so that no Expression silently gets a meaningless score.

### Echo in the app (stage 2, if the Echo lab passes)

36. As a learner, I want to turn Echo on in Settings, so that it's only there if I want it.
37. As a learner, I want an Echo button next to the play buttons at first exposure, so that I can say a new Expression back while it's fresh.
38. As a learner, I want an Echo button in the feedback after every answer, so that I can practise saying the phrase I just heard.
39. As a learner, I want an Echo button in the Phrasebook list, so that I can rehearse right before saying something to a waiter.
40. As a learner, I want no Echo button on the Listen prompt or in the Show view, so that Echo never gives away an answer or gets in the way of showing a phrase to someone.
41. As a learner, I want Echo buttons hidden while Echo is off or its model isn't downloaded, so that I never tap something that can't work.
42. As a learner, I want Echo never to block me, so that a wrong score never stops me moving on.
43. As a learner, I want Echo never to change my Grades or XP, so that an imperfect model can't damage my schedule.
44. As a learner, I want time spent echoing in a session to count as Practice time, so that my Stats show the time I actually practised.
45. As a learner, I want to keep the Echo lab in Settings, with its own switch, so that I can come back to raw scores, each sound's rating and timings when a score seems wrong. *(Changed: this replaces a debug setting for the raw score.)*
46. As a learner, I want my recordings never saved or sent anywhere, so that my voice stays on my phone.
47. As the maintainer, I want the losing model removed once Echo is in the app, so that no dead weight ships. *(Changed: the Echo lab stays.)*
48. As the maintainer, I want the README to explain how to change the model and redo the reference points, so that I can update Echo later without rediscovering the steps.

### If the Echo lab fails (stage 2, alternative)

49. As the maintainer, I want everything built for Echo removed, so that the app, the build and the docs go back to what they were before.

## Implementation Decisions

### Model

- A speech model that gives, for each short slice of the recording, a probability for every sound in its vocabulary (CTC-style output). The sounds are Korean letters (jamo), Korean syllables, or phones across languages.
- Candidates are chosen at the start of stage 1. Every candidate must:
  - have a licence that allows us to serve it ourselves,
  - give per-slice sound probabilities (not just a transcript),
  - have ONNX weights, or be exportable to ONNX,
  - run in Safari on an iPhone 14 Pro without crashing the page.
- Download size is not a constraint (the user accepted any size that passes), but iPhone memory is.
- At most two candidates go into the Echo lab. Stage 2 keeps one.
- It runs with ONNX Runtime Web (directly or through Transformers.js): WebGPU where available, WebAssembly otherwise.

### Build and hosting

- slplab publishes PyTorch weights only. Each candidate is converted to ONNX with 4-bit weights once, on a dev machine, and attached to a GitHub Release of this repo (`echo-models-N`). A fetch script downloads each file from there and checks it against a pinned checksum. It uses a local cache outside git first, so a freshly converted file can be tried before it's published. ADR 0004 records why a GitHub Release rather than Hugging Face, git, Git LFS or converting during the build.
- The build copies the model files into the build output. Each file name includes the start of its checksum, so a changed model is a new URL. nginx serves them like the Clips.
- The runtime's WebAssembly files are served from our server too. Nothing is loaded from GitHub, Hugging Face or a CDN at runtime.
- In the Dockerfile the fetch runs as its own layer before the rest of the source is copied, so Docker caches the model between builds.
- Model files are excluded from the offline precache.

### Setup on the phone

- Turning Echo on shows the download size, downloads the model from our server with progress, and stores it on the phone for offline use. Then it asks for the microphone. If the learner refuses, Echo stays off.
- The app knows which model file the current build expects. If the stored model is missing (e.g. iOS cleared it) or is a different file, Echo counts as off and offers the download again.
- Turning Echo off deletes the stored model.
- In stage 1 this setup is at the top of the Echo lab page, built as the Settings row it becomes in stage 2.

### Expected sounds

- Every Expression is turned into the sequence of sounds the model should hear, in the model's own units.
- For a phone-level model this comes from the Romanization, which already spells the actual pronunciation (ADR 0001: *maek-jju*, *gam-sa-ham-ni-da*). For a model trained on Korean spelling it comes from the Hangul.
- The one Expression with Latin letters in its Hangul (*ATM 어디 있어요?*) needs its own handling.
- Every Expression must convert. A whole-Catalog check enforces it.

### Recording

- Hold to talk: recording runs while the button is held, and stops on release or after 10 seconds.
- Holding stops any playing Clip.
- Audio is mono, resampled to the model's rate, and kept only in memory. In stage 2 it is discarded right after scoring. In the Echo lab it stays in memory for playback until the tester leaves the page.

### Scorer

The scorer is one pure function, shared by the browser and the local reference-point script. Its inputs are the model's per-slice sound probabilities for a recording, the Expression's expected sounds, and the Expression's reference points. It returns one of two results:
- **Heard:** the Echo score, the raw score, and a rating for each expected sound.
- **Not heard:** with a reason: too short, no speech, or too short for the expected sounds.

How it works:
1. **Not heard.** The recording is under about 0.3 s, the model hears almost nothing but silence, or there are too few slices to fit the expected sounds.
2. **Alignment.** It finds where each expected sound falls in the recording (forced alignment over the model's output).
3. **Rating each sound.** Each expected sound is rated by how strongly the model heard it, compared with the strongest competing sound, in the slices aligned to it.
4. **Raw score.** The average of those ratings.
5. **Echo score.** The raw score mapped linearly between the Expression's two reference points, clamped to 0–100% and rounded to a whole percent.

Intonation is not scored, so 네 and 네? get the same Echo score.

### Reference points

- Each Expression has two reference points for each model:
  - **100%:** the average raw score of the Expression's two Normal Clips, one per Voice.
  - **0%:** the median raw score of the other Normal Clips in the same Topic, scored against this Expression's sounds. The median means one near-identical sibling (*ne* / *ne?*) doesn't collapse the scale.
- A local script works them out for the whole Catalog. It runs the same model (ONNX Runtime for Node) and the same scorer, and decodes Clips with ffmpeg as the Clip script does.
- The script saves the reference points in a table committed to the repo. The table is keyed by a hash of the Romanization, the Clips in the Topic, the model file and the scorer version.
- A check next to the Clip check fails the build when an Expression is missing from the table or its entry is stale.
- The Echo lab's "score the Voices' Clips" button shows whether browser inference matches the script's numbers on each phone.

### Echo lab page (stage 1 only)

- The page is reached from a link in Settings and ships with the normal deploy. It never changes Progress.
- Test Expressions (the list can be changed):
  - hello, thank-you, sorry, excuse-me-attention
  - goodbye-leaving and goodbye-staying (*ga-se-yo* / *ge-se-yo*)
  - yes and pardon (*ne* / *ne?*)
  - sino-1, sino-2, sino-4 and sino-5 (*il*, *i*, *sa*, *o*)
  - beer (*maek-jju*), card-ok (*ka-deu*), its-okay (*gwaen-cha-na-yo*)
  - how-much, this-one-please, bill-please, bathroom-where
  - thanks-for-help (a long one)
- For each test Expression the page shows:
  - the Expression, with its Normal and Slow Clip
  - an attempt-kind switch (careful / deliberate mistake / different Expression)
  - hold-to-talk
  - the Echo score or "Didn't catch that"
  - the raw score and the time from release to score
  - playback of the recording
  - Fair / Too harsh / Too generous
- Page-level tools:
  - a tester name, remembered on the phone
  - a model switch, when there are two candidates
  - the backend in use (WebGPU or WebAssembly) and the model's load time
  - "Score the Voices' Clips", which runs every test Expression's Normal Clips through the full pipeline on the phone
  - "Copy results" and "Clear results"
- Attempts are kept in the Echo lab's own storage on the phone, apart from Progress. Recordings are not kept.
- Each attempt in the copied results includes:
  - the tester, the backend and the model
  - the Expression id and the attempt kind
  - the Echo score, the raw score and each sound's rating
  - the time to score and the recording length
  - the fairness tap and a timestamp

### Echo in the app (stage 2, if it passes)

- Settings gets an Echo row (the setup above). *(Changed: there is no debug setting; the Echo lab covers it.)*
- The Settings row and the Echo lab each have their own switch but share the downloaded files. Turning one off deletes the files only if the other is off too.
- A hold-to-talk mic button sits next to the play buttons at:
  - first exposure,
  - the feedback after every answer (Speak, Listen and See, and the Learn session's checks),
  - the Phrasebook list.
- It is never on the Listen prompt or in the Show view, and it is hidden while Echo is off.
- The button shows the latest Echo score or "Didn't catch that, try again". Each new Echo replaces it.
- In sessions, a hold counts as learner input for Practice time, through the same path answers use. In the Phrasebook it changes nothing.
- Nothing is stored: no attempts, no scores, no audio. There is no XP, and no Grade or schedule changes.
- The losing model is removed; the Echo lab stays, without its model switch. ADR 0004 becomes *accepted*. The README explains how to change the model and redo the reference points. *(Changed: the Echo lab was going to be removed.)*

### If the Echo lab fails (stage 2, alternative)

- Remove the Echo lab, the fetch script and its Dockerfile layer, the model runner, the scorer, the reference-point script, table and check, and every model file.
- Mark ADR 0004 *rejected*, with a line on why.
- Remove **Echo** and **Echo score** from `CONTEXT.md`, restore the Practice time definition, and change the v1 non-goal note to say Echo was tried and rejected.

## Testing Decisions

- A good test checks what the scorer returns for a given input, never how it got there (not the alignment path, not intermediate matrices). The tests build model output by hand: made-up per-slice probabilities for a chosen sequence of sounds, plus silence.
- **Scorer tests** (the one new place with automated tests):
  - model output that clearly matches the expected sounds scores about 100%
  - output matching a different Expression's sounds scores near 0%
  - one wrong sound (*ge* for *ga*) scores between the two, and lower than all sounds right
  - more wrong sounds score lower than fewer
  - silence, a too-short recording, and a recording too short for the sounds all return Not heard, each with its reason
  - the Echo score is clamped to 0–100% and rounded, and the raw score passes through unchanged
  - an Expression whose reference points are very close together doesn't divide by zero
- **Whole-Catalog tests:**
  - every Expression converts into sounds the model knows
  - the reference table covers every Expression, and each entry's 100% point is above its 0% point
- **Build checks:** model files match their pinned checksums, and the reference table isn't stale. Both run in the Docker build next to the existing Catalog and Clip checks.
- **Prior art:** the domain tests for options and for Progress (Practice time, Stars) show the style: plain inputs, no mocks. The Catalog and Illustration tests show whole-Catalog checks. The Clip check script shows a build-time freshness check.
- **Not unit-tested:** the model runner, recording, the download and the page. Stage 1 checks them with a desktop end-to-end run, which may feed a Clip in as the microphone and should then score about 100%. Then both learners run the Echo lab on their iPhones. Stage 2 checks the app with an end-to-end run through a Learn session, a Review session and the Phrasebook.

## Out of Scope

- Scoring intonation (네 vs 네?).
- Per-syllable colouring or text labels. The Echo score is a single percentage.
- Storing Echo scores, showing them in Stats, or giving XP for Echo.
- Echo as a Direction, or Echo affecting FSRS, Learned or Stars.
- Checking a Speak answer said from memory. Echo is only for repeating right after a Clip.
- Cloud recognition, the browser's speech API, and embedding or vector-store matching (ADR 0004).
- A "syllables heard" fallback if the Echo lab fails. That would be a new decision.
- Testing on Android. It should work there but is only verified on the two iPhones.

## Further Notes

- **Testers:** the user (iPhone 14 Pro) and their wife (iPhone 16 Pro). Each has their own Progress, and nothing is shared.
- **Pass bar for the Echo lab.** The verdict is the user's, and it looks at four things:
  - the Voices' Clips score high on both phones
  - saying a different Expression scores clearly lower
  - deliberate mistakes score lower than careful attempts, for both voices
  - the score appears within about 2 seconds of letting go
- Installed iOS apps may ask for the microphone again in later sessions. The Echo lab will show whether they do. It can't be fixed from our side.
- The v1 spec's non-goal "Speech recognition or pronunciation scoring" points to ADR 0004.
