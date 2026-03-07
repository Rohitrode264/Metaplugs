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

                    {/* Desktop Nav - Direct Category Links */}
                    <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
                        <Link
                            href="/"
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all whitespace-nowrap ${isActive('/') ? 'bg-mp-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Home
                        </Link>

                        {categories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug || cat.id}`}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all whitespace-nowrap ${pathname === `/category/${cat.slug || cat.id}` ? 'bg-mp-red/20 text-mp-red' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {cat.title}
                            </Link>
                        ))}

                        <Link
                            href="/news"
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all whitespace-nowrap ${isActive('/news') ? 'bg-mp-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            News
                        </Link>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 ml-auto">
                        <Link
                            href="/admin"
                            className="hidden sm:block px-5 py-2 text-xs font-black uppercase tracking-widest border border-white/20 rounded-full text-gray-300 hover:text-white hover:border-white/40 transition-all"
                        >
                            Portal
                        </Link>
                        <button
                            className="p-2 text-gray-400 hover:text-white lg:hidden"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="lg:hidden bg-mp-black-soft border-t border-white/5 px-4 py-6 space-y-1 animate-in fade-in duration-300 max-h-[80vh] overflow-y-auto">
                    <Link href="/" className={`block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest ${isActive('/') ? 'bg-mp-red text-white' : 'text-gray-400'}`}>Home</Link>

                    <div className="py-2 space-y-1">
                        {categories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug || cat.id}`}
                                className={`block px-4 py-2 text-sm font-bold tracking-wide ${pathname === `/category/${cat.slug || cat.id}` ? 'text-mp-red' : 'text-gray-500 hover:text-white'}`}
                            >
                                {cat.title}
                            </Link>
                        ))}
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5">
                        <Link href="/news" className={`block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest ${isActive('/news') ? 'bg-mp-red text-white' : 'text-gray-400'}`}>News</Link>
                        <Link href="/admin" className="block px-4 py-3 text-gray-400 text-sm font-bold uppercase tracking-widest">Portal</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
