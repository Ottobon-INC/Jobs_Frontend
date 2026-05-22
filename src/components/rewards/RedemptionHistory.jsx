import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterviewCreditsContext } from '../../context/InterviewCreditsContext';

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

const GiftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const statusColors = {
  Active: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
  Used: { bg: 'rgba(160,160,184,0.08)', text: '#6b6b82', border: 'rgba(160,160,184,0.1)' },
  Expired: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' },
};

const RedemptionHistory = ({ history }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('redemptions'); // 'redemptions' | 'credits'
  const { transactions } = useInterviewCreditsContext();

  const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  const sortedTransactions = [...(transactions || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalRecords = activeTab === 'redemptions' ? sortedHistory.length : sortedTransactions.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full"
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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F6F3ED] text-[#313851] border border-[#C2CBD3]/20">
            {sortedHistory.length + sortedTransactions.length}
          </span>
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
            {/* Custom Tab Selector */}
            <div className="flex gap-2 p-1 bg-[#F6F3ED] rounded-xl mt-3 max-w-sm border border-[#C2CBD3]/15">
              <button
                onClick={() => setActiveTab('redemptions')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  activeTab === 'redemptions'
                    ? 'bg-white text-[#313851] shadow-sm border border-[#C2CBD3]/10'
                    : 'text-[#313851]/40 hover:text-[#313851]/60'
                }`}
              >
                Redemptions ({sortedHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('credits')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  activeTab === 'credits'
                    ? 'bg-white text-[#313851] shadow-sm border border-[#C2CBD3]/10'
                    : 'text-[#313851]/40 hover:text-[#313851]/60'
                }`}
              >
                Credit Activity ({sortedTransactions.length})
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-[#C2CBD3]/40 overflow-hidden shadow-sm" style={{ background: '#ffffff' }}>
              {activeTab === 'redemptions' ? (
                /* ─── TAB 1: COIN SHOP REDEMPTIONS ─── */
                sortedHistory.length > 0 ? (
                  <div className="divide-y divide-[#C2CBD3]/10">
                    {/* Desktop header */}
                    <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-4 text-[10px] font-bold text-[#313851]/40 uppercase tracking-[0.2em] bg-[#F6F3ED]/50">
                      <span>Date</span>
                      <span>Reward Item</span>
                      <span>Coins Spent</span>
                      <span>Status</span>
                    </div>
                    {sortedHistory.map((entry, index) => {
                      const sc = statusColors[entry.status] || statusColors.Used;
                      return (
                        <motion.div 
                          key={entry.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="px-6 py-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:items-center flex flex-col gap-2 hover:bg-[#F6F3ED]/30 transition-colors"
                        >
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
                        </motion.div>
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
                )
              ) : (
                /* ─── TAB 2: INTERVIEW CREDIT ACTIVITY (TIMELINE) ─── */
                sortedTransactions.length > 0 ? (
                  <div className="p-6 space-y-6 relative">
                    {/* Vertical Timeline Bar */}
                    <div className="absolute left-[37px] top-8 bottom-8 w-0.5 bg-[#F6F3ED]" />

                    {sortedTransactions.map((tx, index) => {
                      const isPositive = tx.amount > 0;
                      let iconColorBg = 'bg-[#6366f1]';
                      let Icon = MicIcon;

                      if (tx.type === 'free_trial_grant') {
                        iconColorBg = 'bg-[#a78bfa]';
                        Icon = GiftIcon;
                      } else if (tx.type === 'shop_purchase') {
                        iconColorBg = 'bg-[#10b981]';
                        Icon = GiftIcon;
                      } else if (tx.type === 'interview_used') {
                        iconColorBg = 'bg-[#ef4444]';
                        Icon = MicIcon;
                      }

                      return (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="flex items-start gap-4 relative z-10"
                        >
                          {/* Circular Icon Container */}
                          <div className={`w-[26px] h-[26px] rounded-full ${iconColorBg} flex items-center justify-center text-white shadow-sm shrink-0 border border-white mt-1.5 ml-1`}>
                            <Icon />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#313851] truncate">{tx.description}</p>
                            <p className="text-xs text-[#313851]/60 mt-0.5 font-medium">
                              {new Date(tx.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {/* Balance Change */}
                          <div className={`text-sm font-extrabold uppercase tracking-tight shrink-0 mt-1.5 ${
                            isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'
                          }`}>
                            {isPositive ? `+${tx.amount}` : tx.amount} {Math.abs(tx.amount) === 1 ? 'credit' : 'credits'}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="flex justify-center mb-4 text-[#313851]/20">
                      <MicIcon />
                    </div>
                    <p className="text-sm text-[#313851]/60 font-semibold">No credit activities logged yet</p>
                    <p className="text-[10px] text-[#313851]/40 mt-2 font-bold uppercase tracking-widest">Your mock interview credits will be tracked here</p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default RedemptionHistory;
