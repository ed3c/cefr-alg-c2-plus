"""Generate all studio scenes with the pinned Parler model; no inference service."""
import argparse, hashlib, json, os, subprocess, time, gc
from pathlib import Path
from datetime import datetime, timezone

p=argparse.ArgumentParser();p.add_argument('cases',type=Path);p.add_argument('--output',type=Path,required=True);p.add_argument('--batch-size',type=int,default=4);p.add_argument('--precision',choices=['float32','bfloat16'],default='float32');p.add_argument('--cache',type=Path,default=Path('.voice-lab/parler-lines'));a=p.parse_args()
from voice_lab_common import environment
os.environ.update(environment())
import torch, numpy as np, soundfile as sf
from transformers import AutoTokenizer
from parler_tts import ParlerTTSForConditionalGeneration

torch.set_num_threads(4);torch.manual_seed(42)
model='parler-tts/parler-tts-mini-v1';revision='0392b9451a601e528fd863bbb0598431fee810d9'
a.output.mkdir(parents=True,exist_ok=True);cache=a.cache;cache.mkdir(parents=True,exist_ok=True)
cases=json.loads(a.cases.read_text());jobs={}
for item in cases:
    speakers=list(dict.fromkeys(s for s,t in item['lines']))
    item['keys']=[]
    for speaker,text in item['lines']:
        voice=['Laura','Jon'][speakers.index(speaker)%2]
        key=hashlib.sha256((voice+'\n'+text).encode()).hexdigest()
        jobs[key]=(voice,text);item['keys'].append(key)
pending=[(k,*v) for k,v in jobs.items() if not ((cache/(k+'.wav')).exists() and (cache/(k+'.json')).exists())]
pending.sort(key=lambda v:len(v[2]))
started=time.perf_counter()
net=ParlerTTSForConditionalGeneration.from_pretrained(model,revision=revision,low_cpu_mem_usage=True,torch_dtype=getattr(torch,a.precision)).eval()
tokenizer=AutoTokenizer.from_pretrained(model,revision=revision,padding_side='left')
sr=net.config.sampling_rate;load_ms=(time.perf_counter()-started)*1000
print(f'Loaded in {load_ms/1000:.1f}s; {len(pending)} unique lines pending',flush=True)
for offset in range(0,len(pending),a.batch_size):
    batch=pending[offset:offset+a.batch_size]
    descriptions=[f'{voice} speaks at a moderate pace with a clear, natural conversational tone. The recording is very clear with no background noise.' for key,voice,text in batch]
    desc=tokenizer(descriptions,return_tensors='pt',padding=True)
    prompt=tokenizer([text for key,voice,text in batch],return_tensors='pt',padding=True)
    t=time.perf_counter()
    with torch.inference_mode():
        result=net.generate(input_ids=desc.input_ids,attention_mask=desc.attention_mask,prompt_input_ids=prompt.input_ids,prompt_attention_mask=prompt.attention_mask,return_dict_in_generate=True)
    elapsed=(time.perf_counter()-t)*1000
    for i,(key,voice,text) in enumerate(batch):
        audio=result.sequences[i,:result.audios_length[i]].cpu().float().numpy().squeeze()
        if audio.ndim!=1 or not audio.size or not np.isfinite(audio).all() or np.max(np.abs(audio))<.001:
            raise RuntimeError('Invalid generated audio: '+key)
        sf.write(cache/(key+'.wav'),audio,sr,subtype='PCM_16')
        (cache/(key+'.json')).write_text(json.dumps({'voice':voice,'text':text,'batch_generation_ms':elapsed,'batch_size':len(batch),'precision':a.precision,'audio_seconds':len(audio)/sr}))
    del result, audio, desc, prompt
    gc.collect()
    print(f'{min(offset+a.batch_size,len(pending))}/{len(pending)} lines; batch {elapsed/1000:.1f}s',flush=True)
results=[]
for item in cases:
    chunks=[];traces=[]
    for key in item['keys']:
        audio,rate=sf.read(cache/(key+'.wav'),dtype='float32');assert rate==sr
        if chunks:chunks.append(np.zeros(round(sr*.25),dtype=np.float32))
        chunks.append(audio)
        trace=json.loads((cache/(key+'.json')).read_text());trace.setdefault('precision','float32');trace['pcm_sha256']=hashlib.sha256((cache/(key+'.wav')).read_bytes()).hexdigest();traces.append(trace)
    audio=np.concatenate(chunks);wav=cache/(item['id']+'.wav');sf.write(wav,audio,sr,subtype='PCM_16')
    digest=hashlib.sha256('\n'.join(f'{s}: {t}' for s,t in item['lines']).encode()).hexdigest()
    filename=f'parler-{item["id"]}-{digest[:12]}.mp3';path=a.output/filename
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-codec:a','libmp3lame','-q:a','3',str(path)],check=True)
    results.append({'case_id':item['id'],'engine':'parler','input_sha256':digest,'audio_file':filename,'audio_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'pcm_sha256':hashlib.sha256(wav.read_bytes()).hexdigest(),'audio_seconds':len(audio)/sr,'sample_rate':sr,'turns':traces})
manifest={'schema':1,'model':model,'model_revision':revision,'runtime':'Parler-TTS 0.2.3 / torch 2.6.0 CPU; precision recorded per turn','seed':42,'requested_batch_size':a.batch_size,'batch_sizes_used':sorted({t['batch_size'] for r in results for t in r['turns']}),'load_ms':load_ms,'delivery':'Laura / Jon; moderate pace, clear natural tone, no background noise','encoding':'MP3 libmp3lame quality 3 from PCM16, 250ms between turns','created_at':datetime.now(timezone.utc).isoformat(),'results':results}
(a.output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print('COMPLETE: '+str(len(results))+' scenes',flush=True)
