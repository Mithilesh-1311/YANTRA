import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { forecastData, buildingStats } from '../services/mockData';
import { BrainCircuit, TrendingUp, CloudSun, Battery, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const surplusDeficitData = buildingStats.map(b => ({
    name: b.name.split(' ')[0] + ' ' + (b.name.split(' ')[1] || ''),
    value: b.solar - b.load,
    building: b.name,
}));

const Forecasts: React.FC = () => {
    const netPosition = forecastData[0].value2! - forecastData[0].value;
    const isSurplus = netPosition > 0;

    return (
        <div className="space-y-6 animate-enter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">AI Load Forecasting</h1>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>LSTM MODEL v2.4 · UPDATED HOURLY</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md">
                    <BrainCircuit size={15} className="text-[var(--color-accent)]" />
                    <span className="text-[13px] font-semibold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>CONFIDENCE: 98.2%</span>
                </div>
            </div>

            {/* Main Chart */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-white">24-Hour Load Prediction</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Actual Load vs AI-Predicted Load</p>
                    </div>
                    <div className="flex items-center gap-5 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-[var(--color-text-muted)]" />
                            <span className="text-[var(--color-text-muted)]">Actual</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-[var(--color-accent)]" style={{ borderTop: '1px dashed var(--color-accent)' }} />
                            <span className="text-[var(--color-text-muted)]">Predicted</span>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecastData}>
                                <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="none" vertical={false} />
                                <XAxis dataKey="time" stroke="var(--color-text-dim)" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--color-text-dim)" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} width={50} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                                    itemStyle={{ color: 'var(--color-text)' }}
                                />
                                <ReferenceLine y={4500} stroke="var(--color-warning)" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'THRESHOLD', fill: 'var(--color-warning)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                                <Line type="monotone" dataKey="value" stroke="var(--color-text-muted)" strokeWidth={1.5} name="Actual Load" dot={false} />
                                <Line type="monotone" dataKey="value2" stroke="var(--color-accent)" strokeWidth={2} name="AI Prediction" dot={false} strokeDasharray="6 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Surplus / Deficit Bar Chart */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-white">Building-wise Surplus / Deficit</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Solar generation minus load consumption per building</p>
                    </div>
                    <div className="flex items-center gap-5 text-xs">
                        <span className="flex items-center gap-1.5 text-[var(--color-positive)]">
                            <ArrowUpRight size={13} /> Surplus
                        </span>
                        <span className="flex items-center gap-1.5 text-[var(--color-negative)]">
                            <ArrowDownRight size={13} /> Deficit
                        </span>
                    </div>
                </div>
                <div className="p-6">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={surplusDeficitData} layout="vertical" barSize={24}>
                                <CartesianGrid stroke="var(--color-border-subtle)" horizontal={false} />
                                <XAxis type="number" stroke="var(--color-text-dim)" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} unit=" kW" />
                                <YAxis dataKey="name" type="category" width={90} stroke="var(--color-text-dim)" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                                    formatter={(val: any) => [`${val > 0 ? '+' : ''}${val} kW`, val > 0 ? 'Surplus' : 'Deficit']}
                                    labelFormatter={(label: any) => `Building: ${label}`}
                                />
                                <ReferenceLine x={0} stroke="var(--color-text-dim)" strokeWidth={1} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {surplusDeficitData.map((entry, i) => (
                                        <Cell key={i} fill={entry.value >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className={`card p-6 border-l-[3px] ${isSurplus ? 'border-l-[var(--color-positive)]' : 'border-l-[var(--color-negative)]'}`}>
                    <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Net Position (Next Hr)</span>
                    <p className={`text-2xl font-bold mt-2 ${isSurplus ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                        {isSurplus ? 'SURPLUS' : 'DEFICIT'}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                        {Math.abs(netPosition).toFixed(0)} MW differential
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-[var(--color-accent)]" />
                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Predicted Peak</span>
                    </div>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                        4,850 <span className="text-xs font-normal text-[var(--color-text-dim)]">MW</span>
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>@ 18:00 TODAY</p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <CloudSun size={14} className="text-[var(--color-warning)]" />
                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Weather Impact</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-warning)]" style={{ fontFamily: 'var(--font-mono)' }}>HIGH</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Heatwave expected</p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Battery size={14} className="text-[var(--color-positive)]" />
                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Optimization</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>+12%</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Via battery discharge</p>
                </div>
            </div>
        </div>
    );
};

export default Forecasts;
