import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Layers, CheckCircle2, DollarSign } from 'lucide-react';

export const NewGradSection = () => {
    return (
        <section className="py-12 bg-[#F8F6F3] relative overflow-hidden flex items-center">
            {/* Subtle background decoration */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#313851]/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side: Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-left relative z-10 flex flex-col items-start"
                >
                    <h2 
                        className="text-6xl md:text-7xl font-extrabold text-[#313851] tracking-tighter mb-4"
                        style={{ fontFamily: "'Inter', 'Roboto', system-ui, sans-serif" }}
                    >
                        New Grad?
                    </h2>

                    <p 
                        className="text-xl md:text-2xl text-[#313851]/60 font-medium mb-12 max-w-xl tracking-tight"
                        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                    >
                        Stop searching. Start building.
                    </p>

                    <Link
                        to="/new-grad"
                        className="group relative inline-flex items-center justify-center px-12 py-5 bg-[#313851] text-white rounded-full font-bold text-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(49,56,81,0.3)] active:scale-95 overflow-hidden"
                    >
                        <span className="relative z-10 uppercase tracking-[0.15em]">Explore</span>
                    </Link>
                </motion.div>
                
                {/* Right Side: Interactive UI Showcase */}
                <div className="relative h-[420px] flex items-center justify-center lg:justify-end">
                    {/* Floating Cards Container */}
                    <div className="relative w-full max-w-[440px] h-[380px] mt-8 lg:mt-0">
                        
                        {/* Card 3: Interview Stats (Top Left) */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, rotate: 0 }}
                            whileInView={{ opacity: 1, y: 0, rotate: -4 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="absolute top-0 left-2 z-10 bg-white p-5 rounded-[1.5rem] shadow-xl border border-zinc-100 w-56 group hover:scale-105 transition-transform"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-zinc-50 rounded-xl flex items-center justify-center text-[#313851]">
                                    <Layers size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Process</p>
                                    <p className="text-xs font-bold text-[#313851]">4 Technical Rounds</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <div className="h-1.5 flex-1 bg-zinc-100 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Card 1: Verified Playbook (Middle Left) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, rotate: 0 }}
                            whileInView={{ opacity: 1, y: 0, rotate: -6 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="absolute top-24 -left-6 z-30 bg-white p-5 rounded-[1.5rem] shadow-2xl shadow-[#313851]/10 border border-zinc-100 w-60 group hover:scale-105 transition-transform"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100">
                                    <div className="w-6 h-6 bg-[#313851] rounded-md" />
                                </div>
                                <ShieldCheck className="text-green-500" size={20} />
                            </div>
                            <h4 className="font-bold text-[#313851] text-base">Google Playbook</h4>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Verified Guide</p>
                            <div className="mt-3 space-y-1.5">
                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="h-full w-4/5 bg-green-500" />
                                </div>
                                <div className="flex justify-between text-[7px] font-bold text-zinc-400 uppercase">
                                    <span>Preparation</span>
                                    <span>80%</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 4: Resume Score (Top Right) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 20 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0, rotate: 5 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="absolute top-4 right-0 z-20 bg-white p-4 rounded-[1.5rem] shadow-2xl shadow-[#313851]/5 border border-zinc-100 w-40 group hover:scale-105 transition-transform"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                    <ShieldCheck size={14} />
                                </div>
                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.1em]">ATS Score</p>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <h4 className="text-3xl font-bold text-[#313851]">94</h4>
                                <span className="text-[10px] font-bold text-green-500">Perfect</span>
                            </div>
                            <div className="mt-2 flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-green-400' : 'bg-zinc-100'}`} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Card 5: Mentors (Middle Right) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="absolute top-28 -right-4 z-40 bg-white p-4 rounded-[1.5rem] shadow-2xl border border-zinc-100 w-52 group hover:scale-105 transition-transform"
                        >
                            <div className="flex -space-x-2 mb-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 overflow-hidden shadow-sm">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} alt="mentor" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#313851] flex items-center justify-center text-[9px] text-white font-bold shadow-sm">
                                    +50
                                </div>
                            </div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Network</p>
                            <h4 className="text-xs font-bold text-[#313851] mt-1">1-on-1 Mentorship</h4>
                            <div className="mt-2 py-1 px-2.5 bg-zinc-50 rounded-full inline-flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Live Support</span>
                            </div>
                        </motion.div>

                        {/* Card 2: Salary Insight (Bottom Right) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0, rotate: 3 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="absolute bottom-0 right-6 z-50 bg-[#313851] p-5 rounded-[1.5rem] shadow-2xl text-white w-52 group hover:scale-105 transition-transform"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <DollarSign size={16} className="text-green-400" />
                                </div>
                                <TrendingUp size={16} className="text-white/40" />
                            </div>
                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Starting TC</p>
                            <h4 className="text-xl font-bold mt-1">$180k - $220k</h4>
                            <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-green-400">
                                <CheckCircle2 size={10} />
                                <span>Verified by Community</span>
                            </div>
                        </motion.div>

                        {/* Background Decorative Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#313851]/5 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </div>
        </section>
    );
};
