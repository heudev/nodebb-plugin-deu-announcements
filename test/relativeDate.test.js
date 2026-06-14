'use strict';
const assert = require('assert');
const relativeDate = require('../lib/util/relativeDate');

const NOW = 1_700_000_000_000; // sabit referans
const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;

describe('relativeDate', () => {
  it('1 dakikadan yeni → "az önce"', () => {
    assert.strictEqual(relativeDate(NOW - 30 * 1000, NOW), 'az önce');
  });
  it('dakikalar', () => {
    assert.strictEqual(relativeDate(NOW - 5 * MIN, NOW), '5 dakika önce');
  });
  it('saatler', () => {
    assert.strictEqual(relativeDate(NOW - 3 * HOUR, NOW), '3 saat önce');
  });
  it('1 gün → "dün"', () => {
    assert.strictEqual(relativeDate(NOW - 25 * HOUR, NOW), 'dün');
  });
  it('birkaç gün', () => {
    assert.strictEqual(relativeDate(NOW - 3 * DAY, NOW), '3 gün önce');
  });
  it('1 haftadan eski → mutlak tarih', () => {
    const ts = Date.UTC(2026, 5, 13); // 13 Haziran 2026
    const out = relativeDate(ts, ts + 30 * DAY);
    assert.match(out, /13 Haz 2026/);
  });
});
