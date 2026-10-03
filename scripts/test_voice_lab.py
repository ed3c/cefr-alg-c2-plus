"""Verify the loopback job boundary without downloading or faking model output."""
import http.client
import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from voice_lab_common import validate_case
from voice_lab_server import Handler

class VoiceLabTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        cls.port = cls.server.server_port
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def request(self, method, path, value=None, **headers):
        connection = http.client.HTTPConnection('127.0.0.1', self.port)
        data = json.dumps(value) if value is not None else None
        defaults = {'Content-Type':'application/json', 'Origin':f'http://127.0.0.1:{self.port}'}
        defaults.update(headers)
        connection.request(method, path, data, defaults)
        response = connection.getresponse()
        code, body = response.status, response.read()
        connection.close()
        return code, body

    def test_static_and_health(self):
        self.assertEqual(self.request('GET', '/compare.html')[0], 200)
        code, body = self.request('GET', '/api/health')
        self.assertEqual(code, 200)
        self.assertIn('kokoro', json.loads(body)['engines'])

    def test_rebinding_and_cross_origin_rejected(self):
        self.assertEqual(self.request('GET', '/api/health', Host='attacker.example')[0], 403)
        self.assertEqual(self.request('POST', '/api/jobs', {}, Origin='https://attacker.example')[0], 403)
        self.assertEqual(self.request('DELETE', '/api/jobs/unknown', Origin='null')[0], 403)

    def test_job_input_boundary(self):
        self.assertEqual(self.request('POST','/api/jobs',{'engine':'arbitrary-command','item':{}})[0],400)
        self.assertEqual(self.request('POST','/api/jobs',{'engine':'kokoro','item':{'id':'x','lines':[['A','text\ncontrol']]}})[0],400)
        self.assertEqual(self.request('GET','/api/jobs/unknown')[0],404)
        self.assertEqual(self.request('POST','/api/unknown',{})[0],404)

    def test_checksum_matches_browser_contract(self):
        item={'id':'quick','lines':[['Maya','Can we release tomorrow?'],['Alex','The sandbox test passed, but the duplicate charge remains unresolved.']]}
        self.assertEqual(validate_case(item),'d833c4c0e287ead954af5426103abc1391c84080e9324db467401f7e73ce192c')
        item['input_sha256']='wrong'
        with self.assertRaises(ValueError):validate_case(item)

if __name__=='__main__':
    unittest.main()
