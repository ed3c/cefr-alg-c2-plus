import {technicalNotes} from './technical-notes.js';
import {StudioNarrator} from './studio-narrator.js';

const $=id=>document.getElementById(id);
const note=technicalNotes[0];
let passIndex=0,transcriptVisible=true,playing=false;
const make=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
const narrator=new StudioNarrator($('technical-audio'),message=>$('audio-status').textContent=message);

function stop(message='Stopped.'){
  narrator.stop();playing=false;$('play-pass').disabled=false;$('stop-pass').disabled=true;
  if(message)$('audio-status').textContent=message;
}
function narrationItem(pass){
  return {id:`technical-${note.id}-${pass.id}`,title:`${note.title} · ${pass.label}`,lines:pass.script.map(text=>['Guide',text])};
}
function render(){
  stop('Kokoro browser audio starts only when you choose it.');
  const pass=note.passes[passIndex];
  $('pass-label').textContent=pass.label;$('pass-goal').textContent=pass.goal;$('pass-instruction').textContent=pass.instruction;
  $('pass-nav').replaceChildren(...note.passes.map((p,i)=>{const b=make('button',p.label);b.type='button';b.setAttribute('aria-current',String(i===passIndex));b.onclick=()=>{passIndex=i;transcriptVisible=i!==2;render();};return b;}));
  const script=$('pass-script');script.replaceChildren(...(pass.script||[]).map(p=>make('p',p)));
  transcriptVisible=pass.id==='listening'?false:transcriptVisible;script.hidden=!transcriptVisible || pass.id==='active';
  $('toggle-transcript').hidden=pass.id==='active';$('toggle-transcript').textContent=transcriptVisible?'Hide transcript':'Show transcript';
  $('play-pass').hidden=pass.id==='active';$('stop-pass').hidden=pass.id==='active';
  $('active-box').hidden=pass.id!=='active';$('oracle').hidden=true;$('reveal-oracle').disabled=false;
  if(pass.id==='active'){
    $('active-prompts').replaceChildren(...pass.prompts.map(p=>make('li',p)));
    $('oracle-list').replaceChildren(...pass.oracle.map(p=>make('li',p)));
  }
}
async function play(){
  const pass=note.passes[passIndex];if(!pass.script?.length||playing)return;
  playing=true;$('play-pass').disabled=true;$('stop-pass').disabled=false;
  try{
    await narrator.play(narrationItem(pass),'kokoro-web',1);
    if(playing)stop('Pass finished. Reconstruct the idea before replaying.');
  }catch(error){
    if(error?.name==='AbortError')return;
    stop(`Kokoro playback unavailable: ${error?.message||error}. You can keep reading or retry.`);
  }
}
$('note-title').textContent=note.title;$('note-focus').textContent=note.focus;$('note-setting').textContent=note.setting;
$('source-label').textContent=note.sourceLabel;$('source-claims').textContent=note.sourceClaims.join('\n');
$('terms').replaceChildren(...note.terms.flatMap(([term,meaning])=>[make('dt',term),make('dd',meaning)]));
$('active-vocabulary').replaceChildren(...note.activeVocabulary.map(([term,meaning])=>{const d=make('div');d.append(make('dt',term),make('dd',meaning));return d;}));
$('play-pass').onclick=play;$('stop-pass').onclick=()=>stop();
$('toggle-transcript').onclick=()=>{transcriptVisible=!transcriptVisible;$('pass-script').hidden=!transcriptVisible;$('toggle-transcript').textContent=transcriptVisible?'Hide transcript':'Show transcript';};
$('reveal-oracle').onclick=()=>{$('oracle').hidden=false;$('reveal-oracle').disabled=true;};
window.addEventListener('pagehide',()=>narrator.dispose(),{once:true});
render();
