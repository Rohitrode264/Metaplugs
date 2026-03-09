import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import PostRenderer from '@/components/PostRenderer';
import { createClient } from '@/lib/supabaseClient';
import { Calendar, Clock, Tag, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

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

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = createClient();

    const { data: post } = await supabase
        .from('posts')
        .select('*, categories(title, slug), profiles(full_name)')
        .eq('id', id)
        .eq('status', 'published')
        .single();

    if (!post) {
        notFound();
    }

    // Fetch related posts from same category
    let related: Post[] = [];
    if (post.category_id) {
        const { data: rel } = await supabase
            .from('posts')
            .select('*, categories(title, slug), profiles(full_name)')
            .eq('category_id', post.category_id)
            .eq('status', 'published')
            .neq('id', id)
            .order('created_at', { ascending: false })
            .limit(4);
        related = rel || [];
    }

    const isNews = post.post_type === 'news';

    return (
        <div className="min-h-screen bg-[#FFF8F8]">
            <Navbar />

            <article className="relative">
                {/* ── TOP HEADER SECTION ─────────────────────────────────── */}
                <div className="bg-white pt-16 md:pt-24 pb-16 md:pb-24 border-b border-red-50">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        {/* Navigation Back */}
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-mp-red text-[10px] font-black uppercase tracking-widest mb-10 transition-colors group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Signals
                        </Link>

                        {/* Labels */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {isNews && (
                                <span className="px-4 py-1.5 bg-mp-red text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-mp-red/20">
                                    News Alert
                                </span>
                            )}
                            {post.categories?.title && (
                                <Link
                                    href={`/category/${post.categories.slug || ''}`}
                                    className="px-4 py-1.5 bg-mp-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-mp-red transition-all"
                                >
                                    {post.categories.title}
                                </Link>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-bold text-mp-black leading-tight mb-8 font-playfair tracking-tight">
                            {post.title}
                        </h1>

                        {/* Author/Date Meta */}
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-gray-400 text-[11px] font-bold tracking-wider">
                            {post.profiles?.full_name && (
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
                                <div className="flex items-center gap-1.5 text-mp-black"><Calendar size={14} className="text-mp-red" /> {formatDate(post.created_at)}</div>
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Reading Time</span>
                                <div className="flex items-center gap-1.5 text-mp-black"><Clock size={14} className="text-mp-red" /> {post.read_time || 5} MIN READ</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── HERO IMAGE ─────────────────────────────────────────── */}
                {post.cover_image_url && (
                    <div className="max-w-6xl mx-auto px-6 mt-[-2rem] md:mt-[-6rem] relative z-20">
                        <div className="aspect-[16/9] md:aspect-[21/9] w-full bg-gray-100 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-black/10 transition-transform duration-700 hover:scale-[1.005] relative">
                            <Image
                                src={post.cover_image_url}
                                alt={post.title}
                                fill
                                priority
                                className="object-cover object-top"
                            />
                        </div>
                    </div>
                )}

                {/* ── CONTENT BODY ───────────────────────────────────────── */}
                <div className="max-w-4xl mx-auto px-6 py-20 md:py-32">
                    {post.excerpt && (
                        <div className="mb-16">
                            <p className="text-xl md:text-2xl font-medium text-gray-600 leading-relaxed italic border-l-4 border-mp-red pl-8">
                                {post.excerpt}
                            </p>
                        </div>
                    )}

                    <div className="prose prose-lg md:prose-xl prose-slate max-w-none prose-headings:font-playfair prose-headings:font-black prose-headings:tracking-tighter prose-a:text-mp-red prose-img:rounded-3xl prose-img:shadow-xl">
                        <PostRenderer blocks={Array.isArray(post.content) ? post.content : (post.content?.blocks || [])} />
                    </div>

                    {/* Tags / End Meta */}
                    <div className="mt-16 pt-16 border-t border-red-50">
                        <div className="flex items-center gap-3">
                            <Tag size={18} className="text-mp-red" />
                            <div className="flex flex-wrap gap-2">
                                {['INTEL', 'ANALYSIS', 'REPORT'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-red-50/50 text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-md">
                                        #{tag}
                                    </span>
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
                            {post.categories?.slug && (
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
