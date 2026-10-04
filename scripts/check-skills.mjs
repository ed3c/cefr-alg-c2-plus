import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../',import.meta.url);
for(const name of ['cefr-alg-four-pass','alg-vocab-encounter','alg-explainer-video']){
  const dir=new URL('.agents/skills/'+name+'/',root);
  const skill=fs.readFileSync(new URL('SKILL.md',dir),'utf8');
  assert.ok(skill.startsWith('---\nname: '+name+'\n'),name+': invalid frontmatter name');
  assert.match(skill,/\ndescription: .+\n/);
  for(const match of skill.matchAll(/\]\(([^)]+\.md)\)/g)){
    assert.ok(fs.existsSync(new URL(match[1],new URL('SKILL.md',dir))),name+': missing linked file '+match[1]);
  }
  assert.ok(fs.existsSync(new URL('features/README.md',dir)),name+': feature map missing');
}
const compiler=fs.readFileSync(new URL('.agents/skills/cefr-alg-four-pass/SKILL.md',root),'utf8');
assert.ok(!compiler.includes('\\n'),'four-pass skill must not contain literal backslash-n insertion artifacts');
for(const term of ['semantic lesson','acquisition sequence','clarity','source-bound meaning oracle','Passive encounter set','Active set','Contextual familiarity','delayed shadowing','simultaneous shadowing'])
  assert.ok(compiler.toLowerCase().includes(term.toLowerCase()),'compiler responsibility missing: '+term);
assert.match(compiler,/Passes 1-3 remain\s+receptive/i);
assert.match(compiler,/Do not require reconstruction, retell, translation, quiz answers, or hidden-transcript retrieval here/i);
assert.match(compiler,/true back-translation or semantic retell/i);
assert.match(compiler,/PASSIVE_RECEPTIVE -> GENERATED -> COMPARED -> ACTIVE_PRACTICED/i);
assert.match(compiler,/oracle unavailable until the learner acknowledges/i);
assert.ok(compiler.includes('../alg-vocab-encounter/SKILL.md'),'compiler must delegate passive vocabulary micro-loop');
assert.match(compiler,/reveal the source-bound oracle only after/i);
assert.match(compiler,/exactly four exposures create a neurological threshold/i);
assert.ok(compiler.includes('../alg-explainer-video/SKILL.md'),'compiler must delegate video rendering');
const renderer=fs.readFileSync(new URL('.agents/skills/alg-explainer-video/SKILL.md',root),'utf8');
for(const term of ['frozen','Hypit','narration','visual','correspondence'])
  assert.ok(renderer.includes(term),'renderer contract missing: '+term);
assert.match(renderer,/not Pass 4 by itself/i);
assert.match(renderer,/may not paraphrase them silently/i);
const vocab=fs.readFileSync(new URL('.agents/skills/alg-vocab-encounter/SKILL.md',root),'utf8');
assert.match(vocab,/form\/sound\/meaning/i);
assert.match(vocab,/recognition probe/i);
assert.match(vocab,/does not make the term .*ACTIVE_PRODUCTIVE/i);
console.log('PASS: four-pass acquisition states, vocabulary leaf routing, technique routing, oracle gate, receipt boundary, renderer boundary, links, and feature maps are present.');