"""
server.py — 5 Buildings
─────────────────────────
Receives data from 5 buildings in parallel.
Stores last 120 readings per building.
Dashboard shows all 5 buildings live.
"""

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from collections import deque, defaultdict
import uvicorn

app = FastAPI()

history = defaultdict(lambda: deque(maxlen=120))
latest  = {}


class Reading(BaseModel):
    building_id:       str
    building_type:     str
    sim_minute:        int
    hour_of_day:       float
    solar_kw:          float
    base_kwh:          float
    spike_kwh:         float
    total_drained_kwh: float
    battery_kwh:       float
    battery_cap:       float
    is_deficit:        bool
    spike_active:      bool
    spike_mins_left:   int


@app.post("/update")
def receive_update(r: Reading):
    row = r.dict()
    history[r.building_id].append(row)
    latest[r.building_id] = row
    return {"status": "ok"}


@app.get("/data")
def get_data():
    return {
        "latest":  latest,
        "history": {bid: list(rows) for bid, rows in history.items()}
    }


@app.get("/", response_class=HTMLResponse)
def dashboard():
    return """<!DOCTYPE html>
<html>
<head>
  <title>5 Buildings — Live Energy Monitor</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace; background: #0a0a0a; color: #e0e0e0; padding: 16px; }
    h1   { color: #00e5ff; margin-bottom: 16px; font-size: 18px; letter-spacing: 1px; }

    .grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    .card {
      background: #111;
      border-radius: 10px;
      padding: 12px;
      border: 1px solid #1e1e1e;
    }
    .card h2    { font-size: 13px; margin-bottom: 8px; }
    .card .row  { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; }
    .card .lbl  { color: #555; }
    .card .val  { font-weight: bold; }
    .surplus    { color: #00e676; }
    .deficit    { color: #ff1744; }
    .spike-val  { color: #ffab00; }

    .bar-bg  { background: #1a1a1a; border-radius: 4px; height: 7px; margin: 6px 0 4px; }
    .bar-fg  { height: 7px; border-radius: 4px; background: #00e5ff; transition: width 0.4s; }

    .spike-info { font-size: 10px; color: #ffab00; min-height: 13px; }

    .section     { margin-top: 14px; }
    .section h2  { color: #444; font-size: 12px; margin-bottom: 6px; }
    canvas       { background: #111; border-radius: 8px; padding: 8px; width: 100% !important; }

    #footer { font-size: 10px; color: #333; text-align: right; margin-top: 10px; }
  </style>
</head>
<body>
<h1>⚡ 5-Building Live Energy Monitor</h1>

<div class="grid" id="cards"></div>

<div class="section">
  <h2>🔋 Battery Level (kWh)</h2>
  <canvas id="batChart" height="70"></canvas>
</div>
<div class="section">
  <h2>☀ Solar Output (kW)</h2>
  <canvas id="solarChart" height="70"></canvas>
</div>
<div class="section">
  <h2>🔌 Total Drained (kWh/min)</h2>
  <canvas id="drainChart" height="70"></canvas>
</div>

<div id="footer">—</div>

<script>
const BUILDINGS = ['B1','B2','B3','B4','B5'];
const COLORS    = ['#00e5ff','#00e676','#ffeb3b','#ff7043','#ce93d8'];

// ── Build cards ──────────────────────────────────────────────
const cardsEl = document.getElementById('cards');
BUILDINGS.forEach((bid, i) => {
  cardsEl.innerHTML += `
    <div class="card" id="card-${bid}">
      <h2 style="color:${COLORS[i]}">${bid} <span id="btype-${bid}" style="color:#333;font-size:10px;font-weight:normal"></span></h2>
      <div class="row"><span class="lbl">☀ Solar</span>   <span class="val" id="solar-${bid}">—</span></div>
      <div class="row"><span class="lbl">🏠 Base</span>    <span class="val" id="base-${bid}">—</span></div>
      <div class="row"><span class="lbl">⚡ Spike</span>   <span class="val spike-val" id="spike-${bid}">—</span></div>
      <div class="row"><span class="lbl">🔋 Battery</span> <span class="val" id="bat-${bid}">—</span></div>
      <div class="bar-bg"><div class="bar-fg" id="bar-${bid}" style="width:0%"></div></div>
      <div class="row">
        <span class="lbl">Status</span>
        <span class="val" id="status-${bid}">—</span>
      </div>
      <div class="spike-info" id="sinfo-${bid}"></div>
    </div>`;
});

// ── Chart factory ────────────────────────────────────────────
function makeChart(id) {
  return new Chart(document.getElementById(id).getContext('2d'), {
    type: 'line',
    data: {
      labels: [],
      datasets: BUILDINGS.map((bid, i) => ({
        label: bid,
        data: [],
        borderColor: COLORS[i],
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1.5,
      }))
    },
    options: {
      animation: false,
      scales: {
        x: { ticks: { color: '#333', maxTicksLimit: 8 } },
        y: { ticks: { color: '#333' }, grid: { color: '#161616' } }
      },
      plugins: { legend: { labels: { color: '#444', boxWidth: 10, font: { size: 11 } } } }
    }
  });
}

const batChart   = makeChart('batChart');
const solarChart = makeChart('solarChart');
const drainChart = makeChart('drainChart');

// ── Refresh loop ─────────────────────────────────────────────
async function refresh() {
  try {
    const data = await fetch('/data').then(r => r.json());
    if (!data.latest) return;

    BUILDINGS.forEach((bid, i) => {
      const L = data.latest[bid];
      if (!L) return;

      document.getElementById(`btype-${bid}`).textContent  = L.building_type;
      document.getElementById(`solar-${bid}`).textContent  = L.solar_kw.toFixed(3) + ' kW';
      document.getElementById(`base-${bid}`).textContent   = L.base_kwh.toFixed(4) + ' kWh';
      document.getElementById(`spike-${bid}`).textContent  = L.spike_kwh > 0 ? L.spike_kwh.toFixed(4) + ' kWh' : '—';

      const pct = (L.battery_kwh / L.battery_cap * 100).toFixed(1);
      document.getElementById(`bat-${bid}`).textContent    = `${L.battery_kwh.toFixed(2)} / ${L.battery_cap} kWh`;
      document.getElementById(`bar-${bid}`).style.width    = pct + '%';

      const statusEl = document.getElementById(`status-${bid}`);
      statusEl.textContent = L.is_deficit ? '▼ DEFICIT' : '▲ SURPLUS';
      statusEl.className   = 'val ' + (L.is_deficit ? 'deficit' : 'surplus');

      document.getElementById(`sinfo-${bid}`).textContent = L.spike_active
        ? `⚡ running — ${L.spike_mins_left} sim-mins left`
        : '';

      // update chart datasets
      const h = data.history[bid] || [];
      const labels = h.map(r => r.hour_of_day.toFixed(1));
      batChart.data.labels              = labels;
      batChart.data.datasets[i].data   = h.map(r => r.battery_kwh);
      solarChart.data.labels            = labels;
      solarChart.data.datasets[i].data = h.map(r => r.solar_kw);
      drainChart.data.labels            = labels;
      drainChart.data.datasets[i].data = h.map(r => r.total_drained_kwh);
    });

    batChart.update();
    solarChart.update();
    drainChart.update();

    const s = Object.values(data.latest)[0];
    if (s) document.getElementById('footer').textContent =
      `sim-min: ${s.sim_minute}  |  hr: ${s.hour_of_day.toFixed(2)}  |  ${new Date().toLocaleTimeString()}`;

  } catch(e) { /* server not ready */ }
}

setInterval(refresh, 1000);
refresh();
</script>
</body>
</html>"""


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)