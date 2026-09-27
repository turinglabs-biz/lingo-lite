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

## Deploy

Hosted on the turinglabs VPS: [`vps-infrastructure`](https://github.com/turinglabs-biz/vps-infrastructure) builds the `Dockerfile` (checks, tests, build, then nginx serving `dist/`) and routes the domain through Traefik. Deploys are triggered from that repo (Actions → Deploy apps), not from here. Cache headers live in `nginx.conf`.

To try the production image locally:

```sh
docker build -t lingo-lite . && docker run --rm -p 8080:80 lingo-lite   # http://localhost:8080
```

Open the URL on your phone once, add it to the Home Screen (Safari: Share, then Add to Home Screen), and it works offline from then on.
