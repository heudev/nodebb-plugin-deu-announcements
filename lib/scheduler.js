'use strict';

let timer = null;

// Tek seferlik çekim: aggregate → store.update
async function runOnce(deps) {
  const result = await deps.aggregate(deps.sources, deps);
  deps.store.update(result);
  return result;
}

// Periyodik başlat. Önce hemen bir kez çalışır.
function start(deps, intervalMs) {
  stop();
  const tick = () => runOnce(deps).catch(deps.onError || (() => {}));
  tick();
  timer = setInterval(tick, intervalMs);
  if (timer.unref) timer.unref();
}

function stop() {
  if (timer) { clearInterval(timer); timer = null; }
}

module.exports = { start, stop, runOnce };
