---
name: cefr-alg-four-pass
description: Compile one source-grounded technical article into a frozen CEFR ALG C2+ four-pass acquisition lesson: receptive encounter, recognition, contextual familiarity, then bounded active reconstruction with shadowing, generation, mutation, and source-bound comparison. Separates passive and active vocabulary and can hand frozen material to the video renderer. Not a CEFR assessment or learner-mastery oracle.
metadata:
  version: "1.3.0"
---

# CEFR ALG four-pass compiler

Read [the four-pass contract](references/four-pass-contract.md) before producing or revising a lesson.
Read [the execution protocol](references/execution-protocol.md) before changing runtime gates, technique routing, or receipts.
Use [the feature map](features/README.md) to keep this compiler and its consumers aligned.

## Responsibility

Compile one technical article into one frozen learning package. This skill owns:

1. the semantic lesson;
2. the receptive-to-productive acquisition sequence;
3. STE-inspired clarity and C2+ precision scripts;
4. passive/active vocabulary allocation;
5. Pass 4 shadowing, active-recall, mutation, and comparison prompts;
6. the source-bound meaning oracle;
7. the session execution state, technique route, and practice-receipt contract.

It does not own video composition. When video is requested, hand the frozen package and narration to
`../alg-explainer-video/SKILL.md`. That renderer may change presentation, never frozen claims.

The four passes are learner interactions, not four summaries or four media formats. Passes 1-3 remain
receptive. Pass 4 is the boundary where required productive work begins. Repeating receptive material
four times does not satisfy this contract.

## Freeze the semantic lesson

Read the actual supplied article or source bytes. Select only the claims needed for this lesson.
For every material claim freeze:

- actor and action;
- condition and negation;
- evidence status and uncertainty;
- causal link from constraint to decision;
- exact technical term when substitution changes the concept;
- unresolved boundary when the source leaves a problem open.

Represent each claim as:

`actor -> condition -> action/decision -> evidence/uncertainty -> consequence`

Do not silently fact-check, strengthen, universalize, or repair the source unless the task separately
authorizes research. A source-reported example remains an example.

Use the Soodles review-writing criteria as the semantic review method: purpose/scope, actor/action,
conditions, stable terms, decision, reasoning, zero-context causality, acceptance boundary, and
preservation. Those criteria do not grant learner-mastery authority.

## Generate the learning representations

### Clarity script

Write an STE-inspired clarity representation. This is a project writing profile, not ASD-STE100
compliance and not a compliance percentage.

Prefer one main proposition per sentence, an explicit actor, stable terminology, concrete verbs,
conditions before consequences, explicit negation, and visible uncertainty. Preserve domain terms,
identifiers, numbers, and evidence language when simplifying them would change meaning.

### C2+ precision script

Express the same frozen claims in precise technical English suitable for advanced engineering
discussion. Sophistication comes from qualification, causal structure, register, and exact terms,
not rare-synonym substitution. Clarity and C2+ scripts must preserve the same semantic tuples.

## Allocate vocabulary before the passes

Create two non-equal sets.

### Passive encounter set

Choose a broader set of terms and phrases the learner should recognize while reading or listening.
Build recognition through repeated, low-burden encounters across the article's real contexts. Prefer
multiple short encounters over forcing one long memorization attempt.

For a new term, bind its visible form, supplied pronunciation when available, stress/phrase grouping
when useful, and one contextually correct core meaning. Additional senses can wait for later real
contexts.

Delegate the passive micro-loop to `../alg-vocab-encounter/SKILL.md`: fast form/sound/meaning
encounter, brief recognition probe, then retire or re-encounter. Lexical meaning recall remains
`PASSIVE_RECEPTIVE`; it does not promote the term to active vocabulary.

Do not claim a fixed ten-second exposure is universally optimal; the supplied ten-second method is a
leaf practice recipe, not the Four-Pass invariant.

### Active set

Choose a smaller set worth producing in engineering conversation, design review, interviews, or
writing. Every active item must first be understandable in the receptive material. Exercise active
items in Pass 4 through shadowing, retell/back-translation, or mutation. Do not attempt to make every
technical term productive.

## Choose the learning target and Pass 4 technique

Name the primary target before compiling the passes. Route the high-resistance operation accordingly:

- technical speaking/interview → shadowing + retell + sentence mutation;
- technical writing/precision → true back-translation or semantic retell + source diff;
- listening → narration + optional scaffold withdrawal + shadowing;
- vocabulary breadth → `alg-vocab-encounter` recognition loop;
- technical reasoning → premise mutation + causal retell.

Do not force every technique merely because it exists. Preserve the distinction between semantic
retell (meaning/diagram → English) and true back-translation (source English → learner L1
representation → reconstructed English → source diff).

## Choose the four-pass sequence

### Pass 1 — Encounter

