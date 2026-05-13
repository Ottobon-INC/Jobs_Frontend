import { useState, useEffect } from 'react';
import { listBlogPosts } from '../../api/blogApi';
import Loader from '../../components/ui/Loader';
import { ArrowRight, Calendar, Search, Filter, TrendingUp, Cpu, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BlogLandingPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await listBlogPosts(100);
                setPosts(data || []);
            } catch (err) {
                console.error("Failed to fetch blogs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post => 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader fullScreen variant="logo" />;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#F6F3ED]">
            {/* Header Section */}
            <header className="relative pt-24 pb-20 px-6 md:px-12 bg-[#313851] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[120px] -ml-48 -mt-48" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C2CBD3] rounded-full blur-[120px] -mr-48 -mb-48" />
                </div>
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-[#F6F3ED]/60 text-xs font-black uppercase tracking-[0.3em] mb-4">
                            Knowledge Base
                        </p>
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8">
                            Industry <span className="text-[#C2CBD3]">Insights</span>
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl leading-relaxed font-medium">
                            Expert analysis, hiring trends, and career strategies to help you navigate the modern job market with precision.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-12 max-w-2xl relative"
                    >
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search size={20} className="text-white/40" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search insights..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C2CBD3]/50 backdrop-blur-md transition-all font-bold"
                        />
                    </motion.div>
                </div>
            </header>

            {/* Content Section */}
            <main className="max-w-7xl mx-auto py-20 px-6 md:px-12">
                {filteredPosts.length > 0 ? (
                    <motion.div 
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                    >
                        {filteredPosts.map((post) => (
                            <motion.article 
                                key={post.id} 
                                variants={item}
                                className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-zinc-900/5 transition-all duration-500 h-full"
                            >
                                {post.image_url && (
                                    <div className="relative h-64 overflow-hidden">
                                        <img 
                                            src={post.image_url} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        <div className="absolute top-6 left-6">
                                            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[#313851] shadow-sm">
                                                {post.domain || "Analysis"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="p-10 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">
                                        <Calendar size={14} />
                                        <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold text-[#313851] mb-6 leading-tight group-hover:text-black transition-colors">
                                        {post.title}
                                    </h2>
                                    
                                    <p className="text-zinc-500 font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                                        {post.summary || post.description || "Deciphering the latest signals from the industry core."}
                                    </p>
                                    
                                    <Link 
                                        to={`/blogs/${post.id}`} 
                                        className="inline-flex items-center gap-3 text-[#313851] font-black text-xs uppercase tracking-[0.2em] group/link hover:gap-5 transition-all"
                                    >
                                        Read Analysis <ArrowRight size={16} className="transition-transform" />
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-zinc-200">
                        <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <BookOpen size={40} className="text-zinc-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#313851] mb-2">No insights found</h3>
                        <p className="text-zinc-400 font-medium">Try refining your search parameters.</p>
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-8 text-[#313851] font-black text-xs uppercase tracking-widest underline underline-offset-8"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BlogLandingPage;
