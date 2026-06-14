# DEÜ Duyuruları Widget'ı — Tasarım Dokümanı

**Tarih:** 2026-06-15
**Proje:** `nodebb-plugin-deu-announcements`

## Amaç

Dokuz Eylül Üniversitesi'nin ana duyurularını ve fakülte duyurularını tek bir
yerde toplayıp NodeBB forumunda bir **widget** olarak gösteren eklenti. Kullanıcı
forumdan ayrılmadan üniversite ve fakülte duyurularını takip edebilir.

## Kapsam & Kararlar

- **Veri kaynağı:** Karma — kaynak RSS sunuyorsa RSS, sunmuyorsa HTML scraping.
  - Ana site (deu.edu.tr): RSS yok → HTML scraping, sayfa başına ~10 duyuru.
  - Fakülteler: çoğunlukla WordPress, heterojen; bazılarında RSS olabilir.
- **Kaynak yönetimi:** Kaynaklar eklenti koduna gömülü (`lib/sources.js`). Yeni
  fakülte eklemek = registry'e bir nesne eklemek.
- **Widget düzeni:** Sekmeli liste (Tümü · Fakültem · Ana).
- **Yenileme:** Sunucu tarafı cron, varsayılan 30 dakika.
- **"Fakültem" sekmesi:** Admin tarafından widget örneği bazında seçilir (ACP ayarı).

## Mimari Yaklaşım

**Sunucu tarafı toplayıcı + önbellek + SSR widget.** Cron belirli aralıkla tüm
kaynakları çeker, normalize eder, NodeBB cache'ine yazar. Widget render anında
yalnızca cache'ten okur — sayfa açılışı yavaşlamaz, kaynak siteler her ziyarette
yorulmaz.

Reddedilen alternatifler:
- Anlık çekme (her render'da fetch): yavaş + kaynakları yorar.
- Client-side fetch: CORS engeli, fakülte siteleri izin vermez.

## Bileşenler

| Dosya | Sorumluluk |
|-------|-----------|
| `plugin.json` | NodeBB eklenti tanımı, hook'lar, widget kaydı |
| `library.js` | Ana giriş; hook'ları bağlar, scheduler'ı başlatır |
| `lib/sources.js` | Kaynak registry: her kaynak `{id, name, faculty, type, url, selectors}` |
| `lib/fetcher.js` | Tek kaynağı çeker (rss veya html), ham içerik döner |
| `lib/parser.js` | Ham içeriği normalize eder → `{sourceId, title, link, date, summary}` |
| `lib/aggregator.js` | Tüm kaynakları paralel çeker, birleştirir, cache'e yazar |
| `lib/scheduler.js` | Cron — aggregator'ı periyodik çalıştırır |
| `lib/widget.js` | Widget render + ACP ayarları |
| `public/templates/` | Widget `.tpl` şablonu |
| `public/scss` veya `css` | Stiller (koyu/açık mod uyumlu) |
| `public/js` | Küçük client JS (sekme geçişi/filtreleme) |

## Veri Modeli (normalize edilmiş duyuru)

```js
{
  sourceId: 'iibf',        // kaynak id
  sourceName: 'İİBF',      // rozet metni
  faculty: 'iibf',         // filtreleme anahtarı ('main' = ana site)
  title: 'Final programı açıklandı',
  link: 'https://iibf.deu.edu.tr/...',
  date: 1718409600000,     // epoch ms (sıralama + göreli tarih)
  summary: '...'           // opsiyonel kısa özet
}
```

## Veri Akışı

```
[cron] → aggregator → her kaynak için (paralel, izole):
           fetcher → parser → normalize
       → birleştir + tarihe göre sırala → NodeBB cache'e yaz
[sayfa açılışı] → widget.render → cache'ten oku → .tpl render → HTML
[client] → sekme tıklaması → JS filtre (Tümü / Fakültem / Ana)
```

## Dayanıklılık (Hata Yönetimi)

- **Kaynak izolasyonu:** Her kaynak ayrı try/catch ile çekilir. Bir kaynak çökse
  veya HTML yapısı değişse bile diğerleri etkilenmez.
- **Stale-while-error:** Çekim başarısızsa o kaynağın son başarılı verisi cache'te
  kalır ve gösterilmeye devam eder.
- **Zaman aşımı:** Her fetch için makul timeout (ör. 10 sn).
- **Loglama:** Hatalar `winston` (NodeBB logger) ile loglanır; ACP'de son çekim
  durumu/zamanı görünür.
- **Widget durumları:** yükleniyor / boş / hata zarif şekilde gösterilir.

## Kaynak Registry — Başlangıç Seti

Ana site + doğrulanmış fakülteler. Her kaynağın seçicileri uygulama sırasında
gerçek HTML'den doğrulanır.

| id | Ad | Tip | URL (duyuru sayfası) |
|----|----|-----|----|
| main | Ana Duyurular | html | https://www.deu.edu.tr/tum-duyurular/ |
| iibf | İİBF | rss→html | https://iibf.deu.edu.tr/ |
| hukuk | Hukuk | html | https://hukuk.deu.edu.tr/ |
| muhendislik | Mühendislik | html | https://muhendislik.deu.edu.tr/ |
| tip | Tıp | html | https://tip.deu.edu.tr/ |
| edebiyat | Edebiyat | html | https://edebiyat.deu.edu.tr/ |
| fen | Fen | html | https://fen.deu.edu.tr/ |
| isletme | İşletme | html | https://isletme.deu.edu.tr/ |

> Not: Her WordPress kaynağı için önce `/feed/` denenir (RSS); 404/erişilemezse
> HTML seçicilere düşülür. Erişilemeyen kaynaklar (ör. bağlantı reddi) registry'de
> `enabled: false` ile işaretlenebilir.

## Widget Tasarımı (Sekmeli Liste)

- DEÜ kurumsal rengi (lacivert/bordo) vurgulu üst şerit + başlık.
- Sekmeler: **Tümü · Fakültem · Ana**. "Fakültem" = ACP'de seçilen birincil fakülte.
- Satır: renkli kaynak rozeti · başlık (link, `target=_blank rel=noopener`) · göreli tarih.
- Koyu/açık mod uyumu: NodeBB CSS değişkenleri kullanılır, sabit renk yok.
- Responsive; kenar çubuğu ve geniş alan için uyumlu.
- "Daha fazla" → kaynağın kendi duyuru sayfası.

## ACP (Admin Panel) Ayarları

- Yenileme aralığı (dk, varsayılan 30)
- Gösterilecek duyuru sayısı (varsayılan 15)
- Varsayılan "Fakültem" (dropdown, kaynak listesinden)
- Aktif kaynaklar (checkbox listesi)
- "Önbelleği şimdi yenile" butonu
- Son çekim durumu/zamanı göstergesi

## Test Stratejisi

- `parser` ve `sources` saf fonksiyonlar — kaydedilmiş örnek HTML/RSS fixture'larıyla
  birim test (canlı siteye bağımlı olmadan).
- `aggregator` izolasyon davranışı: bir kaynak hata verince diğerlerinin geçtiğini
  doğrulayan test.
- Göreli tarih biçimleyici için birim test.
- Widget render: cache verisiyle beklenen HTML iskeletinin üretildiğini doğrula.

## Açıkça Kapsam Dışı (YAGNI)

- Kullanıcı bazlı "Fakültem" tercihi (ilk sürümde admin seçer).
- Push/e-posta bildirimi.
- Tam metin arama.
- Duyuru detay sayfasını forum içinde gösterme (dış linke yönlendirilir).
