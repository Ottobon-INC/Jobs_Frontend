import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPost } from '../../api/blogApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from '../../components/ui/Loader';
import { ArrowLeft, Calendar, Share2, AlertCircle, Sparkles, ExternalLink, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const BlogPostPage = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                // slug here might actually be the ID since we reverted to using IDs
                const data = await getBlogPost(slug);
                setPost(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch post", err);
                setError("Unable to retrieve the requested insight.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) return <Loader fullScreen variant="logo" />;

    if (error || !post) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#F6F3ED]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-xl bg-white border border-zinc-100 p-12 rounded-[3rem] shadow-xl">
                <AlertCircle size={64} className="mx-auto mb-8 text-zinc-200" />
                <h1 className="text-4xl font-bold text-[#313851] tracking-tight mb-4">Insight Not Found</h1>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-12">{error || "The requested analysis is unavailable."}</p>
                <Link to="/blogs" className="inline-block bg-[#313851] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#313851]/20">
                    Return to Feed
                </Link>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F6F3ED] pb-24">
            {/* Minimal Header */}
            <div className="bg-[#313851] py-4 px-6 md:px-12 flex items-center justify-between border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-[#313851]/90">
                <Link 
                    to="/blogs" 
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeft size={14} strokeWidth={3} /> Back to Insights
                </Link>
                <div className="flex items-center gap-2 text-white/90">
                    <Sparkles size={14} className="text-[#C2CBD3]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Verified Analysis</span>
                </div>
            </div>

            <article className="max-w-4xl mx-auto mt-20 px-6">
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-3 text-[10px] font-black text-[#313851]/50 mb-10 bg-white px-8 py-3 rounded-full border border-zinc-100 shadow-sm uppercase tracking-widest">
                        <Calendar size={14} />
                        <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        <span className="mx-2 opacity-20">|</span>
                        <Globe size={14} />
                        <span>{post.domain || 'Global Intel'}</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-bold mb-12 tracking-tight text-[#313851] leading-[1.1]">
                        {post.title}
                    </h1>

                    {post.image_url && (
                        <div className="relative rounded-[3rem] overflow-hidden border border-zinc-100 shadow-2xl">
                            <img src={post.image_url} alt={post.title} className="w-full h-[500px] object-cover" />
                        </div>
                    )}
                </motion.header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="prose prose-zinc prose-lg md:prose-xl max-w-none 
                    prose-headings:text-[#313851] prose-headings:font-bold prose-headings:tracking-tight
                    prose-p:text-zinc-600 prose-p:font-medium prose-p:leading-[1.8]
                    prose-strong:text-[#313851]
                    prose-blockquote:border-l-4 prose-blockquote:border-[#313851] prose-blockquote:bg-white prose-blockquote:rounded-3xl prose-blockquote:py-10 prose-blockquote:px-12 prose-blockquote:not-italic prose-blockquote:text-[#313851] prose-blockquote:font-medium
                "
                >
                    {post.summary && (
                        <div className="text-xl md:text-2xl font-bold text-[#313851] leading-relaxed mb-12 border-l-4 border-[#C2CBD3] pl-10 py-2">
                            {post.summary}
                        </div>
                    )}
                    
                    <div className="mt-8">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.description || post.content || "*Analysis context is being decrypted...*"}
                        </ReactMarkdown>
                    </div>

                    {post.url && (
                        <div className="mt-20 p-10 bg-[#313851] text-white rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-[#313851]/20">
                            <div className="text-center md:text-left">
                                <h3 className="font-bold text-white text-2xl m-0 tracking-tight">Source Context</h3>
                                <p className="text-sm font-medium text-white/60 m-0 mt-2">Proceed to the root source to decrypt the full context of this signal.</p>
                            </div>
                            <a href={post.url} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-3 bg-white text-[#313851] px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl no-underline">
                                View Original <ExternalLink size={16} />
                            </a>
                        </div>
                    )}
                </motion.div>

                {/* Share Section */}
                <div className="mt-32 p-12 bg-white border border-zinc-100 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
                    <div>
                        <p className="text-2xl font-bold text-[#313851] tracking-tight flex items-center gap-3">
                            <Share2 size={24} /> Transmit Insight
                        </p>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-3">Share this analysis with your network.</p>
                    </div>
                    <button className="flex items-center gap-3 px-10 py-5 bg-[#313851] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95">
                        Copy Signal Link
                    </button>
                </div>
            </article>
        </div>
    );
};

export default BlogPostPage;
