'use strict';

const DEFAULT_TIMEOUT = 15000;
const UA = 'NodeBB-DEU-Announcements/0.1 (+https://github.com/heudev)';

// Tek kaynağı çeker, gövde metnini döner. deps.fetch test için enjekte edilebilir.
async function fetchSource(source, deps = {}) {
  const doFetch = deps.fetch || globalThis.fetch;
  const timeout = deps.timeout || DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await doFetch(source.url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/xml,application/rss+xml' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${source.url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchSource };
