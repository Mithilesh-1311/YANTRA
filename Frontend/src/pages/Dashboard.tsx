import React, { useState, useEffect } from 'react';
import { buildingStats, marketPrices } from '../services/mockData';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Activity, Zap, Radio, DollarSign, Sun, Building2, BatteryCharging } from 'lucide-react';

const COLORS = ['#34d399', '#60a5fa', '#f59e0b', '#f87171', '#a78bfa'];

const DashboardOverview: React.FC = () => {
    const [demand, setDemand] = useState(4285);
    const [generation, setGeneration] = useState(4512);
    const [frequency, setFrequency] = useState(50.02);

    useEffect(() => {
        const id = setInterval(() => {
            setDemand(prev => prev + Math.round((Math.random() - 0.5) * 20));
            setGeneration(prev => prev + Math.round((Math.random() - 0.5) * 15));
            setFrequency(prev => +(prev + (Math.random() - 0.5) * 0.02).toFixed(3));
        }, 3000);
        return () => clearInterval(id);
    }, []);

    const sparkData = Array.from({ length: 20 }, (_, i) => ({ val: 40 + Math.sin(i / 2) * 10 + Math.random() * 8 }));


    const solarPieData = buildingStats.map(b => ({ name: b.name, value: b.solar }));
    const loadPieData = buildingStats.map(b => ({ name: b.name, value: b.load }));

    const totalSolar = buildingStats.reduce((s, b) => s + b.solar, 0);
    const totalLoad = buildingStats.reduce((s, b) => s + b.load, 0);
    const avgBattery = Math.round(buildingStats.reduce((s, b) => s + b.battery, 0) / buildingStats.length);

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

    return (
        <div className="space-y-6 animate-enter">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Grid Overview</h1>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                        LAST UPDATE: {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="status-dot status-dot-positive status-dot-live" />
                    <span className="text-xs font-semibold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>SYSTEM ONLINE</span>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Current Demand</span>
                        <Activity size={16} className="text-[var(--color-accent)]" />
                    </div>
                    <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                        {demand.toLocaleString()} <span className="text-xs font-normal text-[var(--color-text-dim)]">kW</span>
                    </p>
                    <div className="h-10 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparkData}>
                                <Area type="monotone" dataKey="val" stroke="var(--color-accent)" fill="none" strokeWidth={1.5} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                <div className="card p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Current Generation</span>
                        <Zap size={16} className="text-[var(--color-positive)]" />
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>
                        {generation.toLocaleString()} <span className="text-xs font-normal text-[var(--color-text-dim)]">kW</span>
                    </p>
                    <div className="h-10 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparkData}>
                                <Area type="monotone" dataKey="val" stroke="var(--color-positive)" fill="none" strokeWidth={1.5} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                <div className="card p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Grid Frequency</span>
                        <Radio size={16} className="text-[var(--color-accent)]" />
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>
                            {frequency.toFixed(2)}
                        </p>
                        <span className="text-xs text-[var(--color-text-dim)] mb-1">Hz</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                        <span className="status-dot status-dot-positive" />
                        <span className="text-xs text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>NOMINAL</span>
                    </div>
                </div>


                <div className="card p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">P2P Market Price</span>
                        <DollarSign size={16} className="text-[var(--color-warning)]" />
                    </div>
                    <p className="text-3xl font-bold text-[var(--color-warning)]" style={{ fontFamily: 'var(--font-mono)' }}>
                        ${marketPrices.p2pAverage}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                        <span className="text-[var(--color-text-dim)]">Grid: ${marketPrices.gridBuy}</span>
                        <span className="text-[var(--color-negative)]">
                            +{((marketPrices.gridBuy - marketPrices.p2pAverage) / marketPrices.p2pAverage * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            </div>


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
                        {buildingStats.map((b, i) => (
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
                                {buildingStats.map((b) => (
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
