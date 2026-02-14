import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, ReferenceLine
} from 'recharts';
import {
    demandData, frequencyData,
    generateBuildingHistory, generatePredictions,
} from '../services/mockData';
import type { HistoryPoint } from '../services/mockData';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const chartTooltipStyle = {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
};

const BUILDING_IDS = ['B1', 'B2', 'B3', 'B4', 'B5'];
const BUILDING_COLORS = ['#00e5ff', '#00ffa3', '#ffd600', '#ff6d00', '#ce93d8'];

// Merge per-building history arrays into a single array of objects for Recharts
function mergeHistory(histories: Record<string, HistoryPoint[]>) {
    const length = histories['B1']?.length || 0;
    const merged: Record<string, any>[] = [];
    for (let i = 0; i < length; i++) {
        const point: Record<string, any> = { hour: histories['B1'][i].hour_of_day };
        BUILDING_IDS.forEach(id => {
            const h = histories[id]?.[i];
            if (h) {
                point[`${id}_bat`] = h.battery_kwh;
                point[`${id}_solar`] = h.solar_kw;
                point[`${id}_drain`] = h.total_drained_kwh;
            }
        });
        merged.push(point);
    }
    return merged;
}

const Charts: React.FC = () => {
    // Generate history on mount and refresh every 5s
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 5000);
        return () => clearInterval(id);
    }, []);

    const histories = useMemo(() => {
        const h: Record<string, HistoryPoint[]> = {};
        BUILDING_IDS.forEach(id => { h[id] = generateBuildingHistory(id, 40); });
        return h;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tick]);

    const mergedData = useMemo(() => mergeHistory(histories), [histories]);

    // Deficit probability — flat lines from predictions
    const predictions = useMemo(() => generatePredictions(), [tick]);
    const deficitData = useMemo(() => {
        return mergedData.map(p => {
            const point: Record<string, any> = { hour: p.hour };
            BUILDING_IDS.forEach(id => {
                point[`${id}_prob`] = +(predictions[id].deficit_probability * 100).toFixed(2);
            });
            return point;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mergedData, predictions]);

    const gridAxisStyle = {
        stroke: 'var(--color-border-subtle)',
        strokeDasharray: 'none',
    };
    const tickStyle = { fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-text-dim)' };

    return (
        <div className="space-y-6 animate-enter">
            <h1 className="text-2xl font-semibold text-white">Grid Analytics</h1>

            {/* Existing: Demand vs Generation */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-white">Demand vs Generation</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>24-HOUR PROFILE · MW</p>
                    </div>
                    <div className="flex items-center gap-5 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-[var(--color-accent)]" />
                            <span className="text-[var(--color-text-muted)]">Demand</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-[var(--color-positive)]" />
                            <span className="text-[var(--color-text-muted)]">Generation</span>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={demandData}>
                                <defs>
                                    <linearGradient id="gDemand" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.08} />
                                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gGen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-positive)" stopOpacity={0.08} />
                                        <stop offset="100%" stopColor="var(--color-positive)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid {...gridAxisStyle} vertical={false} />
                                <XAxis dataKey="time" tick={tickStyle} tickLine={false} axisLine={false} stroke="var(--color-text-dim)" />
                                <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={50} stroke="var(--color-text-dim)" />
                                <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: 'var(--color-text)' }} />
                                <ReferenceLine y={4500} stroke="var(--color-warning)" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'PEAK THRESHOLD', fill: 'var(--color-warning)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                                <Area type="monotone" dataKey="value" stroke="var(--color-accent)" fill="url(#gDemand)" strokeWidth={1.5} dot={false} name="Demand (MW)" />
                                <Area type="monotone" dataKey="value2" stroke="var(--color-positive)" fill="url(#gGen)" strokeWidth={1.5} dot={false} name="Generation (MW)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── NEW: GridMind Analytics Charts (2×2) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Battery Levels (kWh) */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-white">🔋 Battery Levels (kWh)</h3>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>PER-BUILDING · REAL-TIME</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {BUILDING_IDS.map((id, i) => (
                                <span key={id} className="flex items-center gap-1 text-[10px] text-[var(--color-text-dim)]">
                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BUILDING_COLORS[i] }} />
                                    {id}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mergedData}>
                                    <CartesianGrid {...gridAxisStyle} vertical={false} />
                                    <XAxis dataKey="hour" tick={tickStyle} tickLine={false} axisLine={false} />
                                    <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={40} />
                                    <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: 'var(--color-text)' }} />
                                    {BUILDING_IDS.map((id, i) => (
                                        <Line key={id} type="monotone" dataKey={`${id}_bat`} stroke={BUILDING_COLORS[i]} strokeWidth={1.5} dot={false} name={`${id} Battery`} />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Solar Output (kW) */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-white">☀ Solar Output (kW)</h3>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>PER-BUILDING · TREND</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {BUILDING_IDS.map((id, i) => (
                                <span key={id} className="flex items-center gap-1 text-[10px] text-[var(--color-text-dim)]">
                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BUILDING_COLORS[i] }} />
                                    {id}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mergedData}>
                                    <defs>
                                        {BUILDING_IDS.map((id, i) => (
                                            <linearGradient key={id} id={`gSolar${id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={BUILDING_COLORS[i]} stopOpacity={0.15} />
                                                <stop offset="100%" stopColor={BUILDING_COLORS[i]} stopOpacity={0} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid {...gridAxisStyle} vertical={false} />
                                    <XAxis dataKey="hour" tick={tickStyle} tickLine={false} axisLine={false} />
                                    <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={40} />
                                    <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: 'var(--color-text)' }} />
                                    {BUILDING_IDS.map((id, i) => (
                                        <Area key={id} type="monotone" dataKey={`${id}_solar`} stroke={BUILDING_COLORS[i]} fill={`url(#gSolar${id})`} strokeWidth={1.5} dot={false} name={`${id} Solar`} />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Consumption (kWh/min) */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-white">🔌 Consumption (kWh/min)</h3>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>PER-BUILDING · DRAIN RATE</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {BUILDING_IDS.map((id, i) => (
                                <span key={id} className="flex items-center gap-1 text-[10px] text-[var(--color-text-dim)]">
                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BUILDING_COLORS[i] }} />
                                    {id}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mergedData}>
                                    <CartesianGrid {...gridAxisStyle} vertical={false} />
                                    <XAxis dataKey="hour" tick={tickStyle} tickLine={false} axisLine={false} />
                                    <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={50} />
                                    <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: 'var(--color-text)' }} />
                                    {BUILDING_IDS.map((id, i) => (
                                        <Line key={id} type="monotone" dataKey={`${id}_drain`} stroke={BUILDING_COLORS[i]} strokeWidth={1.5} dot={false} name={`${id} Consumption`} />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Deficit Probability (%) */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-white">⚠ Deficit Probability (%)</h3>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>PER-BUILDING · RISK LEVEL</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {BUILDING_IDS.map((id, i) => (
                                <span key={id} className="flex items-center gap-1 text-[10px] text-[var(--color-text-dim)]">
                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BUILDING_COLORS[i] }} />
                                    {id}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={deficitData}>
                                    <defs>
                                        {BUILDING_IDS.map((id, i) => (
                                            <linearGradient key={id} id={`gDef${id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={BUILDING_COLORS[i]} stopOpacity={0.2} />
                                                <stop offset="100%" stopColor={BUILDING_COLORS[i]} stopOpacity={0} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid {...gridAxisStyle} vertical={false} />
                                    <XAxis dataKey="hour" tick={tickStyle} tickLine={false} axisLine={false} />
                                    <YAxis domain={[0, 60]} tick={tickStyle} tickLine={false} axisLine={false} width={40} />
                                    <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: 'var(--color-text)' }} />
                                    {BUILDING_IDS.map((id, i) => (
                                        <Area key={id} type="monotone" dataKey={`${id}_prob`} stroke={BUILDING_COLORS[i]} fill={`url(#gDef${id})`} strokeWidth={1.5} dot={false} name={`${id} Deficit %`} />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing: Grid Frequency + System Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">Grid Frequency</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>REAL-TIME · Hz</p>
                    </div>
                    <div className="p-6">
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={frequencyData}>
                                    <CartesianGrid {...gridAxisStyle} vertical={false} />
                                    <XAxis dataKey="time" tick={{ ...tickStyle, fontSize: 11 }} tickLine={false} axisLine={false} stroke="var(--color-text-dim)" />
                                    <YAxis domain={[49.5, 50.5]} tick={{ ...tickStyle, fontSize: 11 }} tickLine={false} axisLine={false} width={42} stroke="var(--color-text-dim)" />
                                    <Tooltip contentStyle={chartTooltipStyle} />
                                    <ReferenceLine y={50.0} stroke="var(--color-accent)" strokeDasharray="4 4" strokeOpacity={0.4} />
                                    <ReferenceLine y={49.8} stroke="var(--color-negative)" strokeDasharray="2 2" strokeOpacity={0.3} />
                                    <ReferenceLine y={50.2} stroke="var(--color-negative)" strokeDasharray="2 2" strokeOpacity={0.3} />
                                    <Line type="step" dataKey="value" stroke="var(--color-accent)" strokeWidth={1.5} dot={false} name="Frequency" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">System Alerts</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>3 ACTIVE</p>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-[var(--color-bg)] border-l-[3px] border-l-[var(--color-negative)] rounded-r-md">
                            <AlertTriangle size={16} className="text-[var(--color-negative)] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Frequency Deviation — Zone B</p>
                                <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>Detected 14:23:05 UTC</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-[var(--color-bg)] border-l-[3px] border-l-[var(--color-warning)] rounded-r-md">
                            <AlertCircle size={16} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">High Demand Forecast — 18:00</p>
                                <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>Predicted peak: 4,850 MW</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-[var(--color-bg)] border-l-[3px] border-l-[var(--color-positive)] rounded-r-md">
                            <CheckCircle size={16} className="text-[var(--color-positive)] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Backup Generators Synced</p>
                                <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>Verified 13:00:00 UTC</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Charts;
