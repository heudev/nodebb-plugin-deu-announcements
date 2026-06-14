'use strict';
const assert = require('assert');
const scheduler = require('../lib/scheduler');

describe('scheduler.runOnce', () => {
  it('aggregate sonucunu store\'a yazar', async () => {
    const calls = [];
    const deps = {
      sources: [{ id: 'a' }],
      aggregate: async (srcs) => { calls.push(srcs); return { announcements: [], status: { a: { ok: true, count: 0 } } }; },
      store: { update: (r) => calls.push(r) },
    };
    const result = await scheduler.runOnce(deps);
    assert.strictEqual(result.status.a.ok, true);
    assert.strictEqual(calls.length, 2); // aggregate + store.update
  });
});
