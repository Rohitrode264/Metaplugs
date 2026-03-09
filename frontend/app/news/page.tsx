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
    const [analysisPosts, setAnalysisPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const PER_PAGE = 12;

    useEffect(() => {
        fetchTopAnalysis();
    }, []);

    useEffect(() => {
        fetchNews(page);
    }, [page]);

    const fetchTopAnalysis = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from('posts')
            .select('*, categories(title, slug), profiles(full_name)')
            .eq('status', 'published')
            .eq('post_type', 'blog')
            .order('created_at', { ascending: false })
            .limit(3);
        setAnalysisPosts(data || []);
    };

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

        const { data, count } = await query;

        setPosts(prev => pageNum === 1 ? (data || []) : [...prev, ...(data || [])]);
        setHasMore((count || 0) > pageNum * PER_PAGE);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#FFF8F8]">
            <Navbar />

            <main>
                {/* Premium News Header - ADVANCED ATTRACTIVE SHADING */}
                {/* Ultra-Minimal Title Bar */}
                <div className="bg-white pt-12 pb-6 border-b border-red-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 id="news-title" className="text-2xl font-black text-mp-black tracking-tighter uppercase font-playfair">
                                    GLOBAL <span className="text-mp-red">SIGNALS.</span>
                                </h1>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Live Intelligence Feed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TOP ANALYSIS / BLOGS SECTION */}
                {analysisPosts.length > 0 && (
                    <section className="bg-white py-12 border-b border-red-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3 text-mp-red text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                                <span className="w-8 h-[2px] bg-mp-red" /> TOP ANALYSIS <span className="w-8 h-[2px] bg-mp-red" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {analysisPosts.map((post) => (
                                    <div key={post.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <BlogCard
                                            post={{
                                                ...post,
                                                title: post.title.length > 60 ? post.title.substring(0, 60) + '...' : post.title
                                            }}
                                            variant="compact"
                                            priority={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-label="News Feed">

                    {/* Posts Grid */}
                    {loading && posts.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true" aria-label="Loading news">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-3xl h-[400px] animate-pulse border border-red-50" />
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {posts.map((post, idx) => (
                                    <div
                                        key={post.id}
                                        className={`h-full animate-in fade-in duration-700 fill-mode-both ${idx % 2 === 0 ? 'slide-in-from-left-8' : 'slide-in-from-right-8'
                                            }`}
                                        style={{ animationDelay: `${idx * 100}ms` }}
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
                                        className="px-10 py-5 bg-mp-black hover:bg-mp-red text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-black/10 hover:shadow-mp-red/20 disabled:bg-gray-200 hover:-translate-y-1 active:scale-95"
                                    >
                                        {loading ? 'SYNCHRONIZING...' : 'SCAN NEXT SIGNALS'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-red-100 italic">
                            <p className="text-gray-400 text-sm">No signals detected in this sector. Check back later.</p>
                        </div>
                    )}
                </section>

                {/* Bottom Newsletter CTA */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32" aria-labelledby="newsletter-heading">
                    <div className="bg-mp-black rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-mp-red/10 blur-[100px]" aria-hidden="true" />
                        <h2 id="newsletter-heading" className="text-3xl md:text-5xl font-black text-white font-playfair mb-6 tracking-tighter text-center w-full">
                            GET THE RAW <span className="text-mp-red italic underline decoration-mp-red/20 underline-offset-8">INTELLIGENCE.</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto font-medium">
                            Join the inner circle of analysts receiving our proprietary weekly signal brief.
                        </p>
                        <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="YOUR.EMAIL@ANALYST.COM"
                                aria-label="Email Address for News Brief"
                                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-gray-600 focus:outline-none focus:border-mp-red transition-all text-sm"
                            />
                            <button className="px-8 py-4 bg-mp-red text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-mp-red-dark transition-all shadow-xl shadow-mp-red/20 active:scale-95">
                                ACCESS FEED
                            </button>
                        </form>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
