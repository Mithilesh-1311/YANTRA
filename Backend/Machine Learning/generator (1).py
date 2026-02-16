import math, random, time, requests, threading, csv, os
from flask import Flask

# Track which servers are currently unreachable
_server_down = set()

# Use environment variable SERVER_URL if provided
ENV_SERVER_URL = os.getenv("SERVER_URL")
if ENV_SERVER_URL:
    # Ensure it ends with /update
    if not ENV_SERVER_URL.endswith('/update'):
        ENV_SERVER_URL = ENV_SERVER_URL.rstrip('/') + '/update'
    SERVER_URLS = [ENV_SERVER_URL]
else:
    SERVER_URLS = [
        "https://yantra-jajt.onrender.com/update",
        "http://127.0.0.1:5000/update"
    ]
DATA_DIR = "data"
SOLAR_EFF = 0.6

PROFILES = {
    "B1": {"peak_solar": 15.0, "battery_cap": 15.0, "battery_start": 4.0,  "base_mult": 1.3, "btype": "Residential"},
    "B2": {"peak_solar": 10.0, "battery_cap": 15.0, "battery_start": 3.0,  "base_mult": 1.4, "btype": "Residential Large"},
    "B3": {"peak_solar": 12.0, "battery_cap": 15.0, "battery_start": 3.0,  "base_mult": 1.2, "btype": "Residential Small"},
    "B4": {"peak_solar": 8.0,  "battery_cap": 20.0, "battery_start": 5.0,  "base_mult": 1.8, "btype": "Commercial"},
    "B5": {"peak_solar": 20.0, "battery_cap": 18.0, "battery_start": 5.0,  "base_mult": 1.7, "btype": "Commercial Large"},
}

# Persistent state for all buildings
building_states = {}
for bid, prof in PROFILES.items():
    building_states[bid] = {
        "battery": prof["battery_start"],
        "spike_kwh_per_min": 0.0,
        "spike_minutes_left": 0,
        "sim_minute": 0,
        "csv_writer": None,
        "csv_file": None
    }

def solar_kw(hour, peak_solar):
    if hour < 6 or hour > 18: return 0.0
    return max(0.0, round(peak_solar * SOLAR_EFF * math.sin(math.pi*(hour-6)/12) + random.gauss(0, 0.15), 3))

def base_consumption_kwh(hour, base_mult):
    if 7 <= hour < 9:            base = 0.040
    elif 18 <= hour < 22:        base = 0.050
    elif hour >= 22 or hour < 6: base = 0.012
    else:                        base = 0.022
    base *= base_mult
    return max(0.001, round(base + random.gauss(0, 0.002), 4))

# Setup Session for connection pooling (FASTER)
session = requests.Session()

def update_building(bid, profile, state):
    sim_minute = state["sim_minute"]
    hour = (sim_minute % 1440) / 60.0
    solar = solar_kw(hour, profile["peak_solar"])
    base = base_consumption_kwh(hour, profile["base_mult"])

    # Spike logic
    if 7 <= hour < 9:       spike_chance = 0.005
    elif 8 <= hour < 18:    spike_chance = 0.002
    elif 18 <= hour < 22:   spike_chance = 0.006
    elif 6 <= hour < 7:     spike_chance = 0.001
    else:                   spike_chance = 0.0005

    if state["spike_minutes_left"] == 0 and random.random() < spike_chance:
        state["spike_kwh_per_min"] = round(random.uniform(0.033, 0.083), 4)
        state["spike_minutes_left"] = random.randint(20, 90)

    spike_this_min = state["spike_kwh_per_min"] if state["spike_minutes_left"] > 0 else 0.0
    if state["spike_minutes_left"] > 0:
        state["spike_minutes_left"] -= 1

    # Battery update
    solar_gained = round(solar / 60.0, 6)
    total_drained = round(base + spike_this_min, 6)
    state["battery"] = max(0.0, min(profile["battery_cap"], round(state["battery"] + solar_gained - total_drained, 4)))
    is_deficit = (state["battery"] == 0.0 and total_drained > solar_gained)

    # Payload
    payload = {
        "building_id": bid,
        "building_type": profile["btype"],
        "sim_minute": sim_minute,
        "hour_of_day": round(hour, 4),
        "solar_kw": solar,
        "base_kwh": base,
        "spike_kwh": spike_this_min,
        "total_drained_kwh": total_drained,
        "battery_kwh": state["battery"],
        "battery_cap": profile["battery_cap"],
        "is_deficit": is_deficit,
        "spike_active": state["spike_minutes_left"] > 0,
        "spike_mins_left": state["spike_minutes_left"],
    }

    # Log to CSV (optional optimization: don't flush every time)
    if not state["csv_writer"]:
        os.makedirs(DATA_DIR, exist_ok=True)
        csv_path = os.path.join(DATA_DIR, f"{bid}.csv")
        exists = os.path.isfile(csv_path)
        state["csv_file"] = open(csv_path, "a", newline="")
        state["csv_writer"] = csv.writer(state["csv_file"])
        if not exists:
            state["csv_writer"].writerow(["sim_minute", "hour_of_day", "solar_output_kw", "consumption_kw", "battery_level_kwh", "net_flow_kw", "time_sin", "time_cos", "is_deficit"])

    time_sin = round(math.sin(2 * math.pi * hour / 24), 6)
    time_cos = round(math.cos(2 * math.pi * hour / 24), 6)
    net_flow = round(solar_gained - total_drained, 6)
    state["csv_writer"].writerow([sim_minute, round(hour, 4), solar_gained, round(total_drained, 6), state["battery"], net_flow, time_sin, time_cos, int(is_deficit)])
    
    # Send to server (Using session is MUCH faster)
    for url in SERVER_URLS:
        try:
            resp = session.post(url, json=payload, timeout=0.8)
            if resp.status_code == 200:
                if url in _server_down:
                    _server_down.discard(url)
                    print(f"✅ Reconnected to {url}")
            else:
                if url not in _server_down:
                    _server_down.add(url)
                    print(f"⚠ Server returned {resp.status_code} for {url}: {resp.text[:100]}")
        except Exception as e:
            if url not in _server_down:
                _server_down.add(url)
                print(f"⚠ Connection failed to {url}: {str(e)}")

    state["sim_minute"] += 1

# Health Check
app = Flask(__name__)
@app.route('/')
def health(): return "Optimized Generator Running"

@app.route('/update', methods=['POST'])
def dummy_update(): 
    print("⚠ WARNING: Generator is POSTing to itself! Check your SERVER_URL environment variable.")
    return "Self-update blocked", 400

if __name__ == "__main__":
    threading.Thread(target=run_health_server, daemon=True).start()
    print("Starting optimized generator (Single-loop mode)...\n")
    
    try:
        while True:
            # Batch update all buildings in one sequence
            for bid, profile in PROFILES.items():
                update_building(bid, profile, building_states[bid])
            
            # Simulated minute pace (adjust for speed)
            # 0.2s sleep means 5 simulated minutes per real second. Fast but stable.
            time.sleep(0.2) 
    except KeyboardInterrupt:
        print("\nStopped.")