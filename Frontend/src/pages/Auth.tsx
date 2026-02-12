import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/dashboard');
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
                                <input type="text" placeholder="John Doe" className="input-field" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Email</label>
                        <input type="email" placeholder="operator@grid.io" className="input-field" />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Password</label>
                        <input type="password" placeholder="••••••••" className="input-field" />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-[var(--color-accent)] text-black font-bold text-sm rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2"
                        style={{ fontFamily: 'var(--font-mono)' }}
                    >
                        {isLogin ? <><LogIn size={16} /> LOGIN</> : <><UserPlus size={16} /> CREATE ACCOUNT</>}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
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
