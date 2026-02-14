"""
fedavg.py — Federated Averaging
─────────────────────────────────────────────────────────
Collects weights from all 5 building models.
Computes weighted average (weighted by training data size).
Pushes global weights back to all buildings.

Run manually:      python fedavg.py
Run on schedule:   python fedavg.py --watch   (runs every 24 sim-hours)
"""

import os, json, sys, time
import numpy as np
from tensorflow import keras

MODEL_DIR = "models"
BUILDINGS = ["B1", "B2", "B3", "B4", "B5"]
DATA_DIR  = "data"


def get_data_size(building_id):
    """Number of training rows — used as weight in FedAvg."""
    csv_path = os.path.join(DATA_DIR, f"{building_id}.csv")
    if not os.path.exists(csv_path):
        return 1
    with open(csv_path) as f:
        return sum(1 for _ in f) - 1  # subtract header


def load_model(building_id):
    path = os.path.join(MODEL_DIR, f"{building_id}_model.keras")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model not found: {path}")
    return keras.models.load_model(path)


def fedavg_round():
    print("\n" + "="*55)
    print("  FedAvg Round Starting")
    print("="*55)

    # ── Step 1: Load all models + get data sizes ──────────────
    models     = {}
    data_sizes = {}

    for bid in BUILDINGS:
        try:
            models[bid]     = load_model(bid)
            data_sizes[bid] = get_data_size(bid)
            print(f"  [{bid}] loaded — {data_sizes[bid]:,} rows")
        except Exception as e:
            print(f"  [{bid}] SKIP — {e}")

    if len(models) < 2:
        print("  Not enough models for aggregation. Need at least 2.")
        return

    # ── Step 2: Weighted average of all weights ───────────────
    total_data = sum(data_sizes[bid] for bid in models)
    weights    = {bid: data_sizes[bid] / total_data for bid in models}

    print(f"\n  Aggregating {len(models)} models (total rows: {total_data:,})")
    for bid, w in weights.items():
        print(f"  [{bid}] weight = {w:.4f}  ({data_sizes[bid]:,} rows)")

    # Get layer weights from first model as template
    ref_bid        = list(models.keys())[0]
    ref_weights    = models[ref_bid].get_weights()
    num_layers     = len(ref_weights)
    global_weights = [np.zeros_like(w) for w in ref_weights]

    # Weighted sum across all buildings
    for bid, model in models.items():
        w       = weights[bid]
        m_weights = model.get_weights()
        for i in range(num_layers):
            global_weights[i] += w * m_weights[i]

    print(f"\n  Global weights computed ({num_layers} weight tensors)")

    # ── Step 3: Push global weights back to all buildings ─────
    print("\n  Distributing global weights...")
    for bid, model in models.items():
        model.set_weights(global_weights)
        model_path = os.path.join(MODEL_DIR, f"{bid}_model.keras")
        model.save(model_path)
        print(f"  [{bid}] updated → {model_path}")

    # ── Step 4: Save global model separately ──────────────────
    global_path = os.path.join(MODEL_DIR, "global_model.keras")
    models[ref_bid].save(global_path)
    print(f"\n  Global model saved → {global_path}")

    # ── Step 5: Log the round ─────────────────────────────────
    log = {
        "timestamp":   time.strftime("%Y-%m-%d %H:%M:%S"),
        "buildings":   list(models.keys()),
        "data_sizes":  {bid: data_sizes[bid] for bid in models},
        "weights":     {bid: round(weights[bid], 6) for bid in models},
        "total_rows":  total_data,
    }
    log_path = os.path.join(MODEL_DIR, "fedavg_log.json")
    logs = []
    if os.path.exists(log_path):
        with open(log_path) as f:
            logs = json.load(f)
    logs.append(log)
    with open(log_path, "w") as f:
        json.dump(logs, f, indent=2)

    print(f"\n  Round complete. Log → {log_path}")
    print("="*55 + "\n")
    return global_weights


def watch_mode(interval_seconds=86400):
    """Run FedAvg every interval_seconds (default 24 hours)."""
    print(f"FedAvg watch mode — running every {interval_seconds}s")
    while True:
        fedavg_round()
        print(f"  Next round in {interval_seconds}s...")
        time.sleep(interval_seconds)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--watch":
        # For demo: run every 60 real seconds = every simulated day
        watch_mode(interval_seconds=60)
    else:
        fedavg_round()