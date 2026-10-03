# CEFR ALG C2+ · English Studio

A listening-first English learning website. It uses fictional situations to make meaning clear before asking for language output. Optional speaking and writing workshops support engineering communication and everyday conversation.

C2+ is the project name and learning ambition. CEFR's highest named level is C2. This website does not assess or certify CEFR proficiency.

## Use the website

1. Choose one of four scenarios: a payment release, an agent handoff, a queue design discussion, or a café conversation.
2. Read the short situation and listen to a scene. Stay quiet if you prefer. No answer is required to continue.
3. Choose clear language or a more nuanced version. Both retain the scenario's core facts and uncertainty.
4. Open the English transcript only when wanted.
5. When ready, choose optional speaking or writing practice. Recording never starts automatically.
6. Download a recording or draft if you want to keep it. Session content is lost when the page closes or reloads.

## What is implemented

- Four fictional scenarios, each with three scenes and two language variants.
- Device-generated English speech with playback, stop, speed selection, transcript, and unavailable-audio messaging.
- An optional microphone recorder with playback and download. Permission denial has a recoverable state.
- A writing workspace with scenario facts, self-review, before/after examples, and draft download.
- Review cues for long sentences and certainty words. These are prompts for human review, never semantic verdicts or CEFR scores.
- Responsive styling, keyboard tab navigation, labels, focus states, and reduced-motion support.
- Optional browser WebMCP scenario navigation. No tool grades work, starts a microphone, or returns a private draft.

There is no AI tutor, automatic pronunciation score, account database, cross-device progress, or certification workflow. The application does not upload drafts or recordings. The browser may use its vendor's speech service for supplied lesson dialogue. Google Fonts is a presentation dependency; system fonts are the fallback.

## Run locally

No package installation or build step is required. Use Node 18+ for checks and Python 3 for an optional static server.

```sh
node scripts/check.mjs
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Microphone access requires HTTPS or a supported localhost context. Speech voices depend on the browser and operating system.

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
