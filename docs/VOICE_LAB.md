# Voice Lab: real voice comparisons without an inference key

The first conversation ships with five real generated WAV files. Listening to
them requires no account, model download or inference API key.

| Route | Included implementation | Verified on 2026-10-03 |
| --- | --- | --- |
| Parler-TTS Mini v1 | Python, Laura/Jon delivery descriptions, static audio | Real CPU inference and WAV |
| Kokoro 82M | Python, Heart/Michael, static audio | Real CPU inference; web → local job → audio |
| Qwen3-TTS 1.7B CustomVoice | Python, Ryan/Aiden, delivery instructions | Real CPU bfloat16 inference and WAV |
| Pocket TTS | Public January 2026 checkpoint, Alba/Marius preset embeddings | Real CPU inference and WAV; no gated cloning weights |
| Kokoro.js | Web Worker, WASM q8, local text inference | Real Chrome inference and WAV |
| Kokoro / LiteRT-LM | C++ TtsEngine adapter, Bazel target, local job integration | Source only: compiler missing; compatible public model bundle not located |

The sixth card remains unavailable until prerequisites are configured. It never
plays Python Kokoro under a LiteRT label. This is not a finished Android APK or a
verified Android benchmark. The inspected `litert-lm==0.17.1` Python package does
not expose the new TTS engine; this adapter uses upstream C++ instead.

## Listen and compare

1. Choose **Quick comparison** for the five included samples.
2. Optionally show the English script; it stays closed by default.
3. Hide model names to shuffle cards. Voice identity may still reveal a model.
4. Rate naturalness, words intact and role clarity. Note lost negation,
   uncertainty, technical terms or pauses.
5. Download your comparison before closing the tab. Ratings stay in memory.

The other 24 choices are the four existing ALG scenarios × three moments × two
language variants, sharing the learning app's source dialogues. They support
browser/local generation; pre-generated full-lesson audio is not included.
Listening requires no output practice or test.

Every engine receives the same words; speaker labels are not spoken. A 250 ms gap
separates turns. Speaker identities differ across models (Qwen uses Ryan/Aiden),
so this compares whole listening experiences, not architectures with identical
speakers. Ratings are personal notes, not automated quality or CEFR scores.

## Start locally

Python 3.12 and a browser are enough to listen to the included audio:

```bash
git clone https://github.com/ed3c/cefr-alg-c2-.git
cd cefr-alg-c2-
python3 scripts/voice_lab_server.py
```

Open **http://127.0.0.1:8765/compare.html**. Install the generators you want in
independent environments, then reload the page:

```bash
python3 scripts/setup_voice_lab.py kokoro
python3 scripts/setup_voice_lab.py parler
python3 scripts/setup_voice_lab.py qwen
python3 scripts/setup_voice_lab.py pocket
```

The first generation downloads public weights. No inference service is called.
Linux CPU was tested; other platforms and GPUs were not. Parler and Qwen need
several GB of memory; Kokoro/Pocket are smaller. Setup supports `--cuda` and the
generation CLI supports `--device cuda`, but those paths were not measured.

Click **Generate locally**. The server permits one job at a time. Cancel stops the
process; changing scripts cancels pending work and rejects late results. The
server binds to loopback, checks Host/Origin and bounded JSON, and accepts no shell
commands from the page. Do not expose this development server publicly.

Results/logs are in `.voice-lab/jobs/`. Models default to `.voice-lab/models/`;
an existing `HF_HOME` is respected. Delete `.voice-lab/` to remove environments,
caches and job history. Ratings are not saved there.

For CLI generation, download a script from the page:

```bash
.voice-lab/venvs/kokoro/bin/python scripts/generate_voice.py kokoro quick.json --output .voice-lab/results
```

On Windows use the environment's `Scripts/python.exe` (untested here). Import the
matching JSON and WAV together in the appropriate engine card. Import verifies
the script SHA-256, engine, timing metadata and audio checksum. Browser output has
separate **Download audio** and **Download result JSON** controls for transfer.

## Native LiteRT-LM

