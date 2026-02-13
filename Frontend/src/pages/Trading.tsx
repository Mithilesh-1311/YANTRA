import React from 'react';
import { buildingStats } from '../services/mockData';
import { Battery, Activity, ArrowRight, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';


const activeTransactions = [
    { id: 1, from: 'Building 2', to: 'Building 3', energy: 15, status: 'In Progress', time: '12:45 PM' },
    { id: 2, from: 'Building 4', to: 'Building 1', energy: 10, status: 'Completed', time: '12:30 PM' },
    { id: 3, from: 'Building 5', to: 'Building 3', energy: 12, status: 'Completed', time: '12:15 PM' },
    { id: 4, from: 'Building 1', to: 'Building 4', energy: 8, status: 'Completed', time: '12:05 PM' },
    { id: 5, from: 'Building 2', to: 'Building 5', energy: 8, status: 'Pending', time: '12:05 AM' },
    { id: 6, from: 'Building 4', to: 'Central Battery', energy: 25, status: 'Completed', time: '11:30 AM' },
];

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
        case 'Completed':
            return <CheckCircle2 size={16} className="text-[var(--color-positive)]" />;
        case 'In Progress':
            return <Loader2 size={16} className="text-[var(--color-accent)] animate-spin" />;
        case 'Pending':
            return <AlertCircle size={16} className="text-[var(--color-warning)]" />;
        default:
            return null;
    }
};

const statusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'text-[var(--color-positive)]';
        case 'In Progress': return 'text-[var(--color-accent)]';
        case 'Pending': return 'text-[var(--color-warning)]';
        default: return 'text-[var(--color-text-muted)]';
    }
};

const Trading: React.FC = () => {
    const buyers = buildingStats.filter(b => b.status === 'Deficit').length;
    const sellers = buildingStats.filter(b => b.status === 'Surplus').length;
    const centralBattery = 85;
    const gridStability = 76;

    const stabilityColor = gridStability >= 70
        ? 'var(--color-positive)'
        : gridStability >= 40
            ? 'var(--color-warning)'
            : 'var(--color-negative)';

    return (
        <div className="space-y-6 animate-enter">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">P2P Energy Transfer Marketplace</h1>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                        BLOCKCHAIN-SETTLED · REAL-TIME TRANSFERS
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="status-dot status-dot-positive status-dot-live" />
                    <span className="text-xs font-semibold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>LIVE</span>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                <div className="card p-5">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Current Buyers</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{buyers}</span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-negative)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-negative)]" />
                            Deficit
                        </span>
                    </div>
                </div>


                <div className="card p-5">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Current Sellers</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{sellers}</span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-positive)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-positive)]" />
                            Surplus
                        </span>
                    </div>
                </div>


                <div className="card p-5">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Central Battery Level</p>
                    <div className="flex items-end justify-between mb-3">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{centralBattery}</span>
                            <span className="text-lg text-[var(--color-text-muted)]">%</span>
                        </div>
                        <Battery size={22} className="text-[var(--color-positive)] mb-1" />
                    </div>
                    <div className="w-full h-3 bg-[var(--color-border)] rounded-sm overflow-hidden">
                        <div
                            className="h-full rounded-sm transition-all duration-500"
                            style={{
                                width: `${centralBattery}%`,
                                background: `linear-gradient(90deg, var(--color-positive), var(--color-accent))`
                            }}
                        />
                    </div>
                </div>


                <div className="card p-5">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Grid Stability Score</p>
                    <div className="flex items-end justify-between mb-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{gridStability}</span>
                            <span className="text-sm font-semibold" style={{ color: stabilityColor }}>(Stable)</span>
                        </div>
                        <Activity size={22} style={{ color: stabilityColor }} className="mb-1" />
                    </div>
                    <div className="w-full h-3 bg-[var(--color-border)] rounded-sm overflow-hidden">
                        <div
                            className="h-full rounded-sm transition-all duration-500"
                            style={{
                                width: `${gridStability}%`,
                                background: `linear-gradient(90deg, var(--color-warning), ${stabilityColor})`
                            }}
                        />
                    </div>
                </div>
            </div>


            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-white">Active Energy Transactions</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                            {activeTransactions.length} TRANSFERS
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[var(--color-text-muted)]" />
                        <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                            UPDATED: {new Date().toLocaleTimeString('en-US', { hour12: false })}
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>From</th>
                                <th>To</th>
                                <th style={{ textAlign: 'center' }}>Energy (kWh)</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTransactions.map((tx) => (
                                <tr key={tx.id}>

                                    <td>
                                        <span className="inline-flex items-center gap-2">
                                            <span className="px-3 py-1 text-xs font-semibold rounded bg-[rgba(96,165,250,0.12)] text-[#60a5fa] border border-[rgba(96,165,250,0.2)]" style={{ fontFamily: 'var(--font-mono)' }}>
                                                {tx.from}
                                            </span>
                                            <ArrowRight size={14} className="text-[var(--color-text-dim)]" />
                                        </span>
                                    </td>

                                    <td>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded border ${tx.to === 'Central Battery'
                                            ? 'bg-[rgba(52,211,153,0.12)] text-[var(--color-positive)] border-[rgba(52,211,153,0.2)]'
                                            : 'bg-[rgba(248,113,113,0.12)] text-[var(--color-negative)] border-[rgba(248,113,113,0.2)]'
                                            }`} style={{ fontFamily: 'var(--font-mono)' }}>
                                            {tx.to}
                                        </span>
                                    </td>

                                    <td style={{ textAlign: 'center' }}>
                                        <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                                            {tx.energy} <span className="text-[var(--color-text-dim)] font-normal text-xs">kWh</span>
                                        </span>
                                    </td>

                                    <td>
                                        <span className={`flex items-center gap-1.5 ${statusColor(tx.status)}`}>
                                            <StatusIcon status={tx.status} />
                                            <span className="text-sm font-medium">{tx.status}</span>
                                        </span>
                                    </td>

                                    <td style={{ textAlign: 'right' }}>
                                        <span className="text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>
                                            {tx.time}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                <div className="px-6 py-3 border-t border-[var(--color-border)] flex items-center gap-6">
                    <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <Loader2 size={13} className="text-[var(--color-accent)]" /> In Progress
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <CheckCircle2 size={13} className="text-[var(--color-positive)]" /> Completed
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <AlertCircle size={13} className="text-[var(--color-warning)]" /> Pending
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Trading;
