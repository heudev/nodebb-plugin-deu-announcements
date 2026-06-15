'use strict';
const { fetchSource } = require('./fetcher');
const { parseHtml, parseRss } = require('./parser');

// Tüm kaynakları izole, eşzamanlılık sınırlı çeker (tüm kaynakları aynı anda
// çekmek sunucuları yorup timeout'a yol açıyordu). Döner:
//   { announcements: [...sıralı], status: { [id]: {ok, count?|error} } }
async function aggregate(sources, deps = {}) {
  const fetchSrc = deps.fetchSource || fetchSource;
  const concurrency = Math.max(1, deps.concurrency || 8);
  const results = new Array(sources.length);

  let next = 0;
  async function worker() {
    while (next < sources.length) {
      const i = next++;
      const source = sources[i];
      try {
        const raw = await fetchSrc(source, deps);
        const items = source.type === 'rss' ? await parseRss(raw, source) : parseHtml(raw, source);
        results[i] = { ok: true, items };
      } catch (err) {
        results[i] = { ok: false, error: String((err && err.message) || err) };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, sources.length) }, worker));

  const announcements = [];
  const status = {};
  results.forEach((r, i) => {
    const source = sources[i];
    if (r.ok) {
      announcements.push(...r.items);
      status[source.id] = { ok: true, count: r.items.length };
    } else {
      status[source.id] = { ok: false, error: r.error };
    }
  });
  announcements.sort((a, b) => b.date - a.date);
  return { announcements, status };
}

module.exports = { aggregate };
