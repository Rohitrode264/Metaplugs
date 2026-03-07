'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabaseClient';
import { Zap, Shield, DollarSign, Rocket, Crown, Globe, ArrowRight, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';

const CAT_ICONS: Record<string, any> = {
    'ai': Zap,
    'defence': Shield,
    'defense': Shield,
    'money': DollarSign,
    'finance': DollarSign,
    'startup': Rocket,
    'startups': Rocket,
    'unicorn': Crown,
    'unicorns': Crown,
    'world': Globe,
    'default': BookOpen,
};

function getCatIcon(title: string) {
    const lower = title.toLowerCase();
    for (const key of Object.keys(CAT_ICONS)) {
        if (lower.includes(key)) return CAT_ICONS[key];
    }
    return CAT_ICONS.default;
}

interface Hub {
    id: string;
    title: string;
    slug: string;
    description?: string;
    post_count?: number;
}

export default function CategoriesPage() {
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHubs = async () => {
            const supabase = createClient();
            const { data: cats } = await supabase.from('categories').select('*').order('title');

            if (!cats) { setLoading(false); return; }

            const withCounts = await Promise.all(
                cats.map(async cat => {
                    const { count } = await supabase
                        .from('posts')
                        .select('*', { count: 'exact', head: true })
                        .eq('category_id', cat.id)
                        .eq('post_type', 'blog')
                        .eq('status', 'published');
                    return { ...cat, post_count: count || 0 };
                })
            );

            setHubs(withCounts);
            setLoading(false);
        };

        fetchHubs();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hubs Hero */}
            <div className="bg-mp-black py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-mp-red/10 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 text-mp-red text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                        <Layers size={14} /> Intelligence Network
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white font-playfair tracking-tighter mb-6">
                        Global <span className="text-mp-red italic">Hubs.</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                        Navigate the Metaplugs network across specialized operational hubs.
                        From frontier AI to defense technology and global venture capital.
                    </p>
                </div>
            </div>

            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-white rounded-3xl h-64 border border-gray-100" />
                            ))}
                        </div>
                    ) : hubs.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200">
                                <Globe size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-mp-black">No active hubs found.</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {hubs.map(hub => {
                                const Icon = getCatIcon(hub.title);
                                return (
                                    <Link
                                        key={hub.id}
                                        href={`/category/${hub.slug || hub.id}`}
                                        className="group relative bg-white p-10 rounded-3xl border border-gray-100 hover:border-mp-red/20 hover:shadow-2xl transition-all duration-300 flex flex-col items-start overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-mp-red/5 rounded-bl-full -mr-10 -mt-10 group-hover:bg-mp-red/10 transition-colors" />

                                        <div className="flex items-center justify-between w-full mb-8">
                                            <div className="w-16 h-16 bg-mp-red-light rounded-2xl flex items-center justify-center text-mp-red transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                                <Icon size={32} />
                                            </div>
                                            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100">
                                                {hub.post_count} SIGNALS
                                            </span>
                                        </div>

                                        <div className="mb-8">
                                            <h2 className="text-2xl font-black text-mp-black mb-3 group-hover:text-mp-red transition-colors font-playfair tracking-tight">
                                                {hub.title}
                                            </h2>
                                            {hub.description && (
                                                <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">
                                                    {hub.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-auto flex items-center gap-2 text-mp-red text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                                            ACCESS HUB <ArrowRight size={16} />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
