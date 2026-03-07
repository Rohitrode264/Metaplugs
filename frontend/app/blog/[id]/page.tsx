'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import PostRenderer from '@/components/PostRenderer';
import { createClient } from '@/lib/supabaseClient';
import { Calendar, Clock, User, Tag, ArrowLeft, Newspaper, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Post {
    id: string;
    title: string;
    excerpt?: string;
    cover_image_url?: string;
    content?: any;
    created_at: string;
    post_type?: string;
    read_time?: number;
    categories?: { title: string; slug?: string } | null;
    profiles?: { full_name: string } | null;
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostPage() {
    const params = useParams();
    const id = params?.id as string;

    const [post, setPost] = useState<Post | null>(null);
    const [related, setRelated] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (id) fetchPost();
    }, [id]);

    const fetchPost = async () => {
        const supabase = createClient();

        const { data } = await supabase
            .from('posts')
            .select('*, categories(title, slug), profiles(full_name)')
            .eq('id', id)
            .eq('status', 'published')
            .single();

        if (!data) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        setPost(data);

        // Fetch related posts from same category
        if (data.category_id) {
            const { data: rel } = await supabase
                .from('posts')
                .select('*, categories(title, slug), profiles(full_name)')
                .eq('category_id', data.category_id)
                .eq('status', 'published')
                .neq('id', id)
                .order('created_at', { ascending: false })
                .limit(4);
            setRelated(rel || []);
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-4xl mx-auto px-6 py-20 animate-pulse">
                    <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
                    <div className="h-16 w-3/4 bg-gray-100 rounded mb-4" />
                    <div className="h-16 w-1/2 bg-gray-100 rounded mb-12" />
                    <div className="aspect-[16/9] w-full bg-gray-50 rounded-3xl mb-12" />
                    <div className="space-y-4">
                        <div className="h-4 w-full bg-gray-50 rounded" />
                        <div className="h-4 w-full bg-gray-50 rounded" />
                        <div className="h-4 w-2/3 bg-gray-50 rounded" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-32 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-8">
                        <Sparkles size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-mp-black mb-4 font-playfair">Signal Lost.</h1>
                    <p className="text-gray-500 mb-10">The intelligence you're looking for has been retracted or moved.</p>
                    <Link href="/" className="px-8 py-4 bg-mp-red text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-mp-red/20 transition-all hover:-translate-y-1">
                        Return to Headquarters
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const isNews = post?.post_type === 'news';

    return (
        <div className="min-h-screen bg-[#F6F7F8]">
            <Navbar />

            <article className="relative">
                {/* ── TOP HEADER SECTION ─────────────────────────────────── */}
                <div className="bg-white pt-16 md:pt-24 pb-16 md:pb-24 border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        {/* Navigation Back */}
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-mp-red text-[10px] font-black uppercase tracking-widest mb-10 transition-colors group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Signals
                        </Link>

                        {/* Labels */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {isNews && (
                                <span className="px-4 py-1.5 bg-mp-red text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-mp-red/20 animate-in fade-in duration-500">
                                    News Alert
                                </span>
                            )}
                            {post?.categories?.title && (
                                <Link
                                    href={`/category/${post.categories.slug || ''}`}
                                    className="px-4 py-1.5 bg-mp-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-mp-red transition-all"
                                >
                                    {post.categories.title}
                                </Link>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-bold text-mp-black leading-tight mb-8 font-playfair tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {post?.title}
                        </h1>

                        {/* Author/Date Meta */}
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-gray-400 text-[11px] font-bold tracking-wider">
                            {post?.profiles?.full_name && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-mp-red/5 border border-mp-red/10 rounded-full flex items-center justify-center text-mp-red font-black text-xs">
                                        {post.profiles.full_name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Author</div>
                                        <div className="text-mp-black">{post.profiles.full_name}</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Published</span>
                                <div className="flex items-center gap-1.5 text-mp-black"><Calendar size={14} className="text-mp-red" /> {post?.created_at && formatDate(post.created_at)}</div>
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Reading Time</span>
                                <div className="flex items-center gap-1.5 text-mp-black"><Clock size={14} className="text-mp-red" /> {post?.read_time || 5} MIN READ</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── HERO IMAGE ─────────────────────────────────────────── */}
                {post?.cover_image_url && (
                    <div className="max-w-6xl mx-auto px-6 mt-[-2rem] md:mt-[-6rem] relative z-20">
                        <div className="aspect-[16/9] md:aspect-[21/9] w-full bg-gray-100 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-black/10 transition-transform duration-700 hover:scale-[1.005]">
                            <img
                                src={post.cover_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>
                )}

                {/* ── CONTENT BODY ───────────────────────────────────────── */}
                <div className="max-w-4xl mx-auto px-6 py-20 md:py-32">
                    {post?.excerpt && (
                        <div className="mb-16">
                            <p className="text-xl md:text-2xl font-medium text-gray-600 leading-relaxed italic border-l-4 border-mp-red pl-8">
                                {post.excerpt}
                            </p>
                        </div>
                    )}

                    <div className="prose prose-lg md:prose-xl prose-slate max-w-none prose-headings:font-playfair prose-headings:font-black prose-headings:tracking-tighter prose-a:text-mp-red prose-img:rounded-3xl prose-img:shadow-xl">
                        <PostRenderer blocks={Array.isArray(post?.content) ? post.content : (post?.content?.blocks || [])} />
                    </div>

                    {/* Tags / End Meta */}
                    <div className="mt-16 pt-16 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-3">
                            <Tag size={18} className="text-mp-red" />
                            <div className="flex flex-wrap gap-2">
                                {['INTEL', 'ANALYSIS', 'REPORT'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-md">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share this intel:</span>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-mp-red hover:text-white transition-all cursor-pointer">
                                        <Share2 size={14} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* ── RELATED READING ────────────────────────────────────── */}
            {related.length > 0 && (
                <section className="bg-gray-50 py-24 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <div className="flex items-center gap-3 text-mp-red text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                                    <span className="w-10 h-[2px] bg-mp-red" /> CONTINUE READING
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-mp-black font-playfair tracking-tighter">
                                    Related <span>Analysis.</span>
                                </h2>
                            </div>
                            {post?.categories?.slug && (
                                <Link href={`/category/${post.categories.slug}`} className="hidden sm:flex items-center gap-2 text-mp-red font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                                    VIEW FULL HUB <ArrowLeft size={14} className="rotate-180" />
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {related.map(rel => <BlogCard key={rel.id} post={rel} />)}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
}
