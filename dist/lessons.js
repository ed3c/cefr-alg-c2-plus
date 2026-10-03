export const lessons = [
  {
    id: 'release', title: 'The release can wait', category: 'Engineering', focus: 'Explain a decision without overstating the evidence.',
    people: ['Maya · Product lead', 'Alex · Engineer'], setting: 'Thursday, 16:40. A checkout release is due tomorrow. The team has one unresolved payment failure.',
    cards: [['Tomorrow', 'Planned launch'], ['1 failure', 'Still unexplained'], ['Sandbox only', 'Current evidence']],
    scenes: [
      { title: 'A result, not a guarantee', cue: 'Maya has a launch date. Alex has a test result. Listen for why these are different.',
        plain: [
          ['Maya', 'The payment test passed this morning. Can we release tomorrow?'],
          ['Alex', 'It passed in the sandbox. That is useful, but it does not tell us what happens with real payments.'],
          ['Maya', 'What is still missing?'],
          ['Alex', 'One customer reported paying twice. We have not reproduced that failure yet.'],
          ['Maya', 'So the test passed, but the original problem is still open.'],
          ['Alex', 'Yes. I can show what we checked and what we still need to check.']
        ],
        detailed: [
          ['Maya', 'The payment test passed this morning. Are we comfortable committing to tomorrow’s release?'],
          ['Alex', 'I would qualify that result. It passed in the sandbox; we have not established that the same behavior holds for real payments.'],
          ['Maya', 'Which uncertainty could actually change the release decision?'],
          ['Alex', 'A customer reported a duplicate charge. We have not reproduced it, so I cannot rule out a problem in the retry path.'],
          ['Maya', 'Then the passing test supports a narrower claim than “the payment issue is fixed.”'],
          ['Alex', 'Exactly. The sandbox result is encouraging. The reported failure remains unresolved.']
        ]
      },
      { title: 'A smaller next step', cue: 'The team needs useful evidence before launch. Listen for the next action and its limit.',
        plain: [['Maya', 'Do we need to test everything again?'], ['Alex', 'First, I want to check the retry path against the customer’s report.'], ['Maya', 'Why start there?'], ['Alex', 'The report mentions a timeout before the second charge. A retry could explain that sequence.'], ['Maya', 'Could explain it, but we do not know yet.'], ['Alex', 'Right. I will inspect the available logs. If they do not answer the question, I will reproduce the timeout in a controlled test.']],
        detailed: [['Maya', 'Would a full regression run resolve the uncertainty?'], ['Alex', 'Not necessarily. The report points to a timeout followed by a second charge. I would investigate that sequence first.'], ['Maya', 'Are you treating the retry as the cause?'], ['Alex', 'As a plausible explanation. The logs may corroborate it, contradict it, or leave the question open.'], ['Maya', 'And if the logs are inconclusive?'], ['Alex', 'Then I will reproduce the timeout in a controlled test. That gives us a focused next step without assuming the outcome.']]
      },
      { title: 'Tell the customer what changed', cue: 'No new evidence has arrived. Listen to how the team communicates the delay.',
        plain: [['Maya', 'What can we tell the customer today?'], ['Alex', 'The sandbox test passed. We are still investigating the duplicate charge.'], ['Maya', 'Should we promise a fix tomorrow?'], ['Alex', 'No. We can promise an update tomorrow, but we do not yet know when we will have a fix.'], ['Maya', 'I will explain the delay and send the update by noon.'], ['Alex', 'I will give you the evidence we have before then.']],
        detailed: [['Maya', 'How do we explain the delay without sounding evasive?'], ['Alex', 'State what we know, what remains unresolved, and who will act next. The sandbox test passed; the duplicate charge is still under investigation.'], ['Maya', 'Can we give them a resolution date?'], ['Alex', 'Not on the evidence we have. We can commit to an update by noon tomorrow, not to a completed fix.'], ['Maya', 'I will make that distinction explicit in the customer update.'], ['Alex', 'And I will provide the latest findings before you send it.']]
      }
    ],
    writing: 'Write a short customer update. Preserve the sandbox-only result, the unresolved duplicate charge, and Maya’s commitment to an update by noon tomorrow.',
    speaking: 'You are Alex. Maya asks, “Why delay if the test passed?” Explain the evidence and the next step. You can stop whenever you wish.',
    followups: ['What would change your recommendation?', 'Why would a full test suite not necessarily answer this question?'],
    facts: ['Only the sandbox test passed.', 'The duplicate-charge report remains unresolved.', 'Maya will send an update by noon tomorrow; a fix is not promised.'],
    before: 'All payment problems have been resolved. The release will be ready tomorrow.',
    after: 'The sandbox payment test passed. We are still investigating the reported duplicate charge. Maya will send an update by noon tomorrow.',
    explanation: 'The revision narrows the test claim, restores the unresolved report, and replaces an unsupported delivery promise with the actual commitment.',
    spoken: 'The sandbox test passed, which is encouraging. But we still haven’t explained the duplicate charge. Let’s investigate that before we commit to the release.',
    phrases: [['qualify a result', 'State the limits of what a result supports.'], ['rule out', 'Exclude a possible explanation.'], ['corroborate', 'Support a claim with additional evidence.']]
  },
  {
    id: 'handoff', title: 'Same issue. Different version.', category: 'Agent systems', focus: 'Keep the evidence attached to the version it actually tested.',
    people: ['Sam · Reviewer', 'Alex · Engineer'], setting: 'A coding agent prepared a patch. Tests passed on revision A. A later edit produced revision B.',
    cards: [['Revision A', 'Tests passed'], ['Revision B', 'Changed afterward'], ['Not yet checked', 'Current patch']],
    scenes: [
      { title: 'What did the test actually cover?', cue: 'Sam sees a passing test. Alex notices a later edit.',
        plain: [['Sam', 'The agent says the issue is fixed. The test is green.'], ['Alex', 'Which version did the test run against?'], ['Sam', 'Revision A. The latest patch is revision B.'], ['Alex', 'Then the result tells us about A. It does not tell us whether B works.'], ['Sam', 'So B is not a failure. It is not checked yet.'], ['Alex', 'Exactly. We need to check the changed behavior on B.']],
        detailed: [['Sam', 'The agent’s handoff says the issue is resolved, and it links to a passing test.'], ['Alex', 'Before we accept that conclusion, does the evidence refer to the current revision?'], ['Sam', 'It covers revision A. One more edit produced revision B.'], ['Alex', 'Then the evidence is valid for A, but insufficient for B. We should not transfer the conclusion without checking what changed.'], ['Sam', 'That leaves B unverified, rather than disproven.'], ['Alex', 'Yes. The next action is to verify the affected behavior on B.']]
      },
      { title: 'Keep the request intact', cue: 'The requested behavior is narrow. A simpler-looking change would lose part of it.',
        plain: [['Sam', 'The request says to retry temporary errors and stop on permission errors.'], ['Alex', 'Does revision B still do both?'], ['Sam', 'It retries every error. That makes the code shorter.'], ['Alex', 'But it changes the request. A permission error should stop the operation.'], ['Sam', 'I will restore that distinction.'], ['Alex', 'Then check both cases on the new revision.']],
        detailed: [['Sam', 'The requirement distinguishes temporary errors from permission errors. Revision B collapses them into one retry path.'], ['Alex', 'That simplifies the code at the expense of the required behavior. Permission errors must still stop the operation.'], ['Sam', 'So a shorter implementation is not necessarily an equivalent one.'], ['Alex', 'Right. Preserve the distinction, then verify both outcomes on the resulting revision.'], ['Sam', 'I will correct the implementation before updating the handoff.'], ['Alex', 'And the handoff should name the revision the new checks actually cover.']]
      },
      { title: 'An honest handoff', cue: 'The correction has been proposed but has not been executed. Listen for careful status wording.',
        plain: [['Sam', 'Can I write that the corrected version now passes?'], ['Alex', 'Not yet. We have proposed the correction, but we have not run it.'], ['Sam', 'I will write what needs to change and what still needs checking.'], ['Alex', 'Yes. Name the next action so the next person does not have to guess.']],
        detailed: [['Sam', 'The correction looks straightforward. Can the handoff say the behavior is restored?'], ['Alex', 'Only as a proposed change. We do not yet have execution evidence for the corrected revision.'], ['Sam', 'Then I will separate the intended behavior from the observed result.'], ['Alex', 'And identify the remaining check. A clear handoff preserves uncertainty instead of making it disappear.']]
      }
    ],
    writing: 'Write a handoff for the next engineer. Distinguish the passing result on A, the defect in B, and the proposed correction that has not yet been tested.',
    speaking: 'You are reviewing an agent’s patch. Explain why a passing test on revision A does not establish that revision B is ready.',
    followups: ['Does “unverified” mean “failed”?', 'What would the next engineer need to check?'],
    facts: ['The passing test covers revision A.', 'Revision B retries permission errors, contrary to the requirement.', 'The correction is proposed; no passing result exists for it yet.'],
    before: 'The agent fixed the issue and verified the final version.',
    after: 'Tests passed on revision A. Revision B incorrectly retries permission errors. The proposed correction restores the stop condition, but it has not yet been tested.',
    explanation: 'The revision restores version identity, names the actual defect, and preserves the difference between a proposal and an observed result.',
    spoken: 'That test passed on A. We’re reviewing B now, and B changed the retry behavior. We need evidence for the version we intend to ship.',
    phrases: [['at the expense of', 'A gain in one area causes a loss in another.'], ['insufficient evidence', 'The available information does not support this conclusion.'], ['preserve a distinction', 'Keep two different cases separate.']]
  },
  {
    id: 'design', title: 'Do we really need a queue?', category: 'System design', focus: 'Explain when a choice is useful and when a simpler option is enough.',
    people: ['Jamie · Engineer', 'Alex · Engineer'], setting: 'A small product generates reports. Most requests are quick, but a few take longer than the web request limit.',
    cards: [['Most reports', 'Finish quickly'], ['Some reports', 'Exceed request limit'], ['One decision', 'Where should work run?']],
    scenes: [
      { title: 'Start with the constraint', cue: 'Jamie suggests a queue. Alex asks which problem it solves.',
        plain: [['Jamie', 'We should put every report in a queue.'], ['Alex', 'Which problem are we trying to solve?'], ['Jamie', 'Some reports take longer than the web request allows.'], ['Alex', 'A background worker could finish those reports after the request ends.'], ['Jamie', 'Would that make every report faster?'], ['Alex', 'No. It changes where the work happens. It does not remove the work.']],
        detailed: [['Jamie', 'I propose moving report generation to a queue.'], ['Alex', 'What constraint makes that necessary?'], ['Jamie', 'A few reports exceed the web request limit. A background worker could continue processing them independently.'], ['Alex', 'That addresses the lifetime of the request. It does not, by itself, reduce the computation time.'], ['Jamie', 'Then we should avoid presenting the queue as a general performance fix.'], ['Alex', 'Yes. The benefit is that long-running work can outlive the request.']]
      },
      { title: 'The extra responsibilities', cue: 'Moving the work creates a new responsibility: telling the user what happened.',
        plain: [['Jamie', 'The server can return a job number immediately.'], ['Alex', 'Then the user needs a way to check whether the report is ready.'], ['Jamie', 'We can show waiting, running, ready, and failed.'], ['Alex', 'What happens if the worker tries the same job twice?'], ['Jamie', 'We need to prevent duplicate effects.'], ['Alex', 'That is part of the cost of this design.']],
        detailed: [['Jamie', 'We can acknowledge the request immediately and return a job identifier.'], ['Alex', 'That introduces a status flow. The user needs to distinguish waiting, running, successful, and failed work.'], ['Jamie', 'We also need to decide how retries behave.'], ['Alex', 'Exactly. A repeated attempt should not create duplicate effects. A queue shifts responsibilities; it does not eliminate them.']]
      },
      { title: 'State the decision boundary', cue: 'The team compares the same choices under a different constraint.',
        plain: [['Jamie', 'What if every report finished within the request limit?'], ['Alex', 'Then a direct request could be simpler.'], ['Jamie', 'And if long reports remain a real problem?'], ['Alex', 'A queue may be worth the extra status and retry handling.'], ['Jamie', 'So we choose from the actual workload, not from what sounds more advanced.'], ['Alex', 'Yes. We still need measurements before claiming a performance improvement.']],
        detailed: [['Jamie', 'Under what conditions would you keep the synchronous design?'], ['Alex', 'If all reports reliably completed within the request limit and no other requirement justified background work.'], ['Jamie', 'But if the long-running cases remain?'], ['Alex', 'Then a queue may justify its operational overhead. The decision is contingent on the workload and the user experience we need to support.'], ['Jamie', 'We should measure the result rather than infer a speedup from the architecture.'], ['Alex', 'Agreed.']]
      }
    ],
    writing: 'Write a design note: explain the request limit, how a worker changes execution, the new status and retry responsibilities, and when a direct request would be simpler.',
    speaking: 'A teammate asks, “Why not always use a queue?” Explain the constraint, one benefit, and one cost.',
    followups: ['What happens after the web request returns?', 'Which changed condition would make the simpler design suitable?'],
    facts: ['Some reports exceed the web request limit.', 'A queue lets work continue after the request; it does not automatically reduce computation time.', 'The design needs job status and duplicate-effect handling.'],
    before: 'A queue makes reports faster and removes failures.',
    after: 'A queue allows long reports to continue after the web request ends. It also requires job-status and retry handling. We have not measured a speed improvement.',
    explanation: 'The revision explains the actual execution change and its cost. It removes two unsupported guarantees.',
    spoken: 'A queue helps when the report outlives the request. But then we need job status and safe retries. If the direct request already meets our needs, I would keep it.',
    phrases: [['contingent on', 'Dependent on a condition.'], ['operational overhead', 'Additional work needed to run and maintain a system.'], ['by itself', 'Without any additional change or condition.']]
  },
  {
    id: 'everyday', title: 'A quieter place to meet', category: 'Everyday life', focus: 'Express preferences, acknowledge another view, and reach a practical decision.',
    people: ['Nora · Friend', 'Alex · Friend'], setting: 'Two friends are choosing a café for Saturday. One wants good coffee. The other needs a quiet place to talk.',
    cards: [['Saturday', 'A catch-up'], ['Market café', 'Good coffee · noisy'], ['Garden café', 'Quieter · farther away']],
    scenes: [
      { title: 'Different priorities', cue: 'Both friends want to meet. They care about different things.',
        plain: [['Nora', 'Let’s go to the market café. Their coffee is great.'], ['Alex', 'I like it too, but it gets noisy on Saturdays.'], ['Nora', 'Does that bother you?'], ['Alex', 'A little. I was hoping we could have a proper conversation.'], ['Nora', 'The garden café is quieter, but it is farther away.'], ['Alex', 'I do not mind the extra walk.']],
        detailed: [['Nora', 'I was leaning toward the market café. The coffee is hard to beat.'], ['Alex', 'It is, though I find it difficult to follow a conversation there when it gets busy.'], ['Nora', 'Fair point. The garden café would be quieter, but it is a bit out of the way.'], ['Alex', 'I would rather make the extra trip and actually hear you.'], ['Nora', 'So the atmosphere matters more to you this time.'], ['Alex', 'Yes. Especially since we have not caught up in a while.']]
      },
      { title: 'Leave room for uncertainty', cue: 'Nora remembers one visit. Listen for how much that memory tells them.',
        plain: [['Nora', 'The garden café was quiet when I went last month.'], ['Alex', 'Was that on a Saturday?'], ['Nora', 'No, it was a Tuesday morning.'], ['Alex', 'Then Saturday might be different.'], ['Nora', 'We could call and ask when it is usually less busy.'], ['Alex', 'That sounds sensible.']],
        detailed: [['Nora', 'It was almost empty the last time I went.'], ['Alex', 'Was that around the time we are planning to meet?'], ['Nora', 'Actually, no. It was a weekday morning.'], ['Alex', 'Then I would not take that as a guarantee for Saturday.'], ['Nora', 'I can call and ask about their quieter hours.'], ['Alex', 'Good idea. That would give us something more useful to go on.']]
      },
      { title: 'A flexible plan', cue: 'They choose a plan without pretending that every detail is certain.',
        plain: [['Nora', 'I will call tomorrow. If they expect a crowd, we can choose somewhere else.'], ['Alex', 'Great. We do not need to decide everything now.'], ['Nora', 'Shall we keep Saturday afternoon free?'], ['Alex', 'Yes. Send me a message after you call.']],
        detailed: [['Nora', 'I will call tomorrow. If Saturday looks crowded, we can reconsider.'], ['Alex', 'That works for me. Let’s keep the afternoon free and leave the venue open for now.'], ['Nora', 'I will message you once I know more.'], ['Alex', 'Perfect. I am looking forward to catching up, wherever we end up.']]
      }
    ],
    writing: 'Write a friendly message confirming the plan. Keep Saturday afternoon, the undecided venue, and Nora’s plan to call tomorrow.',
    speaking: 'Tell a friend why you prefer somewhere quiet. Acknowledge their preference without making it sound wrong.',
    followups: ['What would make you change your mind?', 'How would you say the same thing more casually?'],
    facts: ['Saturday afternoon is the plan.', 'The venue is still undecided.', 'Nora will call tomorrow and then send a message.'],
    before: 'We are definitely meeting at the garden café on Saturday because it is always quiet.',
    after: 'Let’s keep Saturday afternoon free. Nora will call the garden café tomorrow and let us know how busy it is likely to be. We can choose the venue after that.',
    explanation: 'The revision keeps the plan flexible and does not turn one quiet weekday visit into an “always” claim.',
    spoken: 'I’d love somewhere a little quieter so we can catch up properly. But let’s see what they say when you call.',
    phrases: [['lean toward', 'Prefer one choice without deciding firmly.'], ['out of the way', 'Not convenient to reach.'], ['something to go on', 'Information that helps you decide.']]
  }
];

export function reviewCues(text) {
  const value = text.trim();
  if (!value) return { words: 0, longSentences: [], certainty: [], message: 'Write something first. These cues cannot judge meaning or CEFR level.' };
  const sentences = value.match(/[^.!?]+[.!?]?/g) || [value];
  return {
    words: (value.match(/\b[\w’'-]+\b/g) || []).length,
    longSentences: sentences.map(s=>s.trim()).filter(s=>(s.match(/\b[\w’'-]+\b/g)||[]).length>25),
    certainty: [...new Set((value.match(/\b(always|never|guaranteed|guarantees|definitely|proves|all|resolved)\b/gi)||[]).map(x=>x.toLowerCase()))],
    message: 'Review cues only. A short sentence can still change the meaning. No CEFR score is assigned.'
  };
}
