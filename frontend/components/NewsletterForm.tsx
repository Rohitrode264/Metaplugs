'use client';

import { useState } from 'react';

interface NewsletterFormProps {
    variant?: 'default' | 'side';
}

export default function NewsletterForm({ variant = 'default' }: NewsletterFormProps) {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter subscription
        console.log('Subscribe:', email);
        alert('Thank you for subscribing!');
        setEmail('');
    };

    if (variant === 'side') {
        return (
            <div className="mt-auto bg-[#FFF8F8] rounded-2xl p-8 border border-red-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
                <h3 className="font-black text-mp-black text-sm mb-3">Want the full picture?</h3>
                <p className="text-gray-500 text-xs mb-6 leading-relaxed">Join 50k+ readers getting surgical-grade intelligence delivered daily.</p>
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        aria-label="Email Address for Newsletter"
                        className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl text-xs focus:ring-1 focus:ring-mp-red focus:border-mp-red outline-none transition-all"
                    />
                    <button type="submit" className="w-full py-3 bg-mp-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-mp-red transition-all shadow-lg active:scale-95">
                        JOIN NEWSLETTER
                    </button>
                </form>
            </div>
        );
    }

    return (
        <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubmit}>
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR.EMAIL@WORK.COM"
                aria-label="Email Address for Global Newsletter"
                className="flex-1 px-6 py-4 bg-white border border-red-100 rounded-xl text-mp-black font-bold placeholder:text-gray-400 focus:outline-none focus:border-mp-red transition-all text-sm shadow-sm"
            />
            <button type="submit" className="px-8 py-4 bg-mp-red text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-mp-red-dark transition-all shadow-xl shadow-mp-red/10 active:scale-95">
                SUBSCRIBE
            </button>
        </form>
    );
}
