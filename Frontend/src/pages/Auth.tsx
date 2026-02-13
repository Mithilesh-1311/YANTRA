import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) {
                    setError(error);
                    setLoading(false);
                    return;
                }
            } else {
                if (!name.trim()) {
                    setError('Please enter your full name.');
                    setLoading(false);
                    return;
                }
                const { error } = await signUp(email, password, name);
                if (error) {
                    setError(error);
                    setLoading(false);
                    return;
                }
            }
            navigate('/dashboard');
        } catch {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
            <div className="w-full max-w-md card p-9">
                <div className="text-center mb-7">
                    <div className="text-xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                        GRID<span className="text-[var(--color-accent)]">AI</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-white">
                        {isLogin ? 'Welcome Back' : 'Join the Grid'}
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {isLogin ? 'Sign in to access your control panel' : 'Create your operator account'}
                    </p>
                </div>

                {/* Error display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-5 overflow-hidden"
                        >
                            <div className="flex items-start gap-2.5 p-3.5 bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)] rounded-md">
                                <AlertCircle size={16} className="text-[var(--color-negative)] mt-0.5 shrink-0" />
                                <p className="text-sm text-[var(--color-negative)]">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="input-field"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="operator@grid.io"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[var(--color-accent)] text-black font-bold text-sm rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'var(--font-mono)' }}
                    >
                        {loading ? (
                            <><Loader2 size={16} className="animate-spin" /> PROCESSING...</>
                        ) : isLogin ? (
                            <><LogIn size={16} /> LOGIN</>
                        ) : (
                            <><UserPlus size={16} /> CREATE ACCOUNT</>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
