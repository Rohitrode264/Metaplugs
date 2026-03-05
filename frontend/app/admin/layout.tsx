'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';
import { LayoutDashboard, FileText, Users, Mail, LogOut, Menu, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/posts', label: 'Posts', icon: FileText },
    { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMounted, setIsMounted] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        checkUser();
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/admin/login');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        setProfile(profile);
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    // Filter links based on role visibility
    const userRole = profile?.role?.toString().trim().toLowerCase();
    const isAdmin = userRole === 'admin' || userRole === 'administrator';

    useEffect(() => {
        if (profile) {
            console.group('Admin Diagnostic');
            console.log('Current Profile:', profile);
            console.log('User Role (Raw):', profile.role);
            console.log('User Role (Processed):', userRole);
            console.log('Is Admin:', isAdmin);
            console.groupEnd();
        }
    }, [profile, userRole, isAdmin]);

    const visibleLinks = sidebarLinks.filter(link => {
        if (isAdmin) return true;
        // Contributors see Dashboard, Posts, and Users (Users link will be visible but disabled per req)
        return link.href === '/admin' || link.href === '/admin/posts' || link.href === '/admin/users';
    });

    // Handle redirection for restricted routes
    useEffect(() => {
        if (!loading && profile && !isAdmin) {
            const isRestricted = pathname.startsWith('/admin/users');

            if (isRestricted) {
                router.push('/admin/posts');
            }
        }
    }, [pathname, profile, loading, isAdmin]);

    if (pathname === '/admin/login') {
        return <div className="min-h-screen bg-slate-50">{children}</div>;
    }

    if (!isMounted || loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
            Loading...
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-40 md:ml-64 transition-all">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <h2 className="text-lg font-bold text-slate-900 md:hidden">Admin<span className="text-blue-600">Portal</span></h2>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 group"
                    >
                        <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </header>

            {/* Mobile Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "w-64 bg-white border-r border-slate-200 fixed h-full flex flex-col z-50 transition-transform duration-300 md:translate-x-0",
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Admin<br /><span className="text-blue-600">Portal</span></h2>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{profile?.role}</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {visibleLinks.map(link => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        // It's ONLY disabled if we HAVE a profile, they are NOT an admin, AND it's a restricted link
                        const isDisabled = profile && !isAdmin && (link.href === '/admin/users');


                        return (
                            <Link
                                key={link.href}
                                href={isDisabled ? '#' : link.href}
                                onClick={(e) => {
                                    if (isDisabled) {
                                        e.preventDefault();
                                        alert('Access Denied: Only administrators can manage users.');
                                    }
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                        : isDisabled
                                            ? "text-slate-300 cursor-not-allowed opacity-50 gray-grayscale"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon size={18} />
                                {link.label}
                                {isDisabled && (
                                    <Shield size={12} className="ml-auto text-slate-300" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="px-4 py-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-bold text-slate-900 truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-[10px] text-slate-400 truncate">Online</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 pt-28 md:pt-28">
                <style jsx global>{`
                    input, select, textarea, [contenteditable] {
                        color: #000000 !important;
                    }
                    [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: #cbd5e1;
                        pointer-events: none;
                        display: block; /* For empty blocks */
                    }
                    .select-text {
                        user-select: text !important;
                    }
                `}</style>
                {children}
            </main>
        </div>
    );
}
