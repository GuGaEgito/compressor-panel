function arcPath(cx, cy, r, startDeg, endDeg) {
  const toRad = (d) => d * Math.PI / 180;
  const sx = cx + r * Math.cos(toRad(startDeg));
  const sy = cy + r * Math.sin(toRad(startDeg));
  const ex = cx + r * Math.cos(toRad(endDeg));
  const ey = cy + r * Math.sin(toRad(endDeg));
  const largeArc = (endDeg - startDeg) <= 180 ? 0 : 1;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`;
}

let cfg = {
  min: 6.0,
  max: 8.0,
  setpoint1: 7.0,
  setpoint2: 7.5,
  unit: 'bar',
  title: 'Início',
  status: 'Func em Carga'
};

document.addEventListener("DOMContentLoaded", () => {
  const mainValEl = document.getElementById('mainVal');
  const unitEl = document.getElementById('unit');
  const capacityEl = document.getElementById('capacity');
  const hoursEl = document.getElementById('hours');
  const tempEl = document.getElementById('temp');
  const tsEl = document.getElementById('ts');
  const statusEl = document.getElementById('status');
  const needle = document.getElementById('needle');
  const arcLeft = document.getElementById('arcLeft');
  const arcMid = document.getElementById('arcMid');
  const arcRight = document.getElementById('arcRight');

  function drawArcs() {
    const cx = 0, cy = 60, r = 100;
    arcLeft.setAttribute("d", arcPath(cx, cy, r, -110, -30));
    arcMid.setAttribute("d", arcPath(cx, cy, r, -30, 30));
    arcRight.setAttribute("d", arcPath(cx, cy, r, 30, 110));
  }
  drawArcs();

  function map(value, inMin, inMax, outMin, outMax) {
    const clamped = Math.min(Math.max(value, inMin), inMax);
    return outMin + (outMax - outMin) * ((clamped - inMin) / (inMax - inMin));
  }

  function updateGauge(value) {
    const angle = map(value, cfg.min, cfg.max, -70, 70);
    needle.setAttribute('transform', `rotate(${angle},0,60)`);
    mainValEl.textContent = Number(value).toFixed(1);
    unitEl.textContent = cfg.unit;
  }

  uibuilder.onChange('msg', (msg) => {
    if (!msg || !msg.payload) return;
    const p = msg.payload;
    if (p.ui && p.ui.gauge) cfg = { ...cfg, ...p.ui.gauge };
    const val = Number(p.packageDischargePressure || 0);
    updateGauge(val);
    capacityEl.textContent = p.percentCapacity ?? '—';
    hoursEl.textContent = p.runningHours ?? '—';
    tempEl.textContent = p.airendTemp ?? '—';
    statusEl.textContent = cfg.status ?? '—';
    tsEl.textContent = new Date(p._ts).toLocaleTimeString();
    console.log("🟢 Dados recebidos do Node-RED:", p);
  });

  uibuilder.send({ topic: 'client_connected', payload: { ts: Date.now() } });
});
