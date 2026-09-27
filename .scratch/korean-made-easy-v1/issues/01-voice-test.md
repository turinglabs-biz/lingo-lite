# 01 Voice test

Status: done
Blocked by: none

## What
A local script that picks the two Voices (one female, one male) through a listening test.

- It generates 5 test Expressions: *an-nyeong-ha-se-yo*, *kam-sa-ham-ni-da*, *i-geo ol-ma-ye-yo?*, *hwa-jang-sil eo-di-ye-yo?*, *man o-cheon won*.
- It uses about 5 OpenRouter TTS models: `google/gemini-3.8-flash-tts`, `minimax/speech-2.8-hd`, `fish-audio/s2.1-pro`, `qwen/qwen-audio-3.0-tts-flash`, `microsoft/mai-voice-2`.
- For each model it uses the available female and male voices.
- The endpoint is `POST https://openrouter.ai/api/v1/audio/speech` with `response_format: mp3`. The key comes from `OPENROUTER_API_KEY`.
- Each output also gets a 0.75× version made with ffmpeg `atempo=0.75`.
- It writes `voice-test/index.html` (gitignored), a grid of model × voice × phrase with Normal and Slow players.

## Done when
- The user has listened and chosen a female and a male Voice (model and voice id), recorded below under `## Answer`.
- If no model is acceptable, fall back to local Supertonic 3 or MeloTTS and repeat the test.

## Notes
- Check the live model list (`/api/v1/models?output_modalities=speech`) first. Model ids may have changed.
- Record which models honored Korean well and which failed.

## Comments

- 2026-09-26: First run done.
  - Scripts:
    - `node --env-file=.env scripts/voice-test.ts` generates the Clips and records the billed cost per Clip via `/api/v1/generation`.
    - `node scripts/voice-test-page.ts` builds `voice-test/index.html`.
  - Published as the Voice Lab artifact (https://claude.ai/artifact/EQYamobLd17bndHDEn1hDb). The user's ratings, picks, Catalog marks and flag decisions are saved to its db, in collections `voiceRatings`, `picks`, `catalogMarks` and `flagDecisions`.
  - Working models: Gemini 3.8 Flash and Flash Lite (PCM only), MiniMax 2.8 HD and Turbo, MAI-Voice-2 (MAI and Azure ko-KR voices), Grok Voice.
  - Not working:
    - Deepgram Aura-2 and Flux have no Korean voices.
    - Kokoro, Orpheus and CSM are English or no Korean.
    - Qwen Flash has no Korean voices; Voxtral doesn't support Korean at all.
- 2026-09-26: Added Fish Audio S2.1 Pro (fish.audio library ids for Korean voices), Qwen Audio 3.0 Plus (longanlingxin / longanlufeng) and Seed Audio 1.0 (provider default voice; its ids aren't public, gender unknown). That makes 10 setups and 19 voices on the page.

## Answer

The user picked MiniMax Speech 2.8 Turbo: `Korean_CalmLady` (female) and `Korean_CalmGentleman` (male). Measured cost is $60 per 1M characters, about $0.16 for the whole Catalog with both Voices.
