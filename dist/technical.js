import {technicalNotes} from './technical-notes.js';
import {StudioNarrator} from './studio-narrator.js';

const $=id=>document.getElementById(id);
const note=technicalNotes[0];
let passIndex=0,transcriptVisible=true,playing=false;
const practice={encountered:new Set(),recognized:new Set(),techniques:new Set(),attemptAcknowledged:false,compared:false};
const make=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
const narrator=new StudioNarrator($('technical-audio'),message=>$('audio-status').textContent=message);

function stop(message='Stopped.'){
  narrator.stop();playing=false;$('play-pass').disabled=false;$('stop-pass').disabled=true;
  if(message)$('audio-status').textContent=message;
}
function narrationLines(pass){return pass.script||pass.shadowingScript||[];}
function narrationItem(pass){
  return {id:`technical-${note.id}-${pass.id}`,title:`${note.title} · ${pass.label}`,lines:narrationLines(pass).map(text=>['Guide',text])};
}
function hasGenerativeTechnique(){
  return practice.techniques.has('semantic-retell')||practice.techniques.has('premise-mutation')||practice.techniques.has('true-back-translation');
}
function executionState(){
  if(!practice.attemptAcknowledged)return 'PASSIVE_RECEPTIVE';
  if(!practice.compared)return 'GENERATED';
  return hasGenerativeTechnique()?'ACTIVE_PRACTICED':'COMPARED';
}
function updateGate(){
  $('reveal-oracle').disabled=!practice.attemptAcknowledged || practice.compared;
  $('execution-state').textContent=executionState();
}
function render(){
  stop('Kokoro browser audio starts only when you choose it.');
  const pass=note.passes[passIndex];
  $('pass-label').textContent=pass.label;$('pass-goal').textContent=pass.goal;$('pass-instruction').textContent=pass.instruction;
  $('pass-nav').replaceChildren(...note.passes.map((p,i)=>{const b=make('button',p.label);b.type='button';b.setAttribute('aria-current',String(i===passIndex));b.onclick=()=>{passIndex=i;transcriptVisible=true;render();};return b;}));
  const script=$('pass-script');script.replaceChildren(...(pass.script||[]).map(p=>make('p',p)));
  script.hidden=!transcriptVisible || pass.id==='active';
  $('toggle-transcript').hidden=pass.id==='active';$('toggle-transcript').textContent=transcriptVisible?'Hide transcript':'Show transcript';
  const hasNarration=narrationLines(pass).length>0;
  $('play-pass').hidden=!hasNarration;$('stop-pass').hidden=!hasNarration;$('playback-rate').hidden=pass.id!=='active';
  $('active-box').hidden=pass.id!=='active';
  if(pass.id==='active'){
    $('shadowing-script').replaceChildren(...pass.shadowingScript.map(p=>make('li',p)));
    $('active-prompts').replaceChildren(...pass.prompts.map(p=>make('li',p)));
    $('oracle-list').replaceChildren(...pass.oracle.map(p=>make('li',p)));
  }
  updateGate();
}
async function play(){
  const pass=note.passes[passIndex];if(!narrationLines(pass).length||playing)return;
  playing=true;$('play-pass').disabled=true;$('stop-pass').disabled=false;
  const rate=pass.id==='active'?Number($('playback-rate').value):1;
  try{
    await narrator.play(narrationItem(pass),'kokoro-web',rate);
    if(playing)stop(pass.id==='active'?'Shadowing segment finished. Generate from meaning before revealing the oracle.':'Pass finished. Replay when useful.');
  }catch(error){
    if(error?.name==='AbortError')return;
    stop(`Kokoro playback unavailable: ${error?.message||error}. You can keep reading or retry.`);
  }
}
async function playWord(item){
  stop('Playing vocabulary encounter.');
  try{
    await narrator.play({id:`vocab-${note.id}-${item.term}`,title:item.term,lines:[['Guide',item.term]]},'kokoro-web',0.9);
    $('audio-status').textContent='Vocabulary encounter finished.';
  }catch(error){$('audio-status').textContent=`Vocabulary audio unavailable: ${error?.message||error}.`;}
}
function renderVocabulary(){
  $('passive-vocabulary').replaceChildren(...note.passiveVocabulary.map(item=>{
    const card=make('div');card.className='vocab-card';card.dataset.retired=String(practice.recognized.has(item.term));
    const term=make('dt',item.term),sound=make('dd',`${item.pronunciation} · stress: ${item.stress}`),meaning=make('dd',item.meaning);
    const actions=make('p');actions.className='vocab-actions';
    const play=make('button','Play');play.type='button';play.onclick=()=>{practice.encountered.add(item.term);playWord(item);};
    const probe=make('button','Probe');probe.type='button';probe.onclick=()=>{practice.encountered.add(item.term);meaning.hidden=true;probe.textContent='Reveal';probe.onclick=()=>{meaning.hidden=false;probe.textContent='Probe';renderVocabulary();};};
    const known=make('button','Recognized');known.type='button';known.onclick=()=>{practice.encountered.add(item.term);practice.recognized.add(item.term);card.dataset.retired='true';updateReceiptPreview();};
    const again=make('button','Re-encounter');again.type='button';again.onclick=()=>{practice.encountered.add(item.term);practice.recognized.delete(item.term);meaning.hidden=false;card.dataset.retired='false';updateReceiptPreview();};
    actions.append(play,probe,known,again);card.append(term,sound,meaning,actions);return card;
  }));
}
function receiptText(){
  const gaps=$('semantic-gaps').value.trim()||'None recorded.';
  return [
    'CEFR ALG practice receipt',
    `lesson: ${note.id}`,
    `source: ${note.sourceLabel}`,
    `target: ${note.learningTarget}`,
    `pass4_route: ${note.pass4Technique}`,
    `state: ${executionState()}`,
    `attempt_before_oracle: ${practice.attemptAcknowledged?'yes':'no'}`,
    `techniques: ${[...practice.techniques].join(', ')||'none recorded'}`,
    `passive_encountered: ${practice.encountered.size}`,
    `passive_recognized: ${practice.recognized.size}`,
    `semantic_gaps: ${gaps}`,
    'claim: practice receipt only; not mastery, retention, pronunciation, or CEFR evidence.'
  ].join('\n');
}
function updateReceiptPreview(){if(practice.compared)$('receipt-output').textContent=receiptText();}
function downloadReceipt(){
  const blob=new Blob([receiptText()],{type:'text/plain'}),url=URL.createObjectURL(blob),a=make('a');
  a.href=url;a.download=`${note.id}-practice-receipt.txt`;a.click();URL.revokeObjectURL(url);
}

