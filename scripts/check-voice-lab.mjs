import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {cases,inputHash,inputText,validateResult,engines} from '../dist/voice-cases.js';

assert.equal(cases.length,25);
assert.equal(new Set(cases.map(c=>c.id)).size,cases.length);
const digests=await Promise.all(cases.map(async item=>{
  const hash=await inputHash(item);
  assert.equal(hash,createHash('sha256').update(inputText(item)).digest('hex'));
  return hash;
}));
const manifest=JSON.parse(await readFile(new URL('../dist/audio/manifest.json',import.meta.url)));
assert.ok(manifest.results.length>=4,'Ship real samples for the four Python routes.');
const seen=new Set();
for(const result of manifest.results){
  assert.ok(digests.includes(result.input_sha256),'Published sample must match a shipped script.');
  validateResult(result,result.input_sha256);
  assert.ok(!seen.has(result.engine+result.input_sha256));
  seen.add(result.engine+result.input_sha256);
  assert.match(result.audio_file,/^[-a-zA-Z0-9_.]+\.wav$/);
  const bytes=await readFile(new URL(`../dist/audio/${result.audio_file}`,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),result.audio_sha256);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WAVE');
  // Walk RIFF chunks rather than assuming a 44-byte header.
  let p=12,samples=0,sr=0,channels=0,bits=0;
  while(p+8<=bytes.length){
    const id=bytes.toString('ascii',p,p+4),size=bytes.readUInt32LE(p+4);
    if(id==='fmt '){channels=bytes.readUInt16LE(p+10);sr=bytes.readUInt32LE(p+12);bits=bytes.readUInt16LE(p+22);}
    if(id==='data')samples=size;
    p+=8+size+(size%2);
  }
  assert.equal(channels,1);assert.equal(bits,16);assert.ok(samples>0);
  assert.ok(Math.abs(samples/(sr*channels*bits/8)-result.audio_seconds)<.001);
  assert.throws(()=>validateResult(result,'0'.repeat(64)));
  assert.throws(()=>validateResult({...result,engine:'made-up'},result.input_sha256));
  assert.throws(()=>validateResult({...result,rtf:NaN},result.input_sha256));
  assert.throws(()=>validateResult({...result,rtf:result.rtf+1},result.input_sha256));
  assert.throws(()=>validateResult({...result,audio_sha256:''},result.input_sha256));
}
for(const file of await readdir(new URL('../dist/audio/',import.meta.url))){
  if(file.endsWith('.wav'))assert.ok(manifest.results.some(r=>r.audio_file===file));
}
assert.equal(new Set(engines.map(e=>e.id)).size,6);
console.log(`PASS: 25 script identities, ${manifest.results.length} actual WAV checksums/durations, engine validation, mismatched and corrupt metadata rejection.`);
