'use strict';

const MONTHS = {
  ocak: 0, şubat: 1, subat: 1, mart: 2, nisan: 3, mayıs: 4, mayis: 4,
  haziran: 5, temmuz: 6, ağustos: 7, agustos: 7, eylül: 8, eylul: 8,
  ekim: 9, kasım: 10, kasim: 10, aralık: 11, aralik: 11,
};

// "13 Haziran 2026" veya "13.06.2026" → epoch ms (UTC). Tanınmazsa 0.
module.exports = function parseTurkishDate(text) {
  if (!text || typeof text !== 'string') return 0;
  const s = text.trim().toLowerCase();

  // gg.aa.yyyy veya gg/aa/yyyy
  const numeric = s.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (numeric) {
    const [, d, m, y] = numeric;
    return Date.UTC(Number(y), Number(m) - 1, Number(d));
  }

  // gg Ay yyyy
  const named = s.match(/(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{4})/);
  if (named) {
    const [, d, monthName, y] = named;
    const m = MONTHS[monthName];
    if (m !== undefined) return Date.UTC(Number(y), m, Number(d));
  }
  return 0;
};
