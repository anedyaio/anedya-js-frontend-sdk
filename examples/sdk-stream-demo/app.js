// ─────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────
let stream = null;
let node = null;
let client = null;
let globalPaused = false;
let subs = [];
let subIdCounter = 0;
let sdkReady = false;

window.addEventListener('sdk-ready', () => { sdkReady = true; });

// ─────────────────────────────────────────────────────────────────────────
// Logging
// ─────────────────────────────────────────────────────────────────────────
const LOG_STYLES = {
  var:    { dot: 'dot-var',    cls: 'c-var' },
  vs:     { dot: 'dot-vs',     cls: 'c-vs' },
  event:  { dot: 'dot-event',  cls: 'c-event' },
  status: { dot: 'dot-status', cls: 'c-status' },
  error:  { dot: 'dot-error',  cls: 'c-error' },
  node:   { dot: 'dot-node',   cls: 'c-node' },
};

function ts() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function log(msg, type = 'status') {
  const box = document.getElementById('log-box');
  box.querySelector('.log-empty')?.remove();
  const style = LOG_STYLES[type] || LOG_STYLES.status;
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-ts">${ts()}</span><div class="log-dot ${style.dot}"></div><span class="log-msg ${style.cls}">${msg}</span>`;
  box.appendChild(entry);
  box.scrollTop = box.scrollHeight;
}

function clearLog() {
  document.getElementById('log-box').innerHTML =
    '<div class="log-empty"><i class="ti ti-route"></i>Log cleared</div>';
}

// ─────────────────────────────────────────────────────────────────────────
// UI helpers: flow steps + status badge
// ─────────────────────────────────────────────────────────────────────────
function setStep(n, state) {
  const el = document.getElementById(`step-${n}`);
  el.classList.remove('done', 'active');
  if (state) el.classList.add(state);
}

function setStepDetail(n, text) {
  document.getElementById(`step-${n}-detail`).textContent = text;
}

function setStatus(s) {
  const badge = document.getElementById('status-badge');
  const dot   = document.getElementById('pulse-dot');
  const text  = document.getElementById('status-text');
  const btnRun  = document.getElementById('btn-run');
  const btnStop = document.getElementById('btn-disconnect');
  const btnPause = document.getElementById('btn-pause-global');

  badge.className = 'header-badge';
  dot.className = 'pulse-dot';

  const map = {
    connected:    { badgeCls: 'connected',    dotCls: 'on',    label: 'Connected',     run: true,  stop: false, pause: false },
    reconnecting: { badgeCls: 'reconnecting', dotCls: 'blink', label: 'Reconnecting…', run: true,  stop: false, pause: true  },
    disconnected: { badgeCls: '',             dotCls: '',      label: 'Disconnected',  run: false, stop: true,  pause: true  },
  };
  const s2 = map[s] || map.disconnected;

  if (s2.badgeCls) badge.classList.add(s2.badgeCls);
  if (s2.dotCls) dot.classList.add(s2.dotCls);
  text.textContent = s2.label;
  btnRun.disabled = s2.run;
  btnStop.disabled = s2.stop;
  btnPause.disabled = s2.pause;
}

// ─────────────────────────────────────────────────────────────────────────
// UI helpers: subscription rows
// ─────────────────────────────────────────────────────────────────────────
function renderSubs() {
  const list = document.getElementById('sub-list');
  const active = subs.filter((s) => s.active);

  if (active.length === 0) {
    list.innerHTML = '<div class="empty-subs"><i class="ti ti-antenna-off"></i>No subscriptions yet</div>';
    return;
  }

  list.innerHTML = active.map((s) => {
    const badgeCls = { variable: 'badge-var', valuestore: 'badge-vs', event: 'badge-event' }[s.type];
    const badgeLabel = { variable: 'variable', valuestore: 'value store', event: 'event' }[s.type];
    return `
      <div class="sub-item ${s.paused ? 'sub-paused' : ''}" id="sub-row-${s.id}">
        <span class="badge ${badgeCls}">${badgeLabel}</span>
        <span class="sub-name">${s.key || 'all events'}</span>
        <span class="sub-value" id="sub-value-${s.id}">—</span>
        <span class="sub-count" id="sub-count-${s.id}">0</span>
        <button class="btn btn-sm" id="sub-pause-btn-${s.id}" data-sub-pause="${s.id}">${s.paused ? 'Resume' : 'Pause'}</button>
        <button class="btn btn-sm btn-danger" data-sub-cancel="${s.id}"><i class="ti ti-x"></i></button>
        <div class="sub-meta" id="sub-meta-${s.id}">no data yet</div>
      </div>
    `;
  }).join('');
}

