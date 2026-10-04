import {technicalNotes} from '../dist/technical-notes.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {lessons, reviewCues} from '../dist/lessons.js';
assert.equal(lessons.length,4);
assert.equal(new Set(lessons.map(l=>l.id)).size,4);
assert.equal(technicalNotes.length,1);
const technical=technicalNotes[0];
assert.deepEqual(technical.passes.map(p=>p.id),['context','precision','listening','active']);
assert.ok(technical.passes.slice(0,3).every(p=>p.script?.length>=3));
assert.match(technical.passes[2].label,/Contextual familiarity/);
assert.match(technical.passes[2].instruction,/transcript available/i);
assert.match(technical.passes[2].instruction,/reconstruction is not required/i);
assert.ok(technical.passes[3].shadowingScript.length>=2);
assert.match(technical.passes[3].instruction,/delayed shadowing/i);
assert.match(technical.passes[3].instruction,/simultaneous shadowing/i);
assert.ok(technical.passes[3].prompts.some(x=>/Semantic retell/i.test(x)));
assert.equal(technical.learningTarget,'technical speaking / interview');
assert.match(technical.pass4Technique,/shadowing/);
assert.ok(technical.passes[3].prompts.length>=2 && technical.passes[3].oracle.length>=4);
assert.ok(technical.passiveVocabulary.length>technical.activeVocabulary.length);
assert.ok(technical.passiveVocabulary.every(x=>x.term&&x.pronunciation&&x.stress&&x.meaning));
assert.ok(technical.sourceClaims.includes('K-long-horizon-verification'));
assert.ok(technical.passes[3].oracle.some(x=>/unresolved/i.test(x)));
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
for(const path of ['app.js','lessons.js','style.css','technical.html','technical.js','technical-notes.js'])assert.ok(fs.existsSync(new URL('../dist/'+path,import.meta.url)));
const technicalHtml=fs.readFileSync(new URL('../dist/technical.html',import.meta.url),'utf8');
const technicalJs=fs.readFileSync(new URL('../dist/technical.js',import.meta.url),'utf8');
assert.ok(html.includes('href="./technical.html"'));
assert.ok(technicalHtml.includes('Generate with Kokoro browser & play'));
assert.ok(technicalHtml.includes('Reveal meaning oracle'));
assert.ok(technicalHtml.includes('id="passive-vocabulary"'));
assert.ok(technicalHtml.includes('id="shadowing-script"'));
assert.ok(technicalHtml.includes('id="attempt-ack"'));
assert.ok(technicalHtml.includes('id="reveal-oracle" class="primary" disabled'));
assert.ok(technicalHtml.includes('id="receipt" hidden'));
assert.ok(technicalHtml.includes('id="playback-rate"'));
assert.ok(!technicalHtml.includes('\\\\n'),'Technical HTML must not contain literal backslash-n insertion artifacts');
const technicalIds=[...technicalHtml.matchAll(/\\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(technicalIds).size,technicalIds.length,'Duplicate technical HTML IDs');
for(const match of technicalJs.matchAll(/\\$\\('([^']+)'\\)/g))assert.ok(technicalIds.includes(match[1]),`Missing technical element ${match[1]}`);
assert.ok(technicalJs.includes("'kokoro-web'"));
assert.ok(technicalJs.includes("$('oracle').hidden=false"));
assert.ok(technicalJs.includes("transcriptVisible=true"));
assert.ok(technicalJs.includes("pass.shadowingScript"));
assert.ok(technicalJs.includes("if(!practice.attemptAcknowledged)return"));
assert.ok(technicalJs.includes("ACTIVE_PRACTICED"));
assert.ok(technicalJs.includes("practice receipt only; not mastery"));
assert.ok(technicalJs.includes("passive_recognized"));
assert.ok(!/localStorage|fetch\(/.test(technicalJs),'Technical drafts must stay local and narration must use StudioNarrator');
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
class FakeNarrator { static calls=[]; constructor(){} async preloadParler(){} stop(){} dispose(){} play(item,engine,rate){return new Promise((resolve,reject)=>FakeNarrator.calls.push({item,engine,rate,resolve,reject}));} }
els['narration-model'].value='parler';
const sandbox={StudioNarrator:FakeNarrator,lessons,reviewCues,document:fakeDocument,window:{addEventListener(){}},navigator:{},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},Blob,AbortController,setTimeout};
vm.createContext(sandbox);
vm.runInContext(js.replace(/^import[^\n]+\n/gm,''),sandbox);
assert.equal(els['lesson-title'].textContent,lessons[0].title);
assert.equal(FakeNarrator.calls.length,0,'Loading the app never starts narration');
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
console.log('PASS: content structure, review boundaries, HTML wiring, unsupported-recording state, mode/scenario navigation, session drafts, and WebMCP handler valid/invalid inputs.');
console.log('LIMIT: DOM harness only; no real browser rendering, TTS output, microphone device, or native WebMCP runtime was tested.');

// Drive the real app's cross-scene loop with controlled completion, not synthetic voice quality.
select.execute({lessonId:'release',mode:'listen'});els.continuous.checked=true;
const playback=els.play.events.click();
for(let i=0;i<3;i++){
  assert.equal(FakeNarrator.calls.at(-1).item.id,`release-${i}-plain`);
  assert.equal(FakeNarrator.calls.at(-1).engine,'parler');
  FakeNarrator.calls.at(-1).resolve();await new Promise(r=>setImmediate(r));
}
await playback;assert.match(els['audio-status'].textContent,/Scenario finished/);
assert.equal(FakeNarrator.calls.length,3,'Queue stops at the scenario boundary');