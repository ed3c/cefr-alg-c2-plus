import assert from 'node:assert/strict';
import {StudioNarrator} from '../dist/studio-narrator.js';
import {inputHash} from '../dist/voice-cases.js';
class Audio extends EventTarget {
  playCount=0;hidden=true;src='';blocked=false;
  play(){this.playCount++;return this.blocked?Promise.reject(new DOMException('gesture','NotAllowedError')):Promise.resolve();}
  pause(){}load(){}removeAttribute(){this.src='';}
  end(){this.dispatchEvent(new Event('ended'));}
}
const item={id:'test',title:'Test',lines:[['Maya','Can we release tomorrow?']]};
const hash=await inputHash(item);
const manifest={results:[{case_id:'test',engine:'parler',input_sha256:hash,audio_file:'parler-test.mp3'}]};
let downloads=0;const fakeFetch=async()=>{downloads++;return {ok:true,json:async()=>manifest};};
async function until(check){for(let i=0;i<100;i++){if(check())return;await new Promise(r=>setTimeout(r,2));}throw Error('Expected state not reached');}
const audio=new Audio();const reader=new StudioNarrator(audio,()=>{},{fetch:fakeFetch});
await reader.preloadParler(item);assert.equal(audio.playCount,0,'Metadata preload is silent');
const run=reader.play(item,'parler',.85);assert.equal(audio.playCount,1,'Ready Parler starts in the click gesture');await until(()=>audio.playCount===1);
assert.match(audio.src,/narration\/parler-test.mp3$/);assert.equal(audio.playbackRate,.85);audio.end();await run;
assert.equal(downloads,1);
// A retry from the validated cache calls play synchronously, preserving the gesture.
audio.blocked=true;await assert.rejects(reader.play(item,'parler'),{name:'NotAllowedError'});audio.blocked=false;
const count=audio.playCount;const retry=reader.play(item,'parler');assert.equal(audio.playCount,count+1);audio.end();await retry;
await assert.rejects(reader.play({...item,lines:[['Maya','A different script.']]},'parler'),/No Parler audio matches/);
// Stop during manifest loading: even a transport that ignores AbortSignal cannot start old audio.
let release;const slow=new StudioNarrator(new Audio(),()=>{},{fetch:()=>new Promise(r=>release=r)});
const pending=slow.play(item,'parler');const rejected=assert.rejects(pending,{name:'AbortError'});
await until(()=>release);slow.stop();release({ok:true,json:async()=>manifest});await rejected;assert.equal(slow.audio.playCount,0);
// Worker cancellation and stale messages must never revive stopped audio.
let worker;const revoked=[];const synth=new StudioNarrator(new Audio(),()=>{},{fetch:fakeFetch,urls:{createObjectURL:()=> 'blob:generated',revokeObjectURL:u=>revoked.push(u)},makeWorker:()=>worker={postMessage(data){this.request=data;},terminate(){this.terminated=true;}}});
const generated=synth.play(item,'kokoro-web');const cancelled=assert.rejects(generated,{name:'AbortError'});
await until(()=>worker?.request);const old=worker;synth.stop();await cancelled;
assert.equal(old.terminated,true);old.onmessage({data:{id:old.request.id,type:'complete',samples:new Float32Array(240),sr:24000}});assert.equal(synth.audio.playCount,0);
const ready=synth.play(item,'kokoro-web');await until(()=>worker!==old&&worker.request);
worker.onmessage({data:{id:worker.request.id,type:'complete',samples:new Float32Array(240),sr:24000}});
await until(()=>synth.audio.playCount===1);assert.equal(synth.audio.src,'blob:generated');synth.audio.end();await ready;
const cached=synth.play(item,'kokoro-web');assert.equal(synth.audio.playCount,2);synth.audio.end();await cached;
synth.dispose();assert.ok(revoked.includes('blob:generated'));assert.equal(worker.terminated,true);
console.log('PASS: validated audio lookup, synchronous gesture retry, speed, changed-text rejection, cancelled fetch/worker, stale completion and cached Kokoro playback.');
