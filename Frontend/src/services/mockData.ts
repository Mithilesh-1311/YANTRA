

export interface DataPoint {
    time: string;
    value: number;
    value2?: number;
}

export const demandData: DataPoint[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: 4000 + Math.random() * 1000,
    value2: 3800 + Math.random() * 1200,
}));

export const frequencyData: DataPoint[] = Array.from({ length: 60 }, (_, i) => ({
    time: `${i}s`,
    value: 49.8 + Math.random() * 0.4,
}));

export const voltageData: DataPoint[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: 220 + Math.random() * 10 - 5,
}));

export const forecastData: DataPoint[] = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: 4200 + Math.sin(i / 3) * 500,
    value2: 4200 + Math.sin(i / 3) * 500 + (Math.random() - 0.5) * 100,
}));

export const tradingHistory = [
    { id: 1, type: 'Buy', amount: 50, price: 0.12, status: 'Confirmed', time: '10:23 AM' },
    { id: 2, type: 'Sell', amount: 120, price: 0.11, status: 'Pending', time: '10:25 AM' },
    { id: 3, type: 'Buy', amount: 30, price: 0.13, status: 'Confirmed', time: '10:30 AM' },
    { id: 4, type: 'Sell', amount: 200, price: 0.10, status: 'Failed', time: '10:45 AM' },
    { id: 5, type: 'Buy', amount: 75, price: 0.12, status: 'Confirmed', time: '11:05 AM' },
];


export const userProfile = {
    name: 'John Doe',
    email: 'john.doe@smartgrid.io',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    accountType: 'Prosumer',
    joinDate: 'Jan 2023',
    'energy ID': 'SG-8821-9922'
};

export const systemLogs = [
    { id: 1, action: 'Login Successful', ip: '192.168.1.10', time: 'Today, 10:00 AM' },
    { id: 2, action: 'Smart Meter Sync', ip: 'Device-AF22', time: 'Today, 09:45 AM' },
    { id: 3, action: 'Trade Executed (Buy)', ip: '192.168.1.10', time: 'Yesterday, 04:30 PM' },
    { id: 4, action: 'Device Connected', ip: '192.168.1.10', time: 'Yesterday, 04:25 PM' },
    { id: 5, action: 'Password Changed', ip: '192.168.1.10', time: 'Oct 24, 2023' },
];

export const buildingStats = [
    { id: 'B1', name: 'Main Admin Block', solar: 120, load: 85, battery: 78, status: 'Surplus' },
    { id: 'B2', name: 'Research Lab', solar: 45, load: 150, battery: 45, status: 'Deficit' },
    { id: 'B3', name: 'Student Dorms', solar: 80, load: 60, battery: 92, status: 'Surplus' },
    { id: 'B4', name: 'Cafeteria', solar: 30, load: 45, battery: 20, status: 'Deficit' },
    { id: 'B5', name: 'Guesthouse / EV Station', solar: 60, load: 40, battery: 85, status: 'Surplus' },
];

export const carbonStats = [
    { label: 'Total Credits Earned', value: '450', unit: 'CC', change: '+12%', color: 'text-[var(--color-accent-green)]' },
    { label: 'Credits Traded', value: '120', unit: 'CC', change: '+5%', color: 'text-[var(--color-accent-cyan)]' },
    { label: 'CO2 Offset', value: '1.2', unit: 'Tons', change: '+8%', color: 'text-white' },
];

export const marketPrices = {
    gridBuy: 0.15,
    gridSell: 0.08,
    p2pAverage: 0.12,
    trend: 'up'
};

/* ── GridMind Simulation Data ── */

export interface BuildingSimState {
    id: string;
    type: string;
    solar_kw: number;
    total_drained_kwh: number;
    battery_kwh: number;
    battery_cap: number;
    is_deficit: boolean;
    spike_active: boolean;
    sim_minute: number;
    hour_of_day: number;
}

export interface BuildingPrediction {
    predicted_net_kwh: number;
    deficit_probability: number;
    buffer_minutes: number;
}

export interface AllocationEntry {
    type: 'P2P' | 'CENTRAL' | 'GRID' | 'RECHARGE' | 'NO_ACTION';
    message: string;
    sim_minute: number;
}

const BUILDING_TYPES: Record<string, string> = {
    B1: 'Residential',
    B2: 'Residential L',
    B3: 'Residential S',
    B4: 'Commercial',
    B5: 'Commercial L',
};

const BASE_SOLAR: Record<string, number> = { B1: 2.1, B2: 1.5, B3: 1.8, B4: 1.9, B5: 2.6 };
const BASE_DRAIN: Record<string, number> = { B1: 0.031, B2: 0.030, B3: 0.028, B4: 0.031, B5: 0.038 };
const BASE_BATTERY: Record<string, number> = { B1: 10, B2: 7, B3: 15, B4: 8, B5: 12 };
const BATTERY_CAP: Record<string, number> = { B1: 10, B2: 10, B3: 15, B4: 10, B5: 15 };

