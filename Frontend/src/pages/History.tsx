import React from 'react';
import { systemLogs } from '../services/mockData';
import { FileText, Download } from 'lucide-react';

const History: React.FC = () => {
    return (
        <div className="space-y-6 animate-enter">
            <h1 className="text-2xl font-semibold text-white">History & Logs</h1>

            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[var(--color-accent)]" />
                        <h3 className="text-base font-semibold text-white">System Activity Log</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <select className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-[13px] rounded-md px-4 py-2 outline-none" style={{ fontFamily: 'var(--font-mono)' }}>
                            <option>ALL ACTIVITY</option>
                            <option>SECURITY</option>
                            <option>TRANSACTIONS</option>
                            <option>SYSTEM</option>
                        </select>
                        <button className="flex items-center gap-2 text-[13px] text-[var(--color-accent)] hover:text-white transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
                            <Download size={14} /> EXPORT
                        </button>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Event ID</th>
                            <th>Action</th>
                            <th>IP / Device</th>
                            <th style={{ textAlign: 'right' }}>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {systemLogs.map((log) => (
                            <tr key={log.id}>
                                <td style={{ fontFamily: 'var(--font-mono)' }} className="text-[var(--color-text-dim)]">
                                    LOG-{log.id.toString().padStart(6, '0')}
                                </td>
                                <td className="font-medium text-white">{log.action}</td>
                                <td style={{ fontFamily: 'var(--font-mono)' }} className="text-[var(--color-text-muted)]">{log.ip}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }} className="text-[var(--color-text-muted)]">{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
