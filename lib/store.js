'use strict';

let bySource = {};   // sourceId -> items[]
let merged = [];     // birleşik, tarihe göre azalan
let lastRun = null;  // { time, status }

function rebuild() {
  // Kaynaklar arası round-robin harmanla (tarih bilinmeyince çeşitlilik için),
  // sonra tarihe göre azalan sırala. Node'un sort'u kararlı olduğundan, tarihi
  // olan duyurular üste çıkar; tarihsiz (date=0) olanlar round-robin sırasını korur.
  const lists = Object.values(bySource).map(items => items.slice());
  const interleaved = [];
  let added = true;
  while (added) {
    added = false;
    for (const list of lists) {
      if (list.length) { interleaved.push(list.shift()); added = true; }
    }
  }
  merged = interleaved.sort((a, b) => b.date - a.date);
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