function toggleSubPause(id) {
  const s = subs.find((x) => x.id === id);
  if (!s) return;
  s.paused ? s.handle.resume() : s.handle.pause();
  s.paused = !s.paused;
  document.getElementById(`sub-row-${id}`).classList.toggle('sub-paused', s.paused);
  document.getElementById(`sub-pause-btn-${id}`).textContent = s.paused ? 'Resume' : 'Pause';
  log(`"${s.key || 'events'}" ${s.paused ? 'paused' : 'resumed'}`);
}

function cancelSub(id) {
  const s = subs.find((x) => x.id === id);
  if (!s) return;
  s.handle.cancel();
  s.active = false;
  log(`Subscription "${s.key || 'events'}" cancelled`);
  renderSubs();
}

function incSubCount(id) {
  const el = document.getElementById(`sub-count-${id}`);
  if (el) el.textContent = parseInt(el.textContent || '0') + 1;
}

function updateSubValue(id, value, meta) {
  const valEl = document.getElementById(`sub-value-${id}`);
  const metaEl = document.getElementById(`sub-meta-${id}`);
  if (valEl) {
    valEl.textContent = typeof value === 'object' ? JSON.stringify(value) : String(value);
    valEl.classList.add('flash');
    setTimeout(() => valEl.classList.remove('flash'), 400);
  }
  if (metaEl && meta) metaEl.textContent = meta;
}

// Delegate clicks for dynamically-rendered subscription buttons
document.getElementById('sub-list').addEventListener('click', (e) => {
  const pauseId = e.target.closest('[data-sub-pause]')?.dataset.subPause;
  const cancelId = e.target.closest('[data-sub-cancel]')?.dataset.subCancel;
  if (pauseId) toggleSubPause(Number(pauseId));
  if (cancelId) cancelSub(Number(cancelId));
});

// ─────────────────────────────────────────────────────────────────────────
// Core flow: NewClient → NewNode → NewStream (real SDK)
// ─────────────────────────────────────────────────────────────────────────
async function runFlow() {
  if (!sdkReady) { log('SDK bundle not loaded yet — wait a moment and try again', 'error'); return; }

  const tid = document.getElementById('inp-tid').value.trim();
  const tok = document.getElementById('inp-tok').value.trim();
  const nid = document.getElementById('inp-nid').value.trim();
  const url = document.getElementById('inp-url').value.trim();
  const sid = document.getElementById('inp-sid').value.trim();

  if (!tid || !tok || !nid || !url || !sid) {
    log('All fields are required', 'error');
    return;
  }

  clearLog();
  [1, 2, 3].forEach((n) => setStep(n, null));

  const anedya = new window.SDK.Anedya();

  // Step 1 — Client
  setStep(1, 'active');
  log('Step 1 → anedya.NewClient(anedya.NewConfig(tokenId, token))', 'node');
  const config = anedya.NewConfig(tid, tok);
  client = anedya.NewClient(config);
  setStep(1, 'done');
  setStepDetail(1, `tokenId: ${tid.slice(0, 10)}… · auth: ${client.authorizationMode}`);
  log('✅ Client created', 'status');

  // Step 2 — Node
  setStep(2, 'active');
  log(`Step 2 → anedya.NewNode(client, "${nid}")`, 'node');
  node = anedya.NewNode(client, nid);
  setStep(2, 'done');
  setStepDetail(2, `node.getNodeId() → ${node.getNodeId()}`);
  log(`✅ Node created — id: ${node.getNodeId()}`, 'status');

  // Step 3 — Stream
  setStep(3, 'active');
  setStepDetail(3, 'Generating signature and opening WebSocket…');
  log('Step 3 → anedya.NewStream(client, node, streamId, streamUrl)', 'node');
  stream = anedya.NewStream(client, node, sid, url);

  stream.onStatus((status) => {
    setStatus(status);
    if (status === 'connected') {
      setStep(3, 'done');
      setStepDetail(3, 'Connected — listening for messages');
    }
    log(`Status: ${status}`, 'status');
  });

  stream.onError((err) => log(`Stream error: ${err}`, 'error'));

  log('Connecting…', 'status');
  await stream.connect();
}

