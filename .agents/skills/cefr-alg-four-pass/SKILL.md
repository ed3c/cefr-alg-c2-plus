---
name: cefr-alg-four-pass
description: Compile one source-grounded technical article into a frozen CEFR ALG C2+ four-pass learning lesson with meaning-preserving scripts, active recall, a source-bound oracle, and an optional video-renderer handoff. Use for technical-article English study notes and multimodal lesson preparation. Not a CEFR assessment or learner-mastery oracle.
metadata:
  version: "1.1.0"
---

# CEFR ALG four-pass compiler

Read [the four-pass contract](references/four-pass-contract.md) before producing or revising a lesson.
Use [the feature map](features/README.md) to keep this compiler and its consumers aligned.

## Responsibility

Compile one technical article into one frozen learning package. This skill owns:

1. the semantic lesson;
2. the acquisition sequence;
3. clarity and C2+ scripts;
4. active-recall prompts;
5. the source-bound meaning oracle.

It does not own video composition. When video is requested, hand the frozen package and narration to
`../alg-explainer-video/SKILL.md`. That renderer may change presentation, never the frozen claims.

The four passes are learner interactions, not four summaries and not four media formats. Pass 4 must
require learner-generated language before the oracle is visible.

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
preservation. Those criteria do not grant runtime or learner-mastery authority.

## Generate the learning representations

### Clarity script

Write an STE-inspired clarity representation. This is a project writing profile, not ASD-STE100
compliance and not a compliance percentage.

Prefer one main proposition per sentence, an explicit actor, stable terminology, concrete verbs,
conditions before their consequences, explicit negation, and visible uncertainty. Preserve domain
terms, identifiers, numbers, and evidence language when simplifying them would change meaning.

### C2+ precision script

Express the same frozen claims in precise technical English suitable for advanced engineering
discussion. Sophistication comes from qualification, causal structure, register, and exact terms,
not rare-synonym substitution. The clarity and C2+ scripts must preserve the same semantic tuples.

## Choose the four-pass sequence

### Pass 1 — Context

Use the clarity representation with a concrete situation or explanatory visual. Establish actors,
stakes, and the governing causal problem. No learner output is required.

### Pass 2 — Precision

Use the C2+ representation with the architecture/representation needed to reconstruct the decision.
Bind each important term to a role in the system. Keep uncertainty visible.

### Pass 3 — Listening reconstruction

Use a shorter spoken script that preserves the same architecture. Hide the transcript by default.
Ask the learner to reconstruct the governing structure from sound or a reduced visual cue.

### Pass 4 — Active reconstruction

Require both:

- retell or back-translation from a meaning/diagram cue without copying the English source;
- mutation of one condition, actor, or architecture premise and explanation of the consequence.

Only after the attempt reveal the source-bound oracle. Compare meaning, not wording. A fluent answer
fails preservation when it changes an actor, condition, evidence claim, uncertainty, or causal link.

## Narration contract

Narration is a rendering input, not a new semantic author. Produce the exact narration script and bind
it to the frozen lesson revision. A narrator may change prosody or voice, not words. Record the
narration source identity or digest when available.

The current site may use Parler for fixed pre-generated lessons and Kokoro for dynamic browser
narration. Do not make either engine part of semantic acceptance.

## Frozen lesson package

A renderer handoff must contain or reference:

- stable lesson ID and source label/revision;
- frozen source claims;
- clarity script and C2+ precision script;
- ordered four-pass prompts;
- active vocabulary;
- hidden-until-attempt oracle;
- exact narration script plus narration identity when available;
- visual anchors: the concepts/state changes worth showing, without prescribing renderer internals.

Freeze this package before video composition. If a renderer discovers a semantic defect, return it to
this compiler; do not repair the lesson inside the renderer.

The website artifact may remain `dist/technical-notes.js`. Video support does not require the site
schema to become a video-project schema.

## Review

Read the complete package back against the source. Look for a counterexample that satisfies the
rewritten wording while violating a frozen source claim. Mark the package incomplete when any selected
claim lacks a supported representation or oracle item.

Sentence length, vocabulary rarity, animation quality, and narration fluency are cues only. They do
not establish semantic preservation.

## Non-goals

Do not record a CEFR score, completion streak, mastery state, automatic pronunciation judgment, or
claim that four exposures guarantee acquisition. C2+ is the project name and learning ambition;
CEFR's highest named level is C2.

Do not turn this skill into a video framework, TTS owner, generic fact checker, or progress database.

## Maintenance

When the lesson contract changes, review the feature map and every direct consumer. When only video
composition changes, keep this compiler stable unless its handoff is actually insufficient. Re-run
the repository checks after structural edits. A structural pass does not prove language acquisition.
