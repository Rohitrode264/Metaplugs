'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.push('/admin/posts');
        } catch (error: any) {
            alert(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
            <div className="max-w-md w-full p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in duration-700">
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <ShieldCheck size={24} />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-center text-black mb-2 tracking-tight">Admin Access</h1>
                <p className="text-slate-400 text-center text-xs font-bold uppercase tracking-[0.2em] mb-10">Metaplugs Dashboard</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-black text-black mb-2 px-1 uppercase tracking-widest">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-black font-bold placeholder:text-slate-300"
                            placeholder="name@metaplugs.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-black mb-2 px-1 uppercase tracking-widest">Secure Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-black font-bold placeholder:text-slate-300"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-black text-sm uppercase tracking-widest flex justify-center shadow-xl shadow-slate-200 active:scale-[0.98] mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Sign In to Portal'}
                    </button>

                    <style jsx global>{`
                        input {
                            color: #000000 !important;
                        }
                    `}</style>
                </form>
            </div>
        </div>
    );
}
