'use strict';
const { fetchSource } = require('./fetcher');
const { parseHtml, parseRss } = require('./parser');

// Tüm kaynakları paralel + izole çeker.
// Döner: { announcements: [...sıralı], status: { [id]: {ok, count?|error} } }
async function aggregate(sources, deps = {}) {
  const fetchSrc = deps.fetchSource || fetchSource;
  const settled = await Promise.allSettled(sources.map(async (source) => {
    const raw = await fetchSrc(source, deps);
    const items = source.type === 'rss' ? await parseRss(raw, source) : parseHtml(raw, source);
    return items;
  }));

  const announcements = [];
  const status = {};
  settled.forEach((r, i) => {
    const source = sources[i];
    if (r.status === 'fulfilled') {
      announcements.push(...r.value);
      status[source.id] = { ok: true, count: r.value.length };
    } else {
      const err = r.reason;
      status[source.id] = { ok: false, error: String((err && err.message) || err) };
    }
  });
  announcements.sort((a, b) => b.date - a.date);
  return { announcements, status };
}

module.exports = { aggregate };
