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
    category: source.category || 'ana',
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

// Item için href bulur. Item'ın kendisi <a> olabilir (anchor-as-item),
// nested <a> içerebilir veya sel.link ile hedeflenebilir.
function pickHref($el, sel) {
  if (sel.link) {
    const found = $el.find(sel.link).first().attr('href');
    if (found) return found;
    if ($el.is(sel.link) && $el.attr('href')) return $el.attr('href');
  } else {
    const nested = $el.find('a').first().attr('href');
    if (nested) return nested;
  }
  if ($el.is('a') && $el.attr('href')) return $el.attr('href');
  return '';
}

function parseHtml(html, source) {
  const $ = cheerio.load(html);
  const sel = source.selectors;
  const items = [];
  const seen = new Set();
  const indexUrl = absolutize(source.url, source.url).replace(/\/$/, '');
  $(sel.item).each((i, el) => {
    const $el = $(el);
    const titleEl = sel.title ? $el.find(sel.title).first() : $el;
    const title = titleEl.text();
    if (!title.trim()) return;
    const link = absolutize(pickHref($el, sel), source.url);
    if (!link) return;
    if (link.replace(/\/$/, '') === indexUrl) return; // index/self linkini atla
    if (seen.has(link)) return;                        // aynı linki tekrar ekleme
    seen.add(link);
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
