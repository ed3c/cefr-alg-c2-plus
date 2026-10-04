# Four-pass execution governance

## State model

The runtime may expose these session-local states:

`PASSIVE_RECEPTIVE -> GENERATED -> COMPARED -> ACTIVE_PRACTICED`

Passes 1-3 can only establish `PASSIVE_RECEPTIVE`. A lexical recognition probe from
`alg-vocab-encounter` does not cross the productive boundary.

- `GENERATED`: the learner acknowledges an oral or written Pass 4 attempt.
- `COMPARED`: the source-bound oracle was revealed after the attempt.
- `ACTIVE_PRACTICED`: the learner completed at least one productive technique and comparison.

None of these states means `MASTERED`.

## Oracle hard gate

Software, not prose, must prevent oracle reveal before an attempt acknowledgement. The learner may
attempt aloud, so a non-empty textarea is not required. Do not use an LLM judge to decide whether the
attempt is good enough.

## Technique routing

Choose resistance by learning target rather than forcing every technique every time:

| Target | Primary Pass 4 technique |
| --- | --- |
| technical speaking / interview | delayed/simultaneous shadowing + retell + sentence mutation |
| technical writing / precision | true back-translation or semantic retell + source diff |
| listening | narration + optional scaffold withdrawal + shadowing |
| vocabulary breadth | `alg-vocab-encounter` recognition loop |
| technical reasoning | premise mutation + causal retell |

A lesson can combine techniques, but the compiler should name the primary target and route.

## Back-translation terminology

Keep two operations distinct:

- **semantic retell**: diagram/meaning cue → English;
- **true back-translation**: source English → learner L1 representation → reconstructed English → source diff.

Do not label semantic retell as true back-translation.

## Shadowing rollback

Provide a slower playback option for Pass 4. If phrase grouping or meaning collapses at normal speed,
use the slower rate or return to Pass 2/3. Do not require automatic pronunciation scoring.

## Practice receipt

After comparison, the runtime may produce a session-local receipt containing:

- lesson and source identity;
- productive techniques the learner says they performed;
- whether an attempt preceded oracle reveal;
- passive encounter / recognition counts when available;
- learner-written semantic gaps when supplied.

A receipt proves practice events only. It is not a mastery certificate. Keep it in-session or
downloadable; do not require an account, cloud database, streak, or persistent browser storage.
