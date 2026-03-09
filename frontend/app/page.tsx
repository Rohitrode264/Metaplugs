import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import NewsTicker from '@/components/NewsTicker';
import NewsletterForm from '@/components/NewsletterForm';
import { createClient } from '@/lib/supabaseClient';
import { ArrowRight, Zap, Shield, DollarSign, Rocket, Crown } from 'lucide-react';

const CATEGORIES_CONFIG = [
  { label: 'World AI Tech', icon: Zap, color: '#dc2626', description: 'Artificial Intelligence shaping the world' },
  { label: 'World Defence Tech', icon: Shield, color: '#991b1b', description: 'Military & defence innovations' },
  { label: 'World Money', icon: DollarSign, color: '#b91c1c', description: 'Finance, markets & economics' },
  { label: 'World Startups', icon: Rocket, color: '#dc2626', description: 'Disruptive ventures & founders' },
  { label: 'World Unicorn', icon: Crown, color: '#7f1d1d', description: 'Billion-dollar companies & beyond' },
];

interface Post {
  id: string;
  title: string;
  excerpt?: string;
  cover_image_url?: string;
  created_at: string;
  post_type?: string;
  categories?: { title: string; slug?: string } | null;
  profiles?: { full_name: string } | null;
}

interface CategorySection {
  category: typeof CATEGORIES_CONFIG[0];
  posts: Post[];
  slug: string;
}

export default async function HomePage() {
  const supabase = createClient();

  // Fetch all parallel to improve speed
  const [
    { data: latestPosts },
    { data: newsData },
    { data: cats }
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('*, categories(title, slug), profiles(full_name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('posts')
      .select('*, categories(title, slug), profiles(full_name)')
      .eq('status', 'published')
      .eq('post_type', 'news')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('categories')
      .select('id, title, slug')
      .order('title')
  ]);

  const posts: Post[] = latestPosts || [];
  const heroPost = posts.length > 0 ? posts[0] : null;
  const featuredPosts = posts.slice(1, 4);
  const tickerPosts = posts.slice(0, 10);
  const latestNews = newsData || [];

  const categorySections: CategorySection[] = [];
  if (cats) {
    for (const cat of cats) {
      const config = CATEGORIES_CONFIG.find(c =>
        c.label.toLowerCase().includes(cat.title.toLowerCase().split(' ').pop() || '') ||
        cat.title.toLowerCase().includes(c.label.toLowerCase().split(' ').pop() || '')
      ) || CATEGORIES_CONFIG[0];

      const { data: catPosts } = await supabase
        .from('posts')
        .select('*, categories(title, slug), profiles(full_name)')
        .eq('category_id', cat.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(4);

      if (catPosts && catPosts.length > 0) {
        categorySections.push({ category: { ...config, label: cat.title }, posts: catPosts, slug: cat.slug || cat.id });
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F8]">
      <Navbar />

      <main>
        {/* ── HERO SECTION ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white py-16 md:py-28 min-h-[75vh] flex flex-col justify-center border-b border-red-100" aria-labelledby="hero-heading">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#fef2f2_0%,transparent_70%)]" aria-hidden="true" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-mp-red/5 border border-mp-red/10 rounded-full text-mp-red text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <span className="w-1.5 h-1.5 bg-mp-red rounded-full shadow-[0_0_8px_#dc2626]" aria-hidden="true" />
              Live Global Intelligence
            </div>

            <h1 id="hero-heading" className="text-5xl md:text-8xl font-black text-mp-black leading-[0.95] tracking-tighter mb-8 font-playfair">
              DECODING THE <br />
              <span className="text-mp-red underline decoration-mp-red/10 underline-offset-8">WORLD'S SIGNALS.</span>
            </h1>

            <p className="max-w-2xl text-gray-500 text-lg md:text-xl font-medium leading-relaxed mb-12">
              From battlefield AI and defence tech to startup unicorns and global finance.
              Metaplugs provides high-fidelity intelligence to navigate the next era.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link href="/news" className="group flex items-center gap-2 px-8 py-4 bg-mp-red hover:bg-mp-red-dark text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-mp-red/20 hover:-translate-y-1" aria-label="View latest news alerts">
                Latest Alerts <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <Link href="/categories" className="px-8 py-4 bg-gray-100 border border-gray-200 hover:border-mp-red/30 text-mp-black font-bold text-sm uppercase tracking-widest rounded-xl transition-all" aria-label="Explore intelligence topics">
                Explore Topics
              </Link>
            </div>
          </div>
        </section>

        {/* ── BREAKING NEWS TICKER ───────────────────────────────── */}
        <NewsTicker tickerPosts={tickerPosts} />

        {/* ── EDITOR'S PICKS ──────────────────────────────────────── */}
        <section className="py-24 bg-white border-b border-red-50" aria-labelledby="featured-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="flex items-center gap-3 text-mp-red text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  <span className="w-10 h-[2px] bg-mp-red" aria-hidden="true" /> EDITOR'S CHOICES
                </div>
                <h2 id="featured-heading" className="text-4xl md:text-5xl font-black text-mp-black font-playfair tracking-tighter">
                  Premium <span>Insights.</span>
                </h2>
              </div>
              <Link href="/categories" className="hidden sm:flex items-center gap-2 text-mp-red font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                EXPLORE ALL <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                {heroPost && <BlogCard post={heroPost} variant="featured" />}
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6">
                {featuredPosts.map(p => <BlogCard key={p.id} post={p} variant="compact" />)}
                <NewsletterForm variant="side" />
              </div>
            </div>
          </div>
        </section>

        {/* ── LATEST GLOBAL NEWS ─────────────────────────────────── */}
        <section className="py-24 bg-white overflow-hidden relative border-t border-red-50" aria-labelledby="latest-heading">
          <div className="absolute right-0 top-0 w-1/3 h-full bg-mp-red/[0.02] blur-[100px] pointer-events-none" aria-hidden="true" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-3 text-mp-red text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  <span className="w-10 h-[2px] bg-mp-red" aria-hidden="true" /> SIGNAL FEED
                </div>
                <h2 id="latest-heading" className="text-4xl md:text-5xl font-black text-mp-black font-playfair tracking-tighter">
                  Latest <span>Signals.</span>
                </h2>
              </div>
              <Link href="/news" className="flex items-center gap-2 text-mp-red font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
                LIVE FEED <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestNews.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="h-full"
                >
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER NEWSLETTER CTAs ────────────────────────── */}
        <section className="py-24 bg-[#FFF8F8] relative overflow-hidden border-t border-red-50" aria-labelledby="cta-heading">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" aria-hidden="true" />
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-3 text-mp-red text-[10px] font-black uppercase tracking-[0.3em] mb-6 mx-auto">
              <span className="w-5 h-[2px] bg-mp-red" aria-hidden="true" /> NEWSLETTER <span className="w-5 h-[2px] bg-mp-red" aria-hidden="true" />
            </div>
            <h2 id="cta-heading" className="text-4xl md:text-6xl font-black text-mp-black font-playfair mb-8 tracking-tighter leading-none">
              DON'T MISS THE <br />NEXT SIGNAL.
            </h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto">
              Get 3 surgical-grade intelligence briefs every week directly in your inbox.
            </p>
            <NewsletterForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
