import {technicalNotes,createSoleAcceptanceNote} from '../dist/technical-notes.js';
import {createHash} from 'node:crypto';
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
assert.ok(!technicalHtml.includes('\\n'),'Technical HTML must not contain literal backslash-n insertion artifacts');
const technicalIds=[...technicalHtml.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(technicalIds).size,technicalIds.length,'Duplicate technical HTML IDs');
for(const match of technicalJs.matchAll(/\$\('([^']+)'\)/g))assert.ok(technicalIds.includes(match[1]),`Missing technical element ${match[1]}`);
assert.ok(technicalJs.includes("'kokoro-web'"));
assert.ok(technicalJs.includes("transcriptVisible=true"));
assert.ok(technicalJs.includes("pass.shadowingScript"));
assert.ok(technicalJs.includes("if(!practice.attemptAcknowledged)return"));
assert.ok(technicalJs.includes("ACTIVE_PRACTICED"));
assert.ok(technicalJs.includes("hasGenerativeTechnique"));
assert.ok(technicalJs.includes("semantic-retell")&&technicalJs.includes("premise-mutation"));
assert.ok(technicalJs.includes("practice receipt only; not mastery"));
assert.ok(technicalJs.includes("passive_recognized"));
assert.ok(!/localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|WebSocket/.test(technicalJs),'Technical practice must not persist or upload learner data');
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
const pending=els.play.events.click(),old=FakeNarrator.calls.at(-1),before=FakeNarrator.calls.length;
els['next-scene'].events.click();old.resolve();await pending;
assert.equal(FakeNarrator.calls.length,before,'Old completion cannot advance after navigation');
els.continuous.checked=false;els['narration-model'].value='kokoro-web';els['narration-model'].events.change();
const single=els.play.events.click();assert.equal(FakeNarrator.calls.at(-1).engine,'kokoro-web');
FakeNarrator.calls.at(-1).resolve();await single;
assert.match(els['audio-status'].textContent,/Conversation finished/);
const failed=els.play.events.click();FakeNarrator.calls.at(-1).reject({name:'NotAllowedError'});await failed;
assert.match(els['audio-status'].textContent,/Play gesture/);assert.equal(els.play.disabled,false);
assert.ok(!/speechSynthesis|SpeechSynthesisUtterance/.test(js),'No hidden system-voice fallback');
console.log('PASS: explicit model choice, cross-scene continuation, scenario boundary, navigation cancellation and gesture-retry state.');
const assetRoot=new URL('../dist/technical-lessons/software-factory-sole-acceptance/',import.meta.url);
const asset=name=>fs.readFileSync(new URL(name,assetRoot));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const frozen=JSON.parse(asset('lesson.json'));
const manifest=JSON.parse(asset('manifest.json'));
const immutablePins={
  original_lesson_sha256:'4dd5d0c09ee829290db29c58cff78c1f3f2e14bbb6261cc424f148cc328e19c1',
  projection_sha256:'ba829a6fede10a3b7dfb6c3b999f554159bbdec94b2540e630ef951a747b715c',
  narration_sha256:'9ee68b89c9fce494e50f14d24a847620cb40bedfe6bb0d19cdcb128a1ebb6e31',
  video_sha256:'f171144553782a2af03a0fb33f6375abdd963563a1b2522a35d32842da0bd050',
  original_srt_sha256:'afbf2527f59eff79e86334737785651cf1be598f10570f2aeb4ce6eccede2a4f',
  captions_vtt_sha256:'24cab60fca56e7854af7a9761de7a8fa0c8d7fc4221319065eff24096580251a'
};
for(const [key,value] of Object.entries(immutablePins))assert.equal(manifest[key],value,key);
for(const [name,key] of [['lesson.json','projection_sha256'],['narration.txt','narration_sha256'],['final.mp4','video_sha256'],['captions.vtt','captions_vtt_sha256']])assert.equal(digest(asset(name)),immutablePins[key],`${name} retained bytes`);
assert.equal(frozen.lesson_id,'software-factory-sole-acceptance');assert.equal(frozen.revision,'1.0.0');
assert.equal(frozen.compiler_skill.path,'.agents/skills/cefr-alg-four-pass/SKILL.md');
assert.equal(frozen.narration.audio_status,'NOT_GENERATED','Preserve historical freeze status');
assert.equal(manifest.delivery_evidence.medium_import,'PENDING');
assert.deepEqual(frozen.sources.map(source=>source.label),['A','B']);
assert.deepEqual(frozen.sources.map(source=>source.sha256),[
  '8de7868145c635eb60ae7605dc13adf5b91547cce6483b9b9eb5ce825e203878',
  '74a1bb1a715a07b5af02ea8643cadedb80548b152173ce14c926b99fb2ab9225'
]);
assert.deepEqual(manifest.sources,frozen.sources.map(({label,sha256,source_kind})=>({label,sha256,source_kind})));
assert.ok(frozen.sources.every(source=>!Object.hasOwn(source,'path')&&source.logical_lines>0&&source.selected_spans.length>0));
for(const contents of [technicalHtml,technicalJs,fs.readFileSync(new URL('../dist/technical-notes.js',import.meta.url),'utf8'),asset('lesson.json').toString(),asset('manifest.json').toString(),asset('narration.txt').toString(),asset('captions.vtt').toString()])assert.doesNotMatch(contents,/\/Users\/|\/home\/|[A-Z]:\\Users\\/,'No private absolute paths in public entry');
const named=createSoleAcceptanceNote(frozen,manifest);
const claimIds=['SF-DUAL-01','SF-DUAL-02','SF-DUAL-03','SF-DUAL-04','SF-DUAL-05','SF-DUAL-06','SF-DUAL-07'];
assert.deepEqual(frozen.claims.map(claim=>claim.id),claimIds);
for(const representation of ['clarity','c2_precision','zh_tw']){
  assert.equal(frozen.scripts[representation].length,7);
  assert.deepEqual(frozen.claims.map(claim=>claim[representation]),frozen.scripts[representation]);
}
assert.deepEqual(named.passes.map(pass=>pass.id),['context','precision','listening','active']);
assert.deepEqual(named.passes[0].script,frozen.scripts.clarity);
assert.deepEqual(named.passes[1].script,frozen.scripts.c2_precision);
assert.deepEqual(named.passes[2].script,frozen.scripts.clarity);
assert.deepEqual(named.zhTw,frozen.scripts.zh_tw);
assert.deepEqual(frozen.four_passes[3].segment_claims,['SF-DUAL-02','SF-DUAL-03','SF-DUAL-04']);
assert.deepEqual(named.passes[3].shadowingScript,frozen.scripts.clarity.slice(1,4));
assert.ok(named.passes[3].prompts.includes(frozen.four_passes[3].cue_en));
assert.ok(named.passes[3].prompts.includes('The User-Testing Validator now reads source code, but remains separate from the worker. Which boundary changes, and which separation remains?'));
assert.equal(named.passes[3].oracle.at(-1),frozen.oracle.mutation_reference);
for(const item of frozen.oracle.items)assert.ok(named.passes[3].oracle.some(text=>text.includes(item.claim)&&text.includes(item.preserve)&&text.includes(item.gap_example)));
for(const [term,meaning] of named.activeVocabulary)assert.equal(meaning,named.passiveVocabulary.find(item=>item.term===term).meaning);
assert.ok(named.passiveVocabulary.every(item=>item.pronunciation===null&&item.stress&&item.sound_cue_status));
assert.ok(technicalHtml.indexOf('id="runtime-ownership"')<technicalHtml.indexOf('id="technical-decision"'));
assert.ok(technicalHtml.indexOf('id="technical-decision"')<technicalHtml.indexOf('id="four-pass-practice"'));
for(const claim of claimIds)assert.ok(technicalHtml.includes(claim));
assert.match(technicalHtml,/<video[^>]*id="lesson-video"[^>]*controls[^>]*preload="metadata"/);
assert.match(technicalHtml,/<details[^>]*id="shadowing-source"[^>]*open/);

async function technicalSession(search='',loadFailure=''){
  const elements=Object.fromEntries(technicalIds.map(id=>[id,new El(id)]));
  for(const tag of technicalHtml.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){
    const el=elements[tag[1]];el.hidden=/\shidden(?:\s|>)/.test(tag[0]);el.disabled=/\sdisabled(?:\s|>)/.test(tag[0]);
  }
  elements['playback-rate'].value='1';
  const techniques=[...technicalHtml.matchAll(/data-technique="([^"]+)"/g)].map(match=>{const el=new El();el.dataset.technique=match[1];return el;});
  const requests=[],audioCalls=[],blobs=[],downloads=[];
  class TechnicalNarrator {
    stop(){} dispose(){}
    async play(item,engine,rate){audioCalls.push({item,engine,rate});}
  }
  const document={getElementById:id=>elements[id],querySelectorAll:selector=>selector==='[data-technique]'?techniques:[],createElement:tag=>{
    const el=new El();if(tag==='a')el.click=()=>downloads.push({href:el.href,name:el.download});return el;
  }};
  const context={technicalNotes,createSoleAcceptanceNote,StudioNarrator:TechnicalNarrator,document,
    window:{location:{search},addEventListener(){}},URLSearchParams,Blob,
    URL:{createObjectURL:blob=>{blobs.push(blob);return 'blob:technical-receipt';},revokeObjectURL(){}},
    fetch:async(path,options)=>{
      requests.push({path,options});
      assert.equal(options,undefined,'Only static GET requests are allowed');
      assert.ok(['./technical-lessons/software-factory-sole-acceptance/lesson.json','./technical-lessons/software-factory-sole-acceptance/manifest.json'].includes(path),'No remote upload or arbitrary lesson fetch');
      if(loadFailure==='network')throw new Error('Network unavailable');
      return {ok:loadFailure!=='http',json:async()=>{
        if(loadFailure==='json')throw new Error('Invalid JSON');
        const data=structuredClone(path.endsWith('/lesson.json')?frozen:manifest);
        if(loadFailure==='identity')data.revision='wrong';return data;
      }};
    }
  };
  vm.createContext(context);vm.runInContext(technicalJs.replace(/^import[^\n]+\n/gm,''),context);
  await vm.runInContext('ready',context);
  const press=id=>{const el=elements[id];assert.equal(el.hidden,false,`${id} hidden`);assert.notEqual(el.disabled,true,`${id} disabled`);return el.onclick();};
  const navigate=index=>elements['pass-nav'].children[index].onclick();
  const acknowledge=value=>{assert.equal(elements['attempt-ack'].disabled,false);elements['attempt-ack'].checked=value;elements['attempt-ack'].onchange();};
  const technique=(name,value)=>{const box=techniques.find(box=>box.dataset.technique===name);box.checked=value;box.onchange();};
  return {elements,requests,audioCalls,blobs,downloads,press,navigate,acknowledge,technique};
}
const defaultSession=await technicalSession();
assert.equal(defaultSession.elements['note-title'].textContent,technical.title);
assert.equal(defaultSession.elements['named-entry'].hidden,true);
assert.equal(defaultSession.requests.length,0);assert.equal(defaultSession.audioCalls.length,0);
defaultSession.navigate(3);defaultSession.acknowledge(true);defaultSession.press('reveal-oracle');
assert.equal(defaultSession.elements['execution-state'].textContent,'GENERATED');
assert.equal(defaultSession.elements['receipt'].hidden,true);assert.equal(defaultSession.elements['download-receipt'].disabled,true);
defaultSession.press('confirm-comparison');assert.equal(defaultSession.elements['execution-state'].textContent,'COMPARED');
assert.equal(defaultSession.elements['receipt'].hidden,false);
const explicitDefault=await technicalSession('?lesson=software-factory');
assert.equal(explicitDefault.elements['note-title'].textContent,technical.title);assert.equal(explicitDefault.requests.length,0);
const unknown=await technicalSession('?lesson=not-a-lesson');
assert.equal(unknown.elements['lesson-content'].hidden,true);assert.equal(unknown.elements['lesson-error'].hidden,false);
assert.match(unknown.elements['lesson-error'].textContent,/Unknown lesson ID: not-a-lesson/);assert.equal(unknown.requests.length,0);
for(const failure of ['network','http','json','identity']){
  const failed=await technicalSession('?lesson=software-factory-sole-acceptance',failure);
  assert.equal(failed.elements['lesson-content'].hidden,true);assert.equal(failed.elements['lesson-error'].hidden,false);
  assert.match(failed.elements['lesson-error'].textContent,/Lesson unavailable/);assert.equal(failed.audioCalls.length,0);
}
const session=await technicalSession('?lesson=software-factory-sole-acceptance');
const t=session.elements;
assert.deepEqual(session.requests.map(request=>request.path),['./technical-lessons/software-factory-sole-acceptance/lesson.json','./technical-lessons/software-factory-sole-acceptance/manifest.json']);
assert.equal(t['note-title'].textContent,'Self-tests and acceptance');assert.equal(t['named-entry'].hidden,false);
assert.equal(t['lesson-video'].src,'./technical-lessons/software-factory-sole-acceptance/final.mp4');
assert.equal(t['lesson-captions'].src,'./technical-lessons/software-factory-sole-acceptance/captions.vtt');
assert.equal(t['fixed-media'].hidden,false);assert.equal(session.audioCalls.length,0,'Loading a lesson does not generate audio');
const texts=id=>Array.from(t[id].children,el=>el.textContent);
assert.deepEqual(texts('pass-script'),frozen.scripts.clarity);assert.deepEqual(texts('zh-tw-script'),frozen.scripts.zh_tw);
for(const id of claimIds)assert.ok(t['source-claims'].textContent.includes(id));
for(const card of t['passive-vocabulary'].children){assert.doesNotMatch(card.children[1].textContent,/null/);assert.match(card.children[1].textContent,/no supplied or generated audio/);}
for(const index of [0,1,2]){
  session.navigate(index);assert.equal(t['active-box'].hidden,true);assert.equal(t['pass-script'].hidden,false);
  assert.equal(t['execution-state'].textContent,'PASSIVE_RECEPTIVE');
  assert.deepEqual(texts('pass-script'),index===1?frozen.scripts.c2_precision:frozen.scripts.clarity);
}
session.press('toggle-transcript');assert.equal(t['pass-script'].hidden,true);
session.navigate(0);session.navigate(2);assert.equal(t['pass-script'].hidden,false,'Pass 3 restores transcript on entry');
session.navigate(3);assert.deepEqual(texts('shadowing-script'),frozen.scripts.clarity.slice(1,4));
assert.equal(t['active-draft'].value,'');assert.equal(t['oracle'].hidden,true);assert.equal(t['receipt'].hidden,true);
assert.equal(t['confirm-comparison'].hidden,true);assert.equal(t['reveal-oracle'].disabled,true);assert.equal(t['download-receipt'].disabled,true);
const recognition=t['passive-vocabulary'].children[0].children[3].children.find(button=>button.textContent==='Recognized');
recognition.onclick();assert.equal(t['execution-state'].textContent,'PASSIVE_RECEPTIVE','Lexical recognition does not establish a productive attempt');
assert.equal(session.downloads.length,0);
t['active-draft'].value='Typed text is not acknowledgment';
assert.equal(t['reveal-oracle'].disabled,true);
t['active-draft'].value='';
session.acknowledge(true);assert.equal(t['execution-state'].textContent,'GENERATED');assert.equal(t['reveal-oracle'].disabled,false);
session.acknowledge(false);assert.equal(t['execution-state'].textContent,'PASSIVE_RECEPTIVE');assert.equal(t['reveal-oracle'].disabled,true);
assert.equal(t['oracle'].hidden,true);assert.equal(t['receipt'].hidden,true);
session.technique('semantic-retell',true);
session.acknowledge(true);session.press('reveal-oracle');
assert.equal(t['active-draft'].value,'','Oral attempts require no textarea content');
assert.equal(t['attempt-ack'].disabled,true);assert.equal(t['attempt-ack'].checked,true);
assert.equal(t['reveal-oracle'].disabled,true);assert.equal(t['oracle'].hidden,false);
assert.equal(t['confirm-comparison'].hidden,false);assert.equal(t['confirm-comparison'].disabled,false);
assert.equal(t['execution-state'].textContent,'GENERATED');assert.equal(t['receipt'].hidden,true);assert.equal(t['download-receipt'].disabled,true);
assert.equal(session.blobs.length,0);assert.equal(t['receipt-output'].textContent||'','');
session.navigate(2);session.navigate(3);
assert.equal(t['oracle'].hidden,false);assert.equal(t['execution-state'].textContent,'GENERATED');assert.equal(t['receipt'].hidden,true);
session.technique('semantic-retell',false);
session.technique('delayed-shadowing',true);session.technique('simultaneous-shadowing',true);
session.press('confirm-comparison');
assert.equal(t['execution-state'].textContent,'COMPARED');assert.equal(t['confirm-comparison'].disabled,true);
assert.equal(t['receipt'].hidden,false);assert.equal(t['download-receipt'].disabled,false);
session.technique('semantic-retell',true);assert.equal(t['execution-state'].textContent,'ACTIVE_PRACTICED');
session.technique('semantic-retell',false);assert.equal(t['execution-state'].textContent,'COMPARED');
session.technique('premise-mutation',true);assert.equal(t['execution-state'].textContent,'ACTIVE_PRACTICED');
t['semantic-gaps'].value='I omitted the unresolved boundary.';t['semantic-gaps'].oninput();
session.navigate(0);session.navigate(3);
session.press('download-receipt');assert.equal(session.downloads.length,1);
assert.equal(session.downloads[0].name,'software-factory-sole-acceptance-practice-receipt.txt');
const receipt=await session.blobs[0].text();assert.equal(receipt,t['receipt-output'].textContent);
for(const key of ['original_lesson_sha256','projection_sha256','narration_sha256','video_sha256'])assert.ok(receipt.includes(immutablePins[key]));
for(const source of manifest.sources)assert.ok(receipt.includes(`source_${source.label}: ${source.sha256}`));
assert.match(receipt,/revision: 1.0.0/);assert.match(receipt,/attempt_before_oracle: yes/);
assert.match(receipt,/oracle_revealed: yes/);assert.match(receipt,/comparison_reported: yes \(learner-reported\)/);
assert.match(receipt,/state: ACTIVE_PRACTICED/);assert.match(receipt,/not verified cognition/);
assert.match(receipt,/semantic_gaps: I omitted the unresolved boundary\./);
const events=JSON.parse(receipt.split('\n').find(line=>line.startsWith('session_events: ')).slice('session_events: '.length));
assert.deepEqual(events.map(event=>event.event),['attempt_acknowledged','attempt_withdrawn','attempt_acknowledged','oracle_revealed','comparison_reported']);
assert.deepEqual(events.map(event=>event.sequence),[1,2,3,4,5]);assert.ok(events.every(event=>Number.isFinite(Date.parse(event.at))));
for(const rate of ['0.8','1']){
  t['playback-rate'].value=rate;await session.press('play-pass');
  const audio=session.audioCalls.at(-1);assert.equal(audio.engine,'kokoro-web');assert.equal(audio.rate,Number(rate));
  assert.deepEqual(Array.from(audio.item.lines,line=>line[1]),frozen.scripts.clarity.slice(1,4));
}
const reload=await technicalSession('?lesson=software-factory-sole-acceptance');reload.navigate(3);
assert.equal(reload.elements['execution-state'].textContent,'PASSIVE_RECEPTIVE');assert.equal(reload.elements['attempt-ack'].checked,false);
assert.equal(reload.elements['oracle'].hidden,true);assert.equal(reload.elements['receipt'].hidden,true);
assert.equal(reload.elements['confirm-comparison'].hidden,true);assert.equal(reload.elements['download-receipt'].disabled,true);
reload.acknowledge(true);reload.press('reveal-oracle');reload.press('confirm-comparison');reload.press('download-receipt');
const freshReceipt=await reload.blobs[0].text();
const freshEvents=JSON.parse(freshReceipt.split('\n').find(line=>line.startsWith('session_events: ')).slice('session_events: '.length));
assert.deepEqual(freshEvents.map(event=>event.event),['attempt_acknowledged','oracle_revealed','comparison_reported']);
assert.deepEqual(freshEvents.map(event=>event.sequence),[1,2,3]);assert.match(freshReceipt,/state: COMPARED/);
assert.match(freshReceipt,/techniques: none recorded/);assert.match(freshReceipt,/semantic_gaps: None recorded\./);
assert.equal(reload.audioCalls.length,0);
console.log('PASS: frozen package hashes and mappings, named/default/error routes, receptive navigation, oral attempt withdrawal, separate reveal/comparison, retained receipt history, fresh reload and explicit shadowing rates.');
console.log('LIMIT: technical DOM handlers use a fake narrator; browser layout, fixed-video playback and actual dynamic Kokoro audio require separate browser evidence.');