function doDisconnect() {
  if (!stream) return;
  stream.disconnect();
  stream = null;
  setStep(3, null);
  setStepDetail(3, 'Disconnected — run flow again to reconnect');
  log('Disconnected by user', 'status');
}

function toggleGlobalPause() {
  if (!stream) return;
  const icon = document.getElementById('pause-icon');
  const label = document.getElementById('pause-label');
  globalPaused = !globalPaused;
  if (globalPaused) {
    stream.pause();
    icon.className = 'ti ti-player-play';
    label.textContent = 'Resume all';
    log('Global delivery paused', 'status');
  } else {
    stream.resume();
    icon.className = 'ti ti-player-pause';
    label.textContent = 'Pause all';
    log('Global delivery resumed', 'status');
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Subscriptions — all calling the real AnedyaStreamClient instance
// ─────────────────────────────────────────────────────────────────────────
function addVariableSub() {
  const key = document.getElementById('inp-var').value.trim();
  if (!key) return;
  if (!stream) { log('Run the flow first', 'error'); return; }

  const id = ++subIdCounter;
  const handle = stream.onVariable(key, (data) => {
    incSubCount(id);
    updateSubValue(id, data.value, `@ ${new Date(data.timestamp || Date.now()).toLocaleTimeString()} · type ${data.dataType}`);
    log(`Variable <strong class="c-var">${key}</strong> → ${JSON.stringify(data.value)}`, 'var');
  });

  subs.push({ id, type: 'variable', key, handle, paused: false, active: true });
  log(`Subscribed to "${key}" via stream.onVariable()`);
  renderSubs();
}

function addValueStoreSub() {
  const key = document.getElementById('inp-vs').value.trim();
  if (!key) return;
  if (!stream) { log('Run the flow first', 'error'); return; }

  const id = ++subIdCounter;
  const handle = stream.onValueStore(key, (data) => {
    incSubCount(id);
    updateSubValue(id, data.value, `scope: ${data.scope ?? '?'} · @ ${new Date(data.timestamp || Date.now()).toLocaleTimeString()}`);
    log(`Value store <strong class="c-vs">${key}</strong> → ${JSON.stringify(data.value)}`, 'vs');
  });

  subs.push({ id, type: 'valuestore', key, handle, paused: false, active: true });
  log(`Subscribed to value store "${key}" via stream.onValueStore()`);
  renderSubs();
}

function addEventSub() {
  if (!stream) { log('Run the flow first', 'error'); return; }

  const id = ++subIdCounter;
  const handle = stream.onEvent((data) => {
    incSubCount(id);
    updateSubValue(id, data.value, `variable: ${data.variable} · @ ${new Date(data.timestamp || Date.now()).toLocaleTimeString()}`);
    log(`Event → <strong class="c-event">${data.variable}</strong> = ${JSON.stringify(data.value)}`, 'event');
  });

  subs.push({ id, type: 'event', key: null, handle, paused: false, active: true });
  log('Added catch-all listener via stream.onEvent()');
  renderSubs();
}

// ─────────────────────────────────────────────────────────────────────────
// Wire up static buttons
// ─────────────────────────────────────────────────────────────────────────
document.getElementById('btn-run').addEventListener('click', runFlow);
document.getElementById('btn-disconnect').addEventListener('click', doDisconnect);
document.getElementById('btn-pause-global').addEventListener('click', toggleGlobalPause);
document.getElementById('btn-add-var').addEventListener('click', addVariableSub);
document.getElementById('btn-add-vs').addEventListener('click', addValueStoreSub);
document.getElementById('btn-add-event').addEventListener('click', addEventSub);
document.getElementById('btn-clear-log').addEventListener('click', clearLog);