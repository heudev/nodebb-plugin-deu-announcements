'use strict';
const assert = require('assert');
const store = require('../lib/store');

function item(sourceId, title, date) {
  return { sourceId, sourceName: sourceId, faculty: sourceId, title, link: 'x', date, summary: '' };
}

describe('store', () => {
  beforeEach(() => store.reset());

  it('başarılı sonucu saklar ve birleştirir', () => {
    store.update({
      announcements: [item('a', 'A1', 200), item('b', 'B1', 100)],
      status: { a: { ok: true, count: 1 }, b: { ok: true, count: 1 } },
    });
    const out = store.get();
    assert.strictEqual(out.length, 2);
    assert.strictEqual(out[0].title, 'A1'); // tarihe göre sıralı
  });

  it('kaynak çökerse eski verisini korur (stale-while-error)', () => {
    store.update({
      announcements: [item('a', 'A1', 200), item('b', 'B1', 100)],
      status: { a: { ok: true, count: 1 }, b: { ok: true, count: 1 } },
    });
    // ikinci çekimde a çöküyor, b güncelleniyor
    store.update({
      announcements: [item('b', 'B2', 300)],
      status: { a: { ok: false, error: 'boom' }, b: { ok: true, count: 1 } },
    });
    const titles = store.get().map(x => x.title);
    assert.ok(titles.includes('A1'), 'eski A1 korunmalı');
    assert.ok(titles.includes('B2'), 'yeni B2 olmalı');
    assert.ok(!titles.includes('B1'), 'eski B1 değişmeli');
  });

  it('getStatus son çalışmayı döner', () => {
    store.update({ announcements: [], status: { a: { ok: true, count: 0 } } });
    assert.ok(store.getStatus().time > 0);
    assert.strictEqual(store.getStatus().status.a.ok, true);
  });
});
