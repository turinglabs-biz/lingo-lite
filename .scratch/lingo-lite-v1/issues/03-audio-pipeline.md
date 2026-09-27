# 03 Audio pipeline

Status: done
Blocked by: 01, 02

## What
A script that generates every Clip for the Catalog.

- For each Expression × Voice: a Normal Clip (mp3 from OpenRouter) and a Slow Clip (ffmpeg `atempo=0.75`).
- Output goes to `public/audio/<voice>/<id>.mp3` and `public/audio/<voice>/<id>.slow.mp3`.
- It's idempotent. A manifest stores a hash of `hangul` + voice + model per Clip, and only missing or changed Clips are regenerated.
- The script sends Hangul, not Romanization, to the TTS model.
- Retries with backoff. A summary of failures is printed at the end.
- It reports the total size. The target is about 20 MB.

## Done when
- Every Catalog Expression has 4 Clips. A check script verifies that every Clip exists and is non-empty.
- The user spot-checks about 20 random Clips and flags bad ones for regeneration (e.g. with a different input spelling).

## Comments

- 2026-09-27: `npm run audio` generated 964 Clips (241 × 2 Voices × Normal and Slow), 7.3 MB, 48 kbps mono mp3. `npm run audio:check` passes. It's idempotent via `catalog/audio-manifest.json`, keyed by a hash of Hangul, model, voice and tempo.
- Still to do: the user's spot-check of about 20 random Clips. In particular, check `atm-where`, whose Hangul contains Latin letters ("ATM").
