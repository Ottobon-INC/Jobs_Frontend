import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterviewCreditsContext } from '../../context/InterviewCreditsContext';

export const CreditBalance = ({ mode = 'all' }) => {
  const {
    freeCreditsRemaining,
    purchasedCreditsRemaining,
    purchasedHumanCreditsRemaining,
    totalCreditsRemaining,
    totalUsed,
    hasFreeTrialRemaining
  } = useInterviewCreditsContext();

  let displayCredits = totalCreditsRemaining;
  if (mode === 'purchased_only') {
    displayCredits = purchasedCreditsRemaining;
  } else if (mode === 'purchased_human_only') {
    displayCredits = purchasedHumanCreditsRemaining;
  }
  const isZero = displayCredits === 0;

  const [showMinusOne, setShowMinusOne] = useState(false);
  const prevCreditsRef = useRef(displayCredits);

  useEffect(() => {
    if (displayCredits < prevCreditsRef.current) {
      setShowMinusOne(true);
      const timer = setTimeout(() => setShowMinusOne(false), 800);
      return () => clearTimeout(timer);
    }
    prevCreditsRef.current = displayCredits;
  }, [displayCredits]);

  return (
    <div 
      className="group relative flex items-center gap-3 bg-white/70 border border-zinc-200/60 rounded-xl px-4 py-2 select-none transition-all duration-300 hover:border-zinc-300 hover:shadow-md cursor-help"
      aria-label={`Interview credits: ${displayCredits} remaining`}
    >
      {/* Icon with Indigo Gradient */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <defs>
          <linearGradient id="indigo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <path 
          d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" 
          fill="url(#indigo-grad)" 
        />
        <path 
          d="M19 10v2a7 7 0 0 1-14 0v-2" 
          stroke="url(#indigo-grad)" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <line 
          x1="12" y1="19" x2="12" y2="22" 
          stroke="url(#indigo-grad)" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
      </svg>
 
      {/* Credit Count Indicator */}
      <div className="relative flex items-center gap-1.5 min-w-[20px] justify-center">
        {/* Floating Negative Credit Indicator */}
        <AnimatePresence>
          {showMinusOne && (
            <motion.span
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#ef4444] pointer-events-none"
            >
              -1
            </motion.span>
          )}
        </AnimatePresence>
 
        {/* Credit Count Bounce */}
        <motion.span
          key={displayCredits}
          animate={{ scale: [1, 1.25, 0.95, 1.05, 1] }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`font-bold text-base leading-none ${isZero ? 'text-[#ef4444]' : 'text-zinc-800'}`}
        >
          {displayCredits}
        </motion.span>
 
        <span className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider leading-none">credits</span>
      </div>
 
      {/* Free Trial Badge with pulsing effect */}
      {mode !== 'purchased_only' && hasFreeTrialRemaining && (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full border border-emerald-100 uppercase"
        >
          Free Trial
        </motion.div>
      )}
 
      {/* CSS-Only Tooltip */}
      <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[9999]">
        <div className="relative bg-white border border-zinc-200/80 text-[10px] font-bold text-zinc-400 rounded-xl px-3.5 py-2.5 whitespace-nowrap shadow-xl flex items-center gap-1.5 uppercase tracking-wider">
          {/* Arrow Shadow/Border */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-zinc-200/80 -mb-[1px] z-0" />
          {/* Arrow Fill */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-white -mb-[0.5px] z-10" />
          
          <span className="relative z-20">
            {mode === 'purchased_only' ? (
              <>Purchased AI: <span className="text-indigo-600 font-black">{purchasedCreditsRemaining}</span></>
            ) : mode === 'purchased_human_only' ? (
              <>Purchased Human: <span className="text-indigo-600 font-black">{purchasedHumanCreditsRemaining}</span></>
            ) : (
              <>Free: <span className="text-emerald-600 font-black">{freeCreditsRemaining}</span> · Purchased AI: <span className="text-indigo-600 font-black">{purchasedCreditsRemaining}</span> · Human: <span className="text-indigo-600 font-black">{purchasedHumanCreditsRemaining}</span> · Used: <span className="text-zinc-700 font-black">{totalUsed}</span></>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
