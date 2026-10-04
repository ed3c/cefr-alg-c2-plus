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
6. the source-bound meaning oracle;\n7. the session execution state, technique route, and practice-receipt contract.

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
