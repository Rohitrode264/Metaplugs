'use client';

import Link from 'next/link';

interface Post {
    id: string;
    title: string;
}

interface NewsTickerProps {
    tickerPosts: Post[];
}

export default function NewsTicker({ tickerPosts }: NewsTickerProps) {
    if (tickerPosts.length === 0) return null;

    return (
        <aside className="relative z-20 flex bg-mp-red py-2 overflow-hidden items-center group" aria-label="Breaking News Ticker">
            <div className="px-6 py-2 bg-mp-black text-white text-[10px] font-black tracking-widest uppercase italic skew-x-[-15deg] ml-[-1rem] relative z-30 shadow-2xl">
                <span className="inline-block skew-x-[15deg] px-4 italic animate-pulse" aria-hidden="true">BREAKING</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
                <div className="flex whitespace-nowrap animate-ticker group-hover:pause">
                    {[...tickerPosts, ...tickerPosts].map((post, i) => (
                        <Link
                            key={`${post.id}-${i}`}
                            href={`/blog/${post.id}`}
                            className="inline-flex items-center gap-4 px-10 text-xs md:text-sm font-bold text-white uppercase tracking-wider hover:underline"
                        >
                            <span className="text-white/40 font-black" aria-hidden="true">/</span> {post.title}
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
}
