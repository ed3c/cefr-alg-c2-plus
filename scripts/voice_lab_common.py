"""Shared, dependency-free input validation and environment configuration."""
import hashlib
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / '.voice-lab'
ENGINE_IDS = ('parler', 'kokoro', 'qwen', 'pocket', 'litert-kokoro')
MODELS = {
    'parler': ('parler-tts/parler-tts-mini-v1', '0392b9451a601e528fd863bbb0598431fee810d9'),
    'kokoro': ('hexgrad/Kokoro-82M', 'f3ff3571791e39611d31c381e3a41a3af07b4987'),
    'qwen': ('Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice', '0c0e3051f131929182e2c023b9537f8b1c68adfe'),
    'pocket': ('kyutai/pocket-tts', '3e82814a68665eec246ff649b14c71331f955c06'),
}

def python_for(engine):
    return STATE / 'venvs' / engine / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')

def validate_case(item):
    if not isinstance(item, dict) or not isinstance(item.get('id'), str) or not item['id'] or len(item['id']) > 100:
        raise ValueError('A script ID is required.')
    lines = item.get('lines')
    if not isinstance(lines, list) or not 1 <= len(lines) <= 50:
        raise ValueError('A script must contain 1–50 lines.')
    for line in lines:
        if not isinstance(line, list) or len(line) != 2 or any(not isinstance(x, str) or not x.strip() or any(ord(c) < 32 for c in x) for x in line):
            raise ValueError('Each line needs a speaker and text, without control characters.')
        if len(line[0]) > 100 or len(line[1]) > 1500:
            raise ValueError('Speaker or line is too long.')
    text = '\n'.join(f'{speaker}: {text}' for speaker, text in lines)
    if len(text) > 10000:
        raise ValueError('Script exceeds 10,000 characters.')
    digest = hashlib.sha256(text.encode('utf-8')).hexdigest()
    if item.get('input_sha256', digest) != digest:
        raise ValueError('Script checksum does not match its text.')
    return digest

def environment():
    env = os.environ.copy()
    env.setdefault('HF_HOME', str(STATE / 'models'))
    env.setdefault('TOKENIZERS_PARALLELISM', 'false')
    env.setdefault('OMP_NUM_THREADS', '4')
    return env
