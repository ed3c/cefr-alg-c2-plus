# Frozen lesson to video handoff

## Ownership

`cefr-alg-four-pass` owns semantic compilation. `alg-explainer-video` owns audiovisual
composition. Hypit owns its production/runtime mechanics. The source article remains the meaning
reference.

The handoff is immutable for one render attempt. A semantic change creates a new lesson revision.

## Required fields

A handoff must make these values available, directly or by stable reference:

- `lesson_id` and `lesson_revision`;
- source label and source revision/locator when available;
- `source_claims[]` with stable claim IDs;
- clarity and precision scripts;
- ordered passes and hidden-until-attempt oracle;
- exact narration script and narration identity when an audio asset exists;
- `visual_anchors[]`.

A visual anchor names the claim and relationship worth showing. It does not encode Hypit-specific
component syntax.

## Correspondence invariant

Every meaning-bearing visual event must trace back to a frozen claim and narration anchor:

`claim -> narration anchor -> visual state change -> visible consequence`

The renderer can omit a nonessential visual. It cannot invent a semantic replacement.

## Failure routing

Return to the compiler when a claim, script, oracle item, or visual anchor is semantically wrong or
insufficient.

Stay in the renderer when the problem is layout, timing, component choice, rendering, caption
placement, or other presentation mechanics.

Missing Hypit runtime, narration audio, or word alignment is a capability/input gap. It is not
evidence that the lesson failed.
