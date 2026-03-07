'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import { createClient } from '@/lib/supabaseClient';
import { Globe, Layers, ChevronRight, Hash, ArrowUpRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

interface Category {
    id: string;
    title: string;
    slug: string;
    description?: string;
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

export default function CategoryPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [category, setCategory] = useState<Category | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const PER_PAGE = 12;

    useEffect(() => {
        if (slug) fetchCategory();
    }, [slug]);

    useEffect(() => {
        if (category) fetchPosts();
    }, [category, page]);

    const fetchCategory = async () => {
        const supabase = createClient();

        let { data: cat } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (!cat) {
            const { data: catById } = await supabase
                .from('categories')
                .select('*')
                .eq('id', slug)
                .single();
            cat = catById;
        }

        setCategory(cat);
    };

    const fetchPosts = async () => {
        if (!category) return;
        setLoading(true);
        const supabase = createClient();

        const from = (page - 1) * PER_PAGE;
        const to = from + PER_PAGE - 1;

        const { data, count } = await supabase
            .from('posts')
            .select('*, categories(title, slug), profiles(full_name)', { count: 'exact' })
            .eq('category_id', category.id)
            .eq('status', 'published')
            .eq('post_type', 'blog')
            .order('created_at', { ascending: false })
            .range(from, to);

        setPosts(prev => page === 1 ? (data || []) : [...prev, ...(data || [])]);
        setHasMore((count || 0) > page * PER_PAGE);
        setLoading(false);
    };

    const displayTitle = category?.title || decodeURIComponent(slug?.replace(/-/g, ' ') || '');

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* ── PROFESSIONAL HUB HEADER ─────────────────────────────────── */}
            <div className="bg-mp-black pt-28 pb-20 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-mp-red/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-mp-red/5 rounded-full blur-[80px]" />

                <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <Link href="/" className="hover:text-mp-red transition-colors">INTEL</Link>
                        <ChevronRight size={12} className="text-gray-700" />
                        <Link href="/categories" className="hover:text-mp-red transition-colors">HUBS</Link>
                        <ChevronRight size={12} className="text-gray-700" />
                        <span className="text-mp-red">{displayTitle}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-3 text-mp-red text-[10px] font-black uppercase tracking-[0.4em] mb-6">
                                <span className="w-12 h-[2px] bg-mp-red" /> CATEGORY STREAM
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-white font-playfair tracking-tight mb-8 leading-[0.9]">
                                {displayTitle}<span className="text-mp-red">.</span>
                            </h1>
                            {category?.description ? (
                                <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-2xl">
                                    {category.description}
                                </p>
                            ) : (
                                <p className="text-gray-500 text-lg font-medium">
                                    Deep-dive analysis and professional insights regarding <span className="text-white">{displayTitle}</span> within the global intelligence landscape.
                                </p>
                            )}
                        </div>

                        {/* Hub Stats */}
                        <div className="flex flex-wrap gap-4 md:flex-col items-start">
                            <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                <div className="text- mp-red font-black text-2xl leading-none mb-1">{posts.length}</div>
                                <div className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Active Signals</div>
                            </div>
                            <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                <div className="text-white font-black text-2xl leading-none mb-1">04</div>
                                <div className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Sub-Tags</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PROFESSIONAL BLOG GRID ──────────────────────────────────── */}
            <section className="py-24 bg-gray-50/20">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    {/* Grid Title Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16 border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-mp-black text-white rounded-xl flex items-center justify-center shadow-lg">
                                <LayoutGrid size={20} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-mp-black font-playfair">Latest Analysis</h2>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">PRIMARY FEED</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-mp-red mr-2">Quick Access:</span>
                            {['ANALYST', 'REPORTS', 'DATA'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-gray-400 text-[9px] font-black uppercase tracking-widest hover:border-mp-red hover:text-mp-red transition-all cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {loading && page === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-white rounded-3xl h-[450px] border border-gray-100" />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="py-32 text-center flex flex-col items-center gap-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm mx-auto max-w-2xl px-10">
                            <div className="w-24 h-24 bg-mp-red/5 rounded-full flex items-center justify-center text-mp-red/20 scale-110">
                                <Globe size={48} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-mp-black mb-3">Silent Signals.</h3>
                                <p className="text-gray-500 leading-relaxed max-w-md mx-auto">This intelligence hub is currently in a passive state. We are gathering new data points for <span className="text-mp-black font-bold">{displayTitle}</span>. Check back soon.</p>
                            </div>
                            <Link href="/" className="px-8 py-4 bg-mp-red text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-mp-red/20 transition-all hover:scale-105 active:scale-95">
                                EXPLORE OTHER HUBS
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {posts.map((post, idx) => (
                                    <div
                                        key={post.id}
                                        className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                                        style={{ animationDelay: `${idx * 150}ms` }}
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
                                        {loading ? 'SYNCHRONIZING...' : 'SCAN NEXT REPORTS'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* ── RELATED HUBS SECTION ───────────────────────────────────── */}
            <section className="py-24 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div>
                            <div className="text-mp-red text-[10px] font-black uppercase tracking-[0.3em] mb-4">CONTINUE DISCOVERY</div>
                            <h2 className="text-4xl md:text-5xl font-black text-mp-black font-playfair tracking-tight">Across the <span className="text-mp-red">Network.</span></h2>
                        </div>
                        <Link href="/categories" className="flex items-center gap-2 text-mp-black font-black text-xs uppercase tracking-widest group">
                            VIEW GLOBAL HUBS <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {['AI INTERFACE', 'CYBER SEC', 'QUANTUM', 'ROBOTICS'].map(name => (
                            <div key={name} className="p-8 border border-gray-100 rounded-[2rem] hover:border-mp-red/20 hover:shadow-xl hover:shadow-mp-red/5 transition-all group cursor-pointer bg-white">
                                <div className="w-12 h-12 bg-mp-red/5 rounded-2xl flex items-center justify-center text-mp-red mb-6 group-hover:bg-mp-red group-hover:text-white transition-all">
                                    <Hash size={20} />
                                </div>
                                <h4 className="text-lg font-black text-mp-black mb-2 group-hover:text-mp-red transition-colors">{name}</h4>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6">Explore intelligence focused specifically on {name.toLowerCase()} systems.</p>
                                <div className="text-[10px] font-black uppercase tracking-widest text-mp-red flex items-center gap-1 group-hover:gap-2 transition-all">
                                    OPEN HUB <ChevronRight size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
