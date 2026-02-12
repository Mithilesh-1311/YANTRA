import React, { useState } from 'react';
import { walletTransactions } from '../services/mockData';
import { Wallet as WalletIcon, Zap, Leaf, Copy, ExternalLink } from 'lucide-react';

const Wallet: React.FC = () => {
    const [connected, setConnected] = useState(false);

    const connectWallet = () => {
        setConnected(true);
    };

    return (
        <div className="space-y-6 animate-enter">
            <h1 className="text-2xl font-semibold text-white">Smart Wallet</h1>

            {!connected ? (
                <div className="flex flex-col items-center justify-center h-80 card">
                    <WalletIcon size={36} className="text-[var(--color-text-dim)] mb-5" />
                    <h2 className="text-xl font-semibold text-white mb-1">Connect Your Wallet</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-7">Access energy assets and transaction history securely.</p>
                    <button
                        onClick={connectWallet}
                        className="px-7 py-3 bg-[var(--color-accent)] text-black font-bold text-sm rounded-md hover:brightness-110 transition-all"
                        style={{ fontFamily: 'var(--font-mono)' }}
                    >
                        CONNECT METAMASK
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Balance */}
                        <div className="card p-7">
                            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Total Balance</p>
                            <h2 className="text-4xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                                1,245.50 <span className="text-base text-[var(--color-accent)]">SG</span>
                            </h2>
                            <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
                                <span style={{ fontFamily: 'var(--font-mono)' }}>0x71C7...9A23</span>
                                <button className="text-[var(--color-accent)] hover:text-white transition-colors" title="Copy address">
                                    <Copy size={14} />
                                </button>
                                <button className="text-[var(--color-accent)] hover:text-white transition-colors" title="View on explorer">
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="card p-7">
                            <p className="text-base font-semibold text-white mb-5">Quick Actions</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-5 bg-[var(--color-bg)] rounded-md border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors flex flex-col items-center justify-center gap-2.5">
                                    <Zap size={20} className="text-[var(--color-accent)]" />
                                    <span className="text-sm font-medium text-[var(--color-text)]">Buy Energy</span>
                                </button>
                                <button className="p-5 bg-[var(--color-bg)] rounded-md border border-[var(--color-border)] hover:border-[var(--color-positive)] transition-colors flex flex-col items-center justify-center gap-2.5">
                                    <Leaf size={20} className="text-[var(--color-positive)]" />
                                    <span className="text-sm font-medium text-[var(--color-text)]">Offset Carbon</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--color-border)]">
                            <h3 className="text-base font-semibold text-white">Transaction History</h3>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tx Hash</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th style={{ textAlign: 'right' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {walletTransactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td style={{ fontFamily: 'var(--font-mono)' }} className="text-[var(--color-accent)]">{tx.id}</td>
                                        <td className="text-[var(--color-text)]">{tx.type}</td>
                                        <td style={{ fontFamily: 'var(--font-mono)' }} className="text-[var(--color-text-muted)]">{tx.date}</td>
                                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }} className={tx.amount.startsWith('+') ? 'text-[var(--color-positive)]' : 'text-white'}>
                                            {tx.amount}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="flex items-center justify-end gap-1.5">
                                                <span className={`status-dot ${tx.status === 'Confirmed' ? 'status-dot-positive' : 'status-dot-warning status-dot-live'}`} />
                                                <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>{tx.status.toUpperCase()}</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default Wallet;
