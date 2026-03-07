import Link from 'next/link';
import { Mail, Twitter, Linkedin, Zap, Globe, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#F6F7F8] pt-24 pb-12 border-t border-gray-200 relative overflow-hidden">
            {/* Decorative bg element */}
            <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-mp-red/[0.03] blur-[150px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="col-span-1 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-8 group">
                            <div className="w-10 h-10 bg-mp-red rounded-lg flex items-center justify-center text-white shadow-lg shadow-mp-red/20 transition-transform">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <span className="text-2xl font-black text-mp-black tracking-tighter">
                                Meta<span className="text-mp-red">plugs</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            Decoding the signals that shape our collective future. Intelligence on World AI, Defence Tech, Startups, and Global Finance.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:text-mp-red hover:bg-mp-red/5 hover:border-mp-red/20 transition-all">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-mp-black text-xs font-black uppercase tracking-[0.2em] mb-8 border-l-2 border-mp-red pl-4">Network</h4>
                        <ul className="space-y-4">
                            {['Global AI Feed', 'Defence Signals', 'Startup Pulse', 'Money Markets', 'Unicorn tracker'].map(link => (
                                <li key={link}>
                                    <Link href="#" className="text-gray-500 hover:text-mp-red text-sm font-semibold transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-mp-red opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-mp-black text-xs font-black uppercase tracking-[0.2em] mb-8 border-l-2 border-mp-red pl-4">Navigation</h4>
                        <ul className="space-y-4">
                            {['About Intelligence', 'Contact Bureau', 'Privacy Policy', 'Terms of Intel', 'Newsletter'].map(link => (
                                <li key={link}>
                                    <Link href="#" className="text-gray-500 hover:text-mp-red text-sm font-semibold transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-mp-red opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-mp-black text-xs font-black uppercase tracking-[0.2em] mb-8 border-l-2 border-mp-red pl-4">Intel Brief</h4>
                        <p className="text-gray-500 text-xs leading-relaxed mb-6 italic">
                            Sign up for the Metaplugs Intel Brief. Low noise, high fidelity signal delivered daily.
                        </p>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Bureau Email"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-mp-black text-sm focus:outline-none focus:border-mp-red/50 transition-all font-bold placeholder:text-gray-300"
                            />
                            <button className="absolute right-2 top-2 bottom-2 px-4 bg-mp-red text-white rounded-lg hover:bg-mp-red-dark transition-all">
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Globe size={12} className="text-mp-red" /> © 2026 METAPLUGS INTEL BUREAU. ALL SIGNALS BROADCASTED.
                    </p>
                    <div className="flex gap-8">
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">EN-US</span>
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">STATUS: OPERATIONAL</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Helper component for ArrowRight in footer
function ArrowRight({ size }: { size: number }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}
