import React, { useState } from 'react';
import { buildingStats } from '../services/mockData';
import {
    Battery, Activity, CheckCircle2, AlertCircle,
    Loader2, Zap, Building2
} from 'lucide-react';

// --- NEW INTERFACES & DATA ---
interface EnergyOffer {
    id: string;
    source: string;
    type: 'Grid' | 'Battery' | 'P2P';
    amount: number;
    price: number;
}

const mockOffers: EnergyOffer[] = [
    { id: 'grid-01', source: 'Main Power Grid', type: 'Grid', amount: 9999, price: 0.30 },
    { id: 'bat-01', source: 'Central Battery Storage', type: 'Battery', amount: 850, price: 0.22 },
    { id: 'b2', source: 'Building 2', type: 'P2P', amount: 15.5, price: 0.12 },
    { id: 'b3', source: 'Building 3', type: 'P2P', amount: 8.2, price: 0.11 },
    { id: 'b4', source: 'Building 4', type: 'P2P', amount: 12.0, price: 0.13 },
    { id: 'b5', source: 'Building 5', type: 'P2P', amount: 20.4, price: 0.14 },
];

const Trading: React.FC = () => {
    // --- STATE ---
    const [offerStatus, setOfferStatus] = useState<Record<string, 'idle' | 'processing' | 'completed'>>({});

    // --- OLD LOGIC ---
    const buyers = buildingStats.filter(b => b.status === 'Deficit').length;
    const sellers = buildingStats.filter(b => b.status === 'Surplus').length;
    const centralBattery = 85;
    const gridStability = 76;

    // --- NEW LOGIC ---
    const handleBuy = (id: string, sourceName: string) => {
        console.log(`[MetaMask] Requesting transfer from ${sourceName}...`);
        setOfferStatus(prev => ({ ...prev, [id]: 'processing' }));

        setTimeout(() => {
            console.log(`[Blockchain] Confirmed.`);
            setOfferStatus(prev => ({ ...prev, [id]: 'completed' }));
        }, 2500);
    };

    const stabilityColor = gridStability >= 70 ? 'var(--color-positive)' : gridStability >= 40 ? 'var(--color-warning)' : 'var(--color-negative)';

    return (
        <div className="space-y-8 animate-enter">

            {/* 1. HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">P2P Energy Transfer Marketplace</h1>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                        BLOCKCHAIN-SETTLED · REAL-TIME TRANSFERS
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="status-dot status-dot-live bg-[var(--color-positive)]" />
                    <span className="text-xs font-semibold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>LIVE</span>
                </div>
            </div>

            {/* 2. B1 DEFICIT BANNER */}
            <div className="card p-6 border-l-[4px] border-l-[var(--color-negative)] bg-gradient-to-r from-[rgba(248,113,113,0.05)] to-transparent">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[rgba(248,113,113,0.15)] flex items-center justify-center text-[var(--color-negative)]">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Buying For: Building 1</h2>
                            <p className="text-sm text-[var(--color-text-muted)]">Current Status: <span className="text-[var(--color-negative)] font-semibold">DEFICIT</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Required Energy</p>
                            <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>4.5 <span className="text-sm font-normal text-[var(--color-text-dim)]">kWh</span></p>
                        </div>
                        <AlertCircle size={24} className="text-[var(--color-negative)] animate-pulse" />
                    </div>
                </div>
            </div>

            {/* 3. STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Buyers Card */}
                <div className="card p-5">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Current Buyers</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{buyers}</span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-negative)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-negative)]" /> Deficit
                        </span>
                    </div>
                </div>
                {/* Sellers Card */}
                <div className="card p-5">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Current Sellers</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{sellers}</span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-positive)]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-positive)]" /> Surplus
                        </span>
                    </div>
                </div>
                {/* Battery Card */}
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
                        <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${centralBattery}%`, background: `linear-gradient(90deg, var(--color-positive), var(--color-accent))` }} />
                    </div>
                </div>
                {/* Stability Card */}
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
                        <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${gridStability}%`, background: `linear-gradient(90deg, var(--color-warning), ${stabilityColor})` }} />
                    </div>
                </div>
            </div>

            {/* 4. AVAILABLE MARKETS (TABLE VIEW) */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-white">Available Markets (Buy Energy)</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Select a source to fulfill your 4.5 kWh deficit</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>From</th>
                                <th>To</th>
                                <th style={{ textAlign: 'center' }}>Available</th>
                                <th style={{ textAlign: 'center' }}>Rate</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockOffers.map((offer) => {
                                const status = offerStatus[offer.id] || 'idle';
                                const isProcessing = status === 'processing';
                                const isCompleted = status === 'completed';

                                return (
                                    <tr key={offer.id}>
                                        {/* FROM */}
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-md flex items-center justify-center 
                                                    ${offer.type === 'Grid' ? 'bg-[rgba(251,191,36,0.1)] text-[var(--color-warning)]' :
                                                        offer.type === 'Battery' ? 'bg-[rgba(52,211,153,0.1)] text-[var(--color-positive)]' :
                                                            'bg-[rgba(96,165,250,0.1)] text-[var(--color-info)]'}`}>
                                                    {offer.type === 'Grid' && <Zap size={16} />}
                                                    {offer.type === 'Battery' && <Battery size={16} />}
                                                    {offer.type === 'P2P' && <Building2 size={16} />}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-white text-sm block">{offer.source}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${offer.type === 'Grid' ? 'bg-[rgba(251,191,36,0.1)] text-[var(--color-warning)]' :
                                                            offer.type === 'Battery' ? 'bg-[rgba(52,211,153,0.1)] text-[var(--color-positive)]' :
                                                                'bg-[rgba(96,165,250,0.1)] text-[var(--color-info)]'
                                                        }`} style={{ fontFamily: 'var(--font-mono)' }}>{offer.type}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* TO */}
                                        <td>
                                            <span className="px-3 py-1 text-xs font-semibold rounded bg-[rgba(248,113,113,0.12)] text-[var(--color-negative)] border border-[rgba(248,113,113,0.2)]" style={{ fontFamily: 'var(--font-mono)' }}>
                                                Building 1
                                            </span>
                                        </td>

                                        {/* AVAILABLE */}
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                                                {offer.amount} <span className="text-[var(--color-text-dim)] font-normal text-xs">kWh</span>
                                            </span>
                                        </td>

                                        {/* RATE */}
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`font-bold ${offer.price > 0.25 ? 'text-[var(--color-negative)]' : offer.price > 0.15 ? 'text-[var(--color-warning)]' : 'text-[var(--color-positive)]'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                                                ${offer.price.toFixed(2)}<span className="text-[var(--color-text-muted)] font-normal text-xs">/kWh</span>
                                            </span>
                                        </td>

                                        {/* STATUS (NEW) */}
                                        <td style={{ textAlign: 'center' }}>
                                            {isProcessing ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] animate-pulse">
                                                    <Loader2 size={12} className="animate-spin" /> In Queue...
                                                </span>
                                            ) : isCompleted ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-positive)]">
                                                    <CheckCircle2 size={12} /> Completed
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[var(--color-text-muted)]">Available</span>
                                            )}
                                        </td>

                                        {/* ACTION */}
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleBuy(offer.id, offer.source)}
                                                disabled={status !== 'idle'}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 
                                                    ${isCompleted ? 'bg-transparent text-[var(--color-text-muted)] border border-[var(--color-border)] cursor-default opacity-50' :
                                                        isProcessing ? 'bg-[var(--color-card)] border border-[var(--color-accent)] text-[var(--color-accent)] cursor-wait opacity-80' :
                                                            'bg-[var(--color-accent)] text-black hover:bg-[#33e0ff] active:scale-95'}`}
                                            >
                                                {isCompleted ? 'Purchased' : 'Buy Energy'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Trading;
