import {inputHash, inputText} from './voice-cases.js';

const cancelled = () => new DOMException('Playback cancelled', 'AbortError');
export function encodeWav(samples, sr) {
  const b=new ArrayBuffer(44+samples.length*2),v=new DataView(b);
  const str=(at,s)=>[...s].forEach((c,i)=>v.setUint8(at+i,c.charCodeAt(0)));
  str(0,'RIFF');v.setUint32(4,b.byteLength-8,true);str(8,'WAVEfmt ');v.setUint32(16,16,true);
  v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);
  v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,samples.length*2,true);
  samples.forEach((s,i)=>v.setInt16(44+i*2,Math.max(-1,Math.min(1,s))*32767,true));
  return new Blob([b],{type:'audio/wav'});
}

export class StudioNarrator {
  constructor(audio, progress=()=>{}, dependencies={}) {
    this.audio=audio;this.progress=progress;this.fetch=dependencies.fetch||globalThis.fetch.bind(globalThis);
    this.makeWorker=dependencies.makeWorker||(()=>new Worker(new URL('./kokoro-worker.js',import.meta.url),{type:'module'}));
    this.urls=dependencies.urls||URL;this.token=0;this.cache=new Map();this.parlerReady=new Map();this.worker=null;
  }
  async preloadParler(item) {
    const hash=await inputHash(item);
    if(!this.manifest){
      const response=await this.fetch(new URL('./narration/manifest.json',import.meta.url));
      if(!response.ok)return;
      this.manifest=await response.json();
    }
    const result=this.manifest.results?.find(r=>r.case_id===item.id&&r.input_sha256===hash&&r.engine==='parler');
    if(result&&/^[-a-zA-Z0-9_.]+\.mp3$/.test(result.audio_file))
      this.parlerReady.set('parler\n'+inputText(item),new URL('./narration/'+result.audio_file,import.meta.url).href);
  }
  stop() {
    this.token++;this.abort?.abort();this.abort=null;
    this.rejectPending?.(cancelled());this.rejectPending=null;
    if(this.generating){this.worker?.terminate();this.worker=null;this.generating=false;}
    this.audio.pause();this.audio.removeAttribute('src');this.audio.load();this.audio.hidden=true;
  }
  async play(item, engine, rate=1) {
    this.stop();const token=this.token;const signal=(this.abort=new AbortController()).signal;
    const current=()=>{if(token!==this.token)throw cancelled();};
    const cacheKey=engine+'\n'+inputText(item);
    let url=this.parlerReady.get(cacheKey)||this.cache.get(cacheKey);
    if(!url){
    const hash=await inputHash(item);current();
    if(engine==='parler') {
      this.progress('Loading Parler TTS conversation…');
      if(!this.manifest){
        const response=await this.fetch(new URL('./narration/manifest.json',import.meta.url),{signal});
        if(!response.ok)throw Error('Parler lesson audio could not be loaded. Retry or choose Kokoro browser.');
        const manifest=await response.json();current();this.manifest=manifest;
      }
      const result=this.manifest.results?.find(r=>r.case_id===item.id && r.input_sha256===hash && r.engine==='parler');
      if(!result||!/^[-a-zA-Z0-9_.]+\.mp3$/.test(result.audio_file))throw Error('No Parler audio matches this scene. Choose Kokoro browser.');
      url=new URL('./narration/'+result.audio_file,import.meta.url).href;
    } else if(engine==='kokoro-web') {
      {
        this.progress('Preparing Kokoro browser. First use downloads the model; keep this page open.');
        const output=await new Promise((resolve,reject)=>{
          this.rejectPending=reject;this.generating=true;
          this.worker ||= this.makeWorker();
          this.worker.onmessage=({data})=>{
            if(token!==this.token||data.id!==token)return;
            if(data.type==='progress')this.progress(data.text);
            else if(data.type==='complete'){this.generating=false;this.rejectPending=null;resolve(data);}
            else if(data.type==='error'){this.worker.terminate();this.worker=null;this.generating=false;this.rejectPending=null;reject(Error(data.text));}
          };
          this.worker.onerror=()=>{if(token!==this.token)return;this.worker?.terminate();this.worker=null;this.generating=false;this.rejectPending=null;reject(Error('Kokoro could not run on this device. Choose Parler TTS or retry.'));};
          this.worker.postMessage({type:'generate',id:token,item});
        });
        current();url=this.urls.createObjectURL(encodeWav(output.samples,output.sr));
      }
    } else throw Error('Unknown narration model.');
    this.cache.set(cacheKey,url);
    if(this.cache.size>4){const first=this.cache.keys().next().value;this.urls.revokeObjectURL(this.cache.get(first));this.cache.delete(first);}
    }
    current();this.audio.src=url;this.audio.hidden=false;this.audio.playbackRate=typeof rate==='function'?rate():rate;
    this.progress(`${engine==='parler'?'Parler TTS':'Kokoro browser'} · ${item.title}`);
    await new Promise((resolve,reject)=>{
      const cleanup=()=>{this.audio.removeEventListener('ended',ended);this.audio.removeEventListener('error',failed);if(this.rejectPending===cancel)this.rejectPending=null;};
      const ended=()=>{cleanup();resolve();};
      const failed=()=>{cleanup();reject(Error('Audio could not be played. Retry or choose the other model.'));};
      const cancel=error=>{cleanup();reject(error);};this.rejectPending=cancel;
      this.audio.addEventListener('ended',ended);this.audio.addEventListener('error',failed);
      this.audio.play().catch(error=>{cleanup();reject(error);});
    });
    current();
  }
  dispose(){this.stop();this.worker?.terminate();this.worker=null;for(const url of this.cache.values())this.urls.revokeObjectURL(url);this.cache.clear();}
}
