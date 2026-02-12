import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Shield, Zap } from 'lucide-react';

const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            <nav className="flex justify-between items-center px-8 py-6 max-w-[1440px] mx-auto">
                <div className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
                    GRID<span className="text-[var(--color-accent)]">AI</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/auth" className="px-5 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
                        Login
                    </Link>
                    <Link
                        to="/auth?mode=signup"
                        className="px-5 py-2.5 text-sm font-semibold text-black bg-[var(--color-accent)] rounded-md hover:brightness-110 transition-all"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="max-w-[1440px] mx-auto px-8 pt-28 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="max-w-3xl"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <span className="status-dot status-dot-positive status-dot-live" />
                        <span className="text-xs font-semibold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>SYSTEM OPERATIONAL</span>
                    </div>

                    <h1 className="text-6xl font-bold leading-[1.12] mb-7 text-white">
                        Intelligent Grid<br />
                        Management.{' '}
                        <span className="text-[var(--color-accent)]">Decentralized.</span>
                    </h1>

                    <p className="text-xl text-[var(--color-text-muted)] mb-12 max-w-xl leading-relaxed">
                        AI-driven forecasting, peer-to-peer energy trading, and real-time grid monitoring — secured by blockchain.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/auth"
                            className="flex items-center gap-2 px-7 py-3.5 bg-[var(--color-accent)] text-black font-bold text-[15px] rounded-md hover:brightness-110 transition-all"
                        >
                            Enter Control Panel <ArrowRight size={18} />
                        </Link>
                        <Link
                            to="/auth"
                            className="px-7 py-3.5 border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium text-[15px] rounded-md hover:border-[var(--color-text-muted)] hover:text-white transition-colors"
                        >
                            View Demo
                        </Link>
                    </div>
                </motion.div>

                {/* Feature cards */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-24"
                >
                    <div className="card p-7">
                        <Activity size={22} className="text-[var(--color-accent)] mb-4" />
                        <h3 className="text-base font-semibold text-white mb-2">Real-Time Monitoring</h3>
                        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                            Live demand, generation, and frequency data updated every second.
                        </p>
                    </div>
                    <div className="card p-7">
                        <Zap size={22} className="text-[var(--color-positive)] mb-4" />
                        <h3 className="text-base font-semibold text-white mb-2">P2P Energy Trading</h3>
                        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                            Trade surplus energy directly with prosumers via smart contracts.
                        </p>
                    </div>
                    <div className="card p-7">
                        <Shield size={22} className="text-[var(--color-warning)] mb-4" />
                        <h3 className="text-base font-semibold text-white mb-2">Blockchain Security</h3>
                        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                            Every transaction verified and immutable on the blockchain ledger.
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Landing;
