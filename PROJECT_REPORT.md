# Smart Microgrid Energy Trading System — Project Report

This report provides a comprehensive technical overview of the **Smart Microgrid Energy Trading System**, detailing the architecture and implementation of its three core pillars: **Blockchain**, **Web Development**, and **Machine Learning**.

---

## 1. Blockchain Architecture
**Role:** Decentralized settlement layer for energy transactions.

### Smart Contract: `SmartMicrogrid.sol`
The system uses a Solidity smart contract deployed on the Ethereum network (simulated via Hardhat) to enforce trustless energy trading.

- **Building Registry**: Maintains a mapping of registered buildings (`mapping(uint256 => Building)`). Only registered entities can participate.
- **Energy Accounting**: Tracks `storedEnergy` for each building on-chain, ensuring selling is only possible with sufficient balance.
- **Transaction Logic**: The `transferEnergy` function performs atomic atomic swaps:
    1. Verifies sender and receiver registration.
    2. Checks sender's energy balance.
    3. Deducts from sender, adds to receiver.
    4. Emits `EnergyTransferred` event for the frontend to listen to.
    5. Logs the trade in an on-chain `EnergyTransaction` array for auditability.

### Integration
- **Ethers.js**: The frontend interacts with the contract using `ethers.js`.
- **MetaMask**: Users approve transactions via their non-custodial wallet, ensuring cryptographic authorization for every trade.

---

## 2. Web Development Architecture
**Role:** User interface and central data aggregation hub.

### Frontend (React + Vite)
Built with a modern, component-based architecture:
- **Tech Stack**: React, TypeScript, Tailwind CSS, Recharts, Framer Motion.
- **Service Layer (`api.ts`)**: A centralized typed API layer abstracts all network calls, decoupling UI components from backend endpoints.
- **Live Data Visualization**:
    - **Dashboard**: Real-time grid overview, building states, and alerts.
    - **Trading**: P2P marketplace interface where users view offers and initiate blockchain transactions.
    - **Charts/Forecasts**: Interactive graphs for historical data and AI-driven predictions.
- **State Management**: Uses React hooks (`useState`, `useEffect`) with polling intervals (3-10s) to maintain synchronization with the backend.

### Backend (Node.js + Express)
Acts as the bridge between the ML simulation and the frontend.
- **In-Memory Store**: `liveBuildings` object caches the latest 1-second interval updates from the Python generator for sub-millisecond frontend retrieval.
- **History Ring Buffer**: `buildingHistory` circular array stores the fast 200 data points per building for historical charting.
- **API Endpoints**:
    - `POST /update`: Ingests high-frequency simulation data.
    - `GET /api/buildings/*`: Serves live state, history, and ML predictions.
    - `POST /api/trades`: Persists completed blockchain transactions to a Supabase database for off-chain record keeping.

---

## 3. Machine Learning Architecture
**Role:** Simulating the environment and forecasting energy needs.

### Simulation (`generator.py`)
A sophisticated multi-threaded simulation engine:
- **Physics-Based Models**: Simulates 5 distinct buildings (Residential to Commercial) with unique solar array sizes (`peak_solar`) and battery capacities (`battery_cap`).
- **Dynamic Profiles**:
    - **Solar**: Calculated using simulated hour-of-day with efficiency loss factors and weather noise.
    - **Load**: Base load profiles (rush hour peaks) + stochastic appliance spikes (random duration and power draw).
- **Data Stream**: Runs in real-time (1s = 1 simulated minute) and POSTs telemetry payload to the Node.js server every simulation tick.

### Forecasting (LSTM)
Implements a simulation-aware Recurrent Neural Network:
- **Model**: Stacked **Long Short-Term Memory (LSTM)** network (64/32 units) with Dropout layers to prevent overfitting.
- **Multi-Task Learning**: Two output heads:
    1.  **Regression Head**: Predicts `net_flow_kw` (Surplus/Deficit amount).
    2.  **Classification Head**: Predicts `deficit_probability` (Risk of power outage).
- **Feature Engineering**: Uses Cyclical Time Encoding (`time_sin`, `time_cos`) so the model understands 23:59 -> 00:00 continuity.

### Federated Learning (`fedavg.py`)
Enables privacy-preserving model training:
- **Privacy First**: Raw building data (`.csv`) stays local.
- **Aggregation**: The central server averages model **weights** (not data) from all buildings, weighted by their dataset size.
- **Global Intelligence**: Distributes the "smarter" global model back to local buildings, allowing them to learn from collective patterns without sharing sensitive usage data.

---

## 4. System Integration & Data Flow
**Role:** orchestrating the components into a cohesive system.

### The "Loop" Architecture
The system operates in a continuous real-time loop:

1.  **Generation (Python)**:
    - `generator.py` calculates the state for Building 1 (e.g., Solar: 5kW, Bat: 90%).
    - Determines surplus/deficit status.
    - **Action**: `POST /update` -> Node.js Server.

2.  **Aggregation (Node.js)**:
    - Server receives payload, updates `liveBuildings["B1"]` in RAM.
    - Pushes data point to `buildingHistory["B1"]`.

3.  **Visualization (React)**:
    - `Dashboard.tsx` polls `GET /api/buildings` every 4s.
    - User sees Building 1 has 5kW Surplus.

4.  **Trading (Blockchain + Web)**:
    - User notices Building 2 is in Deficit.
    - User clicks "Buy" on the **Trading** page.
    - **MetaMask** prompts to sign a transaction to `SmartMicrogrid.sol`.
    - Upon confirmation (`tx.wait()`), frontend calls `POST /api/trades` to log it.

5.  **Forecasting (ML)**:
    - `train_local.py` runs nightly (simulated) to update models.
    - `fedavg.py` aggregates improvements.
    - Node.js serves these updated predictions via `GET /api/buildings/predictions`, advising users *before* a deficit happens.

### Tech Stack Summary
| Layer | Technologies |
|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind, Recharts |
| **Backend** | Node.js, Express, Supabase |
| **Blockchain** | Solidity, Hardhat, Ethers.js |
| **ML/AI** | Python, TensorFlow/Keras, Pandas, NumPy |
| **DevOps** | Git, Concurrently (for multi-process dev) |
