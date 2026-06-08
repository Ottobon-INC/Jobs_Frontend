import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getRewardsState } from '../../api/rewardsApi';
import { useInterviewCreditsContext } from '../../context/InterviewCreditsContext';

/* ─── Confetti Particle for Onboarding Celebration ─── */
const ConfettiParticle = ({ index }) => {
  const colors = ['#6366f1', '#818cf8', '#a78bfa', '#10b981', '#fbbf24'];
  const color = colors[index % colors.length];

  // Random motion paths for a vibrant burst
  const initialAngle = (index / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
  const distance = 80 + Math.random() * 120;
  const x = Math.cos(initialAngle) * distance;
  const y = -120 - Math.random() * 120; // Float upward
  const rotate = 180 + Math.random() * 360;

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
      animate={{ opacity: [1, 1, 0], x, y, scale: [0, 1.2, 0.4], rotate }}
      transition={{ 
        duration: 1.2, 
        ease: 'easeOut',
        delay: index * 0.02
      }}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 6 + Math.random() * 8,
        height: 6 + Math.random() * 8,
        background: color,
        top: '40%',
        left: '50%',
        boxShadow: '0 0 8px currentColor'
      }}
    />
  );
};

/* ─── State A: Inline Confirmation Panel ─── */
export const CreditCheckPanel = ({ onConfirm, onCancel, isStarting, mode = 'all' }) => {
  const { totalCreditsRemaining, freeCreditsRemaining, freeMatchCreditsRemaining = 5, purchasedCreditsRemaining, purchasedHumanCreditsRemaining, purchasedMatchCreditsRemaining = 0, hasFreeTrialRemaining } = useInterviewCreditsContext();
  const baseCredits = mode === 'purchased_human_only' 
    ? purchasedHumanCreditsRemaining 
    : mode === 'ai_interview_only' || mode === 'ai_only' 
      ? freeCreditsRemaining + purchasedCreditsRemaining 
      : mode === 'ai_match_only'
        ? freeMatchCreditsRemaining + purchasedMatchCreditsRemaining
        : totalCreditsRemaining;
  const remainingAfter = Math.max(0, baseCredits - 1);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 mt-4 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2 text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
            <span>This will use 1 credit. You'll have</span>
            <strong className="text-zinc-900 font-black">{remainingAfter}</strong>
            <span>{remainingAfter === 1 ? 'credit' : 'credits'} remaining.</span>

            {mode !== 'purchased_human_only' && (
              mode === 'ai_match_only' ? freeMatchCreditsRemaining > 0 : hasFreeTrialRemaining
            ) && (
              <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase ml-1.5 shrink-0">
                Free trial credit
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onCancel}
            disabled={isStarting}
            className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-zinc-900 transition-colors px-3 py-2 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isStarting}
            className="text-[10px] uppercase tracking-widest font-bold text-white bg-zinc-900 rounded-full px-5 py-3 hover:bg-zinc-800 active:scale-95 transition-all shadow-md shadow-zinc-900/10 disabled:opacity-40"
          >
            {isStarting ? 'Deducting...' : 'Start'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Centered Modal Dialogs (State C & State D) ─── */
export const CreditCheckModal = ({ isOpen, onClose, viewState, onConfirm, isStarting, mode = 'all' }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const { totalUsed, aiInterviewsUsed = 0, humanInterviewsUsed = 0, transactions = [] } = useInterviewCreditsContext();
  const [coins, setCoins] = useState(0);

  const matchUsed = transactions.filter(t => t.type === 'interview_used' && t.description && t.description.toLowerCase().includes('check match')).length;

  const displayUsed = mode === 'ai_match_only' 
    ? matchUsed 
    : mode === 'ai_interview_only' || mode === 'ai_only'
      ? aiInterviewsUsed 
      : mode === 'purchased_human_only'
        ? humanInterviewsUsed
        : totalUsed;

  // Fetch coins balance dynamically when Paywall view is loaded
  useEffect(() => {
    if (isOpen && viewState === 'paywall') {
      getRewardsState()
        .then((res) => setCoins(res.coin_balance || 0))
        .catch(() => setCoins(0));
    }
  }, [isOpen, viewState]);

  // Trap Focus and Escape Key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#0a0a0f]/45 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {viewState === 'paywall' ? (
          /* ────────────────────────────────────────────────────────── */
          /*  STATE C: PAYWALL MODAL                                    */
          /* ────────────────────────────────────────────────────────── */
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full max-w-lg bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-[0_15px_50px_rgba(0,0,0,0.08)] text-center relative overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-title"
          >
            {/* Lock Icon */}
            <div className="mx-auto w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mb-6">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h3 id="paywall-title" className="text-xl font-bold text-zinc-900 tracking-tight">
              {mode === 'ai_match_only' ? 'No Check Match Credits Remaining' : 'No Interview Credits Remaining'}
            </h3>
            
            <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
              {mode === 'ai_match_only'
                ? "You've used all your Check Match credits. Purchase more Check Match credits from the Reward Shop using your earned coins, or continue exploring jobs to earn more."
                : "You've used all your interview credits. Purchase more credits from the Reward Shop using your earned coins, or continue exploring jobs to earn more."}
            </p>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Used</div>
                <div className="text-lg font-black text-zinc-800 mt-1">{displayUsed}</div>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Coins</div>
                <div className="text-lg font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
                  <span>{coins}</span>
                </div>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Daily</div>
                <div className="text-lg font-black text-emerald-600 mt-1">+50/day</div>
              </div>
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => {
                onClose();
                navigate('/rewards');
              }}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#a78bfa] rounded-2xl py-3.5 text-xs font-bold uppercase tracking-widest text-white mt-6 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.25)] cursor-pointer"
            >
              <span>Go to Reward Shop</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button
              onClick={onClose}
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-950 transition-colors text-center block w-full mt-4 cursor-pointer"
            >
              Continue browsing jobs
            </button>
          </motion.div>
        ) : (
          /* ────────────────────────────────────────────────────────── */
          /*  STATE D: FIRST-TIME USER CELEBRATORY ONBOARDING           */
          /* ────────────────────────────────────────────────────────── */
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full max-w-md bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-[0_15px_50px_rgba(0,0,0,0.08)] text-center relative overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            {/* Confetti Animation Burst */}
            {Array.from({ length: 20 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}

            {/* Gift Icon with primary gradient bounce */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto w-20 h-20 bg-gradient-to-r from-[#6366f1] to-[#a78bfa] rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(99,102,241,0.25)]"
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </motion.div>

            <h3 id="onboarding-title" className="text-2xl font-bold text-zinc-900 tracking-tight">
              You Have 5 Free Credits!
            </h3>

            <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
              Welcome to Ottobon! We've given you 5 free credits to get started. Practice with AI mock interviews, verify external jobs with check match, and land your dream job.
            </p>

            {/* Credit preview with glow */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6366f1] shadow-[0_4px_12px_rgba(99,102,241,0.08)] animate-pulse"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                </div>
              ))}
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1.5">× 5 Free Credits</span>
            </div>

            {/* CTA */}
            <button
              onClick={onConfirm}
              disabled={isStarting}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#a78bfa] rounded-2xl py-3.5 text-xs font-bold uppercase tracking-widest text-white mt-8 hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(99,102,241,0.25)] disabled:opacity-40 cursor-pointer"
            >
              {isStarting ? 'Starting Session...' : 'Start Your First Interview'}
            </button>

            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mt-3">
              Free credits expire 30 days after account creation
            </span>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
