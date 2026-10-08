import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment, sameOrigin } from '../lib/environment.mjs';
test('production API requires explicit safe URL', () => {
  for (const value of ['', 'http://localhost:3000/api/v1', 'https://api.example.invalid/api/v1', 'https://api.example.com/api/v1']) assert.throws(() => validateEnvironment({ NODE_ENV: 'production', API_BASE_URL: value }));
  assert.doesNotThrow(() => validateEnvironment({ NODE_ENV: 'production', API_BASE_URL: 'https://api.homes-fixture.co.ug/api/v1' }));
  assert.doesNotThrow(() => validateEnvironment({ NODE_ENV: 'production', HOMES_BUILD_PROFILE: 'local', API_BASE_URL: 'http://127.0.0.1:3000/api/v1' }));
});
test('cookie-authenticated mutations require the same origin', () => {
  assert.equal(sameOrigin(new Request('https://admin.homes-fixture.co.ug/api/auth/login', { headers: { Origin: 'https://admin.homes-fixture.co.ug' } })), true);
  for (const origin of ['https://evil.homes-fixture.co.ug', 'null', '']) assert.equal(sameOrigin(new Request('https://admin.homes-fixture.co.ug/api/auth/login', { headers: { Origin: origin } })), false);
});
