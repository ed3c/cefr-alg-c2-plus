---
name: alg-vocab-encounter
description: Run the passive-vocabulary micro-loop for CEFR ALG technical lessons: fast form/sound/meaning encounter, brief recognition probe, and retire-or-reencounter routing. Use for passive vocabulary breadth inside cefr-alg-four-pass. This is lexical recognition practice, not productive-language mastery.
metadata:
  version: "1.0.0"
---

# ALG vocabulary encounter

This is a leaf practice protocol consumed by `../cefr-alg-four-pass/SKILL.md`.
It implements the supplied ten-second encounter method without making an exact duration a universal law.

## Boundary

The goal is passive recognition: quickly connect a term's visible form, pronunciation/stress, and one
contextually correct core meaning. A brief meaning-recall probe remains lexical recognition practice;
it does not make the term `ACTIVE_PRODUCTIVE`.

Do not require the learner to produce every passive term in a sentence. Productive promotion belongs
to the smaller active set and Pass 4.

## Encounter round

For each unfamiliar term, keep the interaction short and move on:

1. **Form scan** — see the whole term or phrase; do not turn the exercise into letter-by-letter copying.
2. **Sound/stress** — play or read the supplied pronunciation and stress cue; repeat once when useful.
3. **One core meaning** — bind one meaning that is correct in this article's context.
4. **Advance** — avoid prolonged memorization of one item.

The source method suggests roughly ten seconds per first encounter. Treat that as a practical default
for this leaf protocol, not a correctness threshold. The runtime may not have an exact timer.

## Recognition probe

On a later round, show the form/sound cue before the meaning. Give the learner a brief chance to
recognize the contextual meaning.

- recognized quickly → retire the item from the current encounter queue;
- not recognized → reveal immediately and keep it for another encounter;
- do not punish guessing or require perfect spelling.

A batch can advance before 100% recognition. Do not turn one article into a 500-word curriculum batch.

## Data contract

Each passive item should provide:

- `term`;
- `pronunciation` or another usable sound cue when available;
- `stress` or phrase-grouping cue when useful;
- one `meaning` for this article context.

Optional context examples may come from the frozen lesson. They may not introduce unsupported claims.

## Runtime evidence

A session may record encounter/re-encounter/recognized counts in a local practice receipt. These are
interaction facts, not retention or mastery scores.

## Non-goals

No spaced-repetition scheduler, long-term retention claim, CEFR score, automatic pronunciation score,
or universal ten-second rule. Do not promote a passive term to active solely because its meaning was
recognized once.
