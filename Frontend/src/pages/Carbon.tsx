import React from 'react';
import { carbonStats } from '../services/mockData';
import { Leaf, ShieldCheck, TreePine, Award } from 'lucide-react';

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

            {/* Stats */}
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
                {/* Offset Market */}
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
                    </div>
                </div>

                {/* NFT Certificates */}
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h3 className="text-base font-semibold text-white">NFT Certificates</h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <div className="aspect-video bg-[var(--color-bg)] rounded-md flex flex-col items-center justify-center border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors">
                            <Award size={22} className="text-[var(--color-text-dim)] mb-2" />
                            <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>CERT #001</span>
                        </div>
                        <div className="aspect-video bg-[var(--color-bg)] rounded-md flex flex-col items-center justify-center border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors">
                            <Award size={22} className="text-[var(--color-text-dim)] mb-2" />
                            <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>CERT #002</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carbon;
