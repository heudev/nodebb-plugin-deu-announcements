'use strict';
const assert = require('assert');
const { sources, getById, getEnabled } = require('../lib/sources');

describe('sources registry', () => {
  it('en az ana site + birkaç fakülte var', () => {
    assert.ok(sources.length >= 4);
    assert.ok(sources.some(s => s.id === 'main'));
  });
  it('her kaynak zorunlu alanlara sahip', () => {
    for (const s of sources) {
      assert.ok(s.id && s.name && s.faculty, `eksik alan: ${JSON.stringify(s)}`);
      assert.ok(['rss', 'html'].includes(s.type), `geçersiz type: ${s.id}`);
      assert.ok(/^https?:\/\//.test(s.url), `geçersiz url: ${s.id}`);
      if (s.type === 'html') {
        assert.ok(s.selectors && s.selectors.item, `html kaynağında selectors.item yok: ${s.id}`);
      }
    }
  });
  it('id\'ler benzersiz', () => {
    const ids = sources.map(s => s.id);
    assert.strictEqual(new Set(ids).size, ids.length);
  });
  it('getById çalışır', () => {
    assert.strictEqual(getById('main').id, 'main');
    assert.strictEqual(getById('yok'), null);
  });
  it('getEnabled disabledIds ile filtreler', () => {
    const all = getEnabled([]);
    const filtered = getEnabled(['main']);
    assert.ok(all.length > filtered.length);
    assert.ok(!filtered.some(s => s.id === 'main'));
  });
});
