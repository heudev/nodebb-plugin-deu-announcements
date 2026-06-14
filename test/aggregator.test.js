'use strict';
const assert = require('assert');
const { aggregate } = require('../lib/aggregator');

const A = { id: 'a', name: 'A', faculty: 'a', type: 'html', url: 'https://a/', selectors: { item: 'li' } };
const B = { id: 'b', name: 'B', faculty: 'b', type: 'html', url: 'https://b/', selectors: { item: 'li' } };

describe('aggregate', () => {
  it('bir kaynak çökse de diğeri geçer (izolasyon)', async () => {
    const deps = {
      fetchSource: async (s) => {
        if (s.id === 'a') throw new Error('boom');
        return '<ul><li><a href="https://b/1">B duyuru</a></li></ul>';
      },
    };
    const { announcements, status } = await aggregate([A, B], deps);
    assert.strictEqual(announcements.length, 1);
    assert.strictEqual(announcements[0].sourceId, 'b');
    assert.strictEqual(status.a.ok, false);
    assert.match(status.a.error, /boom/);
    assert.strictEqual(status.b.ok, true);
    assert.strictEqual(status.b.count, 1);
  });
  it('tarihe göre azalan sıralar', async () => {
    const deps = {
      fetchSource: async (s) => s.id === 'a'
        ? '<ul><li><a href="https://a/1">eski</a><time>10 Haziran 2026</time></li></ul>'
        : '<ul><li><a href="https://b/1">yeni</a><time>13 Haziran 2026</time></li></ul>',
    };
    const A2 = { ...A, selectors: { item: 'li', title: 'a', link: 'a', date: 'time' } };
    const B2 = { ...B, selectors: { item: 'li', title: 'a', link: 'a', date: 'time' } };
    const { announcements } = await aggregate([A2, B2], deps);
    assert.strictEqual(announcements[0].title, 'yeni');
    assert.strictEqual(announcements[1].title, 'eski');
  });
});
