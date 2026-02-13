import React from 'react';
import { carbonStats } from '../services/mockData';
import { Leaf, ShieldCheck, TreePine, TrendingUp, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#34d399', '#60a5fa', '#f59e0b'];

const offsetSources = [
    { name: 'Solar Energy', value: 520 },
    { name: 'Wind Power', value: 310 },
    { name: 'Reforestation', value: 170 },
];

const monthlyData = [
    { month: 'Aug', earned: 45, traded: 12 },
    { month: 'Sep', earned: 52, traded: 18 },
    { month: 'Oct', earned: 60, traded: 22 },
    { month: 'Nov', earned: 75, traded: 15 },
    { month: 'Dec', earned: 88, traded: 28 },
    { month: 'Jan', earned: 95, traded: 20 },
    { month: 'Feb', earned: 35, traded: 5 },
];

const Carbon: React.FC = () => {
    const stats = carbonStats;

    return (
        <div className="space-y-6 animate-enter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Carbon Footprint</h1>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Track and trade verified carbon credits on the blockchain.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 card">
                    <Leaf size={18} className="text-[var(--color-positive)]" />
                    <div>
                        <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Rating</p>
                        <p className="text-lg font-bold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>A+</p>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-6">
                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{stat.label}</span>
                        <div className="flex items-end gap-2 mt-3">
                            <span className={`text-3xl font-bold ${stat.color}`} style={{ fontFamily: 'var(--font-mono)' }}>{stat.value}</span>
                            <span className="text-xs text-[var(--color-text-dim)] mb-1">{stat.unit}</span>
                        </div>
                        <div className="mt-3">
                            <span className="badge badge-positive">{stat.change} MoM</span>
                        </div>
                    </div>
                ))}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
                        <BarChart3 size={15} className="text-[var(--color-positive)]" />
                        <h3 className="text-base font-semibold text-white">CO₂ Offset Sources</h3>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={offsetSources} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" labelLine={false} stroke="none"
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                            const RADIAN = Math.PI / 180;
                                            const radius = (innerRadius || 0) + ((outerRadius || 0) - (innerRadius || 0)) * 0.5;
                                            const x = (cx || 0) + radius * Math.cos(-(midAngle || 0) * RADIAN);
                                            const y = (cy || 0) + radius * Math.sin(-(midAngle || 0) * RADIAN);
                                            return <text x={x} y={y} fill="var(--color-text)" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold" fontFamily="var(--font-mono)">{`${((percent || 0) * 100).toFixed(0)}%`}</text>;
                                        }}
                                    >
                                        {offsetSources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                                        formatter={(val) => [`${val} tons CO₂`, 'Offset']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-5 mt-2">
                            {offsetSources.map((d, i) => (
                                <span key={d.name} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i] }} />{d.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
                        <TrendingUp size={15} className="text-[var(--color-accent)]" />
                        <h3 className="text-base font-semibold text-white">Monthly Credits</h3>
                    </div>
                    <div className="p-6">
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} barGap={3}>
                                    <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
                                    <XAxis dataKey="month" stroke="var(--color-text-dim)" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--color-text-dim)" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} width={35} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                                    />
                                    <Bar dataKey="earned" name="Earned" fill="var(--color-positive)" radius={[3, 3, 0, 0]} barSize={16} />
                                    <Bar dataKey="traded" name="Traded" fill="var(--color-accent)" radius={[3, 3, 0, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-5 mt-3 justify-center">
                            <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-positive)]" /> Earned
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-accent)]" /> Traded
                            </span>
                        </div>
                    </div>
                </div>
            </div>


            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)]">
                    <h3 className="text-base font-semibold text-white">Offset Market</h3>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                    <div className="flex items-center justify-between px-6 py-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <div className="flex items-center gap-3">
                            <TreePine size={18} className="text-[var(--color-positive)] shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Solar Farm Project #42</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ShieldCheck size={12} className="text-[var(--color-accent)]" />
                                    <span className="text-[11px] text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>VERIFIED BY VERRA</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-4 py-2 text-xs font-bold text-black bg-[var(--color-positive)] rounded-md hover:brightness-110 transition-all" style={{ fontFamily: 'var(--font-mono)' }}>BUY</button>
                    </div>
                    <div className="flex items-center justify-between px-6 py-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <div className="flex items-center gap-3">
                            <TreePine size={18} className="text-[var(--color-positive)] shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Reforestation Initiative</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ShieldCheck size={12} className="text-[var(--color-accent)]" />
                                    <span className="text-[11px] text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>VERIFIED BY GOLD STANDARD</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-4 py-2 text-xs font-bold text-black bg-[var(--color-positive)] rounded-md hover:brightness-110 transition-all" style={{ fontFamily: 'var(--font-mono)' }}>BUY</button>
                    </div>
                    <div className="flex items-center justify-between px-6 py-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <div className="flex items-center gap-3">
                            <TreePine size={18} className="text-[var(--color-positive)] shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Wind Energy Program</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ShieldCheck size={12} className="text-[var(--color-accent)]" />
                                    <span className="text-[11px] text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>VERIFIED BY CDM</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-4 py-2 text-xs font-bold text-black bg-[var(--color-positive)] rounded-md hover:brightness-110 transition-all" style={{ fontFamily: 'var(--font-mono)' }}>BUY</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carbon;
