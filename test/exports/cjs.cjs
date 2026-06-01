const assert = require('node:assert/strict');
const Analytics = require('../../dist/index.cjs');

assert.equal(typeof Analytics, 'function');
assert.equal(Analytics.default, Analytics);
assert.equal(Analytics.OstrioWebAnalytics, Analytics);
assert.equal(Analytics.Transport.Fetch, 'fetch');
assert.equal(Analytics.Transport.Beacon, 'beacon');
assert.equal(Analytics.Transport.Img, 'img');
assert.deepEqual(Analytics.SUPPORTED_TRANSPORTS, [Analytics.Transport.Fetch, Analytics.Transport.Beacon, Analytics.Transport.Img]);