function jitter(base: number, pct: number): number {
    return base + base * (Math.random() - 0.5) * pct;
}

export function generateBuildingStates(simMinute: number): Record<string, BuildingSimState> {
    const hour = (simMinute / 60) % 24;
    const states: Record<string, BuildingSimState> = {};
    ['B1', 'B2', 'B3', 'B4', 'B5'].forEach(id => {
        const solar = jitter(BASE_SOLAR[id], 0.15);
        const drain = jitter(BASE_DRAIN[id], 0.2);
        const bat = Math.max(0.5, Math.min(BATTERY_CAP[id], jitter(BASE_BATTERY[id], 0.1)));
        const isDeficit = id === 'B2' || id === 'B4';
        states[id] = {
            id,
            type: BUILDING_TYPES[id],
            solar_kw: solar,
            total_drained_kwh: drain,
            battery_kwh: bat,
            battery_cap: BATTERY_CAP[id],
            is_deficit: isDeficit,
            spike_active: Math.random() < 0.1,
            sim_minute: simMinute,
            hour_of_day: hour,
        };
    });
    return states;
}

export function generatePredictions(): Record<string, BuildingPrediction> {
    const preds: Record<string, BuildingPrediction> = {};
    const deficitBuildings = new Set(['B2', 'B4']);
    ['B1', 'B2', 'B3', 'B4', 'B5'].forEach(id => {
        const isDef = deficitBuildings.has(id);
        preds[id] = {
            predicted_net_kwh: isDef ? -(Math.random() * 0.06 + 0.02) : (Math.random() * 0.06 + 0.01),
            deficit_probability: isDef ? 0.3 + Math.random() * 0.2 : Math.random() * 0.15,
            buffer_minutes: isDef ? Math.floor(30 + Math.random() * 100) : Math.floor(50 + Math.random() * 80),
        };
    });
    return preds;
}

export function generateCentralBattery() {
    return {
        kwh: jitter(72, 0.1),
        capacity: 100,
        p2p_count: Math.floor(Math.random() * 20) + 5,
        central_count: Math.floor(Math.random() * 10) + 2,
        grid_count: Math.floor(Math.random() * 5),
    };
}

const ALLOC_TYPES: AllocationEntry['type'][] = ['P2P', 'CENTRAL', 'GRID', 'RECHARGE'];
const ALLOC_MSGS: Record<string, string[]> = {
    P2P: ['B1 → B2 (0.5 kWh)', 'B3 → B4 (0.3 kWh)', 'B5 → B2 (0.4 kWh)', 'B1 → B4 (0.6 kWh)'],
    CENTRAL: ['Central → B2 (1.2 kWh)', 'Central → B4 (0.8 kWh)', 'B5 → Central (0.9 kWh)'],
    GRID: ['Grid import → B4 (2.0 kWh)', 'Grid import → B2 (1.5 kWh)'],
    RECHARGE: ['B1 battery recharge +0.3 kWh', 'B3 battery recharge +0.5 kWh', 'B5 battery recharge +0.2 kWh'],
};

export function generateAllocationLog(count: number, startMinute: number): AllocationEntry[] {
    const log: AllocationEntry[] = [];
    for (let i = 0; i < count; i++) {
        const type = ALLOC_TYPES[Math.floor(Math.random() * ALLOC_TYPES.length)];
        const msgs = ALLOC_MSGS[type];
        log.push({
            type,
            message: msgs[Math.floor(Math.random() * msgs.length)],
            sim_minute: startMinute - i,
        });
    }
    return log;
}

export interface HistoryPoint {
    hour_of_day: number;
    battery_kwh: number;
    solar_kw: number;
    total_drained_kwh: number;
}

export function generateBuildingHistory(id: string, points: number): HistoryPoint[] {
    const history: HistoryPoint[] = [];
    const baseSolar = BASE_SOLAR[id];
    const baseDrain = BASE_DRAIN[id];
    const baseBat = BASE_BATTERY[id];
    for (let i = 0; i < points; i++) {
        const hour = 13.5 + (i * 2) / points;
        history.push({
            hour_of_day: +hour.toFixed(2),
            battery_kwh: Math.max(0.5, baseBat - (i * baseBat * 0.3) / points + (Math.random() - 0.5) * 0.5),
            solar_kw: Math.max(0, baseSolar * (1 - i / (points * 1.2)) + (Math.random() - 0.5) * 0.3),
            total_drained_kwh: baseDrain + (Math.random() - 0.3) * 0.01,
        });
    }
    return history;
}
