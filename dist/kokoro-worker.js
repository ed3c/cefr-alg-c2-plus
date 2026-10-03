let tts;
self.onmessage = async ({data}) => {
  if(data.type!=='generate') return;
  try {
    const started=performance.now();
    if(!tts){
      const {KokoroTTS}=await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js');
      tts=await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{
        device:'wasm',dtype:'q8',progress_callback:p=>self.postMessage({type:'progress',id:data.id,text:p.status==='progress'?`Downloading model: ${Math.round(p.progress||0)}%`:'Preparing browser model…'})
      });
    }
    const load_ms=performance.now()-started;const generationStart=performance.now();
    const voices=['af_heart','am_michael'];const speakers=[...new Set(data.item.lines.map(l=>l[0]))];
    let chunks=[],length=0,sr=24000;
    for(const [speaker,text] of data.item.lines){
      const a=await tts.generate(text,{voice:voices[speakers.indexOf(speaker)%2]});
      sr=a.sampling_rate;chunks.push(a.audio);length+=a.audio.length;
      const pause=new Float32Array(Math.round(sr*.25));chunks.push(pause);length+=pause.length;
    }
    chunks.pop();length-=Math.round(sr*.25);
    const samples=new Float32Array(length);let offset=0;for(const c of chunks){samples.set(c,offset);offset+=c.length;}
    self.postMessage({type:'complete',id:data.id,load_ms,generation_ms:performance.now()-generationStart,samples,sr,voices:speakers.map((_,i)=>voices[i%2])},[samples.buffer]);
  }catch(e){self.postMessage({type:'error',id:data.id,text:e.message});}
};
