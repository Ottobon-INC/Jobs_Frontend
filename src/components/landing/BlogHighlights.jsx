import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, Zap, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '../../hooks/useBlogPosts';

const MOCK_FALLBACKS = [
    {
        id: 'f1',
        title: "The Future of AI in Recruitment",
        summary: "How neural networks are reshaping the way founders find talent in 2026.",
        published_at: new Date().toISOString(),
        category: "Technology"
    },
    {
        id: 'f2',
        title: "Landing a Dream Job at swiggy",
        summary: "Insider tips on cracking the swiggy interview from our community members.",
        published_at: new Date().toISOString(),
        category: "Career"
    }
];

export function BlogHighlights() {
    const { posts, loading } = useBlogPosts(3);
    
    // Use real posts if available, otherwise fallbacks
    const displayPosts = posts?.length > 0 ? posts.slice(0, 2) : MOCK_FALLBACKS;

    return (
        <section className="py-24 px-6 md:px-12 lg:px-20 bg-white border-t-2 border-black">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Blogs Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="lg:w-1/3 bg-black text-white p-10 rounded-[40px] shadow-2xl flex flex-col justify-between relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
                            <Newspaper size={120} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                                <Zap className="text-yellow-400 w-6 h-6" />
                            </div>
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6 leading-none">
                                Market <br /> Intelligence
                            </h2>
                            <p className="text-white/60 font-medium uppercase tracking-widest text-xs leading-loose mb-10">
                                Decrypting the high-growth ecosystems of 2026. Real data, zero noise.
                            </p>
                        </div>

                        <Link to="/blogs" className="relative z-10">
                            <button className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors">
                                Explore Blogs <ArrowRight size={16} />
                            </button>
                        </Link>
                    </motion.div>

                    {/* Blog Posts Grid */}
                    <div className="lg:w-2/3">
                        <div className="mb-10 flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Latest Signals</h3>
                            <div className="h-1 flex-1 mx-8 bg-black/5" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {displayPosts.map((post, idx) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-8 rounded-[32px] border-2 border-black hover:shadow-[12px_12px_0px_#000] transition-all bg-white group flex flex-col h-full"
                                >
                                    <div className="flex items-center gap-3 mb-6 text-[9px] font-black uppercase tracking-[0.2em] text-black/40">
                                        <TrendingUp size={12} className="text-black" />
                                        <span>{post.category || post.domain || 'Analysis'}</span>
                                        <span className="opacity-20">•</span>
                                        <Calendar size={12} />
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <h4 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:italic transition-all flex-1">
                                        {post.title}
                                    </h4>
                                    
                                    <p className="text-sm font-medium text-black/60 mb-8 line-clamp-3 uppercase tracking-wide">
                                        {post.summary || post.abstract || (post.content ? post.content.substring(0, 150) + "..." : "Full signal decryption available for verified operators.")}
                                    </p>

                                    <Link to={`/blogs/${post.slug || post.id}`}>
                                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                            Read Full Signal <ArrowRight size={14} />
                                        </button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
