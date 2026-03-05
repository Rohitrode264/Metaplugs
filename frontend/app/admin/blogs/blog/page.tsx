'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabaseClient';
import PostRenderer from '@/components/PostRenderer';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getPostUrl } from '@/lib/blogUtils';

export default function BlogReviewPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (id) {
            fetchPost();
        } else {
            setError('No post ID provided for review.');
            setLoading(false);
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, categories(title), profiles(full_name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Post not found');

            setPost(data);
        } catch (err: any) {
            console.error('Error fetching post:', err);
            setError(err.message || 'Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!confirm('Are you sure you want to publish this post?')) return;

        try {
            const { error } = await supabase
                .from('posts')
                .update({ status: 'published', updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            // Refresh post data
            fetchPost();
            alert('Post published successfully!');
        } catch (err: any) {
            alert('Error publishing post: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium italic">Preparing review...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-xl shadow-red-100">
                    <AlertCircle size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Review unavailable</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">{error || 'The post you are looking for could not be found.'}</p>
                </div>
                <Link href="/admin/posts" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                    <ArrowLeft size={18} /> Back to Posts
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Review Header Bar */}
            <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 mb-10 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/posts"
                        className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
                        title="Back to posts"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                post.status === 'published' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                            )}>
                                {post.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review Mode</span>
                        </div>
                        <h1 className="text-sm font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">{post.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {post.status === 'published' && (
                        <Link
                            href={getPostUrl(post)}
                            target="_blank"
                            className="px-5 py-2.5 text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-2"
                        >
                            <Eye size={18} />
                            View Live Post
                        </Link>
                    )}
                    <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="px-5 py-2.5 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                        Edit Post
                    </Link>
                </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <article className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                {/* Hero Section (Mini version of public) */}
                <div className="relative w-full h-[400px] bg-slate-900 overflow-hidden">
                    {post.cover_image_url ? (
                        <>
                            <img
                                src={post.cover_image_url}
                                className="w-full h-full object-cover opacity-70"
                                alt={post.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 opacity-60" />
                    )}

                    <div className="absolute inset-0 flex flex-col justify-end p-12">
                        <div className="max-w-4xl">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                {post.categories && (
                                    <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest">
                                        {post.categories.title}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                                {post.title}
                            </h2>
                            <div className="flex items-center gap-4 text-white/80">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-blue-400" />
                                    <span className="text-sm font-bold">{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-white/30" />
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-blue-400" />
                                    <span className="text-sm font-bold">Reviewing as Admin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-16">
                    <div className="prose prose-slate max-w-none">
                        <PostRenderer blocks={post.content} />
                    </div>

                    <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {post.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Author</p>
                                <p className="font-bold text-slate-900">{post.profiles?.full_name || 'System User'}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Policy</p>
                            <p className="text-xs text-slate-500 max-w-xs italic">
                                This is a private preview for administrative review. Changes made here will not be visible until published.
                            </p>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
