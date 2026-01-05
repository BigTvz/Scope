
import React, { useState } from 'react';
import { ScopeLogo } from './ScopeLogo';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        const success = isLogin
            ? login(username, password)
            : register(username, password);

        if (!success) {
            setError(isLogin ? 'Invalid credentials' : 'User already exists');
        }
    };

    return (
        <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-brand-card rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-4">
                        <ScopeLogo className="w-10 h-10 text-brand-accent" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-white italic">Scope</h1>
                    <p className="text-brand-muted text-sm font-bold tracking-widest mt-2 uppercase">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted group-focus-within:text-brand-accent transition-colors" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-accent/50 transition-colors"
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted group-focus-within:text-brand-accent transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-accent/50 transition-colors"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-brand-accent text-brand-black font-bold uppercase tracking-wider py-4 rounded-xl flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                    >
                        <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <div className="mt-8 text-center relative z-10">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-white transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>

            <div className="mt-8 text-brand-muted text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">
                Local Secure Storage
            </div>
        </div>
    );
};
