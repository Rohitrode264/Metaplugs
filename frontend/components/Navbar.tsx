'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { Menu, X, Zap } from 'lucide-react';

interface Category {
    id: string;
    title: string;
    slug: string;
}

export default function Navbar() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const supabase = createClient();
        supabase.from('categories').select('id, title, slug').order('title').then(({ data }) => {
            if (data) setCategories(data);
        });
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    const isActive = (href: string) => pathname === href;

    return (
        <nav className="sticky top-0 z-50 w-full bg-mp-black/95 backdrop-blur-md border-b border-mp-red/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20 gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-mp-red rounded-lg flex items-center justify-center text-white shadow-lg shadow-mp-red/20 group-hover:scale-110 transition-transform">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <span className="hidden sm:block text-xl md:text-2xl font-black text-white tracking-tighter">
                            Meta<span className="text-mp-red">plugs</span>
                        </span>
                    </Link>

                    {/* Desktop Nav - Simplified */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            href="/"
                            className={`px-6 py-2 text-xs font-black uppercase tracking-[0.2em] rounded-full transition-all whitespace-nowrap ${isActive('/') ? 'bg-mp-red text-white shadow-lg shadow-mp-red/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Home
                        </Link>

                        <Link
                            href="/news"
                            className={`px-6 py-2 text-xs font-black uppercase tracking-[0.2em] rounded-full transition-all whitespace-nowrap ${isActive('/news') || pathname.startsWith('/category') ? 'bg-mp-red text-white shadow-lg shadow-mp-red/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            News
                        </Link>
                    </div>

                    {/* Right side - Portal Access */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="hidden sm:inline-flex items-center px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] border border-mp-red/30 rounded-full text-white bg-mp-red/10 hover:bg-mp-red hover:border-mp-red transition-all shadow-lg shadow-mp-red/5"
                        >
                            PORTAL
                        </Link>
                        <button
                            className="p-2 text-gray-400 hover:text-white md:hidden"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* SECONDARY CATEGORY BAR (Visible on News & Categories) */}
            {(pathname.startsWith('/news') || pathname.startsWith('/category')) && (
                <div className="bg-mp-black/40 border-t border-mp-red/10 overflow-hidden animate-in slide-in-from-top-2 duration-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-1 py-3 overflow-x-auto no-scrollbar scroll-smooth">
                            <Link
                                href="/news"
                                className={`flex-shrink-0 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${isActive('/news') ? 'bg-mp-red text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                ALL SIGNALS
                            </Link>

                            <div className="w-[1px] h-4 bg-white/10 mx-2" />

                            {categories.map(cat => (
                                <Link
                                    key={cat.id}
                                    href={`/category/${cat.slug || cat.id}`}
                                    className={`flex-shrink-0 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${pathname === `/category/${cat.slug || cat.id}` ? 'bg-mp-red/20 text-mp-red' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                >
                                    {cat.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-mp-black-soft border-t border-mp-red/10 px-4 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 gap-2">
                        <Link href="/" className={`flex items-center justify-center h-12 rounded-xl text-xs font-black uppercase tracking-widest ${isActive('/') ? 'bg-mp-red text-white' : 'bg-white/5 text-gray-400'}`}>
                            Home
                        </Link>
                        <Link href="/news" className={`flex items-center justify-center h-12 rounded-xl text-xs font-black uppercase tracking-widest ${isActive('/news') ? 'bg-mp-red text-white' : 'bg-white/5 text-gray-400'}`}>
                            News
                        </Link>
                    </div>

                    <div className="py-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4 px-2">Intelligence Hubs</div>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map(cat => (
                                <Link
                                    key={cat.id}
                                    href={`/category/${cat.slug || cat.id}`}
                                    className={`flex items-center px-4 py-3 rounded-xl text-[10px] font-bold tracking-wider ${pathname === `/category/${cat.slug || cat.id}` ? 'bg-mp-red/10 text-mp-red border border-mp-red/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                >
                                    {cat.title}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <Link href="/admin" className="flex items-center justify-center h-12 bg-mp-red/10 border border-mp-red/20 rounded-xl text-mp-red text-xs font-black uppercase tracking-widest">
                            PORTAL ACCESS
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
