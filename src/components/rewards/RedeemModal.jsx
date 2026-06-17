import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoldCoinIcon } from './CoinBalance';
import { useInterviewCreditsContext } from '../../context/InterviewCreditsContext';

/* ─── Confetti Particle ─── */
const ConfettiParticle = ({ index }) => {
  const colors = ['#6366f1', '#818cf8', '#a78bfa', '#c4b5fd', '#fbbf24', '#10b981'];
  const color = colors[index % colors.length];
  const angle = (index / 25) * Math.PI * 2;
  const distance = 60 + Math.random() * 80;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x, y, scale: 0.3 }}
      transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
      className="absolute rounded-full"
      style={{
        width: 4 + Math.random() * 4,
        height: 4 + Math.random() * 4,
        background: color,
        top: '50%',
        left: '50%',
      }}
    />
  );
};

/* ─── Success Checkmark SVG ─── */
const SuccessCheckmark = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <motion.circle
      cx="32" cy="32" r="28"
      stroke="#10b981"
      strokeWidth="3"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
    <motion.path
      d="M20 32l8 8 16-16"
      stroke="#10b981"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
    />
  </svg>
);

const RedeemModal = ({ isOpen, onClose, item, coinBalance, onConfirm }) => {
  const [step, setStep] = useState('confirm'); // 'confirm' | 'loading' | 'success'
  const [errorMsg, setErrorMsg] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const modalRef = useRef(null);
  const { addCredits } = useInterviewCreditsContext();

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setShowConfetti(false);
      setErrorMsg(null);
      setQuantity(1);
    }
  }, [isOpen]);

  // Trap focus
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

  const handleConfirm = useCallback(async () => {
    setStep('loading');
    setErrorMsg(null);
    try {
      await onConfirm(item, quantity);

      // Perform local balance credit addition if shop purchase is interview credits
      if (item.grantType === 'interview_credits') {
        const lowerName = (item.name || '').toLowerCase();
        const lowerDesc = (item.description || '').toLowerCase();
        
        const isHumanMock = item.slug === 'human_mock_interview' || lowerName.includes('human mock') || lowerDesc.includes('human mock');
        const isAiMock = !isHumanMock && (
          item.slug === 'mock_interview' || 
          lowerName.includes('mock interview') || 
          lowerDesc.includes('mock interview')
        );
        const isAiMatch = !isHumanMock && !isAiMock && (
          item.slug === 'check_match' || 
          lowerName.includes('match') ||
          lowerDesc.includes('match')
        );
        
        let creditType = 'ai';
        if (isAiMock) creditType = 'ai_interview';
        else if (isAiMatch) creditType = 'ai_match';
        else if (isHumanMock) creditType = 'human';

        addCredits(item.grantAmount * quantity, 'shop_purchase', item.name, creditType);
      }

      setStep('success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    } catch (err) {
      // If API fails, go back to confirm so user can retry
      setStep('confirm');
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to redeem reward');
    }
  }, [item, onConfirm, addCredits, quantity]);

  if (!item) return null;

  const isClamReward = item.category === 'clam reward' || item.category === 'Claim Reward';
  const totalCost = item.cost * quantity;
  const balanceAfter = isClamReward ? coinBalance + totalCost : coinBalance - totalCost;
  const canAffordMore = isClamReward ? true : coinBalance >= (item.cost * (quantity + 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl border border-[#C2CBD3]/40 p-6 sm:p-8 shadow-2xl"
            style={{ background: '#ffffff' }}
            role="dialog"
            aria-modal="true"
            aria-label={`Redeem ${item.name}`}
          >
            <AnimatePresence mode="wait">
              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border border-[#C2CBD3]/20"
                    style={{ background: '#F6F3ED', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#313851" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12v10H4V12"/>
                      <path d="M2 7h20v5H2z"/>
                      <path d="M12 22V7"/>
                      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
                      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-[#313851] mb-2">{item.name}</h3>
                  <p className="text-sm text-[#313851]/60 mb-4 leading-relaxed font-medium">{item.description}</p>

                  {errorMsg && (
                    <div className="w-full mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center">
                      {errorMsg}
                    </div>
                  )}

                  {item.grantType === 'interview_credits' && (
                    <div className="flex items-center gap-2 text-xs text-[#10b981] font-semibold mb-4 bg-[#10b981]/5 px-3.5 py-2.5 rounded-lg border border-[#10b981]/25 w-full text-left">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>You'll receive {item.grantAmount * quantity} {item.grantAmount * quantity === 1 ? 'credit' : 'credits'} added to your balance</span>
                    </div>
                  )}

                  {/* Quantity Stepper (only for non-claim rewards) */}
                  {!isClamReward && (
                    <div className="w-full flex items-center justify-between mb-4 px-4 py-3 rounded-xl border border-[#C2CBD3]/20" style={{ background: '#F6F3ED/30' }}>
                      <span className="text-xs font-bold text-[#313851]/70 uppercase tracking-wider">Quantity</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="w-8 h-8 rounded-lg border border-[#C2CBD3]/60 flex items-center justify-center font-bold text-[#313851] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F6F3ED] transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[#313851]">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => q + 1)}
                          disabled={!canAffordMore}
                          className="w-8 h-8 rounded-lg border border-[#C2CBD3]/60 flex items-center justify-center font-bold text-[#313851] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F6F3ED] transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="w-full rounded-xl border border-[#C2CBD3]/20 p-5 mb-6 space-y-3" style={{ background: '#F6F3ED' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#313851]/40 uppercase tracking-wider">
                        {isClamReward ? 'Reward Amount' : 'Redemption Cost'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <GoldCoinIcon size={16} />
                        <span className="font-bold text-[#313851]">
                          {isClamReward ? `+${totalCost.toLocaleString()}` : totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-[#C2CBD3]/20" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#313851]/40 uppercase tracking-wider">
                        {isClamReward ? 'New Balance' : 'Remaining Balance'}
                      </span>
                      <span className="font-bold text-[#313851]">{balanceAfter.toLocaleString()} Coins</span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider text-[#F6F3ED] transition-all duration-300 active:scale-[0.98] focus:outline-none"
                    style={{
                      background: '#313851',
                      boxShadow: '0 4px 12px rgba(49,56,81,0.2)',
                    }}
                  >
                    {isClamReward ? 'Confirm Claim' : 'Confirm Redemption'}
                  </button>

                  <button
                    onClick={onClose}
                    className="mt-4 text-[10px] font-bold text-[#313851]/40 hover:text-[#313851] uppercase tracking-widest transition-colors focus:outline-none"
                  >
                    Cancel Transaction
                  </button>
                </motion.div>
              )}

              {step === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-2 border-[#F6F3ED] border-t-[#313851]"
                  />
                  <span className="mt-5 text-[10px] font-bold text-[#313851]/40 uppercase tracking-[0.2em]">Authenticating...</span>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center relative"
                >
                  {/* Confetti */}
                  {showConfetti && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <ConfettiParticle key={i} index={i} />
                      ))}
                    </div>
                  )}

                  <div className="mb-5">
                    {item.grantType === 'interview_credits' ? (
                      <div className="w-16 h-16 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 flex items-center justify-center text-[#10b981] mx-auto">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                        </svg>
                      </div>
                    ) : (
                      <SuccessCheckmark />
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-[#313851] mb-2">
                    {item.grantType === 'interview_credits' 
                      ? 'Credits Added!' 
                      : isClamReward 
                        ? 'Claim Successful!' 
                        : 'Redemption Successful!'}
                  </h3>
                  <p className="text-sm text-[#313851]/60 mb-1 font-semibold">{item.name}</p>
                  <p className="text-xs text-[#313851]/40 mb-8 font-bold uppercase tracking-tight">
                    {item.grantType === 'interview_credits'
                      ? `${item.grantAmount} interview credits have been credited to your balance.`
                      : isClamReward
                        ? `${item.cost} coins have been added to your balance.`
                        : 'This perk has been added to your profile.'}
                  </p>

                  <div className="flex gap-4 w-full">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-[#C2CBD3]/40 text-[#313851]/60 hover:bg-[#F6F3ED] transition-all focus:outline-none"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#F6F3ED] transition-all focus:outline-none shadow-sm"
                      style={{ background: '#313851' }}
                    >
                      View Perk
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RedeemModal;