$('note-title').textContent=note.title;$('note-focus').textContent=note.focus;$('note-setting').textContent=note.setting;
$('source-label').textContent=note.sourceLabel;$('source-claims').textContent=note.sourceClaims.join('\n');
$('learning-target').textContent=note.learningTarget;$('pass4-route').textContent=note.pass4Technique;
$('terms').replaceChildren(...note.terms.flatMap(([term,meaning])=>[make('dt',term),make('dd',meaning)]));
renderVocabulary();
$('active-vocabulary').replaceChildren(...note.activeVocabulary.map(([term,meaning])=>{const d=make('div');d.append(make('dt',term),make('dd',meaning));return d;}));
$('play-pass').onclick=play;$('stop-pass').onclick=()=>stop();
$('toggle-transcript').onclick=()=>{transcriptVisible=!transcriptVisible;$('pass-script').hidden=!transcriptVisible;$('toggle-transcript').textContent=transcriptVisible?'Hide transcript':'Show transcript';};
for(const box of document.querySelectorAll('[data-technique]'))box.onchange=()=>{box.checked?practice.techniques.add(box.dataset.technique):practice.techniques.delete(box.dataset.technique);updateGate();updateReceiptPreview();};
$('attempt-ack').onchange=()=>{practice.attemptAcknowledged=$('attempt-ack').checked;updateGate();};
$('reveal-oracle').onclick=()=>{if(!practice.attemptAcknowledged)return;practice.compared=true;$('oracle').hidden=false;$('receipt').hidden=false;updateGate();updateReceiptPreview();};
$('semantic-gaps').oninput=updateReceiptPreview;$('download-receipt').onclick=downloadReceipt;
window.addEventListener('pagehide',()=>narrator.dispose(),{once:true});
render();