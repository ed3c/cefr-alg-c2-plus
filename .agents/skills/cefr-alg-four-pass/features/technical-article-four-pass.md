# Technical article four-pass learning note

## Sub-features

- source claim freeze and stable provenance IDs;
- Pass 1 low-friction encounter;
- Pass 2 precise C2+ recognition with transcript/diagram support;
- Pass 3 receptive contextual familiarity with natural narration and English transcript available;
- passive vocabulary routed through the fast form/sound/meaning recognition loop;
- a smaller active vocabulary set with an explicit productive target;
- Pass 4 technique routing, slower shadowing rollback, generation, premise mutation, and oracle diff;
- software-enforced attempt-before-oracle gate;
- session-local downloadable practice receipt that never claims mastery.

## Driving it with the website

Passes 1-3 remain receptive. Passive vocabulary cards expose pronunciation/stress and one contextual
meaning. A later Probe hides the meaning briefly; Recognized retires the item from the current queue,
while Re-encounter keeps it active. This recognition probe remains passive.

Pass 4 shows the selected target and route. The learner can use 0.8× or 1.0× narration, record which
productive techniques were actually performed, and answer aloud or in writing. The meaning oracle
stays disabled until the learner acknowledges an attempt.

After comparison, the page creates an in-session practice receipt with technique and vocabulary
interaction counts plus optional semantic gaps. The receipt can be downloaded but is not persisted,
graded, or treated as CEFR, retention, pronunciation, or mastery evidence.

## Gotchas

Do not call a recognition probe active production. Do not call semantic retell true back-translation.
Pass 3 must not become a required retrieval test. Shadowing alone is not semantic mastery. Four
mechanical repetitions are not the four-pass method. The oracle compares meaning, not exact wording.
