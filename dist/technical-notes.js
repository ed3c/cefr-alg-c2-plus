export const technicalNotes = [
  {
    id: 'software-factory',
    title: 'Software Factory: from code generation to verifiable delivery',
    category: 'Agentic software engineering',
    sourceLabel: 'Software Factory architecture article',
    sourceClaims: ['C-software-factory-concept', 'D-factory-mission-architecture', 'K-long-horizon-verification'],
    focus: 'Explain why autonomous coding becomes a software factory only when execution is bounded by independent validation and explicit completion conditions.',
    setting: 'You are explaining a production architecture review to senior engineers who already understand coding agents, CI, and pull requests.',
    learningTarget: 'technical speaking / interview',
    pass4Technique: 'shadowing + causal retell + premise mutation',
    terms: [
      ['validation contract', 'A pre-committed description of observable conditions that a result must satisfy.'],
      ['scrutiny validator', 'An independent reviewer that can inspect source, tests, types, lint, and the implementation trajectory.'],
      ['user-testing validator', 'A black-box reviewer that drives the running product without reading its source code.'],
      ['goal drift', 'A long-running agent gradually optimizing for a proxy or changed objective instead of the original intent.'],
      ['open-ended validation', 'Acceptance where a simple Boolean test does not fully capture whether the intended result is actually useful or correct.']
    ],
    passes: [
      {
        id: 'context', label: 'Pass 1 · Encounter',
        goal: 'Build a low-friction mental model before studying the exact architecture.',
        instruction: 'Read once or listen once. Do not stop to memorize terms. Track only the problem, the actors, and the direction of the solution.',
        script: [
          'A coding agent can write a great deal of code and still fail to deliver a trustworthy product. The hard part is not producing more tokens. It is keeping a long chain of work pointed at the same goal while the environment, the codebase, and the evidence continue to change.',
          'A software factory treats delivery as a loop rather than a single coding session. A signal becomes a plan, the plan becomes isolated work, and the work must survive independent review before it can ship. The important shift is from asking whether the model produced plausible code to asking whether the system can prove what happened and whether the result satisfies the original intent.',
          'This changes the human role as well. Engineers spend less attention on every line of implementation and more attention on constraints, validation boundaries, and the meaning of done.'
        ]
      },
      {
        id: 'precision', label: 'Pass 2 · Recognition',
        goal: 'Recognize the technical terms while following the exact causal architecture.',
        instruction: 'Keep the English transcript and architecture visible. Notice the exact actor, condition, evidence boundary, and uncertainty. Recognition is enough; do not stop to prove recall.',
        script: [
          'The defining property of a software factory is not the number of agents. It is an autonomous development loop whose output is constrained by a validation contract. The contract is established before implementation, so a worker cannot quietly redefine success after seeing what it produced.',
          'Execution and judgment are separated. Workers implement features in isolated contexts. A scrutiny validator inspects source code, tests, type checks, lint results, and implementation history, but it does not repair the candidate it is judging. A user-testing validator takes the opposite view: it never reads the source and instead drives the running application through its external interface. The two perspectives target different failure modes, including code that looks plausible internally but exposes a dummy or broken user experience.',
          'Long-horizon autonomy makes the completion boundary harder, not easier. A loop can run for hours or days without establishing that it is still pursuing the right objective. For open-ended tasks, the unresolved problem is how to define done strongly enough to resist goal drift and reward hacking without pretending that every useful outcome can be reduced to one static test suite.'
        ]
      },
      {
        id: 'listening', label: 'Pass 3 · Contextual familiarity',
        goal: 'Follow the architecture directly in natural spoken English while the context remains available.',
        instruction: 'Listen at normal speed with the English transcript available. Follow the argument without translating it into your first language. Replay as needed. You may hide the transcript for extra listening exposure, but reconstruction is not required in this pass.',
        script: [
          'A software factory is a controlled delivery loop, not merely a swarm of coding agents. Its validation contract fixes the meaning of success before implementation begins.',
          'Workers and validators have different jobs. One builds; the others judge from white-box and black-box perspectives. That separation reduces the chance that the same system can both create a shortcut and approve it.',
          'The remaining frontier is long-horizon verification. The longer the loop runs, the more carefully the system must preserve the original objective and define a completion condition that cannot be satisfied by a convenient proxy.'
        ]
      },
      {
        id: 'active', label: 'Pass 4 · Active reconstruction',
        goal: 'Cross the productive boundary: shadow, generate, mutate, then compare with the source-bound oracle.',
        instruction: 'First shadow the supplied segment. Use delayed shadowing, then simultaneous shadowing if you can keep the meaning and phrase boundaries intact. Next retell or back-translate from the diagram or meaning cue, mutate one premise, and only then reveal the oracle.',
        shadowingScript: [
          'A software factory is a controlled delivery loop, not merely a swarm of coding agents.',
          'Workers implement; independent validators judge from white-box and black-box perspectives.',
          'Long-horizon autonomy makes the definition of done harder because the system must resist goal drift and convenient proxies.'
        ],
        prompts: [
          'Retell: explain why “more agents” is not a sufficient definition of a software factory without copying the model text.',
          'Semantic retell: from the meaning “generation and judgment need separate roles,” produce a precise English explanation in your own wording.',
          'Explain the difference between the scrutiny validator and the user-testing validator without saying that either one alone proves correctness.',
          'Mutation: suppose the black-box validator can now read the source. What failure-detection property becomes weaker, and why?'
        ],
        oracle: [
          'The explanation must name an autonomous delivery loop and a pre-implementation validation contract.',
          'Workers implement; validators judge. The scrutiny validator is white-box, while the user-testing validator is black-box.',
          'The black-box path checks externally visible behavior and is meant to catch results that can pass internal checks while remaining unusable or fake.',
          'The source does not claim that long-horizon completion is solved. Open-ended done conditions and goal drift remain an unresolved boundary.',
          'Do not convert reported examples or source statements into a universal guarantee of correctness, productivity, or learner mastery.'
        ]
      }
    ],
    passiveVocabulary: [
      {term:'orchestrator',pronunciation:'OR-kih-stray-ter',stress:'OR',meaning:'a component that coordinates work and routes tasks'},
      {term:'validator',pronunciation:'VAL-ih-day-ter',stress:'VAL',meaning:'a component that judges a candidate against acceptance conditions'},
      {term:'scrutiny',pronunciation:'SKROO-tuh-nee',stress:'SKROO',meaning:'close examination of implementation and evidence'},
      {term:'contingent on',pronunciation:'kuhn-TIN-juhnt on',stress:'TIN',meaning:'dependent on a stated condition'},
      {term:'goal drift',pronunciation:'GOAL drift',stress:'GOAL',meaning:'movement away from the original objective during a long run'},
      {term:'provenance',pronunciation:'PROV-uh-nuhns',stress:'PROV',meaning:'information that identifies where an artifact or claim came from'},
      {term:'deterministic',pronunciation:'dih-ter-muh-NIS-tik',stress:'NIS',meaning:'producing an outcome by fixed rules rather than open-ended judgment'},
      {term:'reconciliation',pronunciation:'rek-uhn-sil-ee-AY-shuhn',stress:'AY',meaning:'comparison of expected state with observed external state'}
    ],
    activeVocabulary: [
      ['bounded autonomy', 'autonomy constrained by explicit authority, evidence, or completion boundaries'],
      ['pre-commit a criterion', 'define a criterion before observing the candidate result'],
      ['surface a gap', 'make a missing condition or failure visible without silently repairing it'],
      ['externally visible behavior', 'behavior observable through the product interface rather than its implementation'],
      ['resist reward hacking', 'avoid satisfying a proxy while violating the intended objective'],
      ['completion boundary', 'the condition that separates continued iteration from a defensible done state']
    ]
  }
];