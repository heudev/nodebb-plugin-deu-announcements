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
    link: 'https://hukuk.deu.edu.tr/duyurular/',
    selectors: { item: '.news', title: '.news-title', link: 'a' },
    enabled: true,
  },
  {
    id: 'muhendislik', name: 'Mühendislik', faculty: 'muhendislik', type: 'html',
    url: 'https://muhendislik.deu.edu.tr/duyurular/',
    link: 'https://muhendislik.deu.edu.tr/duyurular/',
    selectors: { item: 'a[href*="/duyurular/"]' },
    enabled: false, // fetch failed (DNS/erişim); ağ açılınca etkinleştir
  },
  {
    id: 'tip', name: 'Tıp', faculty: 'tip', type: 'html',
    url: 'https://tip.deu.edu.tr/duyurular/',
    link: 'https://tip.deu.edu.tr/duyurular/',
    selectors: { item: 'a[href*="/duyurular/"]' },
    enabled: true,
  },
  {
    id: 'edebiyat', name: 'Edebiyat', faculty: 'edebiyat', type: 'html',
    url: 'https://edebiyat.deu.edu.tr/tr/ogrenci-isleri-duyurulari/',
    link: 'https://edebiyat.deu.edu.tr/tr/ogrenci-isleri-duyurulari/',
    selectors: { item: 'a[href*="/duyurular/"]' },
    enabled: true,
  },
  {
    id: 'fen', name: 'Fen', faculty: 'fen', type: 'html',
    url: 'https://fen.deu.edu.tr/duyurular/',
    link: 'https://fen.deu.edu.tr/duyurular/',
    // ana içerik sütununa kapsa — aksi halde nav menüsü kirletiyor
    selectors: { item: '.col-md-8 a[href*="/duyurular/"]' },
    enabled: true,
  },
  {
    id: 'isletme', name: 'İşletme', faculty: 'isletme', type: 'html',
    url: 'https://isletme.deu.edu.tr/tr/duyurular/',
    link: 'https://isletme.deu.edu.tr/tr/duyurular/',
    selectors: { item: '.news', title: '.news-title', link: 'a' },
    enabled: true,
  },
  {
    id: 'ogrenci', name: 'Öğrenci İşleri', faculty: 'ogrenci', type: 'html',
    url: 'https://ogrenci.deu.edu.tr/duyurular/',
    link: 'https://ogrenci.deu.edu.tr/duyurular/',
    selectors: { item: '.col-md-8 a[href*="/duyurular/"]' },
    enabled: true,
  },
  {
    id: 'sks', name: 'SKS', faculty: 'sks', type: 'html',
    url: 'https://sks.deu.edu.tr/duyurular/',
    link: 'https://sks.deu.edu.tr/duyurular/',
    selectors: { item: '.col-md-8 a[href*="/duyurular/"]' },
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
