# 04 App skeleton, PWA and offline

Status: done
Blocked by: none (use a small sample Catalog until 02 is done)

## What
- Vite + React + TypeScript, mobile-first.
- Tab navigation: Home, Topics, Phrasebook, Stats, plus Settings.
- Load the Catalog as a typed module from the Catalog source.
- `vite-plugin-pwa`:
  - manifest and icons
  - precache the app, the Catalog and all Clips
  - works fully offline after the first load
- Call `navigator.storage.persist()` on first run.
- An audio player hook implementing the spec's playback rules: random Voice for Normal, same Voice for Slow. Must work on iOS Safari after a tap.
- Expression display component: Romanization large, Hangul subtle, English, Usage note. The Settings toggle for Hangul-first applies here.

## Done when
- Installed on iOS and Android, the app opens and plays a Clip in airplane mode.

## Comments

- 2026-09-26: Skeleton is in place:
  - Vite + React + TS
  - `vite-plugin-pwa` precaching `**/*.{js,css,html,svg,png,mp3,webmanifest}`
  - tabs: Home, Topics, Phrasebook, Stats, Settings
  - Topics list and detail with Normal and Slow playback
  - Hangul-first setting stored in Dexie
  - `navigator.storage.persist()`
  - Clip player (`src/audio/`): random Voice for Normal, same Voice for Slow. It falls back to the device's ko-KR speech voice while Clips don't exist yet (ticket 03).
  - Build is green; unit tests cover voice selection and Catalog order.
  - Remaining: verify "Done when" on real iOS and Android in airplane mode. That needs a deployed HTTPS URL (ticket 10) or `vite preview --host` over LAN; iOS only installs over HTTPS.
- 2026-09-27: Offline verified in headless Chrome: after the first load the service worker cached 973 entries, and with the network off the app reloads and an uncached Clip plays. Installing on a real iOS or Android phone is part of ticket 10.
