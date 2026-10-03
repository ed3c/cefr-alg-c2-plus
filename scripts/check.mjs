import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {lessons, reviewCues} from '../dist/lessons.js';
assert.equal(lessons.length,4);
assert.equal(new Set(lessons.map(l=>l.id)).size,4);
for(const l of lessons){
  assert.equal(l.scenes.length,3);
  assert.ok(l.writing && l.speaking && l.before && l.after && l.explanation);
  assert.ok(l.facts.length>=3);
  for(const s of l.scenes){for(const version of ['plain','detailed'])assert.ok(s[version].length>=4&&s[version].every(line=>line.length===2&&line.every(Boolean)));}
}
assert.equal(reviewCues('  ').words,0);
assert.deepEqual(reviewCues('This always works.').certainty,['always']);
assert.deepEqual(reviewCues('The result remains unknown.').certainty,[]);
assert.equal(reviewCues(Array(26).fill('word').join(' ')+'.').longSentences.length,1);
assert.equal(reviewCues('<img src=x onerror=alert(1)>').message.includes('No CEFR'),true);
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
for(const match of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(match[1]),`Missing element ${match[1]}`);
for(const path of ['app.js','lessons.js','style.css'])assert.ok(fs.existsSync(new URL('../dist/'+path,import.meta.url)));
assert.ok(html.includes('id="panel-speak" role="tabpanel" aria-labelledby="tab-speak" hidden'));
assert.ok(html.includes('id="panel-write" role="tabpanel" aria-labelledby="tab-write" hidden'));
assert.ok(!/localStorage|fetch\(/.test(js),'No app upload or persistent browser storage is intended');
assert.ok(!/<details[^>]+id="transcript"[^>]+open/.test(html),'Transcript must start closed');
// Minimal DOM harness exercises shared state and failure paths. It is not browser/audio QA.
class El {
 constructor(id=''){this.id=id;this.value='';this.children=[];this.attrs={};this.dataset={};this.checked=false;this.hidden=false;this.open=false;this.events={};this.classList={add(){},remove(){}};this.parentElement={textContent:'self-review'};}
 append(...values){this.children.push(...values)} replaceChildren(...values){this.children=values;this.textContent=''} setAttribute(k,v){this.attrs[k]=v} removeAttribute(k){delete this.attrs[k]} addEventListener(k,fn){this.events[k]=fn} pause(){} focus(){} click(){} remove(){} showModal(){this.open=true} close(){this.open=false}
}
const els=Object.fromEntries(ids.map(id=>[id,new El(id)]));
const checkEls=Array.from({length:4},()=>new El());
const tabs=['listen','speak','write'].map(name=>{els['tab-'+name].dataset.mode=name;return els['tab-'+name]});
const registered=[];
const fakeDocument={getElementById:id=>els[id],createElement:()=>new El(),createTextNode:t=>t,querySelectorAll:s=>s==='[data-check]'?checkEls:tabs,body:new El(),modelContext:{registerTool:t=>registered.push(t)}};
const sandbox={lessons,reviewCues,document:fakeDocument,window:{addEventListener(){}},navigator:{},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},Blob,AbortController,setTimeout};
vm.createContext(sandbox);
vm.runInContext(js.replace(/^import[^\n]+\n/,''),sandbox);
assert.equal(els['lesson-title'].textContent,lessons[0].title);
assert.equal(els.play.disabled,true,'Unavailable speech disables playback');
assert.equal(els.record.disabled,true,'Unavailable recording disables recording');
assert.equal(registered.length,2);
const read=registered.find(t=>t.name==='read_learning_scenario');const select=registered.find(t=>t.name==='select_learning_scenario');
assert.equal(read.execute({}).lessonId,'release');
assert.throws(()=>select.execute({lessonId:'missing',mode:'write'}));
assert.equal(read.execute({}).lessonId,'release','Invalid navigation cannot change state');
assert.equal(select.execute({lessonId:'handoff',mode:'write'}).mode,'write');
assert.equal(els['panel-listen'].hidden,true);assert.equal(els['panel-write'].hidden,false);
els.draft.value='My actual words.';checkEls[0].checked=true;
select.execute({lessonId:'design',mode:'listen'});
select.execute({lessonId:'handoff',mode:'write'});
assert.equal(els.draft.value,'My actual words.');assert.equal(checkEls[0].checked,true);
els.draft.value='';els.review.events.click();assert.equal(els['review-results'].children[0].textContent.includes('Write something first'),true);
els.draft.value='All failures are definitely resolved.';els.review.events.click();assert.ok(els['review-results'].children.length>1);
assert.equal(read.execute({}).facts[0],'The passing test covers revision A.');
console.log('PASS: content structure, review boundaries, HTML wiring, unsupported-media states, mode/scenario navigation, session drafts, and WebMCP handler valid/invalid inputs.');
console.log('LIMIT: DOM harness only; no real browser rendering, TTS output, microphone device, or native WebMCP runtime was tested.');

