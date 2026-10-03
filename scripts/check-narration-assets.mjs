import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {cases,inputHash} from '../dist/voice-cases.js';
const manifest=JSON.parse(await readFile(new URL('../dist/narration/manifest.json',import.meta.url)));
assert.equal(manifest.model,'parler-tts/parler-tts-mini-v1');
assert.equal(manifest.model_revision,'0392b9451a601e528fd863bbb0598431fee810d9');
assert.equal(manifest.results.length,cases.length-1);
assert.equal(new Set(manifest.results.map(r=>r.case_id)).size,cases.length-1);
for(const item of cases.filter(c=>c.id!=='quick')){
  const r=manifest.results.find(r=>r.case_id===item.id);
  assert.ok(r,'Missing narration for '+item.id);assert.equal(r.input_sha256,await inputHash(item));
  assert.equal(r.engine,'parler');assert.match(r.audio_file,/^parler-[-a-z0-9]+\.mp3$/);
  const bytes=await readFile(new URL('../dist/narration/'+r.audio_file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),r.audio_sha256);
  assert.ok(bytes.length>1000);assert.ok(r.audio_seconds>0);
  assert.deepEqual(r.turns.map(t=>t.text),item.lines.map(([,t])=>t));
  assert.ok(r.turns.every(t=>['Laura','Jon'].includes(t.voice)&&t.audio_seconds>0));
}
console.log('PASS: all 24 Parler scenes match lesson text, pinned model, speaker metadata and audio checksums.');
