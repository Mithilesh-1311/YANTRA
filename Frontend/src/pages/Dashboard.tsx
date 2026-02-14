import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchBuildings,
    fetchBuildingStates,
    fetchBuildingPredictions,
    fetchGridOverview,
} from '../services/api';
import type { BuildingSimState, BuildingPrediction } from '../services/api';
import {
    generateBuildingStates,
    generatePredictions,
    generateCentralBattery,
} from '../services/mockData';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, Building2, BatteryCharging } from 'lucide-react';

const BUILDING_IDS = ['B1', 'B2', 'B3', 'B4', 'B5'];
const COLORS = ['#00e5ff', '#00ffa3', '#ffd600', '#ff6d00', '#ce93d8'];

const DashboardOverview: React.FC = () => {
    const [simMinute, setSimMinute] = useState(42);
    const [simHour, setSimHour] = useState(0.7);
    const [states, setStates] = useState<Record<string, BuildingSimState>>(() => generateBuildingStates(42));
    const [predictions, setPredictions] = useState<Record<string, BuildingPrediction>>(() => generatePredictions());
    const [centralBat, setCentralBat] = useState(() => generateCentralBattery());
    const [buildingList, setBuildingList] = useState<any[]>([]);


    const refresh = useCallback(async () => {
        try {
            const [statesData, predsData, gridData, buildingsData] = await Promise.all([
                fetchBuildingStates(),
                fetchBuildingPredictions(),
                fetchGridOverview(),
                fetchBuildings(),
            ]);
            setStates(statesData);
            setPredictions(predsData);
            setCentralBat({
                kwh: gridData.totalBatteryKwh ?? gridData.centralBattery * 0.75,
                capacity: gridData.totalBatteryCap ?? 100,
                p2p_count: gridData.surplusCount ?? Math.floor(Math.random() * 20) + 5,
                central_count: gridData.deficitCount ?? Math.floor(Math.random() * 10) + 2,
                grid_count: Math.floor(Math.random() * 5),
            });
            setBuildingList(buildingsData);
            const firstState = statesData[BUILDING_IDS[0]];
            setSimMinute(firstState?.sim_minute ?? simMinute + 1);
            setSimHour(firstState?.hour_of_day ?? (simMinute + 1) / 60);
        } catch (err) {
            console.warn('[Dashboard] API fallback to mock:', err);
            setSimMinute(prev => {
                const next = prev + 1;
                setStates(generateBuildingStates(next));
                setPredictions(generatePredictions());
                setCentralBat(generateCentralBattery());
                setSimHour((next % 1440) / 60); // Fix: Update hour in fallback
                return next;
            });
        }
    }, [simMinute]);

    useEffect(() => {
        refresh(); // initial fetch
        const id = setInterval(refresh, 3000);
        return () => clearInterval(id);
    }, []);

    const cbPct = ((centralBat.kwh / centralBat.capacity) * 100).toFixed(1);

    // Pie chart data — use live building data if available, else fallback
    const pieSource = buildingList.length > 0
        ? buildingList.map(b => ({ id: b.id, name: b.name, solar: b.solar, load: b.load, battery: b.battery, status: b.status }))
        : [
            { id: 'B1', name: 'Main Admin Block', solar: 120, load: 85, battery: 78, status: 'Surplus' },
            { id: 'B2', name: 'Research Lab', solar: 45, load: 150, battery: 45, status: 'Deficit' },
            { id: 'B3', name: 'Student Dorms', solar: 80, load: 60, battery: 92, status: 'Surplus' },
            { id: 'B4', name: 'Cafeteria', solar: 30, load: 45, battery: 20, status: 'Deficit' },
            { id: 'B5', name: 'Guesthouse / EV Station', solar: 60, load: 40, battery: 85, status: 'Surplus' },
        ];

    const solarPieData = pieSource.map(b => ({ name: b.name, value: b.solar }));
    const loadPieData = pieSource.map(b => ({ name: b.name, value: b.load }));
    const totalSolar = pieSource.reduce((s, b) => s + b.solar, 0);
    const totalLoad = pieSource.reduce((s, b) => s + b.load, 0);
    const avgBattery = Math.round(pieSource.reduce((s, b) => s + b.battery, 0) / pieSource.length);

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        if (percent < 0.08) return null;
        return (
            <text x={x} y={y} fill="var(--color-text)" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold" fontFamily="var(--font-mono)">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Battery bar color helper
    const batBarColor = (pct: number) =>
        pct < 20
            ? 'linear-gradient(90deg, #ff3366, #ff6d00)'
            : pct < 50
                ? 'linear-gradient(90deg, #ffd600, #00ffa3)'
                : 'linear-gradient(90deg, #00e5ff, #00ffa3)';

    const batBarGlow = (pct: number) =>
        pct < 20 ? '0 0 8px rgba(255,51,102,0.5)' : '0 0 8px rgba(0,255,163,0.25)';



    return (
        <div className="space-y-6 animate-enter">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Grid Overview</h1>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                        LAST UPDATE: {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.15)]">
                        <span className="flex items-center gap-1.5">
                            <span className="status-dot status-dot-positive status-dot-live" />
                            <span className="text-xs font-bold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>LIVE</span>
                        </span>
                        <span className="w-px h-4 bg-[var(--color-border)]" />
                        <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                            SIM-MIN: <span className="text-white font-bold">{simMinute}</span>
                        </span>
                        <span className="w-px h-4 bg-[var(--color-border)]" />
                        <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                            HOUR: <span className="text-[var(--color-accent)] font-bold">{simHour.toFixed(2)}</span>
                        </span>
                    </div>
                </div>
                {/* DEBUG INFO - REMOVE BEFORE FINAL SUBMISSION IF DESIRED */}
                <div className="text-[10px] text-center text-[var(--color-text-dim)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    API: {(import.meta as any).env.VITE_API_URL || 'LOCALHOST (Default)'} |
                    STATUS: {buildingList.length > 0 ? 'CONNECTED' : 'MOCK DATA'}
                </div>
            </div>

            {/* ── Central Battery Panel ── */}
            <div
                className="card"
                style={{
                    padding: '16px 24px',
                    borderColor: '#a78bfa44',
                    boxShadow: '0 0 30px rgba(124,77,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '32px',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ whiteSpace: 'nowrap' }}>
                    <p className="text-[10px] tracking-widest uppercase" style={{ color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>Central Server Battery</p>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                        {centralBat.kwh.toFixed(1)} <span className="text-xs font-normal text-[var(--color-text-dim)]">/ {centralBat.capacity} kWh</span>
                    </p>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="flex justify-between text-[9px] text-[var(--color-text-dim)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                        <span>CHARGE LEVEL</span><span>{cbPct}%</span>
                    </div>
                    <div style={{ background: 'var(--color-bg)', borderRadius: 6, height: 14, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 6,
                            width: `${cbPct}%`,
                            background: 'linear-gradient(90deg, #7c4dff, #b388ff)',
                            boxShadow: '0 0 12px rgba(124,77,255,0.5)',
                            transition: 'width 0.8s ease',
                        }} />
                    </div>
                </div>
                <div className="flex gap-5" style={{ fontFamily: 'var(--font-mono)' }}>
                    {[
                        { label: 'P2P', val: centralBat.p2p_count, color: 'var(--color-accent)' },
                        { label: 'CENTRAL', val: centralBat.central_count, color: '#a78bfa' },
                        { label: 'GRID', val: centralBat.grid_count, color: '#ff6d00' },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <span className="block text-base font-bold" style={{ color: s.color }}>{s.val}</span>
                            <span className="text-[9px] tracking-wider text-[var(--color-text-dim)]">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Building Cards Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {BUILDING_IDS.map((bid, i) => {
                    const s = states[bid];
                    const p = predictions[bid];
                    if (!s) return null;
                    const batPct = (s.battery_kwh / s.battery_cap) * 100;

                    return (
                        <div
                            key={bid}
                            className="card"
                            style={{
                                padding: '14px',
                                position: 'relative',
                                overflow: 'hidden',
                                borderColor: s.is_deficit ? 'rgba(255,51,102,0.25)' : 'rgba(0,255,163,0.25)',
                                boxShadow: s.is_deficit
                                    ? '0 0 20px rgba(255,51,102,0.15)'
                                    : '0 0 20px rgba(0,255,163,0.12)',
                                transition: 'border-color 0.4s, box-shadow 0.4s',
                            }}
                        >
                            {/* Accent top bar */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                                background: s.is_deficit
                                    ? 'linear-gradient(90deg, transparent, #ff3366, transparent)'
                                    : 'linear-gradient(90deg, transparent, #00ffa3, transparent)',
                            }} />

                            {/* Header row */}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-xl font-bold" style={{ color: COLORS[i], letterSpacing: '2px' }}>{bid}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-dim)]">{s.type}</p>
                                </div>
                                <span
                                    className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                                    style={{
                                        background: s.is_deficit ? 'rgba(255,51,102,0.15)' : 'rgba(0,255,163,0.15)',
                                        color: s.is_deficit ? '#ff3366' : '#00ffa3',
                                        border: `1px solid ${s.is_deficit ? 'rgba(255,51,102,0.3)' : 'rgba(0,255,163,0.3)'}`,
                                        fontFamily: 'var(--font-mono)',
                                        animation: s.is_deficit ? 'pulse-dot 1.5s infinite' : undefined,
                                    }}
                                >
                                    {s.is_deficit ? '▼ DEFICIT' : '▲ SURPLUS'}
                                </span>
                            </div>

                            {/* House icon */}
                            <div className="text-center text-3xl my-2" style={{
                                filter: `drop-shadow(0 0 8px ${s.is_deficit ? '#ff3366' : '#00ffa3'})`,
                                color: s.is_deficit ? '#ff3366' : '#00ffa3',
                                transition: 'color 0.4s',
                            }}>🏠</div>

                            {/* Metrics */}
                            <div className="space-y-1 mb-2">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-[var(--color-text-dim)]">☀ SOLAR</span>
                                    <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#ffd600' }}>
                                        {s.solar_kw.toFixed(3)} kW
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-[var(--color-text-dim)]">🔌 CONSUMPTION</span>
                                    <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
                                        {s.total_drained_kwh.toFixed(4)} kWh
                                    </span>
                                </div>
                            </div>

                            {/* Battery bar */}
                            <div className="mb-2">
                                <div className="flex justify-between text-[9px] text-[var(--color-text-dim)] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                                    <span>🔋 BATTERY</span>
                                    <span>{s.battery_kwh.toFixed(2)}/{s.battery_cap} kWh</span>
                                </div>
                                <div style={{ background: 'var(--color-bg)', borderRadius: 4, height: 8, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 4,
                                        width: `${batPct.toFixed(1)}%`,
                                        background: batBarColor(batPct),
                                        boxShadow: batBarGlow(batPct),
                                        transition: 'width 0.6s ease, background 0.4s',
                                    }} />
                                </div>
                            </div>

                            {/* Spike indicator */}
                            {s.spike_active && (
                                <div style={{
                                    background: 'rgba(255,171,0,0.12)', border: '1px solid rgba(255,171,0,0.3)',
                                    borderRadius: 4, padding: '3px 6px', fontSize: 9, color: '#ffab00', marginBottom: 6,
                                }}>⚡ APPLIANCE SPIKE ACTIVE</div>
                            )}

                            {/* Predictions */}
                            {p && (
                                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 4 }}>
                                    <div className="flex justify-between text-[9px] mb-1">
                                        <span className="text-[var(--color-text-dim)]">🤖 PRED NET</span>
                                        <span className="font-bold" style={{
                                            fontFamily: 'var(--font-mono)', fontSize: 10,
                                            color: p.predicted_net_kwh >= 0 ? '#00ffa3' : '#ff3366',
                                        }}>
                                            {p.predicted_net_kwh >= 0 ? '+' : ''}{p.predicted_net_kwh.toFixed(3)} kWh
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[9px] mb-1">
                                        <span className="text-[var(--color-text-dim)]">⚠ DEFICIT PROB</span>
                                        <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text)' }}>
                                            {(p.deficit_probability * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div style={{ background: 'var(--color-bg)', borderRadius: 3, height: 4, margin: '2px 0' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 3, width: `${(p.deficit_probability * 100).toFixed(1)}%`,
                                            background: 'linear-gradient(90deg, #00ffa3, #ff3366)',
                                            transition: 'width 0.6s',
                                        }} />
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-1 text-[9px]">
                                        <span className="text-[var(--color-text-dim)]">⏱ BUFFER</span>
                                        <span
                                            className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                            style={{
                                                fontFamily: 'var(--font-mono)',
                                                ...(p.buffer_minutes <= 30
                                                    ? { background: 'rgba(0,255,163,0.15)', color: '#00ffa3', border: '1px solid rgba(0,255,163,0.25)' }
                                                    : p.buffer_minutes >= 120
                                                        ? { background: 'rgba(255,51,102,0.15)', color: '#ff3366', border: '1px solid rgba(255,51,102,0.25)' }
                                                        : { background: 'rgba(255,214,0,0.15)', color: '#ffd600', border: '1px solid rgba(255,214,0,0.25)' }
                                                ),
                                            }}
                                        >
                                            {p.buffer_minutes} MIN
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>


            {/* ── Original pie charts & table section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
                        <Sun size={15} className="text-[var(--color-warning)]" />
                        <h3 className="text-base font-semibold text-white">Solar Generation</h3>
                    </div>
                    <div className="p-4 flex flex-col items-center">
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={solarPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" labelLine={false} label={renderCustomLabel} stroke="none">
                                        {solarPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'white' }} itemStyle={{ color: 'white' }} formatter={(val) => [`${val} kW`, 'Solar']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-sm mt-1">
                            <span className="font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{totalSolar} kW</span>
                            <span className="text-[var(--color-text-muted)] ml-1.5 text-xs">total generation</span>
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mt-3">
                            {solarPieData.map((d, i) => (
                                <span key={d.name} className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                                    {d.name.split(' ')[0]}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
                        <Building2 size={15} className="text-[var(--color-negative)]" />
                        <h3 className="text-base font-semibold text-white">Load Consumption</h3>
                    </div>
                    <div className="p-4 flex flex-col items-center">
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={loadPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" labelLine={false} label={renderCustomLabel} stroke="none">
                                        {loadPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'white' }} itemStyle={{ color: 'white' }} formatter={(val) => [`${val} kW`, 'Load']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-sm mt-1">
                            <span className="font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{totalLoad} kW</span>
                            <span className="text-[var(--color-text-muted)] ml-1.5 text-xs">total consumption</span>
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mt-3">
                            {loadPieData.map((d, i) => (
                                <span key={d.name} className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                                    {d.name.split(' ')[0]}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
                        <BatteryCharging size={15} className="text-[var(--color-positive)]" />
                        <h3 className="text-base font-semibold text-white">Battery Status</h3>
                    </div>
                    <div className="p-5 space-y-3">
                        {pieSource.map((b, i) => (
                            <div key={b.id}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[var(--color-text-muted)]">{b.name}</span>
                                    <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: COLORS[i] }}>{b.battery}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-[var(--color-border)] rounded-sm overflow-hidden">
                                    <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${b.battery}%`, backgroundColor: COLORS[i] }} />
                                </div>
                            </div>
                        ))}
                        <div className="mt-4 p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-center">
                            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Avg Battery</p>
                            <p className="text-2xl font-bold text-white mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{avgBattery}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Building Energy Table & System Health ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">Building Energy Status</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Building</th>
                                    <th style={{ textAlign: 'right' }}>Solar (kW)</th>
                                    <th style={{ textAlign: 'right' }}>Load (kW)</th>
                                    <th style={{ textAlign: 'center' }}>Battery</th>
                                    <th style={{ textAlign: 'right' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pieSource.map((b) => (
                                    <tr key={b.id}>
                                        <td className="font-medium text-white">{b.name}</td>
                                        <td className="text-right text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>{b.solar}</td>
                                        <td className="text-right text-[var(--color-negative)]" style={{ fontFamily: 'var(--font-mono)' }}>{b.load}</td>
                                        <td>
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-[var(--color-border)] rounded-sm overflow-hidden">
                                                    <div
                                                        className={`h-full ${b.battery > 50 ? 'bg-[var(--color-positive)]' : 'bg-[var(--color-warning)]'}`}
                                                        style={{ width: `${b.battery}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>{b.battery}%</span>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <span className={`badge ${b.status === 'Surplus' ? 'badge-positive' : 'badge-negative'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-base font-semibold text-white mb-5">System Health</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="status-dot status-dot-positive mt-1.5 status-dot-live" />
                            <div>
                                <p className="text-sm font-medium text-white">System Optimal</p>
                                <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>All controllers online. Freq stable.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="status-dot status-dot-info mt-1.5" />
                            <div>
                                <p className="text-sm font-medium text-white">P2P Trading Active</p>
                                <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>High volume on local exchange.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="status-dot status-dot-positive mt-1.5" />
                            <div>
                                <p className="text-sm font-medium text-white">Battery Sync OK</p>
                                <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>5/5 units responding.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md">
                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Efficiency Score</p>
                        <div className="flex justify-between items-end">
                            <span className="text-4xl font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>94%</span>
                            <span className="text-sm text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>▲ +2.4%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