The adapter targets upstream commit
[`d17a52fd5c2b4ce1280959309af175caebaac2c3`](https://github.com/google-ai-edge/LiteRT-LM/tree/d17a52fd5c2b4ce1280959309af175caebaac2c3).
With the upstream C++/Clang toolchain and Bazelisk installed:

```bash
python3 scripts/setup_voice_lab.py litert-kokoro
python3 scripts/build_litert.py
export ALG_LITERT_RUNNER="$PWD/.voice-lab/LiteRT-LM/bazel-bin/voice_lab/voice_lab"
export ALG_LITERT_MODEL="/absolute/path/to/compatible/kokoro/assets"
python3 scripts/voice_lab_server.py
```

The model path must be a compatible TTS `.litertlm` container or a directory with
the acoustic/vocoder signatures, voice packs and eSpeak data required by that
TtsEngine. A `.tflite` extension is insufficient. The inspected
[`litert-community/Kokoro-82M`](https://huggingface.co/litert-community/Kokoro-82M/tree/5c76448fb5ba1c1ab1908ee881dbbaae634542af)
contains predictor/prosody/vocoder split graphs and a fixed-length demo graph;
compatibility with TtsEngine's two-stage contract was not established. Setup does
not silently rename or substitute those files.

The runner initializes one engine, creates voice-specific sessions, synthesizes
turns, and writes WAV files plus load/generation timings. Python joins turns and
records runner/model checksums. The actual build reached Bazel target analysis
but stopped because Clang/CC was missing. Compilation and native inference remain
unverified; no native audio or speed result is fabricated.

## Timing and reproducibility

Committed result JSON files contain measurements. RTF = generation seconds /
audio seconds; audio duration includes inserted turn gaps. Below 1 means that
particular run generated faster than playback. Load time includes imports,
initialization and sometimes downloads. Browser generation can include first-use
WASM/phonemizer initialization.

These are single runs on a shared CPU host, with some setup/inference overlap,
different precisions and caches. They are demonstrations, not a controlled speed
leaderboard. Naturalness and transcription accuracy were not automatically
graded; listen for yourself, especially to negation and uncertainty.

Parler, Python Kokoro and Qwen model revisions are pinned. Pocket weights,
tokenizer and preset embeddings are selected from pinned package/config revisions.
Kokoro.js 1.2.1 is pinned, but its loader retrieves model/voices from upstream
`main`, as disclosed in metadata. Seeds do not make engines equivalent or ensure
identical output across hardware. Transitive packages are not a fully locked
reproducible training environment.

## Code, data, model and training trace

These categories are separate. No inference key does not prove open training
provenance or grant all downstream rights.

| Project | Code / model | Data and trace boundary |
| --- | --- | --- |
| [Parler](https://github.com/huggingface/parler-tts) / [Mini v1](https://huggingface.co/parler-tts/parler-tts-mini-v1) | Apache-2.0 | Public training recipe/dataset references; dataset attribution applies. This lab does not reconstruct training or audit every training log. |
| [Kokoro](https://github.com/hexgrad/kokoro) / [82M](https://huggingface.co/hexgrad/Kokoro-82M) | Apache-2.0 | Full training corpus and trace are not supplied by this lab. |
| [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS) / [CustomVoice](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice) | Apache-2.0 | Complete pretraining data and end-to-end trace not verified. |
| [Pocket](https://github.com/kyutai-labs/pocket-tts) / [public presets](https://huggingface.co/kyutai/pocket-tts-without-voice-cloning) | MIT / CC BY 4.0 | Weight attribution and voice-specific terms apply. No claim that all training data/traces are public. |
| [LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM) | Apache-2.0 runtime | Does not change model licensing or fill training provenance gaps. |

Pocket sample credit: **Kyutai Pocket TTS**, January 2026 public preset checkpoint,
Alba/Marius, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). This synthetic
fictional dialogue is not a voice donor's recording or endorsement. Model authors
and checkpoints are also credited in each sample's metadata.

No weights are committed. eSpeak/phonemizer and other dependencies have separate
licenses; check notices and source obligations before distributing a native bundle.
An Apache model is not a license audit of the complete app. The browser imports
Kokoro.js from jsDelivr and downloads public assets from Hugging Face. These requests
expose normal network metadata; text inference happens locally. Offline first use
is not promised.

## Verification and deployment

```bash
npm run check
python3 scripts/test_voice_lab.py
```

Checks cover the existing app, 25 script identities, actual WAV checksums/durations,
invalid metadata and server boundaries. Real Chrome checks cover five players,
browser/local generation, cancellation on scenario change, matching/mismatched
imports, hidden model labels, main-app navigation, and 390 px layout without overflow.
The isolated test browser required a certificate override for this environment's
HTTPS interception; the application has no TLS override. Android/iOS, native TTS and
other browser engines remain untested.

GitHub Actions verifies and uploads `dist/`. Enable Pages once under repository
**Settings → Pages → Source: GitHub Actions**. Pages serves static samples; only
the browser route generates on that page. Python/native routes run on your own
computer and can export files for static hosting.
