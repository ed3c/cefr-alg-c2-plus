"""Loopback-only static server and serial, cancellable local generation jobs."""
import argparse
import json
import os
import signal
import subprocess
import threading
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from voice_lab_common import ROOT, STATE, ENGINE_IDS, environment, python_for, validate_case

jobs = {}
lock = threading.Lock()

def engine_health():
    states = {}
    for engine in ENGINE_IDS:
        ready = python_for(engine).exists()
        message = 'Ready for local generation.' if ready else f'Run: python3 scripts/setup_voice_lab.py {engine}'
        if engine == 'litert-kokoro' and not (os.environ.get('ALG_LITERT_RUNNER') and os.environ.get('ALG_LITERT_MODEL')):
            ready, message = False, 'Native runner and model assets are not configured. See setup guide.'
        states[engine] = {'ready':ready, 'message':message}
    return states

def finish(job):
    job['process'].wait()
    job['log'].close()
    with lock:
        if job['status'] == 'cancelled':
            return
        result_files = list(job['dir'].glob('*.json'))
        if job['process'].returncode == 0 and len(result_files) == 1:
            job['result'] = json.loads(result_files[0].read_text())
            job['status'] = 'complete'
        else:
            job['status'] = 'failed'
            job['error'] = (job['dir'] / 'run.log').read_text(errors='replace')[-2500:] or 'Generation failed; see local log.'

def stop(job):
    if job['status'] == 'running':
        job['status'] = 'cancelled'
        try:
            if os.name == 'posix':
                os.killpg(job['process'].pid, signal.SIGTERM)
            else:
                job['process'].terminate()
        except ProcessLookupError:
            pass
        def force_stop():
            try:
                job['process'].wait(timeout=3)
            except subprocess.TimeoutExpired:
                try:
                    if os.name == 'posix':
                        os.killpg(job['process'].pid, signal.SIGKILL)
                    else:
                        job['process'].kill()
                except ProcessLookupError:
                    pass
        threading.Thread(target=force_stop, daemon=True).start()

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / 'dist'), **kwargs)

    def allowed(self, mutation=False):
        authority = self.headers.get('Host', '')
        if authority not in {f'localhost:{self.server.server_port}', f'127.0.0.1:{self.server.server_port}'}:
            self.error(403, 'Loopback Host required.')
            return False
        origin = self.headers.get('Origin')
        if (mutation and origin is None) or (origin and origin != f'http://{authority}'):
            self.error(403, 'Same-origin request required.')
            return False
        return True

    def reply(self, status, value):
        content = json.dumps(value).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(content)

    def error(self, status, message):
        self.reply(status, {'error':message})

    def do_GET(self):
        if not self.allowed():
            return
        path = urlparse(self.path).path
        if path == '/api/health':
            return self.reply(200, {'engines':engine_health()})
        if path.startswith('/api/jobs/'):
            parts = path.split('/')
            with lock:
                job = jobs.get(parts[3])
                if not job:
                    return self.error(404, 'Unknown job.')
                if len(parts) == 5 and parts[4] == 'audio' and job['status'] == 'complete':
                    data = (job['dir'] / job['result']['audio_file']).read_bytes()
                    self.send_response(200)
                    self.send_header('Content-Type', 'audio/wav')
                    self.send_header('Content-Length', str(len(data)))
                    self.end_headers()
                    return self.wfile.write(data)
                if len(parts) != 4:
                    return self.error(404, 'No audio for this job.')
                return self.reply(200, {k:job[k] for k in ('id','status','result','error','audio_url') if k in job})
        if path.startswith('/api/'):
            return self.error(404, 'Unknown endpoint.')
        super().do_GET()

    def do_POST(self):
        if not self.allowed(mutation=True):
            return
        if self.path != '/api/jobs':
            return self.error(404, 'Unknown endpoint.')
        try:
            if self.headers.get_content_type() != 'application/json':
                raise ValueError('JSON body required.')
            size = int(self.headers.get('Content-Length', 0))
            if not 0 < size <= 64000:
                raise ValueError('Body must be 1–64,000 bytes.')
            data = json.loads(self.rfile.read(size))
            engine, item = data['engine'], data['item']
            if engine not in ENGINE_IDS:
                raise ValueError('Unknown engine.')
            validate_case(item)
        except (ValueError, KeyError, TypeError) as e:
            return self.error(400, str(e))
        with lock:
            if any(j['status'] == 'running' or j['process'].poll() is None for j in jobs.values()):
                return self.error(409, 'Another model is running. Wait or cancel it first.')
            if not engine_health()[engine]['ready']:
                return self.error(409, engine_health()[engine]['message'])
            job_id = uuid.uuid4().hex
            directory = STATE / 'jobs' / job_id
            directory.mkdir(parents=True)
            script = directory / 'script.input'
            script.write_text(json.dumps(item), encoding='utf-8')
            log = (directory / 'run.log').open('w')
            try:
                process = subprocess.Popen([str(python_for(engine)), str(ROOT / 'scripts/generate_voice.py'), engine, str(script), '--output', str(directory)], cwd=ROOT, env=environment(), stdout=log, stderr=log, start_new_session=(os.name == 'posix'))
            except OSError as e:
                log.close()
                return self.error(500, str(e))
            job = dict(id=job_id, status='running', process=process, dir=directory, log=log, audio_url=f'/api/jobs/{job_id}/audio')
            jobs[job_id] = job
            threading.Thread(target=finish, args=(job,), daemon=True).start()
        self.reply(202, {'id':job_id})

    def do_DELETE(self):
        if not self.allowed(mutation=True):
            return
        with lock:
            job = jobs.get(self.path.removeprefix('/api/jobs/')) if self.path.startswith('/api/jobs/') else None
            if not job:
                return self.error(404, 'Unknown job.')
            stop(job)
        self.reply(200, {'status':job['status']})

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'Voice Lab: http://127.0.0.1:{args.port}/compare.html', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        with lock:
            for job in jobs.values():
                stop(job)
        server.server_close()
