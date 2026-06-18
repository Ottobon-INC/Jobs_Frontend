import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GoldCoinIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="coinInner" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="15" fill="url(#coinGrad)" stroke="#d97706" strokeWidth="1"/>
    <circle cx="16" cy="16" r="11" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.4"/>
    <text x="16" y="21" textAnchor="middle" fill="#92400e" fontSize="14" fontWeight="800" fontFamily="Inter, sans-serif">C</text>
  </svg>
);

const CoinBalance = ({ balance, coinDelta }) => {
  const [showDelta, setShowDelta] = useState(false);

  useEffect(() => {
    if (coinDelta && coinDelta > 0) {
      setShowDelta(true);
      const timer = setTimeout(() => setShowDelta(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [coinDelta]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const todayStr = `Today, ${timeStr}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-[#1C1A17]/15 p-4 sm:p-5 flex items-center justify-between shadow-sm"
      style={{
        background: '#ffffff',
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4 relative z-10">
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          >
            <GoldCoinIcon size={40} />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#313851] border-2 border-white shadow-sm" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#1C1A17]/60 font-bold tracking-[0.1em] uppercase">Coin Balance</span>
          <div className="relative flex items-center">
            <motion.span
              key={balance}
              initial={{ scale: 1.1, color: '#1C1A17' }}
              animate={{ scale: 1, color: '#313851' }}
              transition={{ duration: 0.4 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight"
            >
              {balance.toLocaleString()}
            </motion.span>

            <AnimatePresence>
              {showDelta && (
                <motion.span
                  initial={{ opacity: 1, y: 0, x: 8 }}
                  animate={{ opacity: 0, y: -30, x: 8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="absolute left-full text-lg font-bold text-[#1C1A17] whitespace-nowrap"
                >
                  +{coinDelta}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end relative z-10">
        <span className="text-[10px] text-[#1C1A17]/40 font-bold tracking-wider uppercase">System Online</span>
        <span className="text-sm text-[#1C1A17]/80 font-semibold">{timeStr}</span>
      </div>

      {/* Subtle Shimmer sweep */}
      <style>{`
        @keyframes coinHeaderShimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(400%) skewX(-15deg); }
        }
      `}</style>
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
      >
        <div
          className="absolute top-0 left-0 w-1/4 h-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(49,56,81,0.03), transparent)',
            animation: 'coinHeaderShimmer 8s ease-in-out infinite',
          }}
        />
      </div>
    </motion.div>
  );
};

export { GoldCoinIcon };
export default CoinBalance;
