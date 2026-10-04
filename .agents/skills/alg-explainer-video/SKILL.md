---
name: alg-explainer-video
description: Render a frozen cefr-alg-four-pass lesson and supplied narration as a meaning-preserving technical explainer video with Hypit. Use for diagram-led ALG lesson videos, word-bound visual timing, and visual/narration correspondence verification. Never edits the source lesson or acts as its semantic oracle.
metadata:
  version: "1.0.0"
---

# ALG explainer video

Consume the frozen package produced by `../cefr-alg-four-pass/SKILL.md`.
Read [the handoff contract](references/handoff-contract.md) before authoring a composition.
Use [the feature map](features/README.md) when the renderer behavior changes.

This is a renderer adapter, not a second learning compiler.

## Input boundary

Require the frozen lesson identity, source claims, selected pass script, exact narration script,
narration asset/identity when supplied, and visual anchors for concepts and state changes.

Do not rewrite a claim to make animation easier. If the lesson is incomplete or contradictory, stop
that render and return the semantic defect to `cefr-alg-four-pass`.

Narration words are fixed input. Hypit may align and time them; it may not paraphrase them silently.

## Visual grammar

Prefer code-rendered explanatory graphics over decorative generated footage when the concept is a
system, process, state transition, comparison, or architecture.

Use one conceptual change per scene, persistent spatial identity for the same actor/object,
transformation instead of unrelated slide replacement, causal arrows only when the lesson establishes
causality, explicit treatment for negation and uncertainty, restrained camera movement, and minimal
on-screen prose.

Do not imitate a named creator's exact style. A request for a mathematical-explainer feel means
diagram-led, transformation-based, concept-first motion.

## Hypit workflow

Use the installed Hypit skill/runtime when available. The upstream Hypit contract reviewed for this
adapter supports workflows authored from a description, supplied audio, code-rendered visuals,
semantic anchors, and word-linked timing; generated media is optional.

1. Create a project-local Hypit composition from the frozen package.
2. Treat supplied narration as retained production material.
3. Bind visual events to semantic words or moments when timing data supports it.
4. Author diagrams/components for the lesson's visual anchors.
5. Render the smallest complete explainer that covers the selected claims.
6. Preserve the editable workflow/project alongside the render when the task requests a deliverable.

Do not require a generation-model API merely to render diagrams, captions, or code-rendered motion.
Do not invent successful Hypit execution when the runtime or required capability is unavailable.

## Four-pass relationship

Video is a representation available to the four-pass runtime; it is not Pass 4 by itself.

The compiler owns the acquisition sequence. The renderer preserves it:

A useful default is:

- Pass 1: explainer video with clarity narration;
- Pass 2: interactive/diagram representation plus C2+ precision language;
- Pass 3: natural-speed narration with the English transcript and useful context visible by default.
  Hiding the transcript is optional listening exposure. No reconstruction, quiz or output gate is required;
- Pass 4: learner retell/mutation from diagram cues, then acknowledged attempt, source-bound oracle
  reveal, and a separate learner report of comparison. Reveal alone does not complete comparison.

Watching the video four times never becomes `ACTIVE_PRODUCTIVE` without learner generation and
oracle comparison.

## Verify correspondence

For every meaning-bearing visual event, record the frozen claim ID, narration phrase or semantic
anchor, visual object/state before, visual change, visible result, and whether the change preserves
condition, negation, uncertainty, and causal direction.

Reject a render plan that implies success where the source reports only a proposal, reverses an actor
or arrow, removes a condition or negation, depicts an unresolved boundary as solved, introduces a new
factual relationship, or highlights words unrelated to the visual event.

A successful render proves only that the inspected artifact was rendered. It does not prove learner
understanding or source truth.

## Evidence

Keep the frozen package identity, Hypit project/workflow identity, narration identity, render output,
and correspondence review together. Distinguish planned visuals from a successfully rendered video.

If word-level timing is unavailable, use coarser semantic moments and report that limit. Do not
manufacture timestamps.

## Non-goals

Do not own source research, C2 rewriting, learner scoring, TTS generation, CEFR assessment, or
automatic mastery. Do not fork Hypit's full skill into this repository; delegate production mechanics
to the installed upstream skill and keep this adapter limited to ALG-specific boundaries.
