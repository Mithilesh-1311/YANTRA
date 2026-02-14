import os
import sys
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings("ignore")



DATA_DIR = "data"
MODEL_DIR = "models"
WINDOW_IN = 60
WINDOW_OUT = 60

FEATURES = [
    "solar_output_kw",
    "consumption_kw",
    "battery_level_kwh",
    "time_sin",
    "time_cos",
]

EPOCHS = 100
BATCH_SIZE = 64
TEST_SPLIT = 0.15
LEARNING_RATE = 0.001

def load_buiding_data(building_id):
    csv_path = os.path.join(DATA_DIR,f"{building_id}.csv")
    df = pd.read_csv(csv_path)
    print(f"Loaded {building_id}: {len(df):,} rows, {len(df)/1440:.1f} simulated days")

    return df

# print(load_buiding_data("B1").head())

def normalize_features(df,features,building_id):
    norm_params = {}
    scaled_data = np.zeros((len(df),len(features)),dtype = np.float32)

    for i, feat in enumerate(features):
        col = df[feat].values.astype(np.float32)
        feat_min = float(col.min())
        feat_max = float(col.max())

        if feat_max - feat_min < 1e-10:
            scaled_data[:,i] = 0
        
        else:
            scaled_data[:,i] = (col-feat_min)/(feat_max - feat_min)

        norm_params[feat] = {"min": feat_min, "max": feat_max}
        print(f"  {feat:25s}  min={feat_min:.6f}  max={feat_max:.6f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    norm_path = os.path.join(MODEL_DIR, f"{building_id}_norm.json")
    with open(norm_path, "w") as f:
        json.dump(norm_params, f, indent=2)

    print(f"  Saved normalization params → {norm_path}")
    return scaled_data, norm_params
    


def create_windows(scaled_features,df,window_in = WINDOW_IN,window_out = WINDOW_OUT):
    net_flow = df["net_flow_kw"].values
    is_deficit = df["is_deficit"].values

    num_samples = len(df)-window_in - window_out + 1
    num_features = scaled_features.shape[1]

    X = np.zeros((num_samples,window_in,num_features),dtype = np.float32)
    y_net = np.zeros(num_samples,dtype = np.float32)
    y_def = np.zeros(num_samples,dtype = np.float32)
    
    for i in range(num_samples):
        X[i] = scaled_features[i:i+window_in]

        future_start = i+window_in
        future_end = future_start + window_out

        y_net[i] = net_flow[future_start:future_end].sum()

        y_def[i] = float(is_deficit[future_start:future_end].max())

    return X,y_net,y_def



def build_model(window_in, num_features):
    inputs = keras.Input(shape = (window_in,num_features), name = "input_window")

    x = layers.LSTM(64,return_sequences = True , name = "lstm_1")(inputs)
    x = layers.Dropout(0.2,name = "dropout_1")(x)
    x = layers.LSTM(32,return_sequences = False,name = "lstm_2")(x)

    reg = layers.Dense(16,activation = "relu",name = "reg_hidden")(x)
    reg_out = layers.Dense(1 , activation = "linear",name = "net_kwh")(reg)


    cls = layers.Dense(16,activation = "relu",name = "cls_hidden")(x)
    cls_out = layers.Dense(1,activation = "sigmoid",name = "deficit_prob")(cls)


    model = keras.Model(inputs = inputs,outputs = [reg_out , cls_out],name = "energy_lstm") 

    model.compile(
        optimizer = keras.optimizers.Adam(learning_rate = LEARNING_RATE),
        loss={
        "net_kwh": "mse",
        "deficit_prob": "binary_crossentropy",
        },
        loss_weights = {
            "net_kwh":1.0,
            "deficit_prob":2.0,
        },
        metrics = {
            "net_kwh":["mae"],
            "deficit_prob":["accuracy"],
        }
    )
    model.summary()
    return model


def train_building(building_id):
    df = load_buiding_data(building_id)
    scaled,norm_params = normalize_features(df,FEATURES,building_id)
    X,y_net,y_def = create_windows(scaled,df)

    split_idx = int(len(X)*(1-TEST_SPLIT))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_net_train, y_net_test = y_net[:split_idx], y_net[split_idx:]
    y_def_train, y_def_test = y_def[:split_idx], y_def[split_idx:]

    model = build_model(WINDOW_IN,len(FEATURES))

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,               # stop if no improvement for 5 epochs
            restore_best_weights=True, # keep the best model, not the last one
            verbose=1,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,               # halve the learning rate when stuck
            patience=3,               # wait 3 epochs before reducing
            min_lr=1e-6,              # don't reduce below this
            verbose=1,
        ),
    ]

    history = model.fit(
        X_train,
        {"net_kwh": y_net_train, "deficit_prob": y_def_train},
        validation_data=(
            X_test,
            {"net_kwh": y_net_test, "deficit_prob": y_def_test},
        ),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=1,
    ) 


    results = model.evaluate(
        X_test,
        {"net_kwh": y_net_test, "deficit_prob": y_def_test},
        verbose=0,
    )

    print(f"  Net energy MAE:      {results[3]:.4f} kWh  (avg error in energy prediction)")
    print(f"  Deficit accuracy:    {results[4]*100:.1f}%  (correctly predicted deficit/surplus)")

    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, f"{building_id}_model.keras")
    model.save(model_path)
    print(f"\n  Model saved → {model_path}")
    weights_path = os.path.join(MODEL_DIR, f"{building_id}_weights.weights.h5")
    model.save_weights(weights_path)

    return model, history

if __name__ == "__main__":
    
    building_arg = sys.argv[1].upper()

    if building_arg=="ALL":
        for bid in ["B1", "B2", "B3", "B4", "B5"]:
            train_building(bid)
    else:
        train_building(building_arg)

    
