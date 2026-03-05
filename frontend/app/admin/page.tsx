'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { CheckCircle, Clock, FileText, Send, Trash2, ExternalLink, Eye, Users, ShieldCheck, Newspaper, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
    const supabase = createClient();
    const [profile, setProfile] = useState<any>(null);
    const [dataList, setDataList] = useState<any[]>([]);
    const [stats, setStats] = useState({ published: 0, pending: 0, drafts: 0 });
    const [loading, setLoading] = useState(true);

    const userRoleStr = profile?.role?.toString().trim().toLowerCase();
    const isAdmin = userRoleStr === 'admin' || userRoleStr === 'administrator';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData);

        const currentRole = profileData?.role?.toString().trim().toLowerCase();
        const isAdminUser = currentRole === 'admin' || currentRole === 'administrator';

        // Fetch Stats (Role Aware)
        let publishedQuery = supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published');
        let pendingQuery = supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        let draftsQuery = supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft');

        if (!isAdminUser) {
            publishedQuery = publishedQuery.eq('author_id', user.id);
            pendingQuery = pendingQuery.eq('author_id', user.id);
            draftsQuery = draftsQuery.eq('author_id', user.id);
        }

        const [{ count: published }, { count: pending }, { count: drafts }] = await Promise.all([
            publishedQuery,
            pendingQuery,
            draftsQuery
        ]);

        setStats({
            published: published || 0,
            pending: pending || 0,
            drafts: drafts || 0
        });

        // Fetch Content based on role
        if (isAdminUser) {
            // Admins see EVERYTHING: drafts, pending, published from all users
            const { data: allPosts, error } = await supabase
                .from('posts')
                .select('*, categories(title), profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(15);

            if (error) {
                console.error("Dashboard fetch error:", error);
                const { data: fallbackAll } = await supabase.from('posts').select('*, categories(title)').order('created_at', { ascending: false }).limit(15);
                setDataList(fallbackAll || []);
            } else {
                setDataList(allPosts || []);
            }
        } else {
            // Contributors see only their own content
            const { data: recent, error } = await supabase
                .from('posts')
                .select('*, categories(title), profiles(full_name)')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error("Dashboard fetch error:", error);
                const { data: fallbackRecent } = await supabase.from('posts').select('*, categories(title)').eq('author_id', user.id).order('created_at', { ascending: false }).limit(10);
                setDataList(fallbackRecent || []);
            } else {
                setDataList(recent || []);
            }
        }

        setLoading(false);
    };

    const handlePublish = async (id: string) => {
        const { error } = await supabase
            .from('posts')
            .update({ status: 'published', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) alert(error.message);
        else fetchData();
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Welcome back, <span className="text-blue-600">{profile?.full_name?.split(' ')[0] || 'Admin'}</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-light">Insights and overview of your Metaplugs platform.</p>
                </div>

                {isAdmin && (
                    <div className="flex gap-3">
                        <Link href="/admin/users" className="px-6 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <Users size={18} /> Manage Team
                        </Link>
                        <Link href="/admin/posts/new" className="px-6 py-3 bg-blue-600 text-white rounded-2xl flex items-center gap-2 font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                            <Send size={18} /> New Story
                        </Link>
                    </div>
                )}
            </header>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Live Content</h3>
                            <p className="text-3xl font-black text-slate-900 mt-1">{stats.published}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest">In Review</h3>
                            <p className="text-3xl font-black text-orange-600 mt-1">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Saved Drafts</h3>
                            <p className="text-3xl font-black text-slate-900 mt-1">{stats.drafts}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_380px] gap-10">
                {/* Content Queue */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-black text-slate-900 flex items-center gap-3">
                            {isAdmin ? <ShieldCheck size={20} className="text-blue-600" /> : <Clock size={20} className="text-orange-500" />}
                            {isAdmin ? 'All Recent Activity' : 'My Recent Activity'}
                        </h2>
                        <Link href="/admin/posts" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">View Library</Link>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {dataList.length === 0 ? (
                            <div className="p-20 text-center">
                                <FileText size={48} className="mx-auto mb-4 text-slate-100" />
                                <p className="text-slate-400 font-medium italic">All caught up! No tasks found.</p>
                            </div>
                        ) : (
                            dataList.map(post => (
                                <div key={post.id} className="p-8 hover:bg-slate-50 transition-all flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                                            post.post_type === 'news' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                                        )}>
                                            {post.post_type === 'news' ? <Newspaper size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div>
                                            <Link href={`/admin/blogs/blog?id=${post.id}`} className="font-black text-slate-900 text-lg hover:text-blue-600 transition-colors line-clamp-1">
                                                {post.title}
                                            </Link>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md font-black",
                                                    post.post_type === 'news' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                                )}>
                                                    {post.post_type || 'blog'}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span>{post.categories?.title || 'Uncategorized'}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md font-black",
                                                    post.status === 'published' ? 'bg-green-100 text-green-700' :
                                                        (post.status === 'pending' || post.status === 'draft') ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'
                                                )}>{post.status}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-slate-500 italic lowercase font-medium">by {post.profiles?.full_name || 'System'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isAdmin && (post.status === 'pending' || post.status === 'draft') && (
                                            <button
                                                onClick={() => handlePublish(post.id)}
                                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                            >
                                                Go Live
                                            </button>
                                        )}
                                        <Link
                                            href={`/admin/posts/${post.id}/edit`}
                                            className="p-3 bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-900 rounded-xl transition-all hover:shadow-md border border-transparent hover:border-slate-100"
                                        >
                                            <ExternalLink size={18} />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Info Sidebar */}
                <aside className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-black text-xl mb-3 tracking-tight">System Status</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                The platform is operating at peak performance. All assets are synced with S3 buckets and real-time updates are active.
                            </p>
                            <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Tier</span>
                                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-blue-600 rounded-lg">{profile?.role || 'User'}</span>
                                </div>
                                <div className="flex justify-between items-center focus-within:">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Media Server</span>
                                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/50">
                        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Send size={18} className="text-slate-400" /> Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Link href="/admin/posts/new" className="block w-full text-center py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                                Write New Article
                            </Link>
                            {isAdmin && (
                                <Link href="/admin/users" className="block w-full text-center py-4 border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                                    Manage Permissions
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

