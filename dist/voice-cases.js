import {lessons} from './lessons.js';

// Same UTF-8 text and speaker order for every engine. No LLM rewrites the input.
export const cases = [{id:'quick', title:'Quick comparison · release decision',
  lines:[['Maya','Can we release tomorrow?'],['Alex','The sandbox test passed, but the duplicate charge remains unresolved.']]}];
for (const lesson of lessons) for (const [i, scene] of lesson.scenes.entries()) {
  for (const version of ['plain','detailed']) cases.push({
    id:`${lesson.id}-${i}-${version}`, title:`${lesson.title} · ${i+1} · ${version}`,
    lines:scene[version]
  });
}
export function inputText(item) { return item.lines.map(([speaker,text])=>`${speaker}: ${text}`).join('\n'); }
export async function inputHash(item) {
  const hash = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(inputText(item)));
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export const engines = [
  {id:'parler',name:'Parler-TTS',route:'Local Python · Mini v1',note:'Text-described delivery · 34 named voices. Public training recipe and datasets.',license:'Apache-2.0 code + weights; dataset attribution applies.'},
  {id:'kokoro',name:'Kokoro',route:'Local Python · 82M',note:'Small English narration baseline. Full training provenance is not published.',license:'Apache-2.0 code + weights; dependencies have separate licenses.'},
  {id:'qwen',name:'Qwen3-TTS',route:'Local Python · 1.7B CustomVoice',note:'Instruction-controlled delivery. Complete pretraining data and logs not verified.',license:'Apache-2.0 code + weights.'},
  {id:'pocket',name:'Pocket TTS',route:'Local CPU · 100M · January checkpoint',note:'Public preset-voice checkpoint from Kyutai. No voice-cloning model or access token required.',license:'MIT code; CC BY 4.0 weights; voice-specific terms.'},
  {id:'litert-kokoro',name:'Kokoro / LiteRT-LM',route:'Native C++ · CPU',note:'Runtime comparison using the same Kokoro voices. Requires a built runner and compatible model assets.',license:'Apache-2.0 runtime + weights; eSpeak dependencies require separate notices.'},
  {id:'kokoro-web',name:'Kokoro / browser',route:'Kokoro.js · WASM q8',note:'Generate on this device. First use downloads model files from Hugging Face (~100 MB or more).',license:'Apache-2.0 model; browser dependencies have separate licenses.'}
];

export function validateResult(r, hash) {
  if (!r || r.schema!==1 || r.input_sha256!==hash || !engines.some(e=>e.id===r.engine)) throw Error('This result does not match the selected script or engine.');
  if(!/^[a-f0-9]{64}$/.test(r.input_sha256)||!/^[a-f0-9]{64}$/.test(r.audio_sha256||'')) throw Error('Missing or invalid checksum.');
  for (const key of ['load_ms','generation_ms','audio_seconds','rtf']) if (!Number.isFinite(r[key]) || r[key]<0) throw Error(`Invalid metric: ${key}`);
  if (r.audio_seconds<=0 || !Array.isArray(r.voices) || typeof r.runtime!=='string') throw Error('Incomplete audio result.');
  if(Math.abs(r.rtf-r.generation_ms/1000/r.audio_seconds)>0.01) throw Error('RTF does not match the recorded timing.');
  return r;
}
