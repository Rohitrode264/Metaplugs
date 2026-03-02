'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, CheckCircle2, FileText, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PostsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        let query = supabase
            .from('posts')
            .select('*, categories(title)')
            .order('created_at', { ascending: false });

        const userRoleCheck = profile?.role?.trim().toLowerCase();
        if (userRoleCheck === 'contributor') {
            query = query.eq('author_id', user.id);
        }

        const { data } = await query;
        if (data) setPosts(data);
        if (profile) setUserRole(profile.role);
        setLoading(false);
    };

    const deletePost = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (!error) {
            fetchPosts();
        } else {
            console.error('Delete error:', error);
            alert(`Error deleting post: ${error.message}`);
        }
    };

    const publishPost = async (id: string) => {
        if (!confirm('Publish this post?')) return;
        const { error } = await supabase.from('posts').update({ status: 'published' }).eq('id', id);
        if (!error) fetchPosts();
        else alert('Error publishing post');
    };

    const isAdmin = ['admin', 'administrator'].includes(userRole?.trim().toLowerCase() || '');

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Content Library</h1>
                    <p className="text-slate-500 mt-2 text-lg font-light">Manage and publish your latest blogs and news updates.</p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center gap-3 font-bold transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                >
                    <Plus size={20} /> Create New Post
                </Link>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Title & Story Type</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Classification</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium italic">Synchronizing posts...</td></tr>
                            ) : posts.length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium italic">No posts found in the library.</td></tr>
                            ) : (
                                posts.map(post => (
                                    <tr key={post.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-transform group-hover:scale-110",
                                                    post.post_type === 'news' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {post.post_type === 'news' ? <Newspaper size={20} /> : <FileText size={20} />}
                                                </div>
                                                <div>
                                                    <Link href={`/admin/blogs/blog?id=${post.id}`} className="font-black text-slate-900 hover:text-blue-600 transition-colors block max-w-xs truncate">
                                                        {post.title}
                                                    </Link>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                        {post.post_type || 'blog'} • By System
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                                {post.categories?.title || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                                post.status === 'published' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    post.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        'bg-slate-50 text-slate-400 border-slate-100'
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full",
                                                    post.status === 'published' ? 'bg-green-500' :
                                                        post.status === 'pending' ? 'bg-orange-500' : 'bg-slate-400'
                                                )} />
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 flex items-center justify-end gap-2">
                                            <Link href={`/admin/posts/${post.id}/edit`} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:bg-white" title="Edit Content">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => deletePost(post.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group-hover:bg-white" title="Trash Content">
                                                <Trash2 size={18} />
                                            </button>
                                            <Link href={`/admin/blogs/blog?id=${post.id}`} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm group-hover:bg-white" title="Proofread & Review">
                                                <Eye size={18} />
                                            </Link>
                                            {isAdmin && post.status !== 'published' && (
                                                <button
                                                    onClick={() => publishPost(post.id)}
                                                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:bg-white"
                                                    title="Go Live Now"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
