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
