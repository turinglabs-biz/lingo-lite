# Lingo Lite

A free, offline PWA with the ~240 survival Korean Expressions a traveller needs. Expressions are shown romanized first, with audio at normal and slow speed. There's no account: Progress stays on the device.

Domain language: [`CONTEXT.md`](CONTEXT.md). Decisions: [`docs/adr/`](docs/adr). Spec and tickets: [`.scratch/lingo-lite-v1/`](.scratch/lingo-lite-v1).

## Develop

```sh
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests (domain logic, Catalog order)
npm run build        # production build with service worker (precaches app + all Clips)
npm run preview -- --host   # try the build on a phone over LAN (install needs HTTPS, see Deploy)
npm run echo:models  # only for the Echo lab: fetch its models into public/models/ (see Echo)
```

## Catalog

The Catalog lives in `catalog/catalog.ts`. The romanization conventions are in its header comment and ADR 0001.

```sh
npm run catalog:check    # validate, print the Batches
npm run catalog:review   # write catalog/REVIEW.md, a readable per-Topic table
```

Each Expression has a stable `id`, and Progress is keyed by it, so edits keep Progress. The Catalog order (the order new Expressions are introduced in) is derived from each Expression's `tier` in `src/catalog/order.ts`.

## Audio

Clips are generated ahead of time with OpenRouter TTS and committed under `public/audio/<voice>/`. The Voices are MiniMax Speech 2.8 Turbo `Korean_CalmLady` (female) and `Korean_CalmGentleman` (male), chosen in the voice test (ticket 01). Slow Clips are the Normal Clip time-stretched to 0.75× with ffmpeg.

Needs `ffmpeg` and `OPENROUTER_KEY` in `.env`.

```sh
npm run audio        # generate missing or changed Clips (idempotent via catalog/audio-manifest.json)
npm run audio:check  # verify every Expression has all 4 Clips
npm run voice-test   # regenerate the voice comparison page in voice-test/ (gitignored)
```

## Echo (prototype)

Echo lets a learner say an Expression right after hearing its Clip and shows an Echo score: how close their sounds were, where 100% is as close as the app's own Voices. It runs entirely on the phone and works offline (ADR 0004; spec and tickets in [`.scratch/echo/`](.scratch/echo)). For now it only lives in the Echo lab, a test page opened from Settings.

### How the models get to the phone

The models are slplab's Korean phone recognisers (Apache-2.0), listed in `src/echo/models.ts`. slplab only publishes PyTorch weights, so we convert them to ONNX with 4-bit weights once, on a dev machine, and attach the files to a GitHub Release of this repo:

```
slplab model (Hugging Face, PyTorch)
  → scripts/echo-export.py, run once by hand            → model_q4.onnx, 241 MB
  → GitHub Release "echo-models-N" of this repo          → <id>-<sha256 start>.onnx, e.g. native-d9baafb5.onnx
  → Docker build: scripts/echo-models.ts downloads it and checks its pinned sha256
  → nginx serves it at /models/<id>-<sha256 start>.onnx
  → the phone downloads it when the learner turns Echo on, and keeps it for offline use
```

The speech engine (ONNX Runtime's WebAssembly, 28 MB, about 7 MB gzipped) is part of the normal build output. Like the models, it is left out of the offline precache and only downloaded when Echo is turned on.

A file's name contains the start of its sha256, so a changed file always gets a new URL, and phones that stored the old one download it again.

### Commands

```sh
npm run echo:models      # put the models into public/models/ (gitignored): from .cache/echo-models/ if there, else from the release
npm run echo:reference   # recompute catalog/echo-reference.json, every Expression's 100% and 0% points (about 5 min, needs ffmpeg)
npm run echo:reference -- --report   # the same, plus the Expressions whose own Clips score lowest
npm run echo:check       # verify the models' checksums and that the reference table is fresh (runs in the Docker build)
```

To try the Echo lab locally, run `npm run echo:models` once (about 480 MB), then `npm run dev`.

### Deploying

Nothing changes: deploy as usual from `vps-infrastructure`. The Docker build downloads the models from the release in their own layer. That happens on the first build and whenever the pins in `src/echo/models.ts` change (about 480 MB); otherwise Docker reuses the layer. The build fails if a file is missing or doesn't match its checksum, so it never ships a model it didn't expect.

### Recomputing the reference table

The Echo score maps each Expression's raw score between two reference points worked out from the Voices' Clips. Recompute them with `npm run echo:reference` whenever any of these changes:

- an Expression's Romanization
- a Clip
- a model
- the scorer (bump `SCORER_VERSION` in `src/echo/scorer.ts`)

Otherwise the Docker build fails on `echo:check`, which lists the stale Expressions. Commit the updated `catalog/echo-reference.json`.

### Changing a model

1. **Convert it.** You need Python with `torch transformers onnx onnxruntime`, e.g. `uv venv --python 3.12 .venv && uv pip install torch transformers onnx onnxruntime`. Then run:

   ```sh
   .venv/bin/python scripts/echo-export.py <hugging-face-repo> <revision> <out-dir>
   ```

   It prints the size, the sha256 and the release file name of `<out-dir>/model_q4.onnx`.
2. **Put it in the local cache:** copy the file to `.cache/echo-models/<id>-<first 8 of sha256>.onnx`. The build uses the cache before the release, so you can test before publishing.
3. **Pin it** in `src/echo/models.ts`: `source` (repo and revision), `file.bytes`, `file.sha256`, and `vocabulary` if the model's tokens differ (in output order, from `<out-dir>/vocab.json`). Point `ECHO_RELEASE_URL` at the new release, e.g. `echo-models-2`.
4. **Check it:** run `npm run echo:models && npm run echo:reference && npm test`, then try it in the Echo lab.
5. **Publish a new release** that contains every model the app still uses, not only the changed one, because `ECHO_RELEASE_URL` points at a single release:

   ```sh
   gh release create echo-models-2 --repo turinglabs-biz/lingo-lite --prerelease --title "Echo models 2" \
     --notes-file notes.md .cache/echo-models/native-<sha>.onnx .cache/echo-models/learner-<sha>.onnx
   ```

   Base the notes on echo-models-1's (`gh release view echo-models-1 --repo turinglabs-biz/lingo-lite`). The Apache-2.0 licence requires them to name each source model and revision, state the licence, and say what was changed.
6. **Commit** `src/echo/models.ts` and `catalog/echo-reference.json`, then deploy.

Never replace or delete a file in a release that a deployed commit still pins: that build, and any rollback to it, would fail.

## Deploy

Hosted on the turinglabs VPS: [`vps-infrastructure`](https://github.com/turinglabs-biz/vps-infrastructure) builds the `Dockerfile` (Echo models, checks, tests, build, then nginx serving `dist/`) and routes the domain through Traefik. Deploys are triggered from that repo (Actions → Deploy apps), not from here. Cache headers live in `nginx.conf`.

To try the production image locally:

```sh
docker build -t lingo-lite . && docker run --rm -p 8080:80 lingo-lite   # http://localhost:8080
```

Open the URL on your phone once, add it to the Home Screen (Safari: Share, then Add to Home Screen), and it works offline from then on.
