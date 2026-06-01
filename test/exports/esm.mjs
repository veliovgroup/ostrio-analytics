import assert from 'node:assert/strict';
import Analytics, { OstrioWebAnalytics, SUPPORTED_TRANSPORTS, Transport } from '../../dist/index.js';

assert.equal(typeof Analytics, 'function');
assert.equal(Analytics, OstrioWebAnalytics);
assert.equal(Transport.Fetch, 'fetch');
assert.equal(Transport.Beacon, 'beacon');
assert.equal(Transport.Img, 'img');
assert.deepEqual(SUPPORTED_TRANSPORTS, [Transport.Fetch, Transport.Beacon, Transport.Img]);
