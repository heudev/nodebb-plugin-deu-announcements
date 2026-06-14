# nodebb-plugin-deu-announcements

Dokuz Eylül Üniversitesi ana ve fakülte duyurularını NodeBB forumunda sekmeli bir
widget olarak gösterir.

## Özellikler

- Ana DEÜ duyuruları + fakülte duyurularını tek yerde toplar
- RSS varsa RSS, yoksa HTML scraping (karma)
- Sunucu tarafı periyodik çekim + önbellek (kaynak izolasyonu, stale-while-error)
- Sekmeli widget: **Tümü / Fakültem / Ana**
- Fakülte bazlı renkli rozetler, koyu/açık mod uyumlu, responsive

## Desteklenen kaynaklar

| id | Fakülte |
|----|---------|
| main | Ana DEÜ Duyuruları |
| iibf | İktisadi ve İdari Bilimler |
| hukuk | Hukuk |
| tip | Tıp |
| edebiyat | Edebiyat |
| fen | Fen |
| isletme | İşletme |
| ogrenci | Öğrenci İşleri Daire Başkanlığı |
| sks | Sağlık Kültür ve Spor (SKS) Daire Başkanlığı |
| muhendislik | Mühendislik *(varsayılan kapalı — erişim doğrulanınca açın)* |

## Kurulum

```bash
cd /path/to/nodebb
npm install nodebb-plugin-deu-announcements
./nodebb build
./nodebb restart
```

1. **ACP → Eklentiler**'den eklentiyi etkinleştirin ve yeniden başlatın.
2. **ACP → DEÜ Duyuruları**'ndan yenileme aralığı, duyuru sayısı ve varsayılan
   fakülteyi ayarlayın.
3. **ACP → Genişletme → Widget'lar** ekranından "DEÜ Duyuruları" widget'ını
   istediğiniz alana (kenar çubuğu vb.) sürükleyin.

## Yeni kaynak ekleme

`lib/sources.js` içindeki diziye bir nesne ekleyin:

```js
{ id: 'gsf', name: 'Güzel Sanatlar', faculty: 'gsf', type: 'html',
  url: 'https://gsf.deu.edu.tr/duyurular/',
  link: 'https://gsf.deu.edu.tr/duyurular/',
  selectors: { item: 'a[href*="/duyurular/"]' },
  enabled: true }
```

Seçici ipuçları (gözlemlenen DEÜ desenleri):
- WordPress fakülteleri: duyuru listesi sayfasında `a[href*="/duyurular/"]`
  (gerekirse `.col-md-8 a[href*="/duyurular/"]` ile ana içeriğe kapsayın).
- Özel temalı siteler (hukuk, isletme): `item: '.news', title: '.news-title', link: 'a'`.
- WordPress `/feed/` çoğu DEÜ sitesinde kapalıdır; önce deneyip 404 alırsanız HTML'e düşün.

Rozet rengi için `static/style.less` içine `.deu-badge-<faculty>` ekleyin.

## Mimari

```
cron → aggregator (paralel + izole) → her kaynak: fetcher → parser → normalize
     → store (stale-while-error) → widget render (SSR)
```

- `lib/sources.js` — kaynak registry
- `lib/fetcher.js` — timeout'lu HTTP
- `lib/parser.js` — HTML/RSS → normalize
- `lib/aggregator.js` — paralel, izole çekim
- `lib/store.js` — bellek önbellek (stale-while-error)
- `lib/scheduler.js` — periyodik çekim
- `library.js` — NodeBB entegrasyonu (init, widget, ACP)

## Geliştirme

```bash
npm install
npm test
```

## Lisans

MIT
