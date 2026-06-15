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
const MORE_LINK = 'https://www.deu.edu.tr/tum-duyurular/';

// Widget sekme kategorileri (sabit görünüm sırası)
const CATEGORY_ORDER = [
  { id: 'ana', name: 'Ana' },
  { id: 'fakulte', name: 'Fakülteler' },
  { id: 'enstitu', name: 'Enstitüler' },
  { id: 'yuksekokul', name: 'Yüksekokullar' },
  { id: 'myo', name: 'MYO' },
  { id: 'birim', name: 'Birimler' },
];

let appRef = null;

plugin.init = async function (params) {
  const { router, middleware } = params;
  appRef = params.app;

  // ACP route
  router.get('/admin/plugins/deu-announcements', middleware.admin.buildHeader, renderAdmin);
  router.get('/api/admin/plugins/deu-announcements', renderAdmin);

  await startScheduler();
  winston.info('[deu-announcements] başlatıldı');
};

function renderAdmin(req, res) {
  res.render('admin/plugins/deu-announcements', {
    sources: sources.map(s => ({ id: s.id, name: s.name, enabled: s.enabled })),
  });
}

async function startScheduler() {
  const settings = (await meta.settings.get(SETTINGS_HASH)) || {};
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
  // ACP'de kapatılan kaynaklar "disabled_<id>" = "on" olarak gelir
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
  const settings = (await meta.settings.get(SETTINGS_HASH)) || {};
  const limit = Math.max(1, parseInt(settings.limit, 10) || 60);
  const defaultFaculty = (widget.data && widget.data.defaultFaculty) || settings.defaultFaculty || '';
  const now = Date.now();

  const announcements = store.get().slice(0, limit).map(a => ({
    ...a,
    relativeDate: a.date ? relativeDate(a.date, now) : '',
  }));

  // Kategori sekmeleri (sabit sıra). 'ana' sekmesi yok — tek kaynak, Tümü'de görünür.
  // Her kategori altında o kategoriye ait kaynaklar (alt-filtre) listelenir.
  const present = new Set(announcements.map(a => a.category));
  const tabs = CATEGORY_ORDER
    .filter(c => c.id !== 'ana' && present.has(c.id))
    .map((c) => {
      const seen = new Set();
      const subs = [];
      announcements.forEach((a) => {
        if (a.category === c.id && !seen.has(a.faculty)) {
          seen.add(a.faculty);
          subs.push({ id: a.faculty, name: a.sourceName });
        }
      });
      return { id: c.id, name: c.name, sources: subs };
    });

  widget.html = await renderTemplate('widgets/deu-announcements', {
    title: (widget.data && widget.data.title) || 'DEÜ Duyuruları',
    announcements,
    tabs,
    hasAnnouncements: announcements.length > 0,
    hasFaculty: !!defaultFaculty,
    defaultFaculty,
    moreLink: MORE_LINK,
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