// Fake speech events verify sequencing and cancellation, not audio quality.
const utterances=[];
const localVoice={name:'Local',voiceURI:'local',lang:'en-US',localService:true};
const remoteVoice={name:'Remote',voiceURI:'remote',lang:'en-GB',localService:false};
let availableVoices=[localVoice,remoteVoice];
const fakeSynth={getVoices:()=>availableVoices,addEventListener(){},cancel(){},speak(u){utterances.push(u);u.onstart?.();}};
els['local-only'].checked=true;els.continuous.checked=true;
const audioSandbox={...sandbox,window:{addEventListener(){},speechSynthesis:fakeSynth,SpeechSynthesisUtterance:class {constructor(value){this.text=value;}}}};
vm.createContext(audioSandbox);vm.runInContext(js.replace(/^import[^\n]+\n/,''),audioSandbox);
assert.equal(utterances.length,0,'No sound before an explicit Play gesture');
assert.equal(els.voice.children.length,1,'Local-only filters online voices');
els.play.events.click();
const allLines=lessons[0].scenes.flatMap(s=>s.plain.map(([,line])=>line));
for(let i=0;i<allLines.length;i++){
  assert.equal(utterances[i].text,allLines[i]);
  assert.equal(utterances[i].voice.localService,true);
  utterances[i].onend();
}
assert.equal(utterances.length,allLines.length,'Continuous reading ends at scenario boundary');
assert.equal(els['scene-title'].textContent,lessons[0].scenes[2].title);
assert.equal(els.stop.disabled,true);assert.match(els['audio-status'].textContent,/Scenario finished/);
// An old callback must not restart audio after Stop or navigation.
els.play.events.click();let last=utterances.at(-1);let count=utterances.length;
els.stop.events.click();last.onend();assert.equal(utterances.length,count);
els.play.events.click();last=utterances.at(-1);count=utterances.length;
els['next-scene'].events.click();last.onend();assert.equal(utterances.length,count);
// Single-scene mode stays on the chosen scene.
els.continuous.checked=false;els.continuous.events.change();
count=utterances.length;els.play.events.click();
for(let i=0;i<lessons[0].scenes[0].plain.length;i++)utterances[count+i].onend();
assert.equal(els['scene-title'].textContent,lessons[0].scenes[0].title);
assert.equal(utterances.length,count+lessons[0].scenes[0].plain.length);
// No fallback to a network voice when local-only is enabled.
availableVoices=[remoteVoice];els['local-only'].events.change();count=utterances.length;
assert.equal(els.play.disabled,true);els.play.events.click();assert.equal(utterances.length,count);
els['local-only'].checked=false;els['local-only'].events.change();els.play.events.click();
assert.equal(utterances.at(-1).voice,remoteVoice);
utterances.at(-1).onerror({error:'not-allowed'});
assert.match(els['audio-status'].textContent,/blocked audio/);assert.equal(els.play.disabled,false);
console.log('PASS: gesture-only start, cross-scene queue, scenario boundary, cancellation, single-scene mode, local-only enforcement, online opt-in, and recoverable speech errors.');
