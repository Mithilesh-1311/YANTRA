"""
generator.py — 5 Buildings
────────────────────────────
Every 1s = 1 simulated minute.

5 buildings run in parallel threads.
Each building has its own solar, battery, consumption profile, spike state.
All buildings tick at the same real-time pace.
All POST to the same server identified by building_id.

DEFICIT: battery hits 0 and total_drained > solar_gained
SURPLUS: otherwise

SPIKE: appliance event (AC, washing machine, etc.)
"""

import math, random, time, requests, threading, csv, os


# List of servers to update simultaneously (Prod + Local)
SERVER_URLS = [
    "https://yantra-jajt.onrender.com/update",
    "http://127.0.0.1:5000/update"
]
DATA_DIR   = "data"   # each building writes its own CSV here

# Solar panel efficiency factor (accounts for panel losses, inverter, heat, angle)
# Real-world: 15kW system generates ~63 kWh/day, not raw 15kW * 12hrs = 180 kWh
SOLAR_EFF  = 0.6

# ── Building profiles ─────────────────────────────────────────
# 5 different buildings — different solar, battery, consumption habits
# base_mult scales the base consumption up or down
# battery_start set to create realistic deficit/surplus split from day 1:
#   B1, B3, B5 → surplus buildings (good solar, moderate consumption)
#   B2, B4     → deficit buildings (weak solar or high consumption, low start charge)
PROFILES = {
    "B1": {"peak_solar": 15.0, "battery_cap": 15.0, "battery_start": 4.0,  "base_mult": 1.3, "btype": "Residential"},
    "B2": {"peak_solar": 10.0, "battery_cap": 15.0, "battery_start": 3.0,  "base_mult": 1.4, "btype": "Residential Large"},
    "B3": {"peak_solar": 12.0, "battery_cap": 15.0, "battery_start": 3.0,  "base_mult": 1.2, "btype": "Residential Small"},
    "B4": {"peak_solar": 8.0,  "battery_cap": 20.0, "battery_start": 5.0,  "base_mult": 1.8, "btype": "Commercial"},
    "B5": {"peak_solar": 20.0, "battery_cap": 18.0, "battery_start": 5.0,  "base_mult": 1.7, "btype": "Commercial Large"},
}
# ─────────────────────────────────────────────────────────────


def solar_kw(hour, peak_solar):
    """Solar output in kW at this hour — with 0.6 efficiency factor (real-world losses)."""
    if hour < 6 or hour > 18: return 0.0
    return max(0.0, round(peak_solar * SOLAR_EFF * math.sin(math.pi*(hour-6)/12) + random.gauss(0, 0.15), 3))


def base_consumption_kwh(hour, base_mult):
    """Normal per-minute usage — boosted during rush hours, scaled by building type."""
    if 7 <= hour < 9:            base = 0.040   # morning rush — kettle, shower, toaster
    elif 18 <= hour < 22:        base = 0.050   # evening rush  — cooking, AC, washing
    elif hour >= 22 or hour < 6: base = 0.012   # night         — standby only
    else:                        base = 0.022   # daytime       — moderate
    base *= base_mult
    return max(0.001, round(base + random.gauss(0, 0.002), 4))


def run_building(building_id, profile):
    """One building running forever — mirrors your exact single-building logic."""
    try:
        BATTERY_CAPACITY = profile["battery_cap"]
        battery          = profile["battery_start"]
        peak_solar       = profile["peak_solar"]
        base_mult        = profile["base_mult"]
        btype            = profile["btype"]

        spike_kwh_per_min  = 0.0
        spike_minutes_left = 0
        sim_minute         = 0

        # ── CSV logger — one file per building ───────────────────
        # Columns match exactly what the LSTM will need:
        #   timestamp, solar_output_kw, consumption_kw, battery_level_kwh,
        #   net_flow_kw, time_of_day_encoded
        # net_flow_kw = solar_kw - total_drained_kw  (positive=surplus, negative=deficit)
        # time_of_day_encoded = sin/cos pair so the model understands cyclical time
        os.makedirs(DATA_DIR, exist_ok=True)

        csv_path = os.path.join(DATA_DIR, f"{building_id}.csv")
        file_exists = os.path.isfile(csv_path)

        csv_file = open(csv_path, "a", newline="")
        writer = csv.writer(csv_file)

        if not file_exists:
            writer.writerow([
            "sim_minute", "hour_of_day",
            "solar_output_kw", "consumption_kw", "battery_level_kwh",
            "net_flow_kw", "time_sin", "time_cos",
            "is_deficit"
        ])


        # ─────────────────────────────────────────────────────────

        while True:
            hour  = (sim_minute % 1440) / 60.0
            solar = solar_kw(hour, peak_solar)
            base  = base_consumption_kwh(hour, base_mult)

            # ── Spike probability varies by time of day ──────────
            # Realistic: 0.1-0.3% per minute → 2-5 appliance events per day
            # Rush hours get higher spike chance — more appliances firing simultaneously
            if 7 <= hour < 9:       spike_chance = 0.005   # morning rush  — kettle, toaster, shower pump
            elif 8 <= hour < 18:    spike_chance = 0.002   # daytime       — AC, dishwasher
            elif 18 <= hour < 22:   spike_chance = 0.006   # evening rush  — cooking, laundry, AC (peak)
            elif 6 <= hour < 7:     spike_chance = 0.001   # early morning — occasional
            else:                   spike_chance = 0.0005  # night         — very rare

            # ── New spike event? ──────────────────────────────────
            if spike_minutes_left == 0 and random.random() < spike_chance:
                spike_kwh_per_min  = round(random.uniform(0.033, 0.083), 4)  # 2–5 kW realistic appliance
                spike_minutes_left = random.randint(20, 90)                   # real cycle: 20–90 mins
                print(f"\n  [{building_id}] ⚡ APPLIANCE ON  — drains {spike_kwh_per_min} kWh/min ({spike_kwh_per_min*60:.1f}kW)  for {spike_minutes_left} simulated minutes\n")

            # ── Current spike drain ───────────────────────────────
            spike_this_min = spike_kwh_per_min if spike_minutes_left > 0 else 0.0
            if spike_minutes_left > 0:
                spike_minutes_left -= 1
                if spike_minutes_left == 0:
                    print(f"\n  [{building_id}] ✅ APPLIANCE OFF — event ended\n")

            # ── Battery update ────────────────────────────────────
            solar_gained   = round(solar / 60.0, 6)
            total_drained  = round(base + spike_this_min, 6)
            battery_before = battery

            battery = battery + solar_gained - base - spike_this_min
            battery = max(0.0, min(BATTERY_CAPACITY, round(battery, 4)))

            is_deficit = (battery == 0.0 and total_drained > solar_gained)

            # ── Log to CSV ────────────────────────────────────────
            # time_sin/cos encodes hour cyclically so LSTM sees 23:59 ≈ 00:00
            time_sin = round(math.sin(2 * math.pi * hour / 24), 6)
            time_cos = round(math.cos(2 * math.pi * hour / 24), 6)
            net_flow = round(solar_gained - total_drained, 6)   # + surplus / - deficit
            writer.writerow([
                sim_minute, round(hour, 4),
                solar_gained, round(total_drained, 6), battery,
                net_flow, time_sin, time_cos,
                int(is_deficit)
            ])
            csv_file.flush()   # write immediately so data is readable while running
            # ─────────────────────────────────────────────────────

            # ── Print ─────────────────────────────────────────────
            if spike_this_min > 0:
                print(f"  [{building_id}] min={sim_minute:5}  hr={hour:5.2f}  solar={solar_gained:.4f}  base={base:.4f}  spike={spike_this_min:.3f}  total={total_drained:.4f}  bat:{battery_before}→{battery}  [left={spike_minutes_left}]")
            else:
                status = "DEFICIT" if is_deficit else "SURPLUS"
                print(f"  [{building_id}] min={sim_minute:5}  hr={hour:5.2f}  solar={solar_gained:.4f}kWh  base={base:.4f}kWh  bat={battery:6.4f}  {status}")

            # ── Send to server ────────────────────────────────────
            payload = {
                "building_id":       building_id,
                "building_type":     btype,
                "sim_minute":        sim_minute,
                "hour_of_day":       round(hour, 4),
                "solar_kw":          solar,
                "base_kwh":          base,
                "spike_kwh":         spike_this_min,
                "total_drained_kwh": total_drained,
                "battery_kwh":       battery,
                "battery_cap":       BATTERY_CAPACITY,
                "is_deficit":        is_deficit,
                "spike_active":      spike_minutes_left > 0,
                "spike_mins_left":   spike_minutes_left,
            }

            # Broadcast to all configured servers
            for url in SERVER_URLS:
                try:
                    requests.post(url, json=payload, timeout=1)
                except Exception as e:
                    print(f"  [{building_id}] Failed to send to {url}: {e}")

            sim_minute += 1
            # Reduced sleep to compensate for network latency (Local: ~0.15s, Remote: ~300ms latency + sleep)
            time.sleep(0.01) 
    except Exception as e:
        print(f"\n❌ [{building_id}] THREAD CRASHED: {e}\n")
        import traceback
        traceback.print_exc()


# ── Launch all 5 buildings in parallel ───────────────────────
if __name__ == "__main__":
    print("Starting 5 buildings...\n")
    for building_id, profile in PROFILES.items():
        t = threading.Thread(
            target=run_building,
            args=(building_id, profile),
            daemon=True
        )
        t.start()
        print(f"  Started {building_id} — {profile['btype']}  (solar={profile['peak_solar']}kW  bat={profile['battery_cap']}kWh  x{profile['base_mult']} consumption)")
        time.sleep(0.25)

    print("\nAll 5 buildings running. Ctrl+C to stop.\n")
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopped.")