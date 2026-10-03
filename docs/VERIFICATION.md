# Verification record

## Initial implementation checks (historical)

Executed with Node on 2026-10-03:

- `node --check dist/app.js`
- `node --check dist/lessons.js`
- `node scripts/check.mjs`

Observed: all checks passed.

Checks cover four unique scenarios, three scenes per scenario, both dialogue variants, complete practice content, review cue boundaries, unique HTML IDs, referenced assets, initially hidden output modes, and a closed transcript.

A minimal DOM harness executes the application and checks unsupported-media messaging, mode changes, scenario changes, preservation of actual drafts and self-review within the tab, empty-draft handling, review results, and valid/invalid WebMCP handler inputs. Invalid navigation leaves the selected scenario unchanged. All user-supplied text is rendered through textContent or text nodes.

## Author review

Read back the saved lesson content and style guide. Reviewed the paired dialogue versions and corrected-draft examples against each scenario's facts. The release scenario preserves the sandbox-only result and unresolved duplicate charge. The handoff scenario distinguishes A's evidence from B and a proposed correction. The queue scenario does not claim an unmeasured speed improvement. The café scenario preserves the undecided venue and future phone call.

This is author review, not an independent blinded review or learning experiment. The deliberate misleading “before” examples are visibly marked and accompanied by faithful revisions.

## Initial environment limits (historical)

The managed environment has no user-facing local preview for plain static output. No compatible permitted browser preview was available for this build. Actual browser rendering, device TTS audibility, microphone capture, mobile Safari behavior, and native WebMCP registration have not been tested. The DOM harness does not replace these observations.

No human learning outcome, pronunciation improvement, speaking readiness, C2 proficiency, or comparative Agent-writing improvement was measured. Those claims remain unestablished.

## Normal-use checks

On the deployed HTTPS site, choose Play and confirm English audio is audible. Change a scene and verify playback stops. Deny microphone permission and confirm the message is recoverable; then allow it, record a short response, play it, and download it. Write a draft, change scenarios and return, then download the draft. Reload only after downloading work you wish to keep.

## Continuous reading update · 2026-10-03

Node syntax and regression checks passed after adding continuous scenes and voice preferences. Fake speech events verify no speech before Play, all expected lines in order through the final scene, no looping past the scenario boundary, single-scene mode, stopped/stale callback cancellation, local-only filtering without online fallback, explicit online opt-in, and a recoverable blocked-audio message. These checks do not establish real-device audibility, pronunciation, network behavior, or background playback.

A Pages workflow checks source before deployment; deployment success must be checked independently in GitHub Actions.

## Parler / Kokoro narrator replacement

The original system-voice event controls above are historical. The current studio
uses published Parler lesson audio and the Kokoro browser worker. `check.mjs` now
drives the application through both engine choices, single/continuous scenes,
scenario boundaries, stale completion after navigation, and gesture failure.
`check-narrator.mjs` exercises the real playback controller with controlled media
and worker events: silent metadata preload, synchronous cached playback, exact
script lookup, stopped fetch/worker, stale results and object URL cleanup. These
controls establish lifecycle behavior, not synthesis quality.

`check-narration-assets.mjs` requires all 24 lesson variants, exact text hashes,
pinned Parler model identity, speaker metadata and matching MP3 checksums. Native
LiteRT, mobile Safari and locked-screen behavior are not implied by these checks.
