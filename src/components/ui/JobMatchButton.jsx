import { Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const JobMatchButton = ({ onMatch, isLoading }) => {
    return (
        <motion.button
            onClick={onMatch}
            disabled={isLoading}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex items-center justify-center gap-4 px-10 py-5 bg-black text-white border-4 border-black rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] transition-all shadow-[0_15px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] disabled:opacity-50 overflow-hidden"
        >
            {/* Neural Shimmer Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite]"
                style={{ backgroundSize: '200% 100%' }}
            />

            {/* Inner Glow Border */}
            <div className="absolute inset-0 border-2 border-white/5 rounded-[1.8rem] pointer-events-none" />

            {isLoading ? (
                <>
                    <RefreshCw size={18} className="animate-spin text-yellow-400" />
                    <span className="relative z-10">Analyzing Match...</span>
                </>
            ) : (
                <>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative z-10"
                    >
                        <Sparkles size={20} className="text-yellow-400 fill-yellow-400/20" />
                    </motion.div>
                    <span className="relative z-10 flex flex-col items-start leading-none">
                        <span className="text-[14px]">Analyze My Fit</span>
                        <span className="text-[8px] opacity-40 mt-1 tracking-[0.4em] font-medium">Smart Matching Analysis</span>
                    </span>
                </>
            )}
        </motion.button>
    );
};

export default JobMatchButton;
