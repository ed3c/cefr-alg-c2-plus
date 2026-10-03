"""Generate one complete comparison result. Failed jobs never create a result JSON."""
import argparse
import hashlib
import importlib.metadata
import json
import os
import platform
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from voice_lab_common import ENGINE_IDS, MODELS, environment, validate_case

def generate(engine, item, output, device='cpu', seed=42):
    digest = validate_case(item)
    os.environ.update(environment())
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    start = time.perf_counter()
    import numpy as np
    import soundfile as sf
    speakers = list(dict.fromkeys(s for s, _ in item['lines']))
    voices = {}
    instruction = 'Calm, clear conversational English, with natural pauses and a measured pace.'
    extra = {}
    chunks = []
    if engine == 'litert-kokoro':
        runner, model_path = os.environ.get('ALG_LITERT_RUNNER'), os.environ.get('ALG_LITERT_MODEL')
        if not runner or not model_path:
            raise RuntimeError('Set ALG_LITERT_RUNNER and ALG_LITERT_MODEL to a built runner and compatible Kokoro assets.')
        voices = {s: ['af_heart', 'am_michael'][i % 2] for i, s in enumerate(speakers)}
        with tempfile.TemporaryDirectory() as tmp:
            script = Path(tmp) / 'input.tsv'
            script.write_text('\n'.join(f'{voices[s]}\t{t}' for s, t in item['lines']), encoding='utf-8')
            subprocess.run([runner, model_path, str(script), tmp], check=True)
            timing = json.loads((Path(tmp) / 'timing.json').read_text())
            for i in range(len(item['lines'])):
                a, rate = sf.read(Path(tmp) / f'{i}.wav', dtype='float32')
                if i and rate != sr:
                    raise RuntimeError('Sample rates differ between lines.')
                sr = rate
                chunks.append(a)
        load_ms, generation_ms = timing['load_ms'], timing['generation_ms']
        model, revision = 'Kokoro / user-supplied LiteRT assets', 'user-supplied; see asset checksums'
        extra['asset_sha256'] = {str(p.relative_to(Path(model_path).parent if Path(model_path).is_file() else model_path)): hashlib.sha256(p.read_bytes()).hexdigest() for p in ([Path(model_path)] if Path(model_path).is_file() else sorted(Path(model_path).rglob('*'))) if p.is_file()}
        extra['runner_sha256'] = hashlib.sha256(Path(runner).read_bytes()).hexdigest()
    else:
        import torch
        torch.set_num_threads(4)
        torch.manual_seed(seed)
        model, revision = MODELS[engine]
        if engine == 'parler':
            from parler_tts import ParlerTTSForConditionalGeneration
            from transformers import AutoTokenizer
            net = ParlerTTSForConditionalGeneration.from_pretrained(model, revision=revision).to(device).eval()
            tokenizer = AutoTokenizer.from_pretrained(model, revision=revision)
            sr = net.config.sampling_rate
            voices = {s: ['Laura', 'Jon'][i % 2] for i, s in enumerate(speakers)}
            def synth(s, text):
                description = f'{voices[s]} speaks at a moderate pace with a clear, natural conversational tone. The recording is very clear with no background noise.'
                desc = tokenizer(description, return_tensors='pt').to(device)
                prompt = tokenizer(text, return_tensors='pt').to(device)
                with torch.inference_mode():
                    a = net.generate(input_ids=desc.input_ids, attention_mask=desc.attention_mask,
                        prompt_input_ids=prompt.input_ids, prompt_attention_mask=prompt.attention_mask)
                return a.cpu().float().numpy().squeeze()
            extra['delivery'] = 'Laura / Jon; moderate pace, clear natural tone, no background noise'
        elif engine == 'kokoro':
            from huggingface_hub import hf_hub_download
            from kokoro import KModel, KPipeline
            def file(name):
                return hf_hub_download(model, name, revision=revision)
            net = KModel(repo_id=model, config=file('config.json'), model=file('kokoro-v1_0.pth')).to(device).eval()
            pipeline = KPipeline(lang_code='a', model=net, device=device, repo_id=model)
            voices = {s: ['af_heart', 'am_michael'][i % 2] for i, s in enumerate(speakers)}
            voice_data = {v: torch.load(file(f'voices/{v}.pt'), weights_only=True, map_location=device) for v in set(voices.values())}
            sr = 24000
            def synth(s, text):
                return np.concatenate([a.cpu().float().numpy() for _, _, a in pipeline(text, voice=voice_data[voices[s]], speed=1)])
        elif engine == 'qwen':
            from qwen_tts import Qwen3TTSModel
            dtype = torch.bfloat16 if device == 'cpu' else torch.float16
            net = Qwen3TTSModel.from_pretrained(model, revision=revision, device_map=device, dtype=dtype, attn_implementation='sdpa')
            voices = {s: ['Ryan', 'Aiden'][i % 2] for i, s in enumerate(speakers)}
            extra.update(delivery=instruction, precision=str(dtype), tokenizer_revision='upstream dependency resolved by Qwen package')
            def synth(s, text):
                nonlocal sr
                audio, sr = net.generate_custom_voice(text=text, language='English', speaker=voices[s], instruct=instruction)
                return np.asarray(audio[0], dtype=np.float32)
        elif engine == 'pocket':
            from pocket_tts import TTSModel
            import pocket_tts
            # Use the publisher's explicitly public preset-voice checkpoint.
            # No gated voice-cloning weights and no third-party mirrors.
            config_path = Path(pocket_tts.__file__).parent / 'config/english_2026-01.yaml'
            config_text = config_path.read_text()
            import yaml
            config = yaml.safe_load(config_text)
            config['weights_path'] = config['weights_path_without_voice_cloning']
            with tempfile.TemporaryDirectory() as tmp:
                custom = Path(tmp) / 'public.yaml'
                custom.write_text(yaml.safe_dump(config))
                net = TTSModel.load_model(config=custom)
            net.has_voice_cloning = False
            voices = {s: ['alba', 'marius'][i % 2] for i, s in enumerate(speakers)}
            from pocket_tts.utils.utils import get_predefined_voice
            states = {v: net.get_state_for_audio_prompt(get_predefined_voice('english_2026-01', v)) for v in set(voices.values())}
            sr = net.sample_rate
            model = 'kyutai/pocket-tts-without-voice-cloning'
            revision = 'd29db7978e464fb90cb3359ee0c69a273b9142cc'
            extra['config'] = 'pocket-tts 3.3.0 / english_2026-01; public preset voices only'
            def synth(s, text):
                return net.generate_audio(states[voices[s]], text).cpu().float().numpy().squeeze()
        load_ms = (time.perf_counter() - start) * 1000
        start = time.perf_counter()
        for i, (speaker, text) in enumerate(item['lines']):
            print(f'Generating line {i+1}/{len(item["lines"])}', flush=True)
            a = synth(speaker, text)
            if a.ndim != 1 or not a.size or not np.isfinite(a).all():
                raise RuntimeError('Model returned invalid audio.')
            chunks.append(a)
        generation_ms = (time.perf_counter() - start) * 1000
    joined = []
    for i, chunk in enumerate(chunks):
        if i:
            joined.append(np.zeros(round(sr * .25), dtype=np.float32))
        joined.append(chunk)
    audio = np.concatenate(joined)
    audio_seconds = len(audio) / sr
    stem = f'{engine}-{digest[:12]}'
    wav = output / f'{stem}.wav'
    sf.write(wav, audio, sr, subtype='PCM_16')
    packages = {}
    for name in ('torch', 'transformers', 'parler-tts', 'kokoro', 'qwen-tts', 'pocket-tts', 'soundfile'):
        try:
            packages[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            pass
    result = dict(schema=1, engine=engine, case_id=item['id'], input_sha256=digest,
        audio_file=wav.name, audio_sha256=hashlib.sha256(wav.read_bytes()).hexdigest(),
        load_ms=load_ms, generation_ms=generation_ms, audio_seconds=audio_seconds,
        rtf=generation_ms/1000/audio_seconds, voices=[{'speaker':s,'voice':v} for s,v in voices.items()],
        runtime=f'{engine} / {device}', model=model, model_revision=revision, seed=seed,
        sample_rate=sr, gap_seconds=.25, device=device, packages=packages,
        platform=platform.platform(), cpu=platform.processor(), threads=4,
        created_at=datetime.now(timezone.utc).isoformat(), **extra)
    (output / f'{stem}.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result), flush=True)
    return result

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('engine', choices=ENGINE_IDS)
    parser.add_argument('script', type=Path)
    parser.add_argument('--output', type=Path, default=Path('.voice-lab/results'))
    parser.add_argument('--device', choices=['cpu', 'cuda', 'mps'], default='cpu')
    args = parser.parse_args()
    generate(args.engine, json.loads(args.script.read_text(encoding='utf-8')), args.output, args.device)
