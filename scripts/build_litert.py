"""Build the native adapter against one reviewed upstream source revision."""
import shutil
import subprocess
from voice_lab_common import ROOT, STATE

REVISION = 'd17a52fd5c2b4ce1280959309af175caebaac2c3'

def main():
    target = STATE / 'LiteRT-LM'
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        subprocess.run(['git', 'clone', '--no-checkout', 'https://github.com/google-ai-edge/LiteRT-LM.git', str(target)], check=True)
    subprocess.run(['git', 'checkout', '--detach', REVISION], cwd=target, check=True)
    shutil.copytree(ROOT / 'native/litert', target / 'voice_lab', dirs_exist_ok=True)
    bazel = shutil.which('bazelisk') or shutil.which('bazel')
    if not bazel:
        raise SystemExit('Install Bazelisk (upstream uses Bazel 7.6.1), then rerun. See docs/VOICE_LAB.md.')
    subprocess.run([bazel, 'build', '-c', 'opt', '--jobs=4', '//voice_lab:voice_lab'], cwd=target, check=True)
    print(f'ALG_LITERT_RUNNER={target}/bazel-bin/voice_lab/voice_lab')

if __name__ == '__main__':
    main()
