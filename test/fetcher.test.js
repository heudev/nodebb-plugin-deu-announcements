'use strict';
const assert = require('assert');
const { fetchSource } = require('../lib/fetcher');

const src = { id: 'x', url: 'https://example.com/' };

describe('fetchSource', () => {
  it('gövde metnini döner', async () => {
    const fakeFetch = async () => ({ ok: true, status: 200, text: async () => '<html>ok</html>' });
    const out = await fetchSource(src, { fetch: fakeFetch });
    assert.strictEqual(out, '<html>ok</html>');
  });
  it('non-2xx → hata fırlatır', async () => {
    const fakeFetch = async () => ({ ok: false, status: 503, text: async () => '' });
    await assert.rejects(() => fetchSource(src, { fetch: fakeFetch }), /503/);
  });
  it('fetch reddederse hatayı yukarı taşır', async () => {
    const fakeFetch = async () => { throw new Error('ECONNREFUSED'); };
    await assert.rejects(() => fetchSource(src, { fetch: fakeFetch }), /ECONNREFUSED/);
  });
});
