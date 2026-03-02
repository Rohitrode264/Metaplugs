'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabaseClient'
import BlockEditor from '@/components/BlockEditor/Editor'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Save,
    Loader2,
    Eye,
    UploadCloud,
    ChevronRight,
    CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import PostRenderer from '@/components/PostRenderer'
import CoverImageSelector from '@/components/CoverImageSelector'
import { cn } from '@/lib/utils'

export default function EditPostPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const supabase = createClient()
    const router = useRouter()
    const { id } = params

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('draft')
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [postType, setPostType] = useState<'blog' | 'news'>('blog')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [blocks, setBlocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<{ role: string, can_post_direct: boolean } | null>(null)

    const isAdmin = profile?.role?.toLowerCase().trim() === 'admin' || profile?.role?.toLowerCase().trim() === 'administrator';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/admin/login')
                    return
                }

                // Fetch Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('role, can_post_direct')
                    .eq('id', user.id)
                    .single()
                setProfile(profileData)

                // Fetch Taxonomy
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('title')

                if (catError) {
                    console.error('Taxonomy fetch error:', catError)
                } else if (catData) {
                    setCategories(catData)
                }

                // Fetch Post
                const { data: post, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (post) {
                    // Check if content is stringified
                    let parsedBlocks = post.content; // Changed from 'blocks'
                    if (typeof parsedBlocks === 'string') {
                        try {
                            parsedBlocks = JSON.parse(parsedBlocks);
                        } catch (e) {
                            console.error('Failed to parse blocks JSON:', e);
                            parsedBlocks = [];
                        }
                    }

                    setTitle(post.title)
                    setSlug(post.slug)
                    setStatus(post.status)
                    setSelectedCategory(post.category_id)
                    setPostType(post.post_type || 'blog')
                    setCoverImageUrl(post.cover_image_url || '')
                    setBlocks(parsedBlocks || [])
                }
            } catch (err: any) {
                console.error('Fetch error:', err)
                alert(err.message)
                router.push('/admin/posts')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id, router])

    const generatedSlug =
        slug ||
        title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

    const handleSave = async (finalStatus: typeof status) => {
        if (!title.trim()) return alert('Title is required')
        if (!selectedCategory) return alert('Please select a category')

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const updatedStatus = isAdmin || profile?.can_post_direct
                ? finalStatus
                : (finalStatus === 'published' ? 'pending' : finalStatus);

            const payload = {
                title,
                slug: generatedSlug,
                status: updatedStatus,
                category_id: selectedCategory,
                post_type: postType,
                cover_image_url: coverImageUrl || null,
                content: blocks, // Renamed from 'blocks' to 'content'
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('posts')
                .update(payload)
                .eq('id', id)

            if (error) throw error
            router.push('/admin/posts')
        } catch (err: any) {
            console.error('Update error:', err)
            alert(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-slate-600 font-medium tracking-tight">Syncing post data...</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Premium Header */}
            <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6 text-slate-900">
                        <Link href="/admin/posts" className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-white hover:shadow-lg">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-slate-900 leading-tight truncate max-w-[400px]">Edit Entry: {title}</h1>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                Modify <ChevronRight size={10} /> {postType} <ChevronRight size={10} /> {status}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={saving}
                            className="px-6 py-3 rounded-[1.25rem] border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Save size={16} />}
                            Sync Draft
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => handleSave('published')}
                                disabled={saving}
                                className="px-8 py-3 rounded-[1.25rem] bg-blue-600 text-white text-sm font-black hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-blue-500/20"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                {status === 'published' ? 'Update Live' : 'Go Live Now'}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Area Layout */}
            <main className="h-[calc(100vh-81px)] overflow-hidden">
                <div className="flex h-full">
                    {/* Editor (Left) */}
                    <section className="flex-1 overflow-y-auto px-12 py-10 bg-white border-r border-slate-50 custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-10">
                            <CoverImageSelector url={coverImageUrl} onChange={setCoverImageUrl} />

                            <div className="space-y-4">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Story title..."
                                    className="w-full text-5xl font-black text-black placeholder:text-slate-200 focus:outline-none leading-[1.1] tracking-tight bg-transparent"
                                />
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">Live Permalink</span>
                                    <span className="text-xs font-mono text-slate-400">metaplugs.com/{postType}/{generatedSlug}</span>
                                </div>
                            </div>

                            {/* Options Panel */}
                            <div className="grid grid-cols-3 gap-6 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                                <div className="space-y-3 col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Story Mode</label>
                                    <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                                        {['blog', 'news'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setPostType(type as any)}
                                                className={cn(
                                                    "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                                    postType === type ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"
                                                )}
                                            >{type}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 col-span-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full p-3.5 bg-white border border-slate-100 rounded-2xl text-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-bold shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <BlockEditor blocks={blocks} onChange={setBlocks} />
                        </div>
                    </section>

                    {/* Live Visual Verification (Right) */}
                    <section className="w-[550px] overflow-y-auto bg-slate-50/50 p-12 border-l border-slate-100 hidden xl:block custom-scrollbar">
                        <div className="flex flex-col gap-8 mb-12">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Rendering Verification</h3>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                </div>
                            </div>

                            <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden min-h-[900px] flex flex-col">
                                {/* Browser Header */}
                                <div className="h-14 bg-slate-50/50 border-b border-slate-100 flex items-center px-8 gap-4">
                                    <div className="flex-1 bg-white h-7 rounded-lg border border-slate-100 flex items-center px-4 text-[10px] font-medium text-slate-300 truncate">
                                        metaplugs.com/{postType}/{generatedSlug}
                                    </div>
                                </div>

                                <div className="p-10 md:p-14 flex-1">
                                    <header className="mb-12 text-center">
                                        {coverImageUrl && (
                                            <div className="mb-10 rounded-[2.5rem] overflow-hidden aspect-[16/10] shadow-2xl shadow-blue-500/10 border-4 border-white">
                                                <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="flex justify-center mb-6">
                                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                                                {postType}
                                            </span>
                                        </div>

                                        <h2 className="text-4xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">{title || 'Story Title'}</h2>

                                        <div className="flex items-center justify-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-white">
                                                {profile?.role?.toUpperCase().charAt(0) || 'A'}
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-black text-slate-900 leading-none">{profile?.role || 'Author'}</span>
                                                <span className="text-[11px] font-bold text-slate-400 capitalize mt-1 block">
                                                    Last Updated: {new Date().toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </header>

                                    <div className="w-full h-[1px] bg-slate-100 mb-12" />

                                    <PostRenderer blocks={blocks} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
