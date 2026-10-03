import {technicalNotes} from './technical-notes.js';

const $=id=>document.getElementById(id);
const note=technicalNotes[0];
let passIndex=0,worker=null,activeToken=0,audio=null,transcriptVisible=true;
const make=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};

function wav(samples,sr){
  const b=new ArrayBuffer(44+samples.length*2),v=new DataView(b);
  const s=(p,t)=>[...t].forEach((c,i)=>v.setUint8(p+i,c.charCodeAt(0)));
  s(0,'RIFF');v.setUint32(4,b.byteLength-8,true);s(8,'WAVEfmt ');v.setUint32(16,16,true);
  v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);
  v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,'data');v.setUint32(40,samples.length*2,true);
  samples.forEach((x,i)=>v.setInt16(44+i*2,Math.max(-1,Math.min(1,x))*32767,true));
  return new Blob([b],{type:'audio/wav'});
}
function stop(message='Stopped.'){
  activeToken++;worker?.terminate();worker=null;
  if(audio){audio.pause();URL.revokeObjectURL(audio.src);audio=null;}
  $('play-pass').disabled=false;$('stop-pass').disabled=true;$('audio-status').textContent=message;
}
function render(){
  stop('Audio starts only when you choose it.');
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
  const pass=note.passes[passIndex];if(!pass.script?.length)return;
  stop('Loading Kokoro browser model…');const token=++activeToken;$('play-pass').disabled=true;$('stop-pass').disabled=false;
  worker=new Worker('./kokoro-worker.js',{type:'module'});
  worker.onerror=()=>{if(token===activeToken)stop('Kokoro could not start. Check network, memory, or browser support.');};
  worker.onmessage=({data})=>{
    if(token!==activeToken)return;
    if(data.type==='progress')$('audio-status').textContent=data.text;
    if(data.type==='error')stop('Kokoro generation failed: '+data.text);
    if(data.type==='complete'){
      const blob=wav(data.samples,data.sr),url=URL.createObjectURL(blob);audio=new Audio(url);
      audio.onended=()=>stop('Pass finished. Reconstruct the idea before replaying.');
      audio.onerror=()=>stop('Generated audio could not be played.');
      $('audio-status').textContent='Generated on this device with Kokoro. Playing now…';audio.play().catch(()=>stop('Playback was blocked. Press play again.'));
    }
  };
  worker.postMessage({type:'generate',id:pass.id,item:{lines:pass.script.map(text=>['Guide',text])}});
}
$('note-title').textContent=note.title;$('note-focus').textContent=note.focus;$('note-setting').textContent=note.setting;
$('source-label').textContent=note.sourceLabel;$('source-claims').textContent=note.sourceClaims.join('\n');
$('terms').replaceChildren(...note.terms.flatMap(([term,meaning])=>[make('dt',term),make('dd',meaning)]));
$('active-vocabulary').replaceChildren(...note.activeVocabulary.map(([term,meaning])=>{const d=make('div');d.append(make('dt',term),make('dd',meaning));return d;}));
$('play-pass').onclick=play;$('stop-pass').onclick=()=>stop();
$('toggle-transcript').onclick=()=>{transcriptVisible=!transcriptVisible;$('pass-script').hidden=!transcriptVisible;$('toggle-transcript').textContent=transcriptVisible?'Hide transcript':'Show transcript';};
$('reveal-oracle').onclick=()=>{$('oracle').hidden=false;$('reveal-oracle').disabled=true;};
window.addEventListener('pagehide',()=>stop(''));
render();
