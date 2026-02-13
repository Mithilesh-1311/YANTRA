import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import EnergyGridDashboard from '../components/EnergyGridDashboard';

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

            <main className="max-w-[1440px] mx-auto px-8 pt-10 pb-24">
                {/* ── Project Title (Centered) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="text-center mb-10"
                >
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <span className="status-dot status-dot-positive status-dot-live" />
                        <span className="text-xs font-semibold text-[var(--color-positive)]" style={{ fontFamily: 'var(--font-mono)' }}>SYSTEM OPERATIONAL</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold leading-[1.12] mb-5 text-white">
                        AI Enabled Smart Grid Management<br />
                        <span className="text-[var(--color-accent)]">with Renewable Energy Prediction</span>
                    </h1>

                    <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                        AI-driven forecasting, peer-to-peer energy trading, and real-time grid monitoring — secured by blockchain.
                    </p>
                </motion.div>

                {/* ── Live Energy Grid Dashboard (Center) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                >
                    <EnergyGridDashboard />
                </motion.div>

                {/* ── Enter Control Panel Button (Bottom Center) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}
                    className="flex justify-center mt-14"
                >
                    <Link
                        to="/auth"
                        className="flex items-center gap-2 px-9 py-4 bg-[var(--color-accent)] text-black font-bold text-base rounded-lg hover:brightness-110 transition-all shadow-[0_0_24px_rgba(0,212,255,0.25)]"
                    >
                        Enter Control Panel <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </main>
        </div>
    );
};

export default Landing;
