import React, { useState, useEffect, useCallback } from 'react';
import {
    AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    fetchBuildingHistory,
    fetchBuildingPredictions,
} from '../services/api';
import type { BuildingPrediction } from '../services/api';
import {
    demandData as rawDemandData,
    frequencyData as rawFrequencyData,
    generateBuildingHistory,
    generatePredictions,
} from '../services/mockData';

const COLORS_B = ['#00e5ff', '#00ffa3', '#ffd600', '#ff6d00', '#ce93d8'];
const BUILDING_IDS = ['B1', 'B2', 'B3', 'B4', 'B5'];

// Convert mockData DataPoint (value/value2) to chart-friendly shapes
const demandData = rawDemandData.map(d => ({
    time: d.time,
    demand: Math.round(d.value),
    generation: Math.round(d.value2 ?? d.value * 0.9),
}));

const frequencyData = rawFrequencyData.map(d => ({
    time: d.time,
    frequency: +d.value.toFixed(3),
}));

const Charts: React.FC = () => {
    const [history, setHistory] = useState<Record<string, any[]>>(() => {
        const h: Record<string, any[]> = {};
        BUILDING_IDS.forEach(bid => { h[bid] = generateBuildingHistory(bid, 40); });
        return h;
    });
    const [predictions, setPredictions] = useState<Record<string, BuildingPrediction>>(() => generatePredictions());
    const alerts = [
        { id: 1, msg: 'Battery low in Building 4 — 12%', severity: 'warning' },
        { id: 2, msg: 'Peak solar output expected at 13:00', severity: 'info' },
        { id: 3, msg: 'P2P trade completed: B1 → B4 (3.2 kWh)', severity: 'success' },
    ];

    const refresh = useCallback(async () => {
        try {
            const [histData, predData] = await Promise.all([
                fetchBuildingHistory(),
                fetchBuildingPredictions(),
            ]);
            setHistory(histData);
            setPredictions(predData);
        } catch (err) {
            console.warn('[Charts] API fallback to mock:', err);
            const h: Record<string, any[]> = {};
            BUILDING_IDS.forEach(bid => { h[bid] = generateBuildingHistory(bid, 40); });
            setHistory(h);
            setPredictions(generatePredictions());
        }
    }, []);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, 5000);
        return () => clearInterval(id);
    }, []);

    // Combine history into unified data arrays for recharts
    const batteryData = (history['B1'] || []).map((_, i) => {
        const point: any = { time: history['B1']?.[i]?.hour_of_day?.toFixed(1) ?? i };
        BUILDING_IDS.forEach(bid => {
            point[bid] = history[bid]?.[i]?.battery_kwh ?? 0;
        });
        return point;
    });

    const solarData = (history['B1'] || []).map((_, i) => {
        const point: any = { time: history['B1']?.[i]?.hour_of_day?.toFixed(1) ?? i };
        BUILDING_IDS.forEach(bid => {
            point[bid] = history[bid]?.[i]?.solar_kw ?? 0;
        });
        return point;
    });

    const consumptionData = (history['B1'] || []).map((_, i) => {
        const point: any = { time: history['B1']?.[i]?.hour_of_day?.toFixed(1) ?? i };
        BUILDING_IDS.forEach(bid => {
            point[bid] = +(history[bid]?.[i]?.total_drained_kwh ?? 0).toFixed(4);
        });
        return point;
    });

    const deficitProbData = BUILDING_IDS.map((bid, i) => ({
        name: bid,
        probability: +(predictions[bid]?.deficit_probability * 100 || 0).toFixed(1),
        fill: COLORS_B[i],
    }));

    // Recharts tooltip styling
    const tooltipStyle = {
        contentStyle: {
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            borderRadius: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'white',
        },
        itemStyle: { color: 'white' },
    };

    return (
        <div className="space-y-6 animate-enter">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-white">Analytics</h1>
                <span className="text-xs text-[var(--color-text-dim)]" style={{ fontFamily: 'var(--font-mono)' }}>
                    LIVE DATA — {new Date().toLocaleTimeString('en-US', { hour12: false })}
                </span>
            </div>

            {/* Row 1 — Demand vs Generation + Battery Levels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">Demand vs. Generation</h3>
                    </div>
                    <div className="p-5 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={demandData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="time" tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <Tooltip {...tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Area type="monotone" dataKey="demand" stroke="#ff6d00" fill="rgba(255,109,0,0.15)" strokeWidth={2} name="Demand" />
                                <Area type="monotone" dataKey="generation" stroke="#00ffa3" fill="rgba(0,255,163,0.15)" strokeWidth={2} name="Generation" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">Battery Levels</h3>
                    </div>
                    <div className="p-5 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={batteryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="time" tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} unit=" kWh" />
                                <Tooltip {...tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                {BUILDING_IDS.map((bid, i) => (
                                    <Line key={bid} type="monotone" dataKey={bid} stroke={COLORS_B[i]} strokeWidth={2} dot={false} name={bid} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2 — Solar Output + Consumption */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">Solar Output</h3>
                    </div>
                    <div className="p-5 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={solarData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="time" tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} unit=" kW" />
                                <Tooltip {...tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                {BUILDING_IDS.map((bid, i) => (
                                    <Area key={bid} type="monotone" dataKey={bid} stroke={COLORS_B[i]} fill={`${COLORS_B[i]}22`} strokeWidth={2} name={bid} />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">Consumption</h3>
                    </div>
                    <div className="p-5 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={consumptionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="time" tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} unit=" kWh" />
                                <Tooltip {...tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                {BUILDING_IDS.map((bid, i) => (
                                    <Line key={bid} type="monotone" dataKey={bid} stroke={COLORS_B[i]} strokeWidth={2} dot={false} name={bid} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3 — Deficit Probability + Grid Frequency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">Deficit Probability</h3>
                    </div>
                    <div className="p-5 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={deficitProbData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} unit="%" domain={[0, 100]} />
                                <Tooltip {...tooltipStyle} />
                                <Area type="monotone" dataKey="probability" stroke="#ff3366" fill="rgba(255,51,102,0.2)" strokeWidth={2} name="Deficit %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">Grid Frequency</h3>
                    </div>
                    <div className="p-5 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={frequencyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="time" tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
                                <YAxis domain={[49.8, 50.2]} tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} unit=" Hz" />
                                <Tooltip {...tooltipStyle} />
                                <Line type="monotone" dataKey="frequency" stroke="#00e5ff" strokeWidth={2} dot={false} name="Frequency" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* System Alerts */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)]">
                    <h3 className="text-base font-semibold text-white">System Alerts</h3>
                </div>
                <div className="p-5 space-y-3">
                    {alerts.map(a => (
                        <div key={a.id} className="flex items-center gap-3 text-sm">
                            <span className={`status-dot ${a.severity === 'warning' ? 'status-dot-warning' : a.severity === 'success' ? 'status-dot-positive' : 'status-dot-info'}`} />
                            <span className="text-[var(--color-text-muted)]">{a.msg}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Charts;
