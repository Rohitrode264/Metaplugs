'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import { createClient } from '@/lib/supabaseClient';
import { Newspaper, Zap, Filter, LayoutGrid } from 'lucide-react';

interface Hub {
    id: string;
    title: string;
    slug: string;
}

interface Post {
    id: string;
    title: string;
    excerpt?: string;
    cover_image_url?: string;
    created_at: string;
    post_type?: string;
    categories?: { title: string; slug?: string } | null;
    profiles?: { full_name: string } | null;
}

export default function NewsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [selectedHub, setSelectedHub] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const PER_PAGE = 12;

    useEffect(() => {
        const fetchHubs = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('categories').select('*').order('title');
            setHubs(data || []);
        };
        fetchHubs();
    }, []);

    useEffect(() => {
        setPosts([]);
        setPage(1);
        fetchNews(1);
    }, [selectedHub]);

    useEffect(() => {
        if (page > 1) fetchNews(page);
    }, [page]);

    const fetchNews = async (pageNum: number) => {
        setLoading(true);
        const supabase = createClient();
        const from = (pageNum - 1) * PER_PAGE;
        const to = from + PER_PAGE - 1;

        let query = supabase
            .from('posts')
            .select('*, categories(title, slug), profiles(full_name)', { count: 'exact' })
            .eq('status', 'published')
            .eq('post_type', 'news')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (selectedHub !== 'all') {
            query = query.eq('category_id', selectedHub);
        }

        const { data, count } = await query;

        setPosts(prev => pageNum === 1 ? (data || []) : [...prev, ...(data || [])]);
        setHasMore((count || 0) > pageNum * PER_PAGE);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F6F7F8]">
            <Navbar />

            {/* Premium News Header */}
            <div className="bg-white pt-24 pb-20 relative overflow-hidden border-b border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-mp-red/[0.03] via-transparent to-transparent opacity-50" />
                <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 text-center">
                    <div className="inline-flex items-center gap-3 text-mp-red text-[10px] font-black uppercase tracking-[0.4em] mb-6 animate-in fade-in duration-500">
                        <Newspaper size={14} className="animate-pulse" /> Global Signals
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-mp-black font-playfair tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        The <span className="text-mp-red">Intercept.</span>
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Real-time intelligence and breaking updates from across the Metaplugs network, delivered with precision.
                    </p>
                </div>
            </div>

            {/* Filter Section - Professional Bar */}
            <div className="sticky top-16 md:top-20 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                        <div className="flex items-center gap-2 text-gray-400 mr-2 border-r border-gray-100 pr-4">
                            <Filter size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Feed</span>
                        </div>
                        <button
                            onClick={() => setSelectedHub('all')}
                            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all whitespace-nowrap border ${selectedHub === 'all' ? 'bg-mp-red text-white border-mp-red shadow-lg shadow-mp-red/20' : 'text-gray-500 hover:text-mp-black hover:bg-gray-50 border-transparent'}`}
                        >
                            All Streams
                        </button>
                        {hubs.map(hub => (
                            <button
                                key={hub.id}
                                onClick={() => setSelectedHub(hub.id)}
                                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all whitespace-nowrap border ${selectedHub === hub.id ? 'bg-mp-red text-white border-mp-red shadow-lg shadow-mp-red/20' : 'text-gray-500 hover:text-mp-black hover:bg-gray-50 border-transparent'}`}
                            >
                                {hub.title}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-mp-red font-black text-[10px] uppercase tracking-widest bg-mp-red/5 px-4 py-2 rounded-lg border border-mp-red/10">
                        <Zap size={14} className="fill-current" /> LIVE UPDATE
                    </div>
                </div>
            </div>

            <section className="py-20 md:py-24 bg-gray-50/50 min-h-[600px]">
                <div className="max-w-7xl mx-auto px-6">
                    {loading && posts.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-white rounded-3xl h-[450px] border border-gray-100" />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="py-32 text-center flex flex-col items-center gap-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm mx-auto max-w-2xl px-10">
                            <div className="w-24 h-24 bg-mp-red/5 rounded-full flex items-center justify-center text-mp-red/20 scale-110">
                                <Filter size={48} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-mp-black mb-3">Silent Frequency.</h3>
                                <p className="text-gray-500 leading-relaxed">No intelligence alerts found matching these parameters. Please adjust your filters or check back for upcoming signals.</p>
                            </div>
                            <button
                                onClick={() => setSelectedHub('all')}
                                className="text-mp-red font-black text-xs uppercase tracking-widest border-b-2 border-mp-red/20 hover:border-mp-red transition-all"
                            >
                                RESET FILTERS
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mb-16">
                                <div className="p-3 bg-white border border-gray-100 text-mp-black rounded-xl shadow-sm">
                                    <LayoutGrid size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-mp-black font-playfair tracking-tight">Intelligence Stream</h2>
                                    <p className="text-mp-red text-[10px] font-black uppercase tracking-widest">{posts.length} ACTIVE ALERTS</p>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-4" />
                            </div>

                            {/* Uniform Professional Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {posts.map((post, idx) => (
                                    <div
                                        key={post.id}
                                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <BlogCard post={post} />
                                    </div>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="mt-24 text-center">
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={loading}
                                        className="px-10 py-5 bg-mp-black hover:bg-mp-red text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-black/10 hover:shadow-mp-red/20 disabled:bg-gray-200 hover:-translate-y-1"
                                    >
                                        {loading ? 'SYNCHRONIZING...' : 'SCAN NEXT SIGNALS'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Newsletter Interstitial - Pro Design */}
            <section className="bg-mp-red py-24 relative overflow-hidden border-t border-mp-red/10">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="w-16 h-1 bg-white/20 mx-auto mb-10 rounded-full" />
                    <h3 className="text-3xl md:text-5xl font-black text-white font-playfair tracking-tight mb-6">
                        Stay ahead of the <span className="text-mp-black underline decoration-mp-black/10 underline-offset-8">curve.</span>
                    </h3>
                    <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        The world moves fast. Get the most critical intelligence reports delivered directly to your workstation once a week.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your terminal email..."
                            className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white transition-all flex-1 backdrop-blur-md placeholder:text-white/40 font-bold"
                        />
                        <button className="bg-mp-black hover:bg-black/80 text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl shadow-xl shadow-black/20 transition-all active:scale-95">
                            SUBSCRIBE
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
