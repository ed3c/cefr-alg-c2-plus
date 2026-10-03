import { lessons, reviewCues } from './lessons.js';

const $ = id => document.getElementById(id);
const state = { lesson: 0, scene: 0, mode: 'listen', version: 'plain', rate: 1 };
const drafts = new Map();
const checks = new Map();
const clips = new Map();
let speechToken = 0, speaking = false, recorder = null, stream = null, recordingPending = false;
let recordingLesson = null, voice = null;
const synth = window.speechSynthesis;
const getLesson = () => lessons[state.lesson];
const getScene = () => getLesson().scenes[state.scene];
const text = (id, value) => { $(id).textContent = value; };
function element(tag, value, className) { const el = document.createElement(tag); if(value !== undefined) el.textContent=value; if(className) el.className=className; return el; }
const speechAvailable = !!(synth && typeof window.SpeechSynthesisUtterance === 'function');
let englishVoices = [];
function chooseVoice() {
  const selected = $('voice').value;
  englishVoices = (synth?.getVoices?.() || []).filter(v => /^en\b/i.test(v.lang) && (!$('local-only').checked || v.localService));
  voice = englishVoices.find(v=>v.voiceURI===selected) || englishVoices.find(v=>v.lang==='en-US' && v.localService) || englishVoices.find(v=>v.localService) || englishVoices[0] || null;
  const options=englishVoices.map(v=>{const option=element('option',`${v.name} · ${v.lang} · ${v.localService?'on device':'online service'}`);option.value=v.voiceURI;return option;});
  if(!options.length){const option=element('option',$('local-only').checked?'No local English voice available':'Browser default English voice');option.value='';options.push(option);}
  $('voice').replaceChildren(...options);$('voice').value=voice?.voiceURI||'';
  $('voice').disabled=!englishVoices.length;
  if(!speaking)$('play').disabled=!speechAvailable || ($('local-only').checked && !voice);
}
function stopSpeech(message = 'Stopped. Replay whenever you like.') {
  speechToken++; speaking = false; synth?.cancel();
  $('panel-listen').classList.remove('playing');
  $('play').disabled = !speechAvailable || ($('local-only').checked && !voice);
  $('stop').disabled = true;
  if (message) text('audio-status', message);
}
function playConversation() {
  if (!speechAvailable) {
    text('audio-status','Audio is unavailable in this browser. Open the English transcript, or use a browser with English speech support.');
    $('transcript').open=true;return;
  }
  stopSpeech('Starting English audio…');chooseVoice();
  if($('local-only').checked && !voice){text('audio-status','No local English voice is available. Install an English voice in your device settings, or allow online voices.');return;}
  const token = speechToken;
  const continuous = $('continuous').checked;
  const playbackVoice = voice;
  let index = 0;
  speaking=true;$('play').disabled=true;$('stop').disabled=false;
  $('panel-listen').classList.add('playing');
  function next() {
    if (token !== speechToken) return;
    let lines = getScene()[state.version];
    if(index>=lines.length) {
      if(continuous && state.scene<getLesson().scenes.length-1){state.scene++;index=0;$('transcript').open=false;renderScene();lines=getScene()[state.version];}
      else {stopSpeech(continuous?'Scenario finished. Replay or choose another situation.':'Conversation finished. Listen again or choose another scene.');return;}
    }
    const [name, line] = lines[index++];
    const utterance = new window.SpeechSynthesisUtterance(line);
    utterance.lang = playbackVoice?.lang || 'en-US';
    if(playbackVoice) utterance.voice=playbackVoice;
    utterance.rate=state.rate;
    utterance.onstart=()=>{if(token===speechToken) text('audio-status',`Scene ${state.scene+1} of ${getLesson().scenes.length} · ${name} · turn ${index} of ${lines.length}`);};
    utterance.onend=next;
    utterance.onerror=event=>{if(token===speechToken)stopSpeech(event.error==='not-allowed'?'Your browser blocked audio. Press Play to try again.':'Playback stopped. Press Play to retry, or open the transcript.');};
    synth.speak(utterance);
  }
  next();
}
chooseVoice();
synth?.addEventListener?.('voiceschanged',chooseVoice);
function renderScene() {
  text('scene-title',getScene().title);text('scene-cue',getScene().cue);
  const nav=$('scene-list');nav.replaceChildren();
  getLesson().scenes.forEach((scene,i)=>{
    const button=element('button',undefined,'scene-button');button.type='button';button.setAttribute('aria-current',String(i===state.scene));
    button.append(element('span',String(i+1)),document.createTextNode(scene.title));
    button.addEventListener('click',()=>selectScene(i));nav.append(button);
  });
  const body=$('transcript-body');body.replaceChildren();
  getScene()[state.version].forEach(([name,line])=>{const row=element('div',undefined,'utterance');row.append(element('strong',name),element('p',line));body.append(row);});
  text('next-scene', state.scene===getLesson().scenes.length-1 ? 'Back to first scene' : 'Next scene');
}
function selectScene(index) {
  if(!Number.isInteger(index)||index<0||index>=getLesson().scenes.length) throw new Error('Unknown scene');
  stopSpeech('Device-generated English audio. No speaking required.');state.scene=index;$('transcript').open=false;renderScene();
}
function saveCurrentDraft() {
  drafts.set(getLesson().id,$('draft').value);
  checks.set(getLesson().id,[...document.querySelectorAll('[data-check]')].map(el=>el.checked));
}
function renderRecording() {
  const clip=clips.get(getLesson().id);
  $('recording').pause();
  $('recording').hidden=!clip;$('download-recording').hidden=!clip;
  if(clip) {
    $('recording').src=clip.url;$('download-recording').href=clip.url;$('download-recording').download=`${getLesson().id}-response.${clip.type.includes('mp4')?'m4a':'webm'}`;
    text('record-status','Your recording is ready. It stays in this tab until you download it or close the page.');
  } else {$('recording').removeAttribute('src');$('download-recording').removeAttribute('href');text('record-status','Recording starts only when you choose it. Audio stays in this page.');}
  const supported=!!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  $('record').disabled=!supported || recordingPending || !!(recorder&&recorder.state!=='inactive');
  $('stop-record').disabled=!(recorder&&recorder.state==='recording');
  if(!supported)text('record-status','Recording is unavailable in this browser. You can still speak freely, or use your device’s recorder.');
}
function renderLesson() {
  const lesson=getLesson();
  text('lesson-category',lesson.category);text('lesson-title',lesson.title);text('lesson-focus',lesson.focus);text('lesson-count',`${String(state.lesson+1).padStart(2,'0')} / 04`);
  text('setting',lesson.setting);
  $('fact-cards').replaceChildren(...lesson.cards.map(([title,detail])=>{const div=element('div',undefined,'fact');div.append(element('strong',title),element('span',detail));return div;}));
  $('people').replaceChildren(...lesson.people.map(p=>element('span',p)));
  const list=$('lesson-list');list.replaceChildren();
  lessons.forEach((l,i)=>{const b=element('button',undefined,'lesson-button');b.setAttribute('aria-current',String(state.lesson===i));b.append(element('span',String(i+1).padStart(2,'0'),'num'),document.createTextNode(l.title),element('small',l.category));b.addEventListener('click',()=>selectLesson(l.id));list.append(b);});
  text('speaking-prompt',lesson.speaking);text('writing-prompt',lesson.writing);text('spoken-model',lesson.spoken);
  $('followups').replaceChildren(...lesson.followups.map(q=>element('li',q)));
  $('meaning-facts').replaceChildren(...lesson.facts.map(f=>element('li',f)));
  text('before',lesson.before);text('after',lesson.after);text('why-rewrite',lesson.explanation);
  $('phrases').replaceChildren(...lesson.phrases.flatMap(([phrase,meaning])=>[element('dt',phrase),element('dd',meaning)]));
  $('draft').value=drafts.get(lesson.id)||'';
  [...document.querySelectorAll('[data-check]')].forEach((el,i)=>el.checked=checks.get(lesson.id)?.[i]||false);
  $('review-results').replaceChildren();text('word-count',`${reviewCues($('draft').value).words} words`);
  for(const id of ['transcript','spoken-example','writing-example','phrase-details']) $(id).open=false;
  renderScene();renderRecording();
}
function selectLesson(id) {
  const index=lessons.findIndex(l=>l.id===id);if(index===-1)throw new Error('Unknown lesson');
  if(recordingPending||recorder?.state==='recording'){text('record-status','Stop recording before changing the scenario.');return {changed:false,reason:'recording_active'};}
  saveCurrentDraft();stopSpeech('Device-generated English audio. No speaking required.');state.lesson=index;state.scene=0;
  renderLesson();return {changed:true,lessonId:id};
}
function setMode(mode) {
  if(!['listen','speak','write'].includes(mode))throw new Error('Unknown mode');
  if(recordingPending||recorder?.state==='recording'){text('record-status','Stop recording before changing the mode.');return false;}
  if(mode!=='listen')stopSpeech(null);
  $('recording').pause();state.mode=mode;
  ['listen','speak','write'].forEach(name=>{const selected=name===mode;$(`tab-${name}`).setAttribute('aria-selected',String(selected));$(`tab-${name}`).tabIndex=selected?0:-1;$(`panel-${name}`).hidden=!selected;});
  return true;
}
async function recordResponse() {
  if(recordingPending || recorder?.state==='recording')return;
  stopSpeech(null);$('recording').pause();recordingPending=true;$('record').disabled=true;text('record-status','Waiting for microphone permission…');
  const lessonId=getLesson().id;
  try {
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
    recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
    recordingLesson=lessonId;const chunks=[];const current=recorder;
    current.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    current.onerror=()=>{stream?.getTracks().forEach(track=>track.stop());text('record-status','Recording failed. Your earlier recording, if any, is unchanged.');$('record').disabled=false;$('stop-record').disabled=true;};
    current.onstop=()=>{
      stream?.getTracks().forEach(track=>track.stop());stream=null;
      const blob=new Blob(chunks,{type:current.mimeType||'audio/webm'});
      if(blob.size){const previous=clips.get(lessonId);if(previous)URL.revokeObjectURL(previous.url);clips.set(lessonId,{url:URL.createObjectURL(blob),type:blob.type});}
      recorder=null;recordingLesson=null;renderRecording();
      if(!blob.size)text('record-status','No audio was captured. Try recording again.');
    };
    current.start();recordingPending=false;$('stop-record').disabled=false;text('record-status','Recording… Choose Stop recording when you are ready.');
  } catch(error) {
    stream?.getTracks().forEach(track=>track.stop());stream=null;recorder=null;recordingPending=false;
    $('record').disabled=false;$('stop-record').disabled=true;
    text('record-status', error.name==='NotAllowedError'?'Microphone access was not granted. You can keep listening or speak without recording.':'The microphone could not start. Check your device, then try again.');
  }
}
function showReview() {
  const result=reviewCues($('draft').value);const container=$('review-results');container.replaceChildren();
  container.append(element('p',result.message));
  if(!result.words)return;
  const cues=[];
  if(result.longSentences.length)cues.push(`${result.longSentences.length} sentence(s) exceed 25 words. Check for competing ideas; length alone is not an error.`);
  if(result.certainty.length)cues.push(`Check the scope of: ${result.certainty.join(', ')}. Keep these words when the evidence supports them.`);
  if(!cues.length)cues.push('No length or certainty-word cues found. Compare every claim with the scenario facts; this is not a semantic pass.');
  const ul=element('ul');ul.append(...cues.map(c=>element('li',c)));container.append(ul);
  container.append(element('p','Read back the actor, condition, evidence, uncertainty, and next action. Your checklist records your own judgment.'));
}
function downloadDraft() {
  saveCurrentDraft();const lesson=getLesson();const value=$('draft').value.trim();
  if(!value){text('review-results','Write a draft before downloading.');return;}
  const marked=[...document.querySelectorAll('[data-check]')].map(el=>`- [${el.checked?'x':' '}] ${el.parentElement.textContent.trim()}`).join('\n');
  const output=`# ${lesson.title}\n\n## My draft\n\n${value}\n\n## Scenario facts\n\n${lesson.facts.map(f=>'- '+f).join('\n')}\n\n## My self-review\n\n${marked}\n\nThis is practice, not a CEFR assessment.\n`;
  const url=URL.createObjectURL(new Blob([output],{type:'text/markdown;charset=utf-8'}));
  const a=element('a');a.href=url;a.download=`${lesson.id}-draft.md`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('voice').addEventListener('change',()=>{stopSpeech('Voice changed. Play when ready.');chooseVoice();});
$('local-only').addEventListener('change',()=>{stopSpeech(null);chooseVoice();text('audio-status',$('local-only').checked && !voice?'No local English voice is available. Install one on your device, or allow online voices.':'Voice preference updated. Play when ready.');});
$('continuous').addEventListener('change',()=>stopSpeech('Playback scope changed. Play when ready.'));
$('play').addEventListener('click',playConversation);$('stop').addEventListener('click',()=>stopSpeech());
$('next-scene').addEventListener('click',()=>selectScene((state.scene+1)%getLesson().scenes.length));
$('version').addEventListener('change',event=>{stopSpeech('Language version changed. Play when ready.');state.version=event.target.value;renderScene();});
$('rate').addEventListener('change',event=>{state.rate=Number(event.target.value);if(speaking)stopSpeech('Speed changed. Replay when ready.');});
const modeButtons=[...document.querySelectorAll('[data-mode]')];
modeButtons.forEach((button,index)=>{
  button.addEventListener('click',()=>setMode(button.dataset.mode));
  button.addEventListener('keydown',event=>{
    let next;if(event.key==='ArrowRight')next=(index+1)%3;else if(event.key==='ArrowLeft')next=(index+2)%3;else if(event.key==='Home')next=0;else if(event.key==='End')next=2;else return;
    event.preventDefault();if(setMode(modeButtons[next].dataset.mode))modeButtons[next].focus();
  });
});
$('record').addEventListener('click',recordResponse);$('stop-record').addEventListener('click',()=>{if(recorder?.state==='recording'){text('record-status','Preparing your recording…');$('stop-record').disabled=true;recorder.stop();}});
$('draft').addEventListener('input',()=>{text('word-count',`${reviewCues($('draft').value).words} words`);$('review-results').replaceChildren();drafts.set(getLesson().id,$('draft').value);});
$('review').addEventListener('click',showReview);$('export').addEventListener('click',downloadDraft);
$('about-button').addEventListener('click',()=>{stopSpeech(null);$('about').showModal();});$('close-about').addEventListener('click',()=>$('about').close());
const sourceLinks=[
 ['ALG World · learning through understandable experiences','https://algworld.com/the-alg-approach/'],
 ['Council of Europe · CEFR spoken-language descriptors','https://www.coe.int/en/web/common-european-framework-reference-languages/table-3-cefr-3.3-common-reference-levels-qualitative-aspects-of-spoken-language-use'],
 ['medium-compiler · meaning and source preservation','https://github.com/ed3c/medium-compiler/blob/ecb9e3140ead481a9d364390c7c1e6b0113e5a0a/writing-contract.md'],
 ['Soodles review-writing · clear claims and evidence boundaries','https://github.com/ed3c/soodles/blob/069e866949c268efee3d529f4d9ae7a4fdf8c106/.agents/skills/review-writing/features/writing-review.md']
];
$('source-links').replaceChildren(...sourceLinks.map(([label,url])=>{const li=element('li');const a=element('a',label);a.href=url;a.target='_blank';a.rel='noopener';li.append(a);return li;}));
renderLesson();
if(!speechAvailable){$('play').disabled=true;text('audio-status','Device audio is unavailable. You can open the English transcript or use a browser with speech support.');}
window.addEventListener('pagehide',()=>{stopSpeech(null);if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());clips.forEach(clip=>URL.revokeObjectURL(clip.url));});

// Optional browser agent access. Does not grade or change learner evidence.
const context=document.modelContext;
if(context?.registerTool){
  const lifecycle=new AbortController();
  const tools=[
    {name:'read_learning_scenario',description:'Read the selected fictional scenario and current mode. Does not return private drafts or recordings.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('Expected an empty object');return {lessonId:getLesson().id,title:getLesson().title,scene:state.scene+1,mode:state.mode,facts:getLesson().facts,availableLessons:lessons.map(l=>({id:l.id,title:l.title}))};}},
    {name:'select_learning_scenario',description:'Navigate to a scenario and mode. Does not play audio, start recording, grade work, or mark learning complete.',inputSchema:{type:'object',properties:{lessonId:{type:'string',enum:lessons.map(l=>l.id)},mode:{type:'string',enum:['listen','speak','write']}},required:['lessonId','mode'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['lessonId','mode'].includes(k))||!lessons.some(l=>l.id===input.lessonId)||!['listen','speak','write'].includes(input.mode))throw new Error('Invalid scenario or mode');if(recordingPending||recorder?.state==='recording')throw new Error('Stop recording before navigating');selectLesson(input.lessonId);setMode(input.mode);return {lessonId:getLesson().id,mode:state.mode};}}
  ];
  for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
