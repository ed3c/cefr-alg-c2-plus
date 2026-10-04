import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../',import.meta.url);
for(const name of ['cefr-alg-four-pass','alg-explainer-video']){
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
for(const term of ['semantic lesson','acquisition sequence','clarity','active-recall','source-bound meaning oracle'])
  assert.ok(compiler.toLowerCase().includes(term.toLowerCase()),'compiler responsibility missing: '+term);
assert.ok(compiler.includes('../alg-explainer-video/SKILL.md'),'compiler must delegate video rendering');
const renderer=fs.readFileSync(new URL('.agents/skills/alg-explainer-video/SKILL.md',root),'utf8');
for(const term of ['frozen','Hypit','narration','visual','correspondence'])
  assert.ok(renderer.includes(term),'renderer contract missing: '+term);
assert.match(renderer,/not Pass 4 by itself/i);
assert.match(renderer,/may not paraphrase them silently/i);
console.log('PASS: four-pass compiler and Hypit renderer skill boundaries, links, feature maps, and preservation guards are present.');
