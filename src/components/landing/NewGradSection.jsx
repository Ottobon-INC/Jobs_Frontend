import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Layers, CheckCircle2, DollarSign } from 'lucide-react';

export const NewGradSection = () => {
    return (
        <section className="py-12 bg-[#F4F1EA] relative overflow-hidden flex items-center">
            {/* Subtle background decoration */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D45B34]/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side: Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-left relative z-10 flex flex-col items-start"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D45B34]/10 text-[#D45B34] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D45B34] animate-pulse" />
                        New Grad Launchpad
                    </div>

                    <h2 
                        className="text-5xl md:text-6xl font-extrabold text-[#1C1A17] tracking-tighter mb-4 leading-none"
                        style={{ fontFamily: "'Inter', 'Roboto', system-ui, sans-serif" }}
                    >
                        Ready to start your career?
                    </h2>
                    
                    <h3 
                        className="text-2xl md:text-3xl font-extrabold text-[#1C1A17]/70 tracking-tight mb-6"
                        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                    >
                        Get the exact guides to ace your interviews.
                    </h3>

                    <p 
                        className="text-base md:text-lg text-[#1C1A17]/60 font-medium mb-10 max-w-xl tracking-tight leading-relaxed"
                        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                    >
                        Stop sending hundreds of resumes. Access verified interview playbooks, step-by-step preparation roadmaps, and 1-on-1 mentorship to land your dream job.
                    </p>

                    <Link
                        to="/new-grad"
                        className="group relative inline-flex items-center justify-center px-10 py-4 bg-[#D45B34] text-white rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_35px_-10px_rgba(212,91,52,0.4)] active:scale-98 overflow-hidden gap-2"
                    >
                        <span className="relative z-10 uppercase tracking-[0.15em]">Explore Playbooks</span>
                        <svg
                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300 text-white relative z-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </Link>
                </motion.div>
                
                {/* Right Side: Interactive UI Showcase */}
                <div className="relative h-[480px] flex items-center justify-center lg:justify-end">
                    {/* Floating Cards Container */}
                    <div className="relative w-full max-w-[460px] h-[440px] mt-8 lg:mt-0">
                        
                        {/* Thinking Man Illustration as the background base */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute bottom-[60px] left-1/2 -translate-x-1/2 w-[250px] h-[270px] z-10 pointer-events-none mix-blend-multiply select-none"
                        >
                            <img 
                                src="/illustrations/thinking_man.png" 
                                alt="Thinking Grad" 
                                className="w-full h-full object-contain"
                            />
                        </motion.div>

                        {/* Card 3: Interview Stats (Top Left) */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, rotate: 0 }}
                            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="absolute top-0 left-[-10px] z-20 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-lg hover:shadow-2xl border border-white/60 w-56 group hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-[#D45B34]/10 rounded-xl flex items-center justify-center text-[#D45B34]">
                                    <Layers size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Process</p>
                                    <p className="text-xs font-bold text-[#1C1A17]">4 Technical Rounds</p>
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                {[
                                    { label: "Online Assessment", checked: true },
                                    { label: "Technical Interview I", checked: true },
                                    { label: "System Design", checked: false },
                                ].map((round, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[10px] font-semibold text-[#1C1A17]/80">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${round.checked ? 'bg-green-500 animate-pulse' : 'bg-zinc-200'}`} />
                                            <span>{round.label}</span>
                                        </div>
                                        {round.checked && <span className="text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md uppercase">Pass</span>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Card 1: Verified Playbook (Bottom Left) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, rotate: 0 }}
                            whileInView={{ opacity: 1, y: 0, rotate: -6 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="absolute bottom-[20px] -left-20 z-20 bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-xl hover:shadow-2xl border border-white/70 w-60 group hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-[#D45B34]/5 rounded-2xl flex items-center justify-center border border-zinc-100">
                                    <img src="/logos/google.svg" alt="Google" className="w-6 h-6 object-contain" />
                                </div>
                                <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                                    <ShieldCheck size={10} /> Verified
                                </div>
                            </div>
                            <h4 className="font-extrabold text-[#1C1A17] text-base">Google Playbook</h4>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Prep Guide & Mocks</p>
                            <div className="mt-4 space-y-1.5">
                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[85%] bg-green-500 rounded-full transition-all duration-1000" />
                                </div>
                                <div className="flex justify-between text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
                                    <span>Preparation</span>
                                    <span className="text-green-600 font-extrabold">85% Ready</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 4: Resume Score (Top Right) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 20 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0, rotate: 5 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="absolute top-4 -right-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-lg hover:shadow-2xl border border-white/60 w-44 group hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                    <ShieldCheck size={14} />
                                </div>
                                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">ATS Optimizer</p>
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                                <h4 className="text-3xl font-black text-[#1C1A17] tracking-tighter">94</h4>
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-wider">Perfect</span>
                            </div>
                            <div className="mt-2 flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? 'bg-green-500' : 'bg-zinc-100'}`} />
                                ))}
                            </div>
                            <p className="text-[8px] font-semibold text-zinc-400 mt-2">Ready for top-tier hiring pools</p>
                        </motion.div>

                        {/* Card 5: Mentors (Middle Right) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="absolute top-40 -right-16 z-20 bg-white/90 backdrop-blur-md p-4.5 rounded-3xl shadow-xl hover:shadow-2xl border border-white/60 w-52 group hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                        >
                            <div className="flex -space-x-2.5 mb-3">
                                {[1, 2, 3, 4].map(i => (
                                    <motion.div 
                                        key={i} 
                                        whileHover={{ y: -4, zIndex: 50 }}
                                        className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 overflow-hidden shadow-sm transition-transform cursor-pointer"
                                    >
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+25}`} alt="mentor" className="w-full h-full object-cover" />
                                    </motion.div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#D45B34] flex items-center justify-center text-[9px] text-white font-bold shadow-sm">
                                    +50
                                </div>
                            </div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Expert Network</p>
                            <h4 className="text-xs font-bold text-[#1C1A17] mt-0.5">1-on-1 Mentorship</h4>
                            <div className="mt-2 py-1 px-2.5 bg-green-50 rounded-full inline-flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] font-black text-green-600 uppercase tracking-wider">Live Coaching Available</span>
                            </div>
                        </motion.div>

                        {/* Card 2: Salary Insight (Bottom Right) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0, rotate: 3 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="absolute bottom-[-30px] right-[24px] z-20 bg-[#222222] p-5 rounded-3xl shadow-xl hover:shadow-2xl text-white w-52 group hover:-translate-y-1 hover:scale-105 transition-all duration-300 border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                                    <DollarSign size={16} className="text-green-400" />
                                </div>
                                <span className="text-[8px] font-black text-white/50 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">Top Decile</span>
                            </div>
                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Avg Starting TC</p>
                            <h4 className="text-xl font-bold mt-0.5 text-white">$180k - $220k</h4>
                            <div className="mt-3.5 flex items-center gap-1.5 text-[9px] font-bold text-green-400">
                                <CheckCircle2 size={11} />
                                <span className="tracking-wide">Verified by Community</span>
                            </div>
                        </motion.div>

                        {/* Background Decorative Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D45B34]/5 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </div>
        </section>
    );
};
