import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    BarChart3,
    BrainCircuit,
    ArrowLeftRight,
    Leaf,
    Wallet,
    User,
    ShoppingBag,
    Clock,
    LogOut,
    Wifi,
    History as HistoryIcon
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [clock, setClock] = useState('');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setClock(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const handler = () => setIsProfileOpen(false);
        if (isProfileOpen) document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [isProfileOpen]);

    const navItems = [
        { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Analytics', path: '/dashboard/charts', icon: BarChart3 },
        { label: 'Forecast', path: '/dashboard/forecasts', icon: BrainCircuit },
        { label: 'Trading', path: '/dashboard/trading', icon: ArrowLeftRight },
        { label: 'Carbon', path: '/dashboard/carbon', icon: Leaf },
        { label: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            {/* ── Header ── */}
            <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-8">
                        <div className="text-xl font-bold tracking-tight select-none" style={{ fontFamily: 'var(--font-mono)' }}>
                            GRID<span className="text-[var(--color-accent)]">AI</span>
                        </div>

                        {/* Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 ${active
                                                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                                                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                                            }`}
                                    >
                                        <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-5">
                        {/* Status indicator */}
                        <div className="hidden lg:flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                            <Wifi size={14} className="text-[var(--color-positive)]" />
                            <span className="font-medium" style={{ fontFamily: 'var(--font-mono)' }}>CONNECTED</span>
                        </div>

                        <div className="hidden lg:block w-px h-5 bg-[var(--color-border)]" />

                        {/* Clock */}
                        <div className="hidden lg:flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
                            <Clock size={14} />
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{clock}</span>
                        </div>

                        <div className="w-px h-5 bg-[var(--color-border)]" />

                        {/* Profile */}
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }}
                                className="w-9 h-9 rounded-md bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] text-sm font-bold hover:border-[var(--color-accent)] transition-colors duration-150"
                            >
                                J
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-xl py-1 z-50 animate-enter">
                                    <div className="px-4 py-3 border-b border-[var(--color-border)]">
                                        <p className="text-sm font-semibold text-[var(--color-text)]">John Doe</p>
                                        <p className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>PROSUMER</p>
                                    </div>

                                    <Link to="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-text)] transition-colors">
                                        <User size={15} /> Profile
                                    </Link>
                                    <Link to="/dashboard/purchases" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-text)] transition-colors">
                                        <ShoppingBag size={15} /> Purchases
                                    </Link>
                                    <Link to="/dashboard/history" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-text)] transition-colors">
                                        <HistoryIcon size={15} /> History & Logs
                                    </Link>

                                    <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                                        <button
                                            onClick={() => navigate('/')}
                                            className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-negative)] hover:bg-[rgba(248,113,113,0.08)] transition-colors"
                                        >
                                            <LogOut size={15} /> Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="max-w-[1440px] mx-auto px-6 py-7">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default DashboardLayout;
