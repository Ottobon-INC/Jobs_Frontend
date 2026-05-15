import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChevronDownIcon = ({ rotated }) => (
  <svg
    width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{
      transition: 'transform 0.3s ease',
      transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
    }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const statusColors = {
  Active: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
  Used: { bg: 'rgba(160,160,184,0.08)', text: '#6b6b82', border: 'rgba(160,160,184,0.1)' },
  Expired: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' },
};

const RedemptionHistory = ({ history }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Header / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-[#C2CBD3]/40 transition-all duration-300 active:scale-[0.99] focus:outline-none"
        style={{ background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <ClockIcon />
          <h2 className="text-base font-bold text-[#313851] uppercase tracking-wider">Transaction History</h2>
          {sortedHistory.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F6F3ED] text-[#313851] border border-[#C2CBD3]/20">
              {sortedHistory.length}
            </span>
          )}
        </div>
        <ChevronDownIcon rotated={isOpen} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="redemption-history-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl border border-[#C2CBD3]/40 overflow-hidden shadow-sm" style={{ background: '#ffffff' }}>
              {sortedHistory.length > 0 ? (
                <div className="divide-y divide-[#C2CBD3]/10">
                  {/* Desktop header */}
                  <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-4 text-[10px] font-bold text-[#313851]/40 uppercase tracking-[0.2em] bg-[#F6F3ED]/50">
                    <span>Date</span>
                    <span>Reward Item</span>
                    <span>Coins Spent</span>
                    <span>Status</span>
                  </div>
                  {sortedHistory.map((entry) => {
                    const sc = statusColors[entry.status] || statusColors.Used;
                    return (
                      <div key={entry.id} className="px-6 py-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:items-center flex flex-col gap-2 hover:bg-[#F6F3ED]/30 transition-colors">
                        <span className="text-xs text-[#313851]/60 font-medium">
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-sm text-[#313851] font-bold">{entry.rewardName}</span>
                        <span className="text-sm font-bold text-[#313851]">
                          -{entry.coinsSpent.toLocaleString()}
                        </span>
                        <span>
                          <span
                            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: sc.bg,
                              color: sc.text,
                              border: `1px solid ${sc.border}`,
                            }}
                          >
                            {entry.status}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="flex justify-center mb-4 text-[#313851]/20">
                    <ClockIcon />
                  </div>
                  <p className="text-sm text-[#313851]/60 font-semibold">No transaction records found</p>
                  <p className="text-[10px] text-[#313851]/40 mt-2 font-bold uppercase tracking-widest">Rewards you redeem will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default RedemptionHistory;
