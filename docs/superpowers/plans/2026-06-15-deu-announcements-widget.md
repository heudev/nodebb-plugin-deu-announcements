# DEÜ Duyuruları Widget'ı — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dokuz Eylül Üniversitesi'nin ana ve fakülte duyurularını toplayıp NodeBB forumunda sekmeli bir widget olarak gösteren eklenti.

**Architecture:** Sunucu tarafı cron tüm kaynakları (RSS varsa RSS, yoksa HTML scraping) periyodik çeker, normalize eder, bellek içi store'a yazar (kaynak izolasyonu + stale-while-error). Widget render anında store'dan okur ve SSR ile HTML üretir. Client JS yalnızca sekme filtrelemesi yapar.

**Tech Stack:** Node.js (NodeBB ≥ 3.x, Node ≥ 18 — global `fetch`), `cheerio` (HTML parse), `rss-parser` (RSS), `mocha` + node `assert` (test), Less (stil), Benchpress (`.tpl` şablon).

---

## Dosya Yapısı

| Dosya | Sorumluluk |
|-------|-----------|
| `package.json` | npm meta + bağımlılıklar + test script |
| `plugin.json` | NodeBB eklenti tanımı (library, hooks, scripts, less, templates) |
| `library.js` | NodeBB giriş noktası: init, hook'lar, widget kayıt/render, ACP route |
| `lib/sources.js` | Kaynak registry + yardımcılar (`getById`, `getEnabled`) |
| `lib/util/relativeDate.js` | epoch ms → Türkçe göreli tarih |
| `lib/util/parseTurkishDate.js` | "13 Haziran 2026" → epoch ms |
| `lib/parser.js` | `parseHtml`, `parseRss` → normalize edilmiş duyuru dizisi |
| `lib/fetcher.js` | `fetchSource` — timeout'lu HTTP GET, metin döner |
| `lib/aggregator.js` | `aggregate` — paralel + izole çekim, sıralı liste + durum |
| `lib/store.js` | bellek store: kaynak bazlı son-iyi veri, birleşik liste, stale-while-error |
| `lib/scheduler.js` | `start`/`stop`/`runOnce` — periyodik çekim |
| `static/templates/widgets/deu-announcements.tpl` | widget şablonu |
| `static/lib/client.js` | sekme geçişi (client) |
| `static/style.less` | stiller (koyu/açık mod) |
| `static/templates/admin/plugins/deu-announcements.tpl` | ACP ayar formu |
| `test/*.js` | birim testler |
| `README.md` | kurulum + kaynak ekleme rehberi |

**Normalize edilmiş duyuru tipi** (tüm modüller bunu kullanır):

```js
{
  sourceId: 'iibf',       // string, kaynak id
  sourceName: 'İİBF',     // string, rozet
  faculty: 'iibf',        // string, filtre anahtarı ('main' = ana site)
  title: 'Final programı', // string
  link: 'https://...',    // string, mutlak URL
  date: 1718409600000,    // number, epoch ms (0 = bilinmiyor)
  summary: ''             // string, opsiyonel
}
```

---

## Task 0: Proje iskeleti

**Files:**
- Create: `package.json`
- Create: `plugin.json`
- Create: `.gitignore`

- [ ] **Step 1: `.gitignore` oluştur**

```
node_modules/
*.log
.DS_Store
```

- [ ] **Step 2: `package.json` oluştur**

```json
{
  "name": "nodebb-plugin-deu-announcements",
  "version": "0.1.0",
  "description": "Dokuz Eylül Üniversitesi ana ve fakülte duyurularını gösteren NodeBB widget eklentisi",
  "main": "library.js",
  "scripts": {
    "test": "mocha test/ --recursive"
  },
  "keywords": ["nodebb", "plugin", "widget", "deu", "duyuru"],
  "author": "heudev <hulkienesuysal@gmail.com>",
  "license": "MIT",
  "dependencies": {
    "cheerio": "^1.0.0",
    "rss-parser": "^3.13.0"
  },
  "devDependencies": {
    "mocha": "^10.4.0"
  },
  "nbbpm": {
    "compatibility": "^3.0.0"
  }
}
```

- [ ] **Step 3: `plugin.json` oluştur**

```json
{
  "id": "nodebb-plugin-deu-announcements",
  "name": "DEÜ Duyuruları",
  "description": "Dokuz Eylül Üniversitesi ana ve fakülte duyurularını widget olarak gösterir.",
  "url": "https://github.com/heudev/nodebb-plugin-deu-announcements",
  "library": "./library.js",
  "hooks": [
    { "hook": "static:app.load", "method": "init" },
    { "hook": "filter:widgets.getWidgets", "method": "defineWidgets" },
    { "hook": "filter:admin.header.build", "method": "addAdminNavigation" }
  ],
  "scripts": ["static/lib/client.js"],
  "less": ["static/style.less"],
  "templates": "static/templates"
}
```

- [ ] **Step 4: Bağımlılıkları kur ve commit**

Run: `npm install`
Expected: `node_modules/` oluşur, hata yok.

```bash
git add package.json plugin.json .gitignore
git commit -m "chore: proje iskeleti ve bağımlılıklar"
```

---

## Task 1: Göreli tarih biçimleyici

**Files:**
- Create: `lib/util/relativeDate.js`
- Test: `test/relativeDate.test.js`

- [ ] **Step 1: Failing test yaz**

```js
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
```

- [ ] **Step 2: Testi çalıştır, fail görmeli**

Run: `npx mocha test/relativeDate.test.js`
Expected: FAIL — `Cannot find module '../lib/util/relativeDate'`

- [ ] **Step 3: Implementasyon**

```js
'use strict';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

// epoch ms → Türkçe göreli tarih. now test için enjekte edilebilir.
module.exports = function relativeDate(ts, now = Date.now()) {
  const diff = now - ts;
  if (diff < MINUTE) return 'az önce';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} dakika önce`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} saat önce`;
  if (diff < 7 * DAY) {
    const d = Math.floor(diff / DAY);
    return d === 1 ? 'dün' : `${d} gün önce`;
  }
  const d = new Date(ts);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
```

- [ ] **Step 4: Testi çalıştır, pass görmeli**

Run: `npx mocha test/relativeDate.test.js`
Expected: PASS (6 passing)

- [ ] **Step 5: Commit**

```bash
git add lib/util/relativeDate.js test/relativeDate.test.js
git commit -m "feat: Türkçe göreli tarih biçimleyici"
```

---

## Task 2: Türkçe tarih ayrıştırıcı

**Files:**
- Create: `lib/util/parseTurkishDate.js`
- Test: `test/parseTurkishDate.test.js`

- [ ] **Step 1: Failing test yaz**

```js
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
```

- [ ] **Step 2: Testi çalıştır, fail görmeli**

Run: `npx mocha test/parseTurkishDate.test.js`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Implementasyon**

```js
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
```

- [ ] **Step 4: Testi çalıştır, pass görmeli**

Run: `npx mocha test/parseTurkishDate.test.js`
Expected: PASS (5 passing)

- [ ] **Step 5: Commit**

```bash
git add lib/util/parseTurkishDate.js test/parseTurkishDate.test.js
git commit -m "feat: Türkçe tarih ayrıştırıcı"
```

---

## Task 3: Kaynak registry

**Files:**
- Create: `lib/sources.js`
- Test: `test/sources.test.js`

- [ ] **Step 1: Failing test yaz**

```js
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
```

- [ ] **Step 2: Testi çalıştır, fail görmeli**

Run: `npx mocha test/sources.test.js`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Implementasyon**

> Not: `selectors` değerleri uygulama sırasında Task 9'da gerçek HTML'e karşı doğrulanacak; aşağıdakiler makul başlangıç değerleridir. `enabled:false` olan kaynaklar (erişilemeyen) toplamadan çıkarılır.

```js
'use strict';

// Her kaynak:
//   id, name, faculty, type('rss'|'html'), url, link, enabled
//   selectors (type==='html'): { item, title?, link?, date? }
//     - title/link/date verilmezse: title=item.text, link=item içindeki ilk <a>
const sources = [
  {
    id: 'main', name: 'Ana Duyurular', faculty: 'main', type: 'html',
    url: 'https://www.deu.edu.tr/tum-duyurular/',
    link: 'https://www.deu.edu.tr/tum-duyurular/',
    selectors: { item: '.announcement, article, .duyuru-item, h3', title: 'a, h3', link: 'a', date: '.tarih, time, .date' },
    enabled: true,
  },
  {
    id: 'iibf', name: 'İİBF', faculty: 'iibf', type: 'html',
    url: 'https://iibf.deu.edu.tr/category/breaking-news-announcements/',
    link: 'https://iibf.deu.edu.tr/about-faculty/all-announcements/',
    selectors: { item: 'article, .post', title: 'h2 a, h3 a, .entry-title a', link: 'h2 a, h3 a, .entry-title a', date: 'time, .entry-date, .posted-on' },
    enabled: true,
  },
  {
    id: 'hukuk', name: 'Hukuk', faculty: 'hukuk', type: 'html',
    url: 'https://hukuk.deu.edu.tr/',
    link: 'https://hukuk.deu.edu.tr/',
    selectors: { item: 'article, .post', title: 'h2 a, h3 a, .entry-title a', link: 'h2 a, h3 a, .entry-title a', date: 'time, .entry-date' },
    enabled: true,
  },
  {
    id: 'muhendislik', name: 'Mühendislik', faculty: 'muhendislik', type: 'html',
    url: 'https://muhendislik.deu.edu.tr/',
    link: 'https://muhendislik.deu.edu.tr/',
    selectors: { item: 'article, .post', title: 'h2 a, h3 a, .entry-title a', link: 'h2 a, h3 a, .entry-title a', date: 'time, .entry-date' },
    enabled: false, // ECONNREFUSED gözlendi; doğrulanınca açılacak
  },
  {
    id: 'tip', name: 'Tıp', faculty: 'tip', type: 'html',
    url: 'https://tip.deu.edu.tr/',
    link: 'https://tip.deu.edu.tr/',
    selectors: { item: 'article, .post', title: 'h2 a, h3 a, .entry-title a', link: 'h2 a, h3 a, .entry-title a', date: 'time, .entry-date' },
    enabled: true,
  },
  {
    id: 'edebiyat', name: 'Edebiyat', faculty: 'edebiyat', type: 'html',
    url: 'https://edebiyat.deu.edu.tr/',
    link: 'https://edebiyat.deu.edu.tr/',
    selectors: { item: 'article, .post', title: 'h2 a, h3 a, .entry-title a', link: 'h2 a, h3 a, .entry-title a', date: 'time, .entry-date' },
    enabled: true,
  },
  {
    id: 'fen', name: 'Fen', faculty: 'fen', type: 'html',
    url: 'https://fen.deu.edu.tr/',
    link: 'https://fen.deu.edu.tr/',
    selectors: { item: 'article, .post', title: 'h2 a, h3 a, .entry-title a', link: 'h2 a, h3 a, .entry-title a', date: 'time, .entry-date' },
    enabled: true,
  },
  {
    id: 'isletme', name: 'İşletme', faculty: 'isletme', type: 'html',
    url: 'https://isletme.deu.edu.tr/',
    link: 'https://isletme.deu.edu.tr/',
    selectors: { item: 'article, .post', title: 'h2 a, h3 a, .entry-title a', link: 'h2 a, h3 a, .entry-title a', date: 'time, .entry-date' },
    enabled: true,
  },
];

function getById(id) {
  return sources.find(s => s.id === id) || null;
}

// enabled && id ∉ disabledIds olan kaynaklar
function getEnabled(disabledIds = []) {
  return sources.filter(s => s.enabled && !disabledIds.includes(s.id));
}

module.exports = { sources, getById, getEnabled };
```

- [ ] **Step 4: Testi çalıştır, pass görmeli**

Run: `npx mocha test/sources.test.js`
Expected: PASS (5 passing)

- [ ] **Step 5: Commit**

```bash
git add lib/sources.js test/sources.test.js
git commit -m "feat: kaynak registry"
```

---

## Task 4: Parser (HTML + RSS → normalize)

**Files:**
- Create: `lib/parser.js`
- Create: `test/fixtures/main.html`
- Create: `test/fixtures/feed.xml`
- Test: `test/parser.test.js`

- [ ] **Step 1: Fixture'ları oluştur**

`test/fixtures/main.html`:

```html
<html><body>
  <article class="post">
    <h3><a href="/duyurular/yatay-gecis/">Yatay geçiş başvuruları</a></h3>
    <time class="entry-date">13 Haziran 2026</time>
  </article>
  <article class="post">
    <h3><a href="https://www.deu.edu.tr/duyurular/burs/">Burs sonuçları</a></h3>
    <time class="entry-date">10 Haziran 2026</time>
  </article>
</body></html>
```

`test/fixtures/feed.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>İİBF</title>
  <item>
    <title>Final programı açıklandı</title>
    <link>https://iibf.deu.edu.tr/final/</link>
    <pubDate>Fri, 13 Jun 2026 09:00:00 +0000</pubDate>
  </item>
</channel></rss>
```

- [ ] **Step 2: Failing test yaz**

```js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseHtml, parseRss } = require('../lib/parser');

const htmlSource = {
  id: 'main', name: 'Ana Duyurular', faculty: 'main', url: 'https://www.deu.edu.tr/tum-duyurular/',
  selectors: { item: 'article.post', title: 'h3 a', link: 'h3 a', date: 'time' },
};
const rssSource = { id: 'iibf', name: 'İİBF', faculty: 'iibf', url: 'https://iibf.deu.edu.tr/' };

const html = fs.readFileSync(path.join(__dirname, 'fixtures/main.html'), 'utf8');
const xml = fs.readFileSync(path.join(__dirname, 'fixtures/feed.xml'), 'utf8');

describe('parseHtml', () => {
  const items = parseHtml(html, htmlSource);
  it('iki duyuru çıkarır', () => assert.strictEqual(items.length, 2));
  it('başlık ve kaynak alanları doğru', () => {
    assert.strictEqual(items[0].title, 'Yatay geçiş başvuruları');
    assert.strictEqual(items[0].sourceId, 'main');
    assert.strictEqual(items[0].sourceName, 'Ana Duyurular');
    assert.strictEqual(items[0].faculty, 'main');
  });
  it('göreli linki mutlak yapar', () => {
    assert.strictEqual(items[0].link, 'https://www.deu.edu.tr/duyurular/yatay-gecis/');
  });
  it('mutlak linki korur', () => {
    assert.strictEqual(items[1].link, 'https://www.deu.edu.tr/duyurular/burs/');
  });
  it('tarihi epoch ms\'e çevirir', () => {
    assert.strictEqual(items[0].date, Date.UTC(2026, 5, 13));
  });
});

describe('parseRss', () => {
  it('feed öğesini normalize eder', async () => {
    const items = await parseRss(xml, rssSource);
    assert.strictEqual(items.length, 1);
    assert.strictEqual(items[0].title, 'Final programı açıklandı');
    assert.strictEqual(items[0].link, 'https://iibf.deu.edu.tr/final/');
    assert.strictEqual(items[0].sourceId, 'iibf');
    assert.ok(items[0].date > 0);
  });
});
```

- [ ] **Step 3: Testi çalıştır, fail görmeli**

Run: `npx mocha test/parser.test.js`
Expected: FAIL — `lib/parser` bulunamadı

- [ ] **Step 4: Implementasyon**

```js
'use strict';
const cheerio = require('cheerio');
const RssParser = require('rss-parser');
const parseTurkishDate = require('./util/parseTurkishDate');

const rss = new RssParser();

function normalize(source, { title, link, date, summary }) {
  return {
    sourceId: source.id,
    sourceName: source.name,
    faculty: source.faculty,
    title: (title || '').trim(),
    link: (link || '').trim(),
    date: date || 0,
    summary: (summary || '').trim(),
  };
}

function absolutize(href, base) {
  if (!href) return '';
  try { return new URL(href, base).href; } catch (e) { return href; }
}

function parseHtml(html, source) {
  const $ = cheerio.load(html);
  const sel = source.selectors;
  const items = [];
  $(sel.item).each((i, el) => {
    const $el = $(el);
    const titleEl = sel.title ? $el.find(sel.title).first() : $el;
    const title = titleEl.text();
    if (!title.trim()) return;
    const linkEl = sel.link ? $el.find(sel.link).first() : $el.find('a').first();
    const link = absolutize(linkEl.attr('href'), source.url);
    const dateText = sel.date ? $el.find(sel.date).first().text() : '';
    items.push(normalize(source, { title, link, date: parseTurkishDate(dateText) }));
  });
  return items;
}

async function parseRss(xml, source) {
  const feed = await rss.parseString(xml);
  return (feed.items || []).map(item => normalize(source, {
    title: item.title,
    link: item.link,
    date: item.isoDate ? new Date(item.isoDate).getTime() : 0,
    summary: item.contentSnippet,
  }));
}

module.exports = { parseHtml, parseRss, normalize };
```

- [ ] **Step 5: Testi çalıştır, pass görmeli**

Run: `npx mocha test/parser.test.js`
Expected: PASS (6 passing)

- [ ] **Step 6: Commit**

```bash
git add lib/parser.js test/parser.test.js test/fixtures/
git commit -m "feat: HTML ve RSS parser"
```

---

## Task 5: Fetcher

**Files:**
- Create: `lib/fetcher.js`
- Test: `test/fetcher.test.js`

- [ ] **Step 1: Failing test yaz**

```js
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
```

- [ ] **Step 2: Testi çalıştır, fail görmeli**

Run: `npx mocha test/fetcher.test.js`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Implementasyon**

```js
'use strict';

const DEFAULT_TIMEOUT = 10000;
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
```

- [ ] **Step 4: Testi çalıştır, pass görmeli**

Run: `npx mocha test/fetcher.test.js`
Expected: PASS (3 passing)

- [ ] **Step 5: Commit**

```bash
git add lib/fetcher.js test/fetcher.test.js
git commit -m "feat: timeout'lu fetcher"
```

---

## Task 6: Aggregator (paralel + izole)

**Files:**
- Create: `lib/aggregator.js`
- Test: `test/aggregator.test.js`

- [ ] **Step 1: Failing test yaz**

```js
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
```

- [ ] **Step 2: Testi çalıştır, fail görmeli**

Run: `npx mocha test/aggregator.test.js`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Implementasyon**

```js
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
```

- [ ] **Step 4: Testi çalıştır, pass görmeli**

Run: `npx mocha test/aggregator.test.js`
Expected: PASS (2 passing)

- [ ] **Step 5: Commit**

```bash
git add lib/aggregator.js test/aggregator.test.js
git commit -m "feat: izole paralel aggregator"
```

---

## Task 7: Store (stale-while-error)

**Files:**
- Create: `lib/store.js`
- Test: `test/store.test.js`

- [ ] **Step 1: Failing test yaz**

```js
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
```

- [ ] **Step 2: Testi çalıştır, fail görmeli**

Run: `npx mocha test/store.test.js`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Implementasyon**

```js
'use strict';

let bySource = {};   // sourceId -> items[]
let merged = [];     // birleşik, tarihe göre azalan
let lastRun = null;  // { time, status }

function rebuild() {
  merged = Object.values(bySource).flat().sort((a, b) => b.date - a.date);
}

// aggregate() çıktısını uygular. Başarılı kaynaklar güncellenir;
// başarısız kaynakların eski verisi korunur (stale-while-error).
function update(result) {
  for (const [id, st] of Object.entries(result.status)) {
    if (st.ok) {
      bySource[id] = result.announcements.filter(a => a.sourceId === id);
    }
  }
  rebuild();
  lastRun = { time: Date.now(), status: result.status };
}

function get() { return merged; }
function getStatus() { return lastRun; }
function reset() { bySource = {}; merged = []; lastRun = null; }

module.exports = { update, get, getStatus, reset };
```

- [ ] **Step 4: Testi çalıştır, pass görmeli**

Run: `npx mocha test/store.test.js`
Expected: PASS (3 passing)

- [ ] **Step 5: Commit**

```bash
git add lib/store.js test/store.test.js
git commit -m "feat: stale-while-error store"
```

---

## Task 8: Scheduler

**Files:**
- Create: `lib/scheduler.js`
- Test: `test/scheduler.test.js`

- [ ] **Step 1: Failing test yaz**

```js
'use strict';
const assert = require('assert');
const scheduler = require('../lib/scheduler');

describe('scheduler.runOnce', () => {
  it('aggregate sonucunu store\'a yazar', async () => {
    const calls = [];
    const deps = {
      sources: [{ id: 'a' }],
      aggregate: async (srcs) => { calls.push(srcs); return { announcements: [], status: { a: { ok: true, count: 0 } } }; },
      store: { update: (r) => calls.push(r) },
    };
    const result = await scheduler.runOnce(deps);
    assert.strictEqual(result.status.a.ok, true);
    assert.strictEqual(calls.length, 2); // aggregate + store.update
  });
});
```

- [ ] **Step 2: Testi çalıştır, fail görmeli**

Run: `npx mocha test/scheduler.test.js`
Expected: FAIL — modül bulunamadı

- [ ] **Step 3: Implementasyon**

```js
'use strict';

let timer = null;

// Tek seferlik çekim: aggregate → store.update
async function runOnce(deps) {
  const result = await deps.aggregate(deps.sources, deps);
  deps.store.update(result);
  return result;
}

// Periyodik başlat. Önce hemen bir kez çalışır.
function start(deps, intervalMs) {
  stop();
  const tick = () => runOnce(deps).catch(deps.onError || (() => {}));
  tick();
  timer = setInterval(tick, intervalMs);
  if (timer.unref) timer.unref();
}

function stop() {
  if (timer) { clearInterval(timer); timer = null; }
}

module.exports = { start, stop, runOnce };
```

- [ ] **Step 4: Testi çalıştır, pass görmeli**

Run: `npx mocha test/scheduler.test.js`
Expected: PASS (1 passing)

- [ ] **Step 5: Tüm testleri çalıştır + commit**

Run: `npm test`
Expected: tüm test dosyaları PASS

```bash
git add lib/scheduler.js test/scheduler.test.js
git commit -m "feat: periyodik scheduler"
```

---

## Task 9: Seçicileri canlı HTML'e karşı doğrula

**Files:**
- Modify: `lib/sources.js` (selectors + enabled değerleri)

> Bu görev "yaz-çalıştır-düzelt" döngüsüdür; her kaynağın gerçek HTML'i çekilip
> seçiciler ayarlanır. Otomatik birim test yerine canlı doğrulama scripti kullanılır.

- [ ] **Step 1: Geçici doğrulama scripti oluştur** `scripts/verify-sources.js`

```js
'use strict';
const { sources } = require('../lib/sources');
const { fetchSource } = require('../lib/fetcher');
const { parseHtml, parseRss } = require('../lib/parser');

(async () => {
  for (const s of sources) {
    process.stdout.write(`\n=== ${s.id} (${s.url}) [${s.enabled ? 'on' : 'off'}] ===\n`);
    try {
      const raw = await fetchSource(s, { timeout: 15000 });
      const items = s.type === 'rss' ? await parseRss(raw, s) : parseHtml(raw, s);
      console.log(`  ${items.length} duyuru`);
      items.slice(0, 3).forEach(it => console.log(`   • ${it.title} | ${new Date(it.date).toISOString().slice(0,10)} | ${it.link}`));
    } catch (e) {
      console.log(`  HATA: ${e.message}`);
    }
  }
})();
```

- [ ] **Step 2: Scripti çalıştır ve çıktıyı incele**

Run: `node scripts/verify-sources.js`
Expected: Her kaynak için ya duyuru listesi ya da net bir hata. Boş/yanlış çıkan kaynakların seçicilerini gerçek HTML'e bakarak düzelt (tarayıcıda "incele" veya `curl` ile). `/feed/` çalışan WordPress kaynaklarını `type:'rss'`, `url:'.../feed/'` yap.

- [ ] **Step 3: `lib/sources.js`'i düzelt**

Çıktıya göre her kaynağın `selectors`'ını ve `enabled` durumunu güncelle. Erişilemeyen kaynakları `enabled:false` bırak. En az `main` + 3 fakülte duyuru döndürmeli.

- [ ] **Step 4: Doğrulama scriptini sil + commit**

```bash
rm scripts/verify-sources.js
git add lib/sources.js
git commit -m "fix: kaynak seçicilerini canlı HTML'e göre doğrula"
```

---

## Task 10: NodeBB entegrasyonu — library.js (init + scheduler + widget render)

**Files:**
- Create: `library.js`
- Create: `static/templates/widgets/deu-announcements.tpl`
- Create: `static/lib/client.js`

- [ ] **Step 1: Widget şablonu oluştur** `static/templates/widgets/deu-announcements.tpl`

```html
<div class="deu-announcements card" data-deu-default-faculty="{defaultFaculty}">
  <div class="deu-header">
    <i class="fa fa-bullhorn"></i>
    <span class="deu-title">{title}</span>
  </div>
  <ul class="deu-tabs" role="tablist">
    <li class="deu-tab active" data-filter="all">Tümü</li>
    <!-- BEGIN hasFaculty -->
    <li class="deu-tab" data-filter="faculty">Fakültem</li>
    <!-- END hasFaculty -->
    <li class="deu-tab" data-filter="main">Ana</li>
  </ul>
  <ul class="deu-list">
    <!-- BEGIN announcements -->
    <li class="deu-item" data-faculty="{announcements.faculty}">
      <span class="deu-badge deu-badge-{announcements.faculty}">{announcements.sourceName}</span>
      <a class="deu-item-title" href="{announcements.link}" target="_blank" rel="noopener noreferrer">{announcements.title}</a>
      <span class="deu-date">{announcements.relativeDate}</span>
    </li>
    <!-- END announcements -->
  </ul>
  <!-- IF !announcements.length -->
  <div class="deu-empty">Şu an gösterilecek duyuru yok.</div>
  <!-- ENDIF !announcements.length -->
  <a class="deu-more" href="{moreLink}" target="_blank" rel="noopener noreferrer">Daha fazla →</a>
</div>
```

