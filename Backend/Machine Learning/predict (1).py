import json, numpy as np, pandas as pd, os
from tensorflow import keras

FEATURES  = ["solar_output_kw", "consumption_kw", "battery_level_kwh", "time_sin", "time_cos"]
WINDOW_IN = 60

# ── Load all models ONCE at import time ──────────────────────
_models = {}
_norms  = {}

for bid in ["B1", "B2", "B3", "B4", "B5"]:
    model_path = f"models/{bid}_model.keras"
    norm_path  = f"models/{bid}_norm.json"
    if os.path.exists(model_path) and os.path.exists(norm_path):
        _models[bid] = keras.models.load_model(model_path)
        with open(norm_path) as f:
            _norms[bid] = json.load(f)
        print(f"[predict] {bid} model loaded")
    else:
        print(f"[predict] WARNING: {bid} model not found")


def predict_building(building_id, last_60_rows_df):
    if building_id not in _models:
        raise KeyError(f"Model for {building_id} not loaded. Check if model files exist and are valid.")
    model = _models[building_id]
    norm  = _norms[building_id]

    X = np.zeros((1, WINDOW_IN, len(FEATURES)), dtype=np.float32)
    for i, feat in enumerate(FEATURES):
        col = last_60_rows_df[feat].values[-WINDOW_IN:].astype(np.float32)
        mn, mx = norm[feat]["min"], norm[feat]["max"]
        X[0, :, i] = (col - mn) / (mx - mn) if mx - mn > 1e-10 else 0

    net_kwh, deficit_prob = model.predict(X, verbose=0)
    return {
        "predicted_net_kwh":   float(net_kwh[0][0]),
        "deficit_probability": float(deficit_prob[0][0])
    }


if __name__ == "__main__":
    for bid in ["B1", "B2", "B3", "B4", "B5"]:
        df     = pd.read_csv(f"data/{bid}.csv")
        result = predict_building(bid, df.tail(60))
        print(f"{bid}: net={result['predicted_net_kwh']:.3f}  deficit_prob={result['deficit_probability']:.3f}")