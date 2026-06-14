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