- [ ] **Step 2: Client JS oluştur** `static/lib/client.js`

```js
'use strict';

$(document).ready(function () {
  function bind(widget) {
    const $tabs = widget.find('.deu-tab');
    const $items = widget.find('.deu-item');
    const defaultFaculty = widget.attr('data-deu-default-faculty');
    $tabs.on('click', function () {
      const filter = $(this).attr('data-filter');
      $tabs.removeClass('active');
      $(this).addClass('active');
      $items.each(function () {
        const f = $(this).attr('data-faculty');
        let show = filter === 'all'
          || (filter === 'main' && f === 'main')
          || (filter === 'faculty' && f === defaultFaculty);
        $(this).toggleClass('hidden', !show);
      });
    });
  }
  $('.deu-announcements').each(function () { bind($(this)); });
});
```

- [ ] **Step 3: library.js oluştur**

```js
'use strict';

const meta = require.main.require('./src/meta');
const winston = require.main.require('winston');

const { sources, getEnabled } = require('./lib/sources');
const { aggregate } = require('./lib/aggregator');
const store = require('./lib/store');
const scheduler = require('./lib/scheduler');
const relativeDate = require('./lib/util/relativeDate');

const plugin = {};
const SETTINGS_HASH = 'deu-announcements';

let appRef = null;

plugin.init = async function (params) {
  const { router, middleware } = params;
  appRef = params.app;

  // ACP route
  router.get('/admin/plugins/deu-announcements', middleware.admin.buildHeader, renderAdmin);
  router.get('/api/admin/plugins/deu-announcements', renderAdmin);

  startScheduler();
  winston.info('[deu-announcements] başlatıldı');
};

function renderAdmin(req, res) {
  res.render('admin/plugins/deu-announcements', {
    sources: sources.map(s => ({ id: s.id, name: s.name, enabled: s.enabled })),
  });
}

async function startScheduler() {
  const settings = await meta.settings.get(SETTINGS_HASH) || {};
  const intervalMin = Math.max(5, parseInt(settings.intervalMinutes, 10) || 30);
  const disabled = parseDisabled(settings);
  scheduler.start({
    sources: getEnabled(disabled),
    aggregate,
    store,
    onError: e => winston.error(`[deu-announcements] çekim hatası: ${e.message}`),
  }, intervalMin * 60 * 1000);
}

function parseDisabled(settings) {
  // ACP'de kapalı kaynaklar "disabled_<id>" = "on" olarak gelir
  return sources.filter(s => settings[`disabled_${s.id}`] === 'on').map(s => s.id);
}

plugin.defineWidgets = async function (widgets) {
  const html = await renderTemplate('admin/widgets/deu-announcements', {});
  widgets.push({
    widget: 'deu-announcements',
    name: 'DEÜ Duyuruları',
    description: 'DEÜ ana ve fakülte duyurularını gösterir.',
    content: html,
  });
  return widgets;
};

plugin.renderWidget = async function (widget) {
  const settings = await meta.settings.get(SETTINGS_HASH) || {};
  const limit = Math.max(1, parseInt(settings.limit, 10) || 15);
  const defaultFaculty = (widget.data && widget.data.defaultFaculty) || settings.defaultFaculty || '';
  const now = Date.now();

  const announcements = store.get().slice(0, limit).map(a => ({
    ...a,
    relativeDate: relativeDate(a.date || now, now),
  }));

  widget.html = await renderTemplate('widgets/deu-announcements', {
    title: (widget.data && widget.data.title) || 'DEÜ Duyuruları',
    announcements,
    hasFaculty: !!defaultFaculty,
    defaultFaculty,
    moreLink: 'https://www.deu.edu.tr/tum-duyurular/',
  });
  return widget;
};

plugin.addAdminNavigation = function (header, callback) {
  header.plugins.push({
    route: '/plugins/deu-announcements',
    icon: 'fa-bullhorn',
    name: 'DEÜ Duyuruları',
  });
  callback(null, header);
};

function renderTemplate(tpl, data) {
  return new Promise((resolve, reject) => {
    appRef.render(tpl, data, (err, html) => (err ? reject(err) : resolve(html)));
  });
}

module.exports = plugin;
```

- [ ] **Step 4: plugin.json'a widget render hook ekle**

`plugin.json` içindeki `hooks` dizisine ekle:

```json
{ "hook": "filter:widget.render:deu-announcements", "method": "renderWidget" }
```

- [ ] **Step 5: Sözdizimi kontrolü + commit**

Run: `node -e "require('./library.js'); console.log('library.js yüklendi')"`
Expected: `require.main.require` NodeBB dışında hata verebilir; bu beklenir. Alternatif kontrol:
Run: `node --check library.js && node --check static/lib/client.js && echo OK`
Expected: `OK`

