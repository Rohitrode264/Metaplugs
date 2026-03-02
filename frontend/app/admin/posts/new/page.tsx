'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import BlockEditor from '@/components/BlockEditor/Editor'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  UploadCloud,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import PostRenderer from '@/components/PostRenderer'
import CoverImageSelector from '@/components/CoverImageSelector'
import { cn } from '@/lib/utils'

export default function CreatePostPage() {
  const supabase = createClient()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('pending')
  const [postType, setPostType] = useState<'blog' | 'news'>('blog')
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [blocks, setBlocks] = useState<any[]>([
    {
      id: 'b1',
      type: 'paragraph',
      data: { text: [{ text: '' }], html: '' },
      style: { fontSize: '17px', lineHeight: '1.8', color: '#000000' }
    }
  ])
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<{ role: string, can_post_direct: boolean } | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState('')

  const userRoleStr = profile?.role?.toString().trim().toLowerCase();
  const isAdmin = userRoleStr === 'admin' || userRoleStr === 'administrator';

  useEffect(() => {
    if (profile) {
      console.log('Post Create Diagnostic:', { profileRole: profile.role, userRoleStr, isAdmin });
    }
  }, [profile, userRoleStr, isAdmin]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role, can_post_direct')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data)
      }

      // Fetch categories
      try {
        console.log('Fetching categories...')
        const { data: cats, error: catsError } = await supabase
          .from('categories')
          .select('*')
          .order('title')

        if (catsError) {
          console.error('Error fetching categories:', catsError)
        } else if (cats) {
          setCategories(cats)
        }
      } catch (err) {
        console.error('Unexpected fetch error:', err)
      }
    }
    fetchData()
  }, [])


  const generatedSlug =
    slug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const handleSave = async (finalStatus: typeof status) => {
    if (!title.trim()) return alert('Title is required')
    if (!selectedCategory) return alert('Please select a category')

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const userRoleLower = profile?.role?.toString()?.toLowerCase()?.trim();
      const isAdminDirect = userRoleLower === 'admin' || userRoleLower === 'administrator';

      // Determination for final status
      const updatedStatus = (isAdminDirect || profile?.can_post_direct)
        ? finalStatus
        : 'draft'; // Contributors can ONLY save as draft

      const payload = {
        title,
        slug: generatedSlug,
        status: updatedStatus,
        category_id: selectedCategory,
        cover_image_url: coverImageUrl || null,
        post_type: postType,
        content: blocks, // Renamed from 'blocks' to 'content' to match schema
        author_id: user.id
      };

      console.log('Attempting save with payload:', payload);

      const { data: postData, error } = await supabase
        .from('posts')
        .insert(payload)
        .select()

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw error;
      }
      router.push('/admin/posts')
    } catch (err: any) {
      console.error('Save error:', err)
      alert('Error saving post: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Premium Header */}
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin/posts" className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-white hover:shadow-lg">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 leading-tight">Create New Entry</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Library <ChevronRight size={10} /> {postType} <ChevronRight size={10} /> Editing
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="px-6 py-3 rounded-[1.25rem] border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Save size={16} />}
              Save Draft
            </button>

            {isAdmin && (
              <button
                onClick={() => handleSave('published')}
                disabled={loading}
                className="px-8 py-3 rounded-[1.25rem] bg-blue-600 text-white text-sm font-black hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-blue-500/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                Publish Story
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="h-[calc(100vh-81px)] overflow-hidden">
        <div className="flex h-full">
          {/* Editor Area (Left) */}
          <section className="flex-1 overflow-y-auto px-12 py-10 bg-white border-r border-slate-50 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-10">
              <CoverImageSelector url={coverImageUrl} onChange={setCoverImageUrl} />

              <div className="space-y-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter an catchy title..."
                  className="w-full text-5xl font-black text-black placeholder:text-slate-200 focus:outline-none leading-[1.1] tracking-tight bg-transparent"
                />
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    Live Slug
                  </span>
                  <span className="text-xs font-mono text-slate-400">metaplugs.com/{postType}/{generatedSlug || '...'}</span>
                </div>
              </div>

              {/* Classification Grid */}
              <div className="grid grid-cols-3 gap-6 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
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
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Main Category</label>
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

              <div className="w-full h-[1px] bg-slate-100" />

              <BlockEditor blocks={blocks} onChange={setBlocks} />
            </div>
          </section>

          {/* Real-time Preview (Right) */}
          <section className="w-[550px] overflow-y-auto bg-slate-50/50 p-12 border-l border-slate-100 hidden xl:block custom-scrollbar">
            <div className="flex flex-col gap-8 mb-12">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Live Visual Verification</h3>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                </div>
              </div>

              <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden min-h-[900px] flex flex-col">
                {/* Browser-like Header */}
                <div className="h-14 bg-slate-50/50 border-b border-slate-100 flex items-center px-8 gap-4">
                  <div className="flex-1 bg-white h-7 rounded-lg border border-slate-100 flex items-center px-4 text-[10px] font-medium text-slate-300 truncate">
                    metaplugs.com/{postType}/{generatedSlug || '...'}
                  </div>
                </div>

                <div className="p-10 md:p-14 flex-1">
                  <header className="mb-12 text-center">
                    {coverImageUrl && (
                      <div className="mb-10 rounded-[2.5rem] overflow-hidden aspect-[16/10] shadow-2xl shadow-blue-500/10 border-4 border-white animate-in fade-in zoom-in-95 duration-1000">
                        <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex justify-center mb-6">
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                        {postType}
                      </span>
                    </div>

                    <h2 className="text-4xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">{title || 'Your Catchy Story Title'}</h2>

                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-white">
                        {profile?.role?.toUpperCase().charAt(0) || 'A'}
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-black text-slate-900 leading-none">{profile?.role || 'Author'}</span>
                        <span className="text-[11px] font-bold text-slate-400 capitalize mt-1 block">
                          {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
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
