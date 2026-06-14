'use strict';
const assert = require('assert');
const parseTurkishDate = require('../lib/util/parseTurkishDate');

describe('parseTurkishDate', () => {
  it('"13 Haziran 2026" ayrıştırır', () => {
    assert.strictEqual(parseTurkishDate('13 Haziran 2026'), Date.UTC(2026, 5, 13));
  });
  it('"01.02.2026" (gg.aa.yyyy) ayrıştırır', () => {
    assert.strictEqual(parseTurkishDate('01.02.2026'), Date.UTC(2026, 1, 1));
  });
  it('boşlukları/fazla metni tolere eder', () => {
    assert.strictEqual(parseTurkishDate('  5 Ocak 2025 '), Date.UTC(2025, 0, 5));
  });
  it('tanınmayan metin → 0', () => {
    assert.strictEqual(parseTurkishDate('yakında'), 0);
  });
  it('boş/undefined → 0', () => {
    assert.strictEqual(parseTurkishDate(''), 0);
    assert.strictEqual(parseTurkishDate(undefined), 0);
  });
});
