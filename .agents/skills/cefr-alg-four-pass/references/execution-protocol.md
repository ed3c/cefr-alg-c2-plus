# Four-pass execution governance

## State model

The runtime may expose these session-local states:

`PASSIVE_RECEPTIVE -> GENERATED -> COMPARED -> ACTIVE_PRACTICED`

Passes 1-3 can only establish `PASSIVE_RECEPTIVE`. A lexical recognition probe from
`alg-vocab-encounter` does not cross the productive boundary.

- `GENERATED`: the learner acknowledges an oral or written Pass 4 attempt.
- `COMPARED`: after the acknowledged attempt and oracle reveal, the learner explicitly reports comparing the attempt with the source-bound oracle.
- `ACTIVE_PRACTICED`: the learner reports both comparison and at least one productive semantic technique, such as semantic retell or premise mutation. Shadowing or passive recognition alone is insufficient.

Revealing the oracle alone leaves the state at `GENERATED`. Acknowledgment and comparison are learner reports.
They do not verify cognition, answer quality, or real learner performance. None of these states means `MASTERED`.

## Oracle hard gate

Software, not prose, must prevent oracle reveal before an attempt acknowledgement. The learner may
attempt aloud, so a non-empty textarea is not required. Do not use an LLM judge to decide whether the
attempt is good enough.

Before reveal, the learner may withdraw acknowledgment, which disables reveal. At the first permitted
reveal, retain the acknowledgment-at-reveal and disable its checkbox. Keep `oracleRevealed` separate
from `comparisonReported`. Show the oracle and a separate comparison-confirmation button. Reveal
does not report comparison or enable a receipt.

After the learner reports comparison, retain that report and disable its button. Only then show the
receipt and enable download. Derive the visible state and receipt from the same session history.
Pass navigation preserves that history. Reload starts a fresh session with the oracle, comparison
control and receipt hidden, and download unavailable. Do not add a post-reveal retract or reset flow.

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
- separate attempt-acknowledgment, oracle-reveal and learner-reported-comparison events, in session order;
- the retained acknowledgment-at-reveal, rather than the current checkbox value;
- passive encounter / recognition counts when available;
- learner-written semantic gaps when supplied.

A receipt records interaction events and learner reports only. Opening the oracle is not a completed
comparison. The receipt does not verify cognition, practice quality, or mastery. Keep it in-session or
downloadable; do not require an account, cloud database, streak, or persistent browser storage.
