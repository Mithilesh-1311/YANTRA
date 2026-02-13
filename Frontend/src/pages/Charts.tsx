import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, ReferenceLine
} from 'recharts';
import { demandData, frequencyData } from '../services/mockData';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const chartTooltipStyle = {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
};

const Charts: React.FC = () => {
    return (
        <div className="space-y-6 animate-enter">
            <h1 className="text-2xl font-semibold text-white">Grid Analytics</h1>


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
                                <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="none" vertical={false} />
                                <XAxis dataKey="time" stroke="var(--color-text-dim)" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--color-text-dim)" tick={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} width={50} />
                                <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: 'var(--color-text)' }} />
                                <ReferenceLine y={4500} stroke="var(--color-warning)" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'PEAK THRESHOLD', fill: 'var(--color-warning)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                                <Area type="monotone" dataKey="value" stroke="var(--color-accent)" fill="url(#gDemand)" strokeWidth={1.5} dot={false} name="Demand (MW)" />
                                <Area type="monotone" dataKey="value2" stroke="var(--color-positive)" fill="url(#gGen)" strokeWidth={1.5} dot={false} name="Generation (MW)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

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
                                    <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="none" vertical={false} />
                                    <XAxis dataKey="time" stroke="var(--color-text-dim)" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
                                    <YAxis domain={[49.5, 50.5]} stroke="var(--color-text-dim)" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} width={42} />
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
