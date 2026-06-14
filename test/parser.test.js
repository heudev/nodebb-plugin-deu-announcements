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

describe('parseHtml — anchor-as-item', () => {
  const anchorSource = {
    id: 'tip', name: 'Tıp', faculty: 'tip', url: 'https://tip.deu.edu.tr/duyurular/',
    selectors: { item: 'a[href*="/duyurular/"]' },
  };
  const anchorHtml = `<html><body>
    <a href="https://tip.deu.edu.tr/duyurular/">Tüm Duyurular</a>
    <a href="https://tip.deu.edu.tr/duyurular/sinav/">Sınav programı</a>
    <a href="https://tip.deu.edu.tr/duyurular/sinav/">Sınav programı</a>
    <a href="https://tip.deu.edu.tr/duyurular/burs/">Burs ilanı</a>
  </body></html>`;
  const items = parseHtml(anchorHtml, anchorSource);
  it('anchor item link ve başlığı çıkarır', () => {
    assert.strictEqual(items[0].title, 'Sınav programı');
    assert.strictEqual(items[0].link, 'https://tip.deu.edu.tr/duyurular/sinav/');
  });
  it('index linkini atlar ve tekrarları temizler', () => {
    assert.strictEqual(items.length, 2); // index + dup elendi
    assert.ok(!items.some(i => i.title === 'Tüm Duyurular'));
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
