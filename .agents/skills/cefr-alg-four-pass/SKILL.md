---
name: cefr-alg-four-pass
description: Compile one source-grounded technical article into a readable and recitable CEFR ALG C2+ four-pass English learning note. Use for technical-article English study notes, listening reconstruction, active retell/back-translation, and source-bound meaning comparison. Not a CEFR assessment or learner-mastery oracle.
metadata:
  version: "1.0.0"
---

# CEFR ALG four-pass technical note

Read [the four-pass contract](references/four-pass-contract.md) before producing or revising a note.
Use [the feature map](features/README.md) to keep the skill and website surface aligned.

## Product

Turn one technical article into one portable English learning note that preserves the
article's technical meaning while changing the learner's interaction across four passes:

1. context;
2. precision;
3. listening reconstruction;
4. active reconstruction and oracle comparison.

The four passes are learning interactions, not four summaries of decreasing length.
Pass 4 must require the learner to generate language before seeing the oracle.

## Source boundary

Read the actual supplied article or source bytes. Freeze the claims that the lesson will
teach before rewriting them. For every material claim preserve:

- actor and action;
- condition and negation;
- evidence status and uncertainty;
- causal link from constraint to decision;
- exact technical term when changing it would change the concept;
- unresolved boundary when the source says the problem remains open.

Do not turn a source-reported example into a universal result. Do not silently repair,
fact-check, or strengthen the article unless the task separately asks for research.

Use the Soodles review-writing criteria as a review method, not as runtime authority:
purpose/scope, actor/action, conditions, terms, decision, reasoning, zero-context
causality, acceptance boundary, and preservation.

## Compile the four passes

### Pass 1 — Context

Write a low-friction scene for a technically literate learner. Explain the problem,
the actors, and why the decision matters without front-loading terminology.

The learner may read or listen once. Do not require vocabulary recall or output.

### Pass 2 — Precision

Express the same causal model in precise C2-level technical English. Sophistication comes
from accurate qualification and structure, not rare synonyms.

Bind each important term to a concrete role in the system. Keep source uncertainty visible.
This is the main readable technical note and must stand alone with zero chat context.

### Pass 3 — Listening reconstruction

Produce a shorter spoken script that preserves the same architecture. The website hides the
transcript by default while audio plays.

After listening, ask the learner to reconstruct the governing structure from memory. Do not
show a translation or answer before the attempt.

### Pass 4 — Active reconstruction

Require at least two active operations:

- retell or back-translation from a meaning cue without copying the English source;
- mutation of one condition, actor, or architecture premise and explanation of the consequence.

Then expose an oracle checklist derived from the frozen source claims. Compare meaning, not
surface wording. A fluent answer fails preservation when it changes an actor, condition,
evidence claim, uncertainty, or causal relation.

## Vocabulary

Select a small active set from the article: phrases the learner could use in a technical
review, design discussion, or interview. Define each phrase in plain English and keep its
original technical sense. Do not attempt to make every article term active vocabulary.

## Review

Before saving the note, read it back against the source and look for a counterexample that
would satisfy the rewritten wording while violating the source claim.

Report the note as incomplete when a required source claim has no supported English
representation or oracle item. Sentence length and vocabulary rarity are cues only.

## Output contract

The website artifact is a JavaScript object in `dist/technical-notes.js` with:

- stable `id`, `title`, `category`, `focus`, and `setting`;
- `sourceLabel` and stable `sourceClaims`;
- `terms`;
- exactly four ordered `passes` with stable IDs `context`, `precision`,
  `listening`, and `active`;
- readable/listenable `script` for passes 1-3;
- `prompts` and `oracle` for pass 4;
- `activeVocabulary`.

Do not record a CEFR score, completion streak, mastery state, or automatic pronunciation
judgment. C2+ is the learning target/project name; CEFR's highest named level is C2.

## Maintenance

When the note schema or website interaction changes, review the feature map first. Update only
the affected skill/reference/map files and the corresponding site surface. Re-run the real
repository checks. A source review without a site drive is not a complete interaction check;
a passing structural check is not proof that the learner acquired the language.
