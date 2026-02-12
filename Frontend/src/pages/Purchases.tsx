import React from 'react';
import { tradingHistory } from '../services/mockData';
import { ShoppingBag } from 'lucide-react';

const Purchases: React.FC = () => {
    const purchases = tradingHistory.filter(t => t.type === 'Buy');

    return (
        <div className="space-y-6 animate-enter">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-white">My Purchases</h1>
                <div className="flex items-center gap-3 card px-5 py-3">
                    <ShoppingBag size={16} className="text-[var(--color-positive)]" />
                    <div>
                        <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Total Spent</p>
                        <p className="text-base font-bold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>$12,450.00</p>
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Energy</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th style={{ textAlign: 'right' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map((purchase) => (
                            <tr key={purchase.id}>
                                <td style={{ fontFamily: 'var(--font-mono)' }} className="text-[var(--color-accent)]">ORD-#{purchase.id}292</td>
                                <td className="text-[var(--color-text-muted)]">{purchase.time}</td>
                                <td className="font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>{purchase.amount} kWh</td>
                                <td className="text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>${purchase.price}</td>
                                <td className="text-[var(--color-positive)] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                                    ${(purchase.amount * purchase.price).toFixed(2)}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <span className="flex items-center justify-end gap-1.5">
                                        <span className="status-dot status-dot-positive" />
                                        <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>{purchase.status.toUpperCase()}</span>
                                    </span>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td style={{ fontFamily: 'var(--font-mono)' }} className="text-[var(--color-accent)]">ORD-#99281</td>
                            <td className="text-[var(--color-text-muted)]">Oct 20, 2023</td>
                            <td className="font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>450 kWh</td>
                            <td className="text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>$0.11</td>
                            <td className="text-[var(--color-positive)] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>$49.50</td>
                            <td style={{ textAlign: 'right' }}>
                                <span className="flex items-center justify-end gap-1.5">
                                    <span className="status-dot status-dot-positive" />
                                    <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>CONFIRMED</span>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {purchases.length === 0 && (
                    <div className="p-12 text-center text-[var(--color-text-dim)]">
                        No purchase history found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Purchases;
