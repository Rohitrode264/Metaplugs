'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Plus, Trash2, Folder, FolderPlus, Tag, ChevronRight, Loader2, AlertCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
    const supabase = createClient();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategorySlug, setNewCategorySlug] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    const [newSubcategorySlug, setNewSubcategorySlug] = useState('');

    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [isSavingSubcategory, setIsSavingSubcategory] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            if (profile) setUserRole(profile.role?.toLowerCase().trim());
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*, subcategories(*)')
            .order('title');

        if (error) {
            console.error('Fetch error:', error);
            alert('Error loading categories: ' + error.message);
        } else if (data) {
            setCategories(data);
        }
        setLoading(false);
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setIsSavingCategory(true);
        const slug = newCategorySlug || newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const { error } = await supabase
            .from('categories')
            .insert({ title: newCategoryName, slug });

        if (error) {
            alert('Error adding category: ' + error.message);
        } else {
            setNewCategoryName('');
            setNewCategorySlug('');
            fetchCategories();
        }
        setIsSavingCategory(false);
    };

    const handleAddSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategoryId || !newSubcategoryName.trim()) return;

        setIsSavingSubcategory(true);
        const slug = newSubcategorySlug || newSubcategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const { error } = await supabase
            .from('subcategories')
            .insert({
                title: newSubcategoryName,
                slug,
                category_id: selectedCategoryId
            });

        if (error) {
            alert('Error adding subcategory: ' + error.message);
        } else {
            setNewSubcategoryName('');
            setNewSubcategorySlug('');
            fetchCategories();
        }
        setIsSavingSubcategory(false);
    };

    const deleteCategory = async (id: string) => {
        if (!confirm('Are you sure? This will delete all subcategories within this category.')) return;

        const { data, error } = await supabase.from('categories').delete().eq('id', id).select();

        if (error) {
            alert('Error: ' + error.message);
        } else if (!data || data.length === 0) {
            alert('Permission Denied: Delete request sent but 0 rows were affected. Your RLS policies likely prevent you from deleting categories.');
        } else {
            fetchCategories();
        }
    };

    const deleteSubcategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subcategory? This may fail if it is assigned to existing blog posts.')) return;

        // Using .select() confirms if a row was actually deleted from the DB
        const { data, error } = await supabase.from('subcategories').delete().eq('id', id).select();

        console.log('Delete result:', { data, error });

        if (error) {
            console.error('Delete error:', error);
            if (error.code === '23503') {
                alert('Cannot delete this subcategory because it is still being used in some blog posts. Please reassign or delete those posts first.');
            } else {
                alert('Error: ' + error.message);
            }
        } else if (!data || data.length === 0) {
            // This catches the "204 Success but nothing happened" scenario
            alert('Permission Denied: Delete request succeeded but 0 rows were affected. This usually means Row Level Security (RLS) policies on your "subcategories" table are preventing this action for your account (current role: ' + (userRole || 'unknown') + ').');
        } else {
            fetchCategories();
        }
    };

    const isAdmin = userRole === 'admin' || userRole === 'administrator';

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Category & <span className="text-blue-600">Subcategory</span> Management</h1>
                    <p className="text-slate-500 mt-2">Organize your blog structure by managing taxonomy here.</p>
                </div>
                {userRole && !isAdmin && (
                    <div className="bg-amber-50 border border-amber-200 px-6 py-4 rounded-2xl flex items-center gap-4">
                        <Shield size={24} className="text-amber-600" />
                        <div>
                            <p className="text-xs font-black uppercase text-amber-800 tracking-widest leading-none">View-Only Mode</p>
                            <p className="text-sm text-amber-700 font-medium mt-1">Logged in as <span className="font-bold">{userRole}</span>. Management tools are restricted to Administrators.</p>
                        </div>
                    </div>
                )}
            </header>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* CATEGORIES LIST */}
                <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            <Folder size={18} className="text-blue-600" /> Existing Categories
                        </h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100">
                            {categories.length} Total
                        </span>
                    </div>

                    <div className="p-2">
                        {loading ? (
                            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                <p className="font-medium italic">Syncing taxonomy...</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <Folder size={48} className="mx-auto mb-4 opacity-10" />
                                <p>No categories found.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
                                        className={cn(
                                            "group p-4 rounded-2xl transition-all cursor-pointer border",
                                            selectedCategoryId === cat.id
                                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                                                : "bg-white border-transparent text-slate-900 hover:bg-slate-50 hover:border-slate-100"
                                        )}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                    selectedCategoryId === cat.id ? "bg-white/20" : "bg-slate-100"
                                                )}>
                                                    <Tag size={18} className={selectedCategoryId === cat.id ? "text-white" : "text-slate-500"} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg leading-none">{cat.title}</h3>
                                                    <p className={cn("text-xs mt-1 font-medium", selectedCategoryId === cat.id ? "text-blue-100" : "text-slate-400")}>
                                                        /{cat.slug} • {cat.subcategories?.length || 0} subcategories
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            selectedCategoryId === cat.id ? "hover:bg-white/20 text-white/70 hover:text-white" : "hover:bg-red-50 text-slate-300 hover:text-red-600"
                                                        )}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <ChevronRight size={18} className={cn("transition-transform", selectedCategoryId === cat.id ? "rotate-90" : "opacity-0")} />
                                            </div>
                                        </div>

                                        {/* Nested Subcategories (Only if selected) */}
                                        {selectedCategoryId === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                                {cat.subcategories.map((sub: any) => (
                                                    <div key={sub.id} className="flex justify-between items-center bg-white/10 p-2.5 rounded-xl border border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.8)]" />
                                                            <span className="text-sm font-bold text-white tracking-tight">{sub.title}</span>
                                                            <span className="text-[10px] text-blue-200 font-mono">/{sub.slug}</span>
                                                        </div>
                                                        {isAdmin && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); deleteSubcategory(sub.id); }}
                                                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* CREATION FORMS (Admin Only) */}
                {isAdmin ? (
                    <div className="space-y-8">
                        {/* ADD CATEGORY FORM */}
                        <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-100">
                                    <FolderPlus size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Category</h2>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Main Taxonomy Level</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddCategory} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Category Title</label>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="e.g. Life Insurance"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Custom Slug (Optional)</label>
                                    <input
                                        type="text"
                                        value={newCategorySlug}
                                        onChange={(e) => setNewCategorySlug(e.target.value)}
                                        placeholder="life-insurance"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-mono text-xs text-blue-600 tracking-tight placeholder:text-slate-300"
                                    />
                                    <p className="mt-2 text-[10px] text-slate-400 italic px-1">Leave blank to auto-generate from title.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSavingCategory || !newCategoryName.trim()}
                                    className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSavingCategory ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    Add Category
                                </button>
                            </form>
                        </section>

                        {/* ADD SUBCATEGORY FORM */}
                        <section className={cn(
                            "rounded-3xl border p-8 transition-all duration-500",
                            selectedCategoryId
                                ? "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                                : "bg-slate-50 border-slate-100 opacity-60 grayscale"
                        )}>
                            <div className="flex items-center gap-4 mb-8">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border transition-colors",
                                    selectedCategoryId ? "bg-blue-600 text-white shadow-blue-500/20 border-blue-500/20" : "bg-white text-slate-300 border-slate-100"
                                )}>
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Subcategory</h2>
                                    {selectedCategoryId ? (
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
                                            Adding to: {categories.find(c => c.id === selectedCategoryId)?.title}
                                        </p>
                                    ) : (
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Select a category first</p>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleAddSubcategory} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Subcategory Title</label>
                                    <input
                                        type="text"
                                        value={newSubcategoryName}
                                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                                        placeholder="e.g. Term Life"
                                        disabled={!selectedCategoryId}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 placeholder:text-slate-300 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Custom Slug (Optional)</label>
                                    <input
                                        type="text"
                                        value={newSubcategorySlug}
                                        onChange={(e) => setNewSubcategorySlug(e.target.value)}
                                        placeholder="term-life"
                                        disabled={!selectedCategoryId}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-mono text-xs text-blue-600 tracking-tight placeholder:text-slate-300 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSavingSubcategory || !newSubcategoryName.trim() || !selectedCategoryId}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                    {isSavingSubcategory ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    Add Subcategory
                                </button>
                            </form>
                        </section>
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                            <Folder size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Taxonomy Administration</h3>
                            <p className="text-slate-400 mt-2 max-w-xs mx-auto">Only administrators can modify categories or subcategories. Please contact your system admin to suggest changes.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
