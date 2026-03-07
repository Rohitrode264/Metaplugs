import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';

interface BlogCardProps {
    post: {
        id: string;
        title: string;
        excerpt?: string;
        cover_image_url?: string;
        created_at: string;
        post_type?: string;
        categories?: { title: string; slug?: string } | null;
        profiles?: { full_name: string } | null;
        read_time?: number;
    };
    variant?: 'default' | 'featured' | 'compact';
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogCard({ post, variant = 'default' }: BlogCardProps) {
    const isNews = post.post_type === 'news';
    const categoryTitle = post.categories?.title || 'Intelligence';

    if (variant === 'featured') {
        return (
            <Link href={`/blog/${post.id}`} className="relative h-[400px] md:h-[500px] w-full block group overflow-hidden rounded-3xl bg-mp-black">
                {post.cover_image_url ? (
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 opacity-80"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-mp-black-soft to-mp-red/20 opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-mp-black via-mp-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col items-start gap-4">
                    <div className="flex gap-2">
                        {isNews && <span className="px-3 py-1 bg-mp-red text-white text-[10px] font-black uppercase tracking-widest rounded-full">News</span>}
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white/90 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                            {categoryTitle}
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white leading-tight font-playfair group-hover:text-mp-red transition-colors duration-300">
                        {post.title}
                    </h2>
                    {post.excerpt && <p className="text-gray-300 text-sm md:text-base line-clamp-2 max-w-2xl">{post.excerpt}</p>}
                    <div className="flex items-center gap-4 text-gray-400 text-xs font-medium pt-2">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {timeAgo(post.created_at)}</span>
                        {post.profiles?.full_name && <span className="px-2 py-0.5 border border-white/10 rounded-md">By {post.profiles.full_name}</span>}
                    </div>
                </div>
            </Link>
        );
    }

    if (variant === 'compact') {
        return (
            <Link href={`/blog/${post.id}`} className="flex items-center gap-4 group py-3 border-b border-gray-100 last:border-0">
                <div className="w-20 h-16 md:w-24 md:h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                    {post.cover_image_url ? (
                        <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                        <div className="w-full h-full bg-mp-red/5 flex items-center justify-center text-mp-red/30">
                            <Tag size={20} />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-mp-red/80 mb-1 block">
                        {categoryTitle}
                    </span>
                    <h4 className="text-sm font-black text-mp-black leading-snug line-clamp-2 group-hover:text-mp-red transition-colors">
                        {post.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium mt-1 inline-block">
                        {timeAgo(post.created_at)}
                    </span>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/blog/${post.id}`} className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-mp-red/20 shadow-sm hover:shadow-xl hover:shadow-mp-red/5 transition-all duration-300 group">
            <div className="aspect-[16/10] w-full overflow-hidden relative">
                {post.cover_image_url ? (
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-200">
                        <Tag size={40} />
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    {isNews && <span className="px-3 py-1 bg-mp-red text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">News</span>}
                </div>
            </div>

            <div className="flex flex-col p-5 flex-1">
                <div className="flex items-center gap-1.5 text-mp-red text-[10px] font-black uppercase tracking-widest mb-3">
                    <Tag size={10} className="fill-current" /> {categoryTitle}
                </div>
                <h3 className="text-lg font-black text-mp-black leading-tight mb-3 group-hover:text-mp-red transition-colors duration-300 line-clamp-2">
                    {post.title}
                </h3>
                {post.excerpt && <p className="text-gray-500 text-sm line-clamp-2 mb-5 leading-relaxed">{post.excerpt}</p>}

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-gray-400 text-[10px] font-semibold">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {timeAgo(post.created_at).toUpperCase()}</span>
                        {post.read_time && <span className="flex items-center gap-1"><Clock size={12} /> {post.read_time} MIN</span>}
                    </div>
                    <span className="text-mp-red font-black text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                        READ <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </Link>
    );
}