Use the clarity representation with a concrete situation, explanatory diagram, or video. Establish
actors, stakes, and the governing causal problem. The learner may read/listen without stopping to
memorize. No output is required.

### Pass 2 — Recognition

Use the C2+ representation with the English transcript and architecture/diagram visible. Bind
technical terms to roles, conditions, and decisions. Keep uncertainty visible. The learner recognizes
and follows; do not require recall or production.

### Pass 3 — Contextual familiarity

Keep this pass receptive. Use natural-speed narration with the English transcript and useful visual
context available by default. The learner follows the argument directly in English and may replay it.
Do not require reconstruction, retell, translation, quiz answers, or hidden-transcript retrieval here.

The learner may optionally hide the transcript as extra listening exposure, but doing so does not
promote the pass to productive practice and is not required to continue.

### Pass 4 — Active reconstruction

Only here cross the required productive boundary. Use a bounded sequence:

1. listen to the selected source-bound sentence/segment;
2. delayed shadowing: repeat about 0.5-1 second or 1-2 words behind when feasible;
3. simultaneous shadowing when feasible, matching phrase grouping, stress, rhythm, and technical terms;
4. retell or back-translate from a meaning/diagram cue without copying the English source;
5. mutate one actor, condition, time, or architecture premise and explain the changed consequence;
6. require an oral-or-written attempt acknowledgement;
7. reveal the source-bound oracle only after that acknowledgement and compare the semantic result;
8. issue only a session-local practice receipt for performed operations; never call it mastery.

If normal-speed shadowing breaks down, offer a slower playback rate or return to Pass 2/3 for the
relevant segment. Mechanical sound imitation without understanding does not satisfy active
reconstruction. Do not require automatic pronunciation scoring.

Compare meaning, not wording. A fluent answer fails preservation when it changes an actor, condition,
evidence claim, uncertainty, or causal link.

## Execution governance

Use the state model from the execution protocol:

`PASSIVE_RECEPTIVE -> GENERATED -> COMPARED -> ACTIVE_PRACTICED`

Passes 1-3 and passive vocabulary recognition cannot cross `PASSIVE_RECEPTIVE`. Software must keep
the oracle unavailable until the learner acknowledges an oral or written Pass 4 attempt. The runtime
may then create a session-local/downloadable receipt of performed techniques and observed gaps.

A receipt records practice events only. Do not persist it to a learner account or reinterpret it as
retention, proficiency, or mastery.

## Difficulty boundary

Productive difficulty must be desirable, not blocking. If the learner cannot follow Pass 2/3 with the
available context, reduce the lesson scope, repair Pass 1, or provide the missing premise before
requiring Pass 4. Do not manufacture difficulty by deleting information required for comprehension.

## Narration contract

Narration is a rendering input, not a new semantic author. Produce the exact narration script and bind
it to the frozen lesson revision. A narrator may change prosody or voice, not words. Record narration
identity or digest when available.

The current site may use Parler for fixed pre-generated lessons and Kokoro for dynamic browser
narration. Neither engine is semantic acceptance authority.

## Frozen lesson package

A renderer handoff must contain or reference:

- stable lesson ID and source label/revision;
- frozen source claims;
- clarity script and C2+ precision script;
- ordered four-pass prompts;
- passive encounter vocabulary with pronunciation/stress cues and smaller active vocabulary;
- primary learning target and selected Pass 4 technique;
- Pass 4 shadowing/back-translation/retell material required by that route;
- execution state and attempt-gate contract;
- hidden-until-attempt oracle;
- exact narration script plus narration identity when available;
- visual anchors: concepts/state changes worth showing, without prescribing renderer internals.

Freeze this package before video composition. If a renderer discovers a semantic defect, return it to
this compiler; do not repair the lesson inside the renderer.

## Review

Read the complete package back against the source. Look for a counterexample that satisfies the
rewritten wording while violating a frozen source claim. Mark the package incomplete when any selected
claim lacks a supported representation or oracle item.

Also reject a package when Pass 3 requires productive retrieval, when Pass 4 lacks either learner
generation or oracle comparison, when the oracle can be revealed without an attempt acknowledgement,
when active vocabulary has no receptive precursor, when lexical recognition is mislabeled productive,
or when shadowing is treated as proof of comprehension.

## Non-goals

Do not record a CEFR score, completion streak, mastery state, automatic pronunciation judgment,
long-term retention guarantee, or claim that exactly four exposures create a neurological threshold.
C2+ is the project name and learning ambition; CEFR's highest named level is C2.

Do not turn this skill into a video framework, TTS owner, generic fact checker, spaced-repetition
system, or progress database.

## Maintenance

When the acquisition contract changes, review the feature map and direct website consumer. When only
video composition changes, keep this compiler stable unless its handoff is insufficient. Re-run the
repository checks after structural edits. A structural pass does not prove language acquisition.
