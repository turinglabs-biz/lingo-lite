# 01 Echo lab

Status: in-progress
Blocked by: none

## What
Stage 1 of the spec. Build the Echo lab: a separate page, opened from a link in Settings, where both learners try Echo on their iPhones. Everything stage 2 would reuse is built for real here, not faked.

- **Candidate models.** Choose up to two, using the spec's criteria:
  - a licence that allows us to serve the model ourselves
  - per-slice sound probabilities, not just a transcript
  - ONNX weights, or exportable to ONNX
  - runs in Safari on an iPhone 14 Pro
- **Build.**
  - The converted models are attached to a GitHub Release of this repo. A fetch script downloads them at pinned checksums.
  - The model and the runtime's WebAssembly files are served from our server. Each model's file name includes the start of its checksum.
  - It runs as a cached Docker layer, and the model stays out of the offline precache.
- **Setup,** at the top of the page:
  - Turn Echo on: see the size, download it with progress, then the mic permission. Refusing the mic keeps Echo off.
  - Turning Echo off deletes the model.
  - If the model is missing or a different file, Echo counts as off and offers the download again.
- **Expected sounds and reference points.**
  - Every Expression is turned into the model's sounds.
  - A local script works out the reference points from the Voices' Normal Clips and saves them in a committed table.
  - A build check fails on a missing or stale entry.
- **Scorer.** The pure function from the spec. It returns either Heard (Echo score, raw score and each sound's rating) or Not heard (with its reason).
- **Hold to talk.** Recording stops on release or after 10 s, holding stops any playing Clip, and audio stays in memory only.
- **Test page.**
  - About 20 test Expressions (the list is in the spec).
  - For each: Normal and Slow Clip, the attempt kind, hold-to-talk, the Echo score or "Didn't catch that", the raw score, the time to score, playback of the recording, and Fair / Too harsh / Too generous.
  - Page-level: the tester name, a model switch, the backend and load time, "Score the Voices' Clips", "Copy results" and "Clear results".
  - Attempts are kept in the lab's own storage.
- The Echo lab never changes Progress.

## Done when
- [x] The scorer tests and whole-Catalog tests from the spec pass, and the Docker build runs the model-checksum and reference-table checks.
- [x] A desktop end-to-end run shows:
  - setup, then a download from our own server, with no requests to GitHub, Hugging Face or a CDN
  - hold-to-talk, a score, and Copy results
  - the Voices' Clips scoring about 100%
- [x] Airplane mode: after setup, the Echo lab still scores offline.
- [ ] *(user)* The user has deployed. Both testers have installed the app from the Home Screen on the iPhone 14 Pro and 16 Pro, gone through setup, recorded the test set (careful, deliberate mistake, different Expression) and pasted their results.
- [ ] *(user)* The verdict is recorded under `## Answer`: pass or fail against the spec's pass bar, the chosen model, and any reference-point tuning.

## Comments

- 2026-09-27: The build is done. What remains needs the user: publishing the converted models, the deploy, and testing on both iPhones.
  - **Models:** two Apache-2.0 Korean phone recognisers from slplab, both using the MFA phone set (G/Kh/GG, final k/t/p, iA/oA…).
    - `native` was trained on 108 h of native read speech. It decodes the Clips almost perfectly.
    - `learner` was trained on 10 h of speech by learners from Asian countries. It is clearly weaker on the Clips. It is kept as an optional second download for comparison.
    - Both are converted to ONNX with 4-bit weights by `scripts/echo-export.py` (241 MB each).
  - **Expected sounds** come from the Romanization. Three native variants count as right:
    - a released or silent final stop at the end of a word
    - h swallowed after a voiced sound
    - e and ye treated as the same vowel
  - **Scoring:** each sound is rated against every other sound in its place and against leaving it out (CTC likelihoods). The raw score is the average rating.
    - One wrong vowel in a 10-sound phrase costs about 10–20 points.
    - The reference table is `catalog/echo-reference.json`. For `native`, a typical Expression's own Clips score 0.87 raw and other Expressions score 0.09.
  - **Tests:** 57 unit tests pass, including the scorer, the whole-Catalog conversion and reference-table coverage. `npm run echo:check` runs in the Docker build.
  - **Desktop end-to-end run** (headless Chrome, production build). A Clip was played into the recorder through an in-page fake microphone, because automated Chrome can't open the Mac's mic.
    - Setup: 270 MB download, then the model loads on WebGPU in about 2.6 s.
    - The Voices' Clips average 92%, at about 0.3 s of model time each.
    - Holds:
      - thank-you audio on its own card: 85%
      - thank-you audio on the ga-se-yo card: 0%
      - ge-se-yo audio on the ga-se-yo card: 78%
      - ge-se-yo audio on its own card: 100%
      - silence: "Didn't catch that" (no speech heard)
      - a 0.1 s tap: "Didn't catch that" (too short)
    - Offline, after a reload: the model loads from phone storage and scores the same.
    - No request went to any host other than our server, and Progress was untouched.
  - **Clips that look wrong,** since the Voices themselves score low on them:
    - `sino-4` (사): both Voices, and both models hear about three syllables
    - `sino-5` (오): female Voice
    - `goodbye-staying`: female Voice
    - Worth including in the pending Clip spot-check from ticket 03.
  - **Docker:** the image built with Podman, using a scratch Dockerfile that pre-filled the model cache, and passed `echo:check`, the tests and the build. nginx serves the engine as `application/wasm`, gzipped (about 7 MB over the wire instead of 28 MB), and each model as a 241 MB file.
  - **Blocked:** the build fetches the converted models from Hugging Face, but they aren't published there yet (`ECHO_ONNX_SOURCE` is null). Until they are, the Docker build fails at the model step, and the models only exist in the local `.cache/echo-models/`.
- 2026-09-27: At the user's request, the models are hosted on a GitHub Release of this repo instead of Hugging Face (ADR 0004 lists the options).
  - `ECHO_RELEASE_URL` in `src/echo/models.ts` points at `echo-models-1`.
  - The files are named `<id>-<sha256 start>.onnx`: `native-d9baafb5.onnx` and `learner-129aeed0.onnx`.
  - The README's Echo section documents the pipeline, deploying, and how to change a model.
  - **Still blocked:** creating the release was left to the user, since it publishes on the public repo. Until `echo-models-1` exists, the Docker build fails at the model step.
- 2026-09-27: With the user's confirmation, published the pre-release `echo-models-1` (https://github.com/turinglabs-biz/lingo-lite/releases/tag/echo-models-1) with both models. `npm run echo:models`, without the local cache, downloaded both files and they matched their pinned sha256.
