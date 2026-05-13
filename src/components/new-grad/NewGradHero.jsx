import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, BookOpen, Radio, CheckCircle, ArrowRight, X, Info, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CompanyLogo } from './CompanyLogo';

export const NewGradHero = ({ onSelectCompany }) => {
    const [showInfo, setShowInfo] = useState(false);
    const navigate = useNavigate();

    const scrollToPlaybooks = useCallback(() => {
        const element = document.getElementById('playbooks-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    // 4 journey steps for the orbital flow
    const journeySteps = [
        { label: "Discover Company", icon: Search, angle: 0 },
        { label: "Read Playbook", icon: BookOpen, angle: 90 },
        { label: "Take Mocks", icon: Radio, angle: 180 },
        { label: "Ace Exam", icon: CheckCircle, angle: 270 }
    ];

    // Playbook cards for floating animation
    const floatingCards = [
        { 
            title: "Google", 
            slug: "google",
            tag: "95% Match", 
            accent: "blue",
            x: "-5%", y: "0%", delay: 0 
        },
        { 
            title: "TCS", 
            slug: "tcs",
            tag: "Updated 2024", 
            accent: "amber",
            x: "75%", y: "0%", delay: 1 
        },
        { 
            title: "Amazon", 
            slug: "amazon",
            tag: "High Success", 
            accent: "emerald",
            x: "75%", y: "75%", delay: 2 
        },
        { 
            title: "Microsoft", 
            slug: "microsoft",
            tag: "Popular", 
            accent: "blue",
            x: "-5%", y: "75%", delay: 1.5 
        }
    ];

    // Company logos for background grid
    const backgroundLogos = [
        "Google", "TCS", "Infosys", "Microsoft", "Amazon", "Meta", "Netflix", "Adobe", 
        "Apple", "Nvidia", "Flipkart", "Razorpay", "Samsung", "Oracle", "IBM", "Intel"
    ];

    return (
        <section className="relative min-h-[850px] lg:min-h-[900px] flex items-center bg-gradient-to-b from-[#1a1f33] to-[#313851] overflow-hidden py-20 px-6">
            {/* 1. Deep Background Ecosystem (Animated Logo Rows) */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none select-none flex flex-col justify-around py-20 overflow-hidden">
                {[0, 1, 2, 3, 4].map((rowIdx) => (
                    <motion.div 
                        key={rowIdx}
                        initial={{ x: rowIdx % 2 === 0 ? "-30%" : "0%" }}
                        animate={{ x: rowIdx % 2 === 0 ? "0%" : "-30%" }}
                        transition={{ 
                            duration: 15 + (rowIdx * 3), 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                        className="flex gap-24 whitespace-nowrap"
                    >
                        {/* Render logos multiple times for seamless loop */}
                        {[...backgroundLogos, ...backgroundLogos, ...backgroundLogos, ...backgroundLogos].map((logo, i) => (
                            <div key={i} className="flex items-center justify-center transform transition-transform">
                                <CompanyLogo 
                                    company={{ name: logo }} 
                                    className="w-20 h-20 bg-transparent border-none" 
                                />
                            </div>
                        ))}
                    </motion.div>
                ))}
            </div>

            {/* Glowing Gradients (Brand Colors) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C2CBD3]/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#F6F3ED]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center relative z-10">
                
                {/* 2. Left Side Data Callout */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    className="space-y-10"
                >
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-black text-[#F6F3ED] leading-[1.1] tracking-tighter">
                            The Ultimate <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C2CBD3] via-white to-[#F6F3ED]">
                                New Grad Placement Hub
                            </span>
                        </h1>
                        <p className="text-xl text-[#F6F3ED]/60 max-w-lg font-medium leading-relaxed">
                            Everything final-year students need to crack assessments, interviews, and placements at top companies.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button 
                            onClick={scrollToPlaybooks}
                            className="px-8 py-4 bg-[#F6F3ED] text-[#313851] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center gap-3 cursor-pointer"
                        >
                            Explore Playbooks <ArrowRight size={16} />
                        </button>
                        <button 
                            onClick={() => setShowInfo(true)}
                            className="px-8 py-4 bg-transparent text-[#F6F3ED] border border-[#F6F3ED]/20 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#F6F3ED]/5 transition-all cursor-pointer"
                        >
                            How it Works
                        </button>
                    </div>

                    {/* Mobile Only: Simple vertical flow */}
                    <div className="lg:hidden grid grid-cols-2 gap-4 mt-12">
                        {journeySteps.map((step, idx) => (
                            <div key={idx} className="bg-[#F6F3ED]/5 border border-[#F6F3ED]/10 rounded-2xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#C2CBD3]/20 flex items-center justify-center">
                                    <step.icon size={16} className="text-[#C2CBD3]" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#F6F3ED]/60">{step.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 3. The Orbital Engine Graphic (Hidden on small mobile, shown on md+) */}
                <div className="relative h-[500px] lg:h-[600px] hidden sm:flex items-center justify-center">
                    
                    {/* The Orbital Workflow Container */}
                    <div className="relative w-[300px] md:w-[450px] h-[300px] md:h-[450px]">
                        
                        {/* Connecting Pulse Lines (SVG) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                            <circle 
                                cx="50" cy="50" r="40" 
                                fill="none" stroke="rgba(246, 243, 237, 0.05)" strokeWidth="0.5" 
                            />
                            <motion.circle 
                                cx="50" cy="50" r="40" 
                                fill="none" stroke="url(#lineGradient)" strokeWidth="1"
                                strokeDasharray="20 100"
                                animate={{ strokeDashoffset: [120, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="transparent" />
                                    <stop offset="50%" stopColor="#F6F3ED" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Central Hub */}
                        <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-[#C2CBD3] to-[#F6F3ED] p-[1px] shadow-[0_0_50px_rgba(194,203,211,0.2)] z-30"
                        >
                            <div className="w-full h-full rounded-full bg-[#313851] flex flex-col items-center justify-center text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-[#F6F3ED]/10 flex items-center justify-center mb-2">
                                    <Sparkles size={24} className="text-[#C2CBD3]" />
                                </div>
                                <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest text-[#F6F3ED] leading-tight">Your AI <br/>Prep Engine</span>
                            </div>
                            {/* Halo Effect */}
                            <div className="absolute inset-[-10px] rounded-full border border-[#F6F3ED]/10 animate-spin-slow pointer-events-none" />
                        </motion.div>

                        {/* Journey Nodes */}
                        {journeySteps.map((step, idx) => {
                            const radius = 40; // as per SVG viewBox 100
                            const angleRad = (step.angle * Math.PI) / 180;
                            const x = 50 + radius * Math.cos(angleRad);
                            const y = 50 + radius * Math.sin(angleRad);

                            return (
                                <motion.div 
                                    key={idx}
                                    style={{ 
                                        left: `${x}%`, 
                                        top: `${y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    className="absolute z-40 group"
                                >
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-[#313851] border border-[#F6F3ED]/10 flex items-center justify-center shadow-2xl group-hover:border-[#F6F3ED] transition-colors">
                                            <step.icon className="text-[#F6F3ED]/40 group-hover:text-[#F6F3ED] transition-colors" size={24} />
                                        </div>
                                        <div className="absolute -bottom-10 whitespace-nowrap">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#F6F3ED]/30 group-hover:text-[#F6F3ED] transition-colors">
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* 4. Floating Data Cards */}
                    {floatingCards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                                opacity: 1, 
                                y: [0, -20, 0],
                                rotateX: [0, 5, 0],
                                rotateY: [0, -5, 0]
                            }}
                            transition={{ 
                                opacity: { duration: 1, delay: i * 0.3 },
                                y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: card.delay },
                                rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                                rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="absolute z-50 hidden md:block cursor-pointer"
                            onClick={() => onSelectCompany?.(card.title)}
                            style={{ 
                                left: card.x, 
                                top: card.y,
                                perspective: '1000px'
                            }}
                        >
                            <div className={`relative group w-60 transition-all duration-500`}>
                                {/* Outer Glow */}
                                <div className={`absolute -inset-1 rounded-[2.5rem] opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500 ${
                                    card.accent === 'blue' ? 'bg-blue-400' : 
                                    card.accent === 'amber' ? 'bg-amber-400' : 
                                    'bg-emerald-400'
                                }`} />
                                
                                <div className="relative bg-[#F6F3ED]/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2.5rem] hover:bg-[#F6F3ED]/20 transition-all shadow-2xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                            card.accent === 'blue' ? 'bg-blue-400/10 text-blue-300 border-blue-400/20' : 
                                            card.accent === 'amber' ? 'bg-amber-400/10 text-amber-300 border-amber-400/20' : 
                                            'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                                        }`}>
                                            {card.tag}
                                        </div>
                                        <CompanyLogo 
                                            company={{ name: card.title, slug: card.slug }} 
                                            className="w-10 h-10 border-white/10" 
                                            iconSize={20}
                                        />
                                    </div>

                                    <h3 className="text-2xl font-black text-white mb-6 tracking-tight">{card.title}</h3>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(user => (
                                                <div key={user} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#313851] flex items-center justify-center backdrop-blur-md">
                                                    <User size={12} className="text-white/40" />
                                                </div>
                                            ))}
                                        </div>
                                        <button className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white flex items-center gap-2 transition-colors">
                                            EXPLORE <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom Glow Effect */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#313851] to-transparent z-20" />

            {/* "How it Works" Modal */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative max-w-xl w-full bg-[#0a0c14] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />
                            
                            <button 
                                onClick={() => setShowInfo(false)}
                                className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Info size={24} />
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">The Playbook Engine</h2>
                            </div>

                            <div className="space-y-6 text-white/70 leading-relaxed font-medium">
                                <p>
                                    Our Playbooks are **AI-distilled strategy guides** generated from thousands of successful candidate interviews and official company recruitment patterns.
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { title: "Insider Data", desc: "Access real interview questions and aptitude patterns from recent cycles." },
                                        { title: "Technical Blueprints", desc: "Step-by-step prep roadmaps for DSA, System Design, and Core Subjects." },
                                        { title: "Placement Strategy", desc: "Learn the specific behavioral 'triggers' that top-tier recruiters look for." }
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-1">{item.title}</h4>
                                            <p className="text-sm">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm italic">
                                    Stop applying blindly. Use the engine to synchronize your prep with company-specific reality.
                                </p>
                            </div>

                            <button 
                                onClick={() => { setShowInfo(false); scrollToPlaybooks(); }}
                                className="w-full mt-10 py-4 bg-white text-[#0a0c14] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Get Started Now
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

