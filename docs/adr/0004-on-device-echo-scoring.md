# On-device, sound-by-sound scoring for Echo instead of embedding matching

Status: accepted (2026-09-27). The Echo lab passed on the user's iPhone; the native-speech model was kept.

Echo lets the learner say an Expression right after hearing its Clip and shows an Echo score. We score it on the phone with a speech model that rates each sound of the recording against the Expression's expected sounds, scaled so the app's own Voices score about 100%. The score is advisory: it never blocks the learner or changes a Grade, so an imperfect model costs a misleading number, not a wrong schedule. This reverses the v1 non-goal "Speech recognition or pronunciation scoring".

The model (slplab's Korean phone recogniser trained on native read speech, Apache-2.0) is only published as PyTorch weights. We convert it to ONNX with 4-bit weights once, on a dev machine, and attach the converted file to a GitHub Release of this repo. The Docker build downloads it at a pinned sha256, and our own server serves it as a static asset, together with the runtime's WebAssembly files. Learners download it once, by turning Echo on, and Echo then works offline. A second candidate trained on learner speech was tried in the Echo lab and dropped: it scored the Voices' own Clips much lower. The app never contacts GitHub, Hugging Face or a CDN.

## Considered options

- **A vector store of phrase embeddings, taking the nearest match.** One embedding of a recording mostly captures the speaker, mic and room rather than the syllables, and our only references are two synthetic Voices. It also blurs the one-sound differences the Catalog depends on (안녕히 가세요 / 안녕히 계세요, 이 / 일), and a nearest-match search always returns some phrase, even for silence. Embedding a transcript instead measures meaning, so 감사합니다 and 고맙습니다 would count as the same.
- **Transcribe, then compare syllables (e.g. Whisper).** More forgiving and more reliable, but recognisers lean toward real words, so they hear a near-miss as correct and can't say how close each sound was. It is the fallback if sound-level scoring proves too noisy.
- **Cloud recognition or the browser's speech API.** Both break offline use abroad. The browser API also behaves differently per browser, and its offline Korean support on iOS is uncertain.

Where the converted files live (241 MB each) was a separate choice:

- **A Hugging Face repo of our own.** Rejected, to avoid depending on another service and account.
- **Committed to git.** GitHub rejects files over 100 MB. Splitting them into parts would add about 240 MB to the history, permanently, for every model version.
- **Git LFS.** It has quotas, and the VPS deploy would need git-lfs and a pull step.
- **Converting during the Docker build.** It needs PyTorch and several GB of RAM on the VPS, which the other apps share.
- **A GitHub Release (chosen).** Nothing new to run or pay for, the repo stays small, and the deploy is unchanged.

## Consequences

- Echo is opt-in and kept out of the offline precache, because the model is many times larger than the rest of the app.
- The model's licence must allow redistribution, since we publish and serve converted copies. The release notes name the source models and the changes.
- A file in a release that a deployed commit pins must never be replaced or deleted. A changed model goes into a new release.
- Intonation is not scored: 네 and 네? get the same Echo score.
