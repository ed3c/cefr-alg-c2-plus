# CEFR ALG C2+ · English Studio

A listening-first English learning website. It uses fictional situations to make meaning clear before asking for language output. Optional speaking and writing workshops support engineering communication and everyday conversation.

C2+ is the project name and learning ambition. CEFR's highest named level is C2. This website does not assess or certify CEFR proficiency.

## Use the website

[Open English Studio](https://medium-compiler.vercel.app/cefr-alg-c2/) on the existing medium-compiler site.

### Voice comparison lab

The **Compare AI voices** link opens five real samples of the same conversation:
Parler, Kokoro, Qwen3-TTS, Pocket TTS and browser Kokoro. Includes optional scripts,
hidden model names, listening ratings, timings and checksummed WAV/JSON transfer.

```bash
python3 scripts/voice_lab_server.py
# Open http://127.0.0.1:8765/compare.html
```

[Setup, license boundaries and verification](docs/VOICE_LAB.md). Native LiteRT-LM
has a C++ adapter/build target but is not runtime-verified; its card remains
unavailable until a compatible model and compiled runner are configured.

1. Choose one of four scenarios: a payment release, an agent handoff, a queue design discussion, or a café conversation.
2. Read the short situation and listen to a scene. Stay quiet if you prefer. No answer is required to continue.
3. Choose clear language or a more nuanced version. Both retain the scenario's core facts and uncertainty.
4. Open the English transcript only when wanted.
5. When ready, choose optional speaking or writing practice. Recording never starts automatically.
6. Download a recording or draft if you want to keep it. Session content is lost when the page closes or reloads.

## What is implemented

- Four fictional scenarios, each with three scenes and two language variants.
- Parler TTS lesson audio (default) and Kokoro browser generation, with continuous scenes, stop, speed, optional transcript, and recoverable playback errors.
- An optional microphone recorder with playback and download. Permission denial has a recoverable state.
- A writing workspace with scenario facts, self-review, before/after examples, and draft download.
- Review cues for long sentences and certainty words. These are prompts for human review, never semantic verdicts or CEFR scores.
- Responsive styling, keyboard tab navigation, labels, focus states, and reduced-motion support.
- Optional browser WebMCP scenario navigation. No tool grades work, starts a microphone, or returns a private draft.

There is no AI tutor, automatic pronunciation score, account database, cross-device progress, or certification workflow. The application does not upload drafts or recordings. Parler downloads published audio; Kokoro downloads a public model and synthesizes lesson text locally. Google Fonts is a presentation dependency; system fonts are the fallback.

## Run locally

No package installation or build step is required. Use Node 22+ for checks and Python 3 for an optional static server.

```sh
node scripts/check.mjs
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Microphone access requires HTTPS or a supported localhost context. Kokoro needs enough device memory for its WASM model; Parler requires only standard audio playback.

## Files and data flow

| File | Responsibility |
| --- | --- |
| `dist/lessons.js` | Fictional situations, paired dialogues, practice prompts, models, and review cues |
| `dist/app.js` | Scenario and mode state, TTS, recording, draft export, browser tools |
| `dist/index.html` | Accessible page structure and controls |
| `dist/style.css` | Desktop and mobile layout |
| `docs/STYLE_GUIDE.md` | Writing and spoken-language criteria |
| `docs/SOURCES.md` | Pinned source references and adaptation boundaries |
| `docs/VERIFICATION.md` | Checks performed and evidence limitations |
| `scripts/check.mjs` | Content, state, fallback, and preservation regression checks |

Selecting a scenario loads its fixed content. Playback sends only that scene's supplied English lines to browser speech synthesis. Microphone access begins after the learner presses Record. MediaRecorder creates an in-memory audio blob. Writing stays in an in-memory map keyed by scenario. A download creates a local file from the learner's actual work. Changing a scenario preserves drafts within the same tab; it does not mark a scenario learned.

## Teaching and style references

This is an ALG-inspired input experience with separately labeled output workshops, not a claim to implement strict ALG or guarantee language acquisition. It adapts meaning-preservation and clear-writing principles from medium-compiler and Soodles review-writing. It does not copy their runtime authority or claim their behavior-verification loops have run.

See [source provenance](docs/SOURCES.md), [style guide](docs/STYLE_GUIDE.md), and [verification limits](docs/VERIFICATION.md).

## Publish with GitHub Pages

In repository Settings → Pages, select **GitHub Actions** as the source. The included [workflow](.github/workflows/pages.yml) checks the app and publishes only `dist/` on main updates or manual dispatch. It uses GitHub-provided short-lived credentials; no user API key or PAT is required. Initial Pages enablement is a repository setting, not performed by the ordinary workflow token.

For the researched no-key TTS, local transcription, local writing assistant, and offline roadmap, see [the integration architecture](docs/NO_API_KEY_ARCHITECTURE.md). Only browser speech and the existing recording/writing tools are implemented today.

## Studio narration

The studio uses **Parler TTS** (default: published lesson audio) and **Kokoro browser**
(on-device generation via the existing Kokoro.js WASM worker). Built-in
`speechSynthesis` is no longer a studio playback route. No inference API key is used.

Parler covers every scene in both language versions: 24 MP3 files, Laura / Jon,
pinned `parler-tts-mini-v1` revision `0392b9451a601e528fd863bbb0598431fee810d9`.
`dist/narration/manifest.json` records the exact lesson hash, encoded and PCM audio
hashes, per-turn text/voice, batch generation timing, per-turn precision, model and encoding.
Batch timings are not individual latency measurements or quality scores.
Use `scripts/generate_parler_lessons.py` with a JSON export of the 24 cases and
the existing Parler environment to rebuild; FFmpeg encodes PCM16 to MP3.
Model and line caches are excluded from the published site.

Kokoro generates the selected scene after an explicit Play gesture and retains up
to four recent results in the tab. First use downloads the public model (~100 MB
or more). Stop, model changes, scene changes and page exit cancel pending work.
There is no silent fallback to another voice. On browsers that require another
gesture after preparation, press Play again: cached audio starts synchronously.
Continuation stops at the current scenario boundary. Device-specific background
playback restrictions still apply. Drafts and personal recordings are not sent to
either model. Voice Lab keeps its comparison routes and earlier samples.

Rebuild the published Parler package (run from the repo root after installing
the existing Parler environment; FFmpeg must be available):

```sh
node --input-type=module -e "import {cases} from './dist/voice-cases.js'; console.log(JSON.stringify(cases.filter(c=>c.id!=='quick')))" > .voice-lab/lesson-cases.json
.voice-lab/venvs/parler/bin/python scripts/generate_parler_lessons.py .voice-lab/lesson-cases.json --output dist/narration
npm run check
```

The published generation run resumed from completed float32 batches and used
BF16 on a supporting CPU for the remaining turns after memory pressure. Each
turn records its actual precision and batch size. This is not a controlled
precision-quality benchmark; model revision, preset voices and input text stay
fixed. `--precision bfloat16` is optional for compatible hardware.
