import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import { createChatSession, getMySessions } from '../../api/chatApi';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { Send, User, Bot, Briefcase, ArrowLeft, MessageSquare, Plus, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [sessionId, setSessionId] = useState(() => location.state?.sessionId || null);
    const [loadingList, setLoadingList] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        const fetchSessions = async () => {
            try {
                const list = await getMySessions();
                setSessions(list);
            } catch (err) {
                console.error("Failed to fetch sessions", err);
            } finally {
                setLoadingList(false);
            }
        };
        fetchSessions();
    }, [user?.id]);

    useEffect(() => {
        if (location.state?.sessionId) {
            setSessionId(location.state.sessionId);
            getMySessions().then(setSessions);
        }
    }, [location.state?.sessionId]);

    const handleSelectSession = (id) => {
        setSessionId(id);
    };

    return (
        <div className="max-w-7xl mx-auto pt-16 pb-8 px-8 h-screen flex flex-col bg-white">
            <div className="mb-10 flex items-center justify-between border-b-4 border-black pb-8">
                <div>
                    <h1 className="text-4xl font-display font-black tracking-tighter text-black uppercase">Coach Terminal</h1>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.4em] mt-2">Personal AI Logic Stream</p>
                </div>
                <Link to="/jobs">
                    <button className="text-[10px] font-black text-black/40 hover:text-black flex items-center gap-2 transition-all uppercase tracking-[0.3em]">
                        <ArrowLeft size={16} /> Return to Signal
                    </button>
                </Link>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-10 min-h-0">
                {/* Sidebar */}
                <div className="col-span-1 lg:col-span-1">
                    <div className="bg-white rounded-[32px] border-4 border-black flex flex-col max-h-[600px] overflow-hidden sticky top-24 shadow-[12px_12px_0px_rgba(0,0,0,0.05)]">
                        <div className="p-6 border-b-2 border-black bg-gray-50">
                            <h2 className="font-display font-black text-[11px] text-black flex items-center gap-3 uppercase tracking-[0.3em]">
                                <MessageSquare size={16} />
                                Active Sessions
                            </h2>
                        </div>

                        <div className="overflow-y-auto p-4 space-y-3">
                            {loadingList ? (
                                <div className="p-4 text-center text-[10px] font-black text-black/20 uppercase tracking-widest italic animate-pulse">Syncing...</div>
                            ) : sessions.length === 0 ? (
                                <div className="p-10 text-center text-black/20 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                    No Streams Detected. <br />
                                    Initiate Match to Start.
                                </div>
                            ) : (
                                sessions.map(session => {
                                    const isActive = session.id === sessionId;
                                    return (
                                        <button
                                            key={session.id}
                                            onClick={() => handleSelectSession(session.id)}
                                            className={`w-full text-left p-5 rounded-2xl transition-all duration-500 border-2 ${isActive
                                                ? 'bg-black text-white border-black shadow-xl translate-y-[-2px]'
                                                : 'text-black border-transparent hover:border-black/10 hover:bg-black/5'
                                                }`}
                                        >
                                            <div className="text-[11px] font-black uppercase tracking-widest truncate">
                                                {session.job_title || "GENERAL_COACH"}
                                            </div>
                                            <div className={`text-[9px] mt-2 font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${isActive ? 'opacity-50' : 'opacity-30'}`}>
                                                <Clock size={12} />
                                                {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'INITIAL'}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="col-span-1 lg:col-span-3 h-[700px] lg:h-[800px]">
                    {sessionId ? (
                        <ChatWindow sessionId={sessionId} />
                    ) : (
                        <div className="bg-white rounded-[40px] border-4 border-dashed border-black/10 h-full grid place-items-center text-center p-16">
                            <div>
                                <div className="w-24 h-24 bg-black rounded-3xl grid place-items-center mx-auto mb-10 shadow-2xl">
                                    <Bot size={48} className="text-white" />
                                </div>
                                <h3 className="font-display font-black text-3xl text-black mb-4 uppercase tracking-tighter">Select Signal</h3>
                                <p className="text-[10px] font-black text-black/40 max-w-sm mx-auto uppercase tracking-[0.3em] leading-relaxed">
                                    Connect to an existing logic stream or navigate to a job node to initiate a new session.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Chat Window Sub-component ──
const ChatWindow = ({ sessionId }) => {
    const { messages, sendMessage, isConnected, isTyping, sessionStatus } = useChatWebSocket(sessionId);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !isConnected) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <div className="bg-white rounded-[40px] border-4 border-black h-full flex flex-col overflow-hidden shadow-[20px_20px_0px_rgba(0,0,0,0.05)]">
            {/* Header */}
            <div className="py-4 px-8 border-b-2 border-black flex justify-between items-center text-[9px] font-black text-black/40 uppercase tracking-[0.3em] bg-gray-50">
                <div>NODE: <span className="font-mono text-black">{sessionId.slice(0, 8)}...</span></div>
                <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'animate-pulse bg-black' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                    <span className={isConnected ? 'text-black' : 'text-red-500 animate-pulse'}>
                        {isConnected ? 'AI_ENGINE_ONLINE' : messages.length > 0 ? 'STREAM_RECONNECTING...' : 'CONNECTING_STREAM...'}
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-white">
                {messages.length === 0 && !isTyping && (
                    <div className="h-full grid place-items-center text-black/10">
                        <div className="text-center">
                            <Bot size={80} className="mx-auto mb-6 opacity-5" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initializing Core Sync...</p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    const isSystem = msg.role === 'system';
                    const isAdmin = msg.role === 'admin';

                    if (isSystem) {
                        return (
                            <div key={idx} className="flex justify-center my-8">
                                <span className="text-[9px] font-black text-black opacity-30 px-6 py-2 border-2 border-black/5 rounded-full uppercase tracking-widest">
                                    {msg.content}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={idx} className={`flex gap-6 ${isUser ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 border-2 ${isUser
                                ? 'bg-black border-black text-white'
                                : isAdmin
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-gray-100 border-transparent text-black opacity-40'
                                }`}>
                                {isUser ? <User size={18} /> : isAdmin ? <Shield size={18} /> : <Bot size={18} />}
                            </div>
                            <div className={`max-w-[85%] space-y-2 ${isUser ? 'text-right' : 'text-left'}`}>
                                <div className={`p-6 rounded-3xl text-[11px] font-medium leading-relaxed uppercase tracking-wider ${isUser
                                    ? 'bg-black text-white rounded-tr-sm'
                                    : isAdmin
                                        ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900 rounded-tl-sm shadow-[6px_6px_0px_#4f46e5]'
                                        : 'bg-white border-2 border-black text-black rounded-tl-sm shadow-[6px_6px_0px_#000]'
                                    }`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-2" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-2" {...props} />,
                                            li: ({ node, ...props }) => <li className="tracking-widest" {...props} />,
                                            h1: ({ node, ...props }) => <h1 className="text-xs font-black mb-3 mt-6 first:mt-0 underline" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-[10px] font-black mb-2 mt-4 first:mt-0 underline" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-black/10 pl-4 italic my-4 opacity-50" {...props} />,
                                            code: ({ node, inline, className, children, ...props }) => {
                                                return inline ? (
                                                    <code className="bg-black/5 px-2 py-0.5 rounded font-mono font-black" {...props}>{children}</code>
                                                ) : (
                                                    <code className="block bg-black text-white p-5 rounded-2xl text-[10px] font-mono whitespace-pre-wrap mb-4 border-2 border-black" {...props}>{children}</code>
                                                );
                                            },
                                            strong: ({ node, ...props }) => <strong className="font-black underline" {...props} />,
                                            a: ({ node, ...props }) => <a className="underline font-black hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" {...props} />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                <div className={`text-[8px] font-black text-black/20 uppercase tracking-widest px-2`}>
                                    {isUser ? 'You' : isAdmin ? 'Expert' : 'AI'} · {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Quick-action chips — visible only on the initial greeting */}
                {(() => {
                    const hasUserMsg = messages.some(m => m.role === 'user');
                    const firstAssistant = messages.find(m => m.role === 'assistant');
                    if (hasUserMsg || !firstAssistant) return null;

                    const isJobSpecific = firstAssistant.content?.includes('exploring the **');
                    const chips = isJobSpecific
                        ? [
                            'Give me interview tips for this role',
                            'What skills should I develop?',
                            'Help me tailor my resume',
                        ]
                        : [
                            'Help me prepare for interviews',
                            'Review my resume',
                            'Suggest skills to learn',
                        ];

                    return (
                        <div className="flex flex-wrap gap-3 pl-16 mt-2">
                            {chips.map((chip, i) => (
                                <motion.button
                                    key={chip}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    onClick={() => isConnected && sendMessage(chip)}
                                    disabled={!isConnected}
                                    className={`px-4 py-2.5 rounded-xl border-2 border-black text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                                        isConnected 
                                            ? 'hover:bg-black hover:text-white cursor-pointer' 
                                            : 'opacity-30 cursor-not-allowed grayscale'
                                    }`}
                                >
                                    {chip}
                                </motion.button>
                            ))}
                        </div>
                    );
                })()}

                {isTyping && (
                    <div className="flex gap-6">
                        <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0 bg-gray-100 border-2 border-transparent">
                            <Bot size={18} className="text-black opacity-40" />
                        </div>
                        <div className="p-6 rounded-3xl rounded-tl-sm bg-white border-2 border-black w-24 shadow-[4px_4px_0px_#000]">
                            <div className="flex gap-2 justify-center">
                                <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-8 border-t-4 border-black bg-gray-50">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isConnected ? "INJECT SIGNAL..." : "CONNECTION_OFFLINE..."}
                        disabled={!isConnected}
                        className="w-full bg-white border-4 border-black rounded-[24px] px-8 py-5 pr-20 text-black font-black text-xs placeholder:text-black/20 focus:outline-none focus:ring-12 focus:ring-black/5 transition-all uppercase tracking-widest"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || !input.trim()}
                        className="absolute right-4 p-4 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl"
                    >
                        <Send size={24} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
