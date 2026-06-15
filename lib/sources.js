'use strict';

// Ortak seçici kalıpları (canlı HTML keşfiyle doğrulandı):
const NEWS = { item: '.news', title: '.news-title', link: 'a' };                 // DEÜ özel tema (ana sayfa flaş haber)
const COL8 = { item: '.col-md-8 a[href*="/duyuru"]' };                           // WP duyuru listeleme (içerik sütunu)
const ANCHOR = { item: 'a[href*="/duyurular/"]' };                               // genel duyuru anchor

// category: ana | fakulte | enstitu | yuksekokul | myo | birim
function S(id, name, category, url, selectors, enabled, link) {
  return {
    id, name, faculty: id, category, type: 'html',
    url, link: link || url, selectors,
    enabled: enabled !== false,
  };
}

const sources = [
  // ---- Ana ----
  S('main', 'Ana Duyurular', 'ana', 'https://www.deu.edu.tr/tum-duyurular/',
    { item: '.announcement, article, .duyuru-item, h3', title: 'a, h3', link: 'a', date: '.tarih, time, .date' }),

  // ---- Fakülteler ----
  S('iibf', 'İİBF', 'fakulte', 'https://iibf.deu.edu.tr/category/breaking-news-announcements/',
    { item: 'article, .post', title: 'h2 a, h3 a, .entry-title a', link: 'h2 a, h3 a, .entry-title a', date: 'time, .entry-date, .posted-on' },
    true, 'https://iibf.deu.edu.tr/about-faculty/all-announcements/'),
  S('hukuk', 'Hukuk', 'fakulte', 'https://hukuk.deu.edu.tr/', NEWS, true, 'https://hukuk.deu.edu.tr/duyurular/'),
  S('muhendislik', 'Mühendislik', 'fakulte', 'https://eng.deu.edu.tr/tr/', NEWS, true, 'https://eng.deu.edu.tr/tr/duyurular/'),
  S('tip', 'Tıp', 'fakulte', 'https://tip.deu.edu.tr/duyurular/', ANCHOR),
  S('edebiyat', 'Edebiyat', 'fakulte', 'https://edebiyat.deu.edu.tr/tr/ogrenci-isleri-duyurulari/', ANCHOR),
  S('fen', 'Fen', 'fakulte', 'https://fen.deu.edu.tr/duyurular/', { item: '.col-md-8 a[href*="/duyurular/"]' }),
  S('isletme', 'İşletme', 'fakulte', 'https://isletme.deu.edu.tr/tr/duyurular/', NEWS),
  S('bef', 'Buca Eğitim', 'fakulte', 'https://bef.deu.edu.tr/', NEWS),
  S('dis', 'Diş Hekimliği', 'fakulte', 'https://dis.deu.edu.tr/', NEWS),
  S('ftr', 'Fizik Tedavi ve Reh.', 'fakulte', 'https://ftr.deu.edu.tr/', NEWS),
  S('gsf', 'Güzel Sanatlar', 'fakulte', 'https://gsf.deu.edu.tr/duyurular/', COL8),
  S('hemsirelik', 'Hemşirelik', 'fakulte', 'https://hemsirelik.deu.edu.tr/', NEWS),
  S('ilahiyat', 'İlahiyat', 'fakulte', 'https://ilahiyat.deu.edu.tr/', NEWS),
  S('mimarlik', 'Mimarlık', 'fakulte', 'https://mimarlik.deu.edu.tr/', NEWS),
  S('turizm', 'Turizm', 'fakulte', 'https://turizm.deu.edu.tr/', NEWS),
  S('sporbilimleri', 'Spor Bilimleri', 'fakulte', 'https://sporbilimleri.deu.edu.tr/', NEWS),
  S('veteriner', 'Veteriner', 'fakulte', 'https://veteriner.deu.edu.tr/', NEWS),
  S('denizcilik', 'Denizcilik', 'fakulte', 'https://denizcilik.deu.edu.tr/duyurular/', COL8, false), // duyuru bulunamadı

  // ---- Enstitüler ----
  S('ataturkilkeleri', 'Atatürk İlkeleri Ens.', 'enstitu', 'https://ataturkilkeleri.deu.edu.tr/duyurular/', COL8),
  S('egitimbilimleri', 'Eğitim Bilimleri Ens.', 'enstitu', 'https://egitimbilimleri.deu.edu.tr/', NEWS),
  S('fbe', 'Fen Bilimleri Ens.', 'enstitu', 'https://www.fbe.deu.edu.tr/duyurular/', COL8),
  S('gse', 'Güzel Sanatlar Ens.', 'enstitu', 'https://gse.deu.edu.tr/duyurular/', COL8),
  S('ibg', 'Biyotıp ve Genom Ens.', 'enstitu', 'https://ibg.deu.edu.tr/', NEWS),
  S('saglikbil', 'Sağlık Bilimleri Ens.', 'enstitu', 'https://saglikbil.deu.edu.tr/duyurular/', COL8),
  S('sbe', 'Sosyal Bilimler Ens.', 'enstitu', 'https://sbe.deu.edu.tr/duyurular/', COL8),
  S('dinbilimleri', 'Din Bilimleri Ens.', 'enstitu', 'https://dinbilimleri.deu.edu.tr/duyurular/', COL8, false),
  S('imst', 'Deniz Bilimleri Ens.', 'enstitu', 'https://imst.deu.edu.tr/duyurular/', COL8, false),
  S('onkoloji', 'Onkoloji Ens.', 'enstitu', 'https://onkoloji.deu.edu.tr/duyurular/', COL8, false),

  // ---- Yüksekokullar ----
  S('konservatuvar', 'Devlet Konservatuvarı', 'yuksekokul', 'https://konservatuvar.deu.edu.tr/duyurular/', COL8),
  S('seferihisaruby', 'Uygulamalı Bilimler YO', 'yuksekokul', 'https://seferihisaruby.deu.edu.tr/duyurular/', COL8),
  S('ydy', 'Yabancı Diller YO', 'yuksekokul', 'https://ydy.deu.edu.tr/', NEWS),

  // ---- Meslek Yüksekokulları ----
  S('adaletmyo', 'Adalet MYO', 'myo', 'https://adaletmyo.deu.edu.tr/duyurular/', COL8),
  S('bergamamyo', 'Bergama MYO', 'myo', 'https://bergamamyo.deu.edu.tr/tr/duyurular/', COL8),
  S('efesmyo', 'Efes MYO', 'myo', 'https://efesmyo.deu.edu.tr/', NEWS),
  S('imyo', 'İzmir MYO', 'myo', 'https://imyo.deu.edu.tr/', NEWS),
  S('kirazmyo', 'Kiraz MYO', 'myo', 'https://kirazmyo.deu.edu.tr/', NEWS),
  S('saglikhmyo', 'Sağlık Hizmetleri MYO', 'myo', 'https://saglikhmyo.deu.edu.tr/', NEWS),
  S('torbali', 'Torbalı MYO', 'myo', 'https://torbali.deu.edu.tr/duyurular/', COL8),

  // ---- Birimler / Daire Bşk. / Koordinatörlükler ----
  S('ogrenci', 'Öğrenci İşleri', 'birim', 'https://ogrenci.deu.edu.tr/duyurular/', { item: '.col-md-8 a[href*="/duyurular/"]' }),
  S('sks', 'SKS', 'birim', 'https://sks.deu.edu.tr/duyurular/', { item: '.col-md-8 a[href*="/duyurular/"]' }),
  S('ozd', 'Ortak Zorunlu Dersler', 'birim', 'https://ozd.deu.edu.tr/duyurular/', COL8),
  S('engelsiz', 'Engelsiz DEÜ', 'birim', 'https://engelsiz.deu.edu.tr/duyurular/', ANCHOR),
  S('kalite', 'Kalite Krd.', 'birim', 'https://kalite.deu.edu.tr/', NEWS),
  S('kariyer', 'Kariyer Planlama', 'birim', 'https://kariyer.deu.edu.tr/', NEWS),
  S('oyp', 'ÖYP Krd.', 'birim', 'http://oyp.deu.edu.tr/duyurular/', COL8),
  S('toplumsalkatki', 'Toplumsal Katkı', 'birim', 'https://toplumsalkatki.deu.edu.tr/', NEWS),
  S('iso', 'Uluslararası Öğrenci', 'birim', 'https://iso.deu.edu.tr/', NEWS),
  S('yuzikibin', '100/2000 Doktora Bursu', 'birim', 'https://yuzikibin.deu.edu.tr/duyurular/', COL8),
];

function getById(id) {
  return sources.find(s => s.id === id) || null;
}

// enabled && id ∉ disabledIds olan kaynaklar
function getEnabled(disabledIds = []) {
  return sources.filter(s => s.enabled && !disabledIds.includes(s.id));
}

module.exports = { sources, getById, getEnabled };
