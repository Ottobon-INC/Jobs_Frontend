import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export const NewGradHero = () => {
    return (
        <section className="relative py-24 px-6 overflow-hidden bg-[#313851]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto text-center relative z-10"
            >
                <h1 
                    className="text-5xl md:text-7xl font-bold text-[#F6F3ED] tracking-tight mb-6"
                    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                    Don't Apply Blind. <br />
                    <span className="bg-gradient-to-r from-[#C2CBD3] to-[#F6F3ED] bg-clip-text text-transparent">
                        Get the Insider Playbook.
                    </span>
                </h1>
                
                <p 
                    className="text-xl md:text-2xl text-[#F6F3ED]/80 max-w-2xl mx-auto font-medium"
                    style={{ letterSpacing: '-0.01em' }}
                >
                    Insights from successfully placed students: interview process, real offers, and proven prep strategies.
                </p>
                
                <div className="mt-10 flex justify-center">
                    <Link 
                        to="/new-grad/timeline" 
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 text-[#313851] rounded-full font-bold hover:bg-amber-300 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-amber-400/20"
                    >
                        <Calendar size={18} />
                        View Hiring Timeline
                    </Link>
                </div>
            </motion.div>

            {/* Abstract Background Elements */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#C2CBD3]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#F6F3ED]/5 rounded-full blur-[120px]" />
        </section>
    );
};
