import React, { useState } from 'react';
import { tradingHistory } from '../services/mockData';
import { ArrowLeftRight, Send } from 'lucide-react';

const orderBookBids = [
    { price: 0.12, amount: 1000, total: 120.00 },
    { price: 0.11, amount: 800, total: 88.00 },
    { price: 0.10, amount: 1500, total: 150.00 },
    { price: 0.09, amount: 600, total: 54.00 },
];

const orderBookAsks = [
    { price: 0.13, amount: 250, total: 32.50 },
    { price: 0.14, amount: 500, total: 70.00 },
    { price: 0.15, amount: 300, total: 45.00 },
    { price: 0.16, amount: 700, total: 112.00 },
];

const Trading: React.FC = () => {
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [tab, setTab] = useState<'buy' | 'sell'>('buy');

    const total = price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : '0.00';

    const handleTrade = () => {
        if (!price || !amount) return;
        alert(`${tab.toUpperCase()} Order: ${amount} kWh @ $${price}/kWh = $${total}`);
    };

    const maxBidAmount = Math.max(...orderBookBids.map(b => b.amount));
    const maxAskAmount = Math.max(...orderBookAsks.map(a => a.amount));

    return (
        <div className="space-y-6 animate-enter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">P2P Energy Trading</h1>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>BLOCKCHAIN-SETTLED · SMART CONTRACT v1.2</p>
                </div>
                <div className="flex items-center gap-6 px-5 py-3 card">
                    <div>
                        <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Available</p>
                        <p className="text-base font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>1,245.50 <span className="text-[11px] text-[var(--color-text-dim)]">SG</span></p>
                    </div>
                    <div className="w-px h-8 bg-[var(--color-border)]" />
                    <div>
                        <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Locked</p>
                        <p className="text-base font-bold text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>120.00 <span className="text-[11px] text-[var(--color-text-dim)]">SG</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Order Form */}
                <div className="card p-6 lg:col-span-1">
                    <h3 className="text-base font-semibold text-white mb-5">Place Order</h3>
                    {/* Buy/Sell Tabs */}
                    <div className="flex mb-5 border border-[var(--color-border)] rounded-md overflow-hidden">
                        <button
                            onClick={() => setTab('buy')}
                            className={`flex-1 py-2.5 text-[13px] font-bold transition-colors ${tab === 'buy' ? 'bg-[var(--color-positive)] text-black' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                            style={{ fontFamily: 'var(--font-mono)' }}
                        >
                            BUY
                        </button>
                        <button
                            onClick={() => setTab('sell')}
                            className={`flex-1 py-2.5 text-[13px] font-bold transition-colors ${tab === 'sell' ? 'bg-[var(--color-negative)] text-white' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                            style={{ fontFamily: 'var(--font-mono)' }}
                        >
                            SELL
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Price ($/kWh)</label>
                            <input
                                type="number"
                                className="input-field input-field-mono"
                                placeholder="0.12"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Amount (kWh)</label>
                            <input
                                type="number"
                                className="input-field input-field-mono"
                                placeholder="100"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center py-3 border-t border-b border-[var(--color-border)]">
                            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Total Cost</span>
                            <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>${total}</span>
                        </div>
                        <button
                            onClick={handleTrade}
                            className={`w-full py-3 font-bold text-sm rounded-md transition-all flex items-center justify-center gap-2 ${tab === 'buy'
                                    ? 'bg-[var(--color-positive)] text-black hover:brightness-110'
                                    : 'bg-[var(--color-negative)] text-white hover:brightness-110'
                                }`}
                            style={{ fontFamily: 'var(--font-mono)' }}
                        >
                            <Send size={15} />
                            {tab === 'buy' ? 'PLACE BUY ORDER' : 'PLACE SELL ORDER'}
                        </button>
                    </div>
                </div>

                {/* Order Book */}
                <div className="card overflow-hidden lg:col-span-2">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-white">Order Book</h3>
                            <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>LIVE DEPTH</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ArrowLeftRight size={14} className="text-[var(--color-accent)]" />
                            <span className="text-[13px] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>SPREAD: $0.01</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
                        {/* Bids */}
                        <div>
                            <div className="px-5 py-2.5 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                                <span className="text-[11px] font-bold text-[var(--color-positive)] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>BIDS</span>
                            </div>
                            <div>
                                {orderBookBids.map((bid, i) => (
                                    <div key={i} className="relative px-5 py-3 flex items-center justify-between text-[13px] hover:bg-[rgba(255,255,255,0.02)]">
                                        <div className="absolute left-0 top-0 h-full bg-[rgba(52,211,153,0.06)]" style={{ width: `${(bid.amount / maxBidAmount) * 100}%` }} />
                                        <span className="text-[var(--color-positive)] relative z-10" style={{ fontFamily: 'var(--font-mono)' }}>{bid.price.toFixed(2)}</span>
                                        <span className="text-[var(--color-text-muted)] relative z-10" style={{ fontFamily: 'var(--font-mono)' }}>{bid.amount.toLocaleString()}</span>
                                        <span className="text-[var(--color-text-dim)] relative z-10" style={{ fontFamily: 'var(--font-mono)' }}>{bid.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Asks */}
                        <div>
                            <div className="px-5 py-2.5 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                                <span className="text-[11px] font-bold text-[var(--color-negative)] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>ASKS</span>
                            </div>
                            <div>
                                {orderBookAsks.map((ask, i) => (
                                    <div key={i} className="relative px-5 py-3 flex items-center justify-between text-[13px] hover:bg-[rgba(255,255,255,0.02)]">
                                        <div className="absolute right-0 top-0 h-full bg-[rgba(248,113,113,0.06)]" style={{ width: `${(ask.amount / maxAskAmount) * 100}%` }} />
                                        <span className="text-[var(--color-negative)] relative z-10" style={{ fontFamily: 'var(--font-mono)' }}>{ask.price.toFixed(2)}</span>
                                        <span className="text-[var(--color-text-muted)] relative z-10" style={{ fontFamily: 'var(--font-mono)' }}>{ask.amount.toLocaleString()}</span>
                                        <span className="text-[var(--color-text-dim)] relative z-10" style={{ fontFamily: 'var(--font-mono)' }}>{ask.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trade History */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)]">
                    <h3 className="text-base font-semibold text-white">Trade History</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Amount</th>
                            <th style={{ textAlign: 'right' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tradingHistory.map((trade) => (
                            <tr key={trade.id}>
                                <td style={{ fontFamily: 'var(--font-mono)' }} className="text-[var(--color-text-muted)]">{trade.time}</td>
                                <td>
                                    <span className={`badge ${trade.type === 'Buy' ? 'badge-positive' : 'badge-negative'}`}>{trade.type}</span>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)' }}>${trade.price}</td>
                                <td style={{ fontFamily: 'var(--font-mono)' }}>{trade.amount} kWh</td>
                                <td style={{ textAlign: 'right' }}>
                                    <span className="flex items-center justify-end gap-1.5">
                                        <span className={`status-dot ${trade.status === 'Confirmed' ? 'status-dot-positive' : trade.status === 'Pending' ? 'status-dot-warning status-dot-live' : 'status-dot-negative'}`} />
                                        <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>{trade.status.toUpperCase()}</span>
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Trading;
