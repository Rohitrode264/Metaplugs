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
        <div className="min-h-screen bg-[#FFF8F8]">
            <Navbar />

            {/* Ultra-Minimal Hub Title */}
            <header className="bg-white pt-12 pb-8 border-b border-red-50">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="text-mp-red text-[10px] font-black uppercase tracking-[0.3em] mb-2">CATEGORY HUB</div>
                            <h1 id="hub-title" className="text-3xl md:text-5xl font-black text-mp-black font-playfair tracking-tight">
                                {displayTitle}<span className="text-mp-red">.</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-mp-black text-white rounded-lg flex items-center justify-center shadow-lg">
                                <LayoutGrid size={18} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hub Intelligence</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── MINIMAL BLOG GRID ──────────────────────────────────── */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
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
                                <p className="text-gray-500 leading-relaxed max-w-md mx-auto">This intelligence hub is currently in a passive state. Check back soon.</p>
                            </div>
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

            <Footer />
        </div>
    );
}