```bash
git add library.js plugin.json static/templates/widgets/ static/lib/client.js
git commit -m "feat: NodeBB widget entegrasyonu (init, render, scheduler)"
```

---

## Task 11: ACP ayar sayfası + widget admin formu

**Files:**
- Create: `static/templates/admin/plugins/deu-announcements.tpl`
- Create: `static/templates/admin/widgets/deu-announcements.tpl`
- Create: `static/lib/admin.js`
- Modify: `plugin.json` (scripts'e admin.js ekle — sadece ACP için)

- [ ] **Step 1: ACP şablonu** `static/templates/admin/plugins/deu-announcements.tpl`

```html
<div class="acp-page-container">
  <div class="row">
    <div class="col-12 col-md-8">
      <div class="card">
        <div class="card-header">DEÜ Duyuruları Ayarları</div>
        <div class="card-body">
          <form role="form" class="deu-settings">
            <div class="mb-3">
              <label class="form-label" for="intervalMinutes">Yenileme aralığı (dakika)</label>
              <input type="number" min="5" id="intervalMinutes" name="intervalMinutes" class="form-control" placeholder="30">
            </div>
            <div class="mb-3">
              <label class="form-label" for="limit">Gösterilecek duyuru sayısı</label>
              <input type="number" min="1" id="limit" name="limit" class="form-control" placeholder="15">
            </div>
            <div class="mb-3">
              <label class="form-label" for="defaultFaculty">Varsayılan "Fakültem"</label>
              <select id="defaultFaculty" name="defaultFaculty" class="form-select">
                <option value="">— Seçiniz —</option>
                <!-- BEGIN sources -->
                <option value="{sources.id}">{sources.name}</option>
                <!-- END sources -->
              </select>
            </div>
            <label class="form-label">Aktif kaynaklar</label>
            <!-- BEGIN sources -->
            <div class="form-check">
              <input type="checkbox" class="form-check-input" id="disabled_{sources.id}" name="disabled_{sources.id}">
              <label class="form-check-label" for="disabled_{sources.id}">{sources.name} kaynağını <strong>kapat</strong></label>
            </div>
            <!-- END sources -->
          </form>
        </div>
      </div>
    </div>
  </div>
  <button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
    <i class="material-icons">save</i>
  </button>
</div>
```

- [ ] **Step 2: ACP client JS** `static/lib/admin.js`

```js
'use strict';

define('admin/plugins/deu-announcements', ['settings', 'alerts'], function (Settings, alerts) {
  const ACP = {};
  ACP.init = function () {
    Settings.load('deu-announcements', $('.deu-settings'));
    $('#save').on('click', function () {
      Settings.save('deu-announcements', $('.deu-settings'), function () {
        alerts.alert({
          type: 'success', alert_id: 'deu-saved', timeout: 2500,
          title: 'Kaydedildi', message: 'Ayarlar kaydedildi. Değişiklik için sunucuyu yeniden başlatın.',
        });
      });
    });
  };
  return ACP;
});
```

- [ ] **Step 3: Widget admin formu** `static/templates/admin/widgets/deu-announcements.tpl`

```html
<div class="form-group mb-3">
  <label class="form-label">Başlık</label>
  <input type="text" class="form-control" name="title" placeholder="DEÜ Duyuruları" />
</div>
<div class="form-group mb-3">
  <label class="form-label">Bu widget için "Fakültem"</label>
  <input type="text" class="form-control" name="defaultFaculty" placeholder="ör. iibf (boş = ACP varsayılanı)" />
</div>
```

- [ ] **Step 4: plugin.json scripts güncelle**

`scripts` dizisini şu hale getir (admin.js dahil):

```json
"scripts": ["static/lib/client.js", "static/lib/admin.js"],
```

- [ ] **Step 5: Sözdizimi kontrolü + commit**

Run: `node --check static/lib/admin.js && echo OK`
Expected: `OK`

```bash
git add static/templates/admin/ static/lib/admin.js plugin.json
git commit -m "feat: ACP ayar sayfası ve widget admin formu"
```

---

## Task 12: Stiller (koyu/açık mod)

**Files:**
- Create: `static/style.less`

- [ ] **Step 1: Stil dosyası oluştur**

```less
.deu-announcements {
  --deu-accent: #00457c;      // DEÜ lacivert
  --deu-accent-2: #8c1d40;    // bordo
  padding: 0;
  overflow: hidden;

  .deu-header {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding: .75rem 1rem;
    background: linear-gradient(90deg, var(--deu-accent), var(--deu-accent-2));
    color: #fff;
    font-weight: 600;
    .fa { opacity: .9; }
  }

  .deu-tabs {
    display: flex;
    gap: .25rem;
    list-style: none;
    margin: 0;
    padding: .5rem .75rem 0;
    border-bottom: 1px solid var(--bs-border-color, rgba(128,128,128,.2));

    .deu-tab {
      cursor: pointer;
      padding: .35rem .75rem;
      border-radius: .5rem .5rem 0 0;
      font-size: .85rem;
      color: var(--bs-secondary-color, #6c757d);
      &:hover { background: var(--bs-tertiary-bg, rgba(128,128,128,.1)); }
      &.active {
        color: var(--deu-accent);
        font-weight: 600;
        box-shadow: inset 0 -2px 0 var(--deu-accent);
      }
    }
  }

  .deu-list {
    list-style: none;
    margin: 0;
    padding: .25rem 0;
    max-height: 420px;
    overflow-y: auto;
  }

  .deu-item {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas: "badge title" "badge date";
    gap: 0 .5rem;
    padding: .6rem 1rem;
    border-bottom: 1px solid var(--bs-border-color, rgba(128,128,128,.12));
    &.hidden { display: none; }
    &:hover { background: var(--bs-tertiary-bg, rgba(128,128,128,.06)); }
  }

  .deu-badge {
    grid-area: badge;
    align-self: start;
    font-size: .7rem;
    font-weight: 600;
    padding: .15rem .45rem;
    border-radius: 1rem;
    color: #fff;
    background: var(--deu-accent);
    white-space: nowrap;
  }
  .deu-badge-main { background: var(--deu-accent-2); }

  .deu-item-title {
    grid-area: title;
    font-size: .9rem;
    line-height: 1.3;
    color: var(--bs-body-color);
    text-decoration: none;
    &:hover { color: var(--deu-accent); text-decoration: underline; }
  }
  .deu-date {
    grid-area: date;
    font-size: .75rem;
    color: var(--bs-secondary-color, #888);
    margin-top: .15rem;
  }

  .deu-empty {
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--bs-secondary-color, #888);
    font-size: .9rem;
  }

  .deu-more {
    display: block;
    padding: .6rem 1rem;
    text-align: right;
    font-size: .8rem;
    color: var(--deu-accent);
    border-top: 1px solid var(--bs-border-color, rgba(128,128,128,.15));
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add static/style.less
git commit -m "feat: widget stilleri (koyu/açık mod uyumlu)"
```

---

## Task 13: README + son doğrulama

**Files:**
- Create: `README.md`

- [ ] **Step 1: README yaz**

````markdown
# nodebb-plugin-deu-announcements

Dokuz Eylül Üniversitesi ana ve fakülte duyurularını NodeBB forumunda sekmeli bir
widget olarak gösterir.

## Özellikler
- Ana DEÜ duyuruları + fakülte duyurularını tek yerde toplar
- RSS varsa RSS, yoksa HTML scraping (karma)
- Sunucu tarafı periyodik çekim + önbellek (kaynak izolasyonu, stale-while-error)
- Sekmeli widget: Tümü / Fakültem / Ana
- Koyu/açık mod uyumlu

## Kurulum
```bash
cd nodebb
npm install nodebb-plugin-deu-announcements
./nodebb build
./nodebb restart
```
ACP → Eklentiler'den etkinleştir, ACP → DEÜ Duyuruları'ndan ayarla, ardından
ACP → Genişletme → Widget'lar ekranından bir alana "DEÜ Duyuruları" widget'ını sürükle.

## Yeni kaynak ekleme
`lib/sources.js` içindeki diziye bir nesne ekle:
```js
{ id: 'gsf', name: 'Güzel Sanatlar', faculty: 'gsf', type: 'html',
  url: 'https://gsf.deu.edu.tr/', link: 'https://gsf.deu.edu.tr/',
  selectors: { item: 'article', title: '.entry-title a', link: '.entry-title a', date: 'time' },
  enabled: true }
```
WordPress kaynaklarında önce `https://<site>/feed/` deneyin (`type:'rss'`).

## Geliştirme
```bash
npm install
npm test
```

## Lisans
MIT
````

- [ ] **Step 2: Tüm testleri çalıştır**

Run: `npm test`
Expected: tüm suite PASS (relativeDate, parseTurkishDate, sources, parser, fetcher, aggregator, store, scheduler)

- [ ] **Step 3: Tüm JS dosyalarını syntax-check et**

Run: `for f in library.js lib/*.js lib/util/*.js static/lib/*.js; do node --check "$f" || echo "FAIL: $f"; done; echo done`
Expected: `done`, hiç FAIL yok

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README ve kurulum rehberi"
```

---

## Self-Review Notları

- **Spec kapsamı:** Veri kaynağı (karma) → Task 4/5/9; kodda tanımlı kaynaklar → Task 3/9; sekmeli widget → Task 10/12; cron+önbellek → Task 6/7/8; ACP ayarları → Task 11; dayanıklılık (izolasyon + stale-while-error) → Task 6/7. ✓
- **Tip tutarlılığı:** Normalize edilmiş duyuru tipi tüm modüllerde aynı (`sourceId, sourceName, faculty, title, link, date, summary`). `aggregate` → `{announcements, status}`; `store.update` aynı şekli tüketir. ✓
- **Placeholder taraması:** Task 9 seçici doğrulaması canlı veriye bağlı olduğu için "yaz-çalıştır-düzelt" döngüsü olarak açıkça tanımlandı; bu bir placeholder değil, kasıtlı bir doğrulama görevidir. ✓
- **NodeBB API riski:** `app.render`, `meta.settings`, widget hook'ları NodeBB 3.x dokümante desenleridir; gerçek instance'ta Task 10-13 manuel doğrulama gerektirir (bu yüzden syntax-check + canlı kurulum adımları eklendi).
````
