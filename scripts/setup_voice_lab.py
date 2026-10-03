"""Install independent Python environments; no inference service or API key."""
import argparse
import subprocess
import sys
import venv
from voice_lab_common import STATE, ENGINE_IDS, python_for

PACKAGES = {
    'parler': ['parler-tts==0.2.3', 'transformers==4.46.1', 'accelerate==1.12.0'],
    'kokoro': ['kokoro==0.9.4', 'transformers==4.51.3', 'misaki[en]==0.9.4',
               'https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl'],
    'qwen': ['qwen-tts==0.1.1', 'transformers==4.57.3', 'accelerate==1.12.0'],
    'pocket': ['pocket-tts==3.3.0'],
    'litert-kokoro': [],
}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('engine', choices=ENGINE_IDS)
    parser.add_argument('--cuda', action='store_true', help='Use the default torch index instead of CPU-only wheels.')
    args = parser.parse_args()
    path = STATE / 'venvs' / args.engine
    venv.EnvBuilder(with_pip=True).create(path)
    command = [str(python_for(args.engine)), '-m', 'pip', 'install']
    if args.engine != 'litert-kokoro':
        torch = ['torch==2.6.0', 'torchaudio==2.6.0']
        if not args.cuda and sys.platform == 'linux':
            torch += ['--index-url', 'https://download.pytorch.org/whl/cpu']
        subprocess.run(command + torch, check=True)
    subprocess.run(command + ['numpy', 'soundfile==0.14.0'] + PACKAGES[args.engine], check=True)
    print(f'Installed {args.engine}. Weights download on first generation.')
    if args.engine == 'pocket':
        print('Uses Kyutai public preset-voice weights. No voice cloning or access token.')
    if args.engine == 'litert-kokoro':
        print('Also build native/litert runner and set ALG_LITERT_RUNNER and ALG_LITERT_MODEL. See docs/VOICE_LAB.md.')

if __name__ == '__main__':
    main()
