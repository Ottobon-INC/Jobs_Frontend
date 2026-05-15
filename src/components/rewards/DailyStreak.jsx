import { useState } from 'react';
import { motion } from 'framer-motion';
import { DAILY_COIN_REWARD, STREAK_LENGTH, DAY_LABELS } from '../../data/rewardItems';

/* ─── Inline SVG Icons ─── */
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M5 10l3.5 3.5L15 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M6 6l8 8M14 6l-8 8" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const FireIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2c.5 3-2 5.5-2 8.5a4 4 0 008 0c0-2-1-3.5-1-5.5 1.5 1.5 3 4 3 7a7 7 0 01-14 0c0-4 3-7 6-10z" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5"/>
    <path d="M12 22a4 4 0 01-4-4c0-2 2-3.5 4-6 2 2.5 4 4 4 6a4 4 0 01-4 4z" fill="#fbbf24" opacity="0.7"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const RestartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6"/>
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
);

const LoaderIcon = () => (
  <motion.svg
    width="20" height="20" viewBox="0 0 24 24" fill="none"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
    <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </motion.svg>
);


const DailyStreak = ({ streakData, onClaim, isClaiming, weekOffset, onWeekChange }) => {
  const currentDay = streakData.findIndex(d => d.status === 'claimable');
  const completedCount = streakData.filter(d => d.status === 'completed').length;
  const hasBrokenStreak = streakData.some(d => d.status === 'missed');
  const allCompleted = completedCount === STREAK_LENGTH;
  const todayClaimed = streakData.some(d => d.status === 'completed' && d.isToday);
  const progress = completedCount / STREAK_LENGTH;

  const getButtonState = () => {
    if (isClaiming) return 'claiming';
    if (todayClaimed) return 'claimed';
    if (hasBrokenStreak && !streakData.some(d => d.status === 'claimable')) return 'broken';
    if (currentDay >= 0) return 'claimable';
    if (allCompleted) return 'all-done';
    return 'claimable';
  };

  const buttonState = getButtonState();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-[#C2CBD3]/40 p-5 sm:p-7 shadow-sm"
      style={{
        background: '#ffffff',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <FireIcon />
          <h2 className="text-lg sm:text-xl font-bold text-[#313851]">Daily Login Streak</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#313851]/60">
            Day {completedCount} / {STREAK_LENGTH}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-[#F6F3ED] mb-7 overflow-hidden border border-[#C2CBD3]/20">
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: '#313851' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        >
          {/* Pulse on leading edge */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{ background: '#313851', boxShadow: '0 0 12px rgba(49,56,81,0.4)' }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onWeekChange(-1)}
          className="p-1.5 rounded-lg text-[#C2CBD3] hover:text-[#313851] hover:bg-[#F6F3ED] transition-all focus:outline-none"
          aria-label="Previous week"
        >
          <ChevronLeftIcon />
        </button>
        <span className="text-[10px] text-[#313851]/50 font-bold tracking-widest uppercase">
          {weekOffset === 0 ? 'Current Week' : `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago`}
        </span>
        <button
          onClick={() => onWeekChange(1)}
          disabled={weekOffset === 0}
          className="p-1.5 rounded-lg text-[#C2CBD3] hover:text-[#313851] hover:bg-[#F6F3ED] transition-all disabled:opacity-20 focus:outline-none"
          aria-label="Next week"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* 7 Day Circles */}
      <div className="flex justify-between gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
        {streakData.map((day, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.05 * i + 0.4 }}
            className="flex flex-col items-center gap-2 min-w-[56px] sm:min-w-[64px]"
          >
            {/* Circle */}
            <div className="relative">
              {day.status === 'claimable' && (
                <motion.div
                  className="absolute inset-[-3px] rounded-full"
                  style={{ border: '2px solid #313851' }}
                  animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative transition-all duration-300"
                style={{
                  ...(day.status === 'completed' ? {
                    background: '#313851',
                    boxShadow: '0 4px 12px rgba(49,56,81,0.2)',
                  } : day.status === 'claimable' ? {
                    background: '#ffffff',
                    border: '2px solid #313851',
                  } : day.status === 'missed' ? {
                    background: '#F6F3ED',
                    border: '1px solid #ef4444',
                  } : {
                    background: '#F6F3ED',
                    border: '1px solid #C2CBD3',
                  }),
                }}
              >
                {day.status === 'completed' && <CheckIcon />}
                {day.status === 'claimable' && (
                  <span className="text-sm font-bold text-[#313851]">+{DAILY_COIN_REWARD}</span>
                )}
                {day.status === 'locked' && <LockIcon />}
                {day.status === 'missed' && <XIcon />}
              </div>
            </div>

            {/* Day label */}
            <span
              className="text-[10px] font-bold tracking-wider uppercase"
              style={{
                color: day.status === 'completed' ? '#313851'
                  : day.status === 'claimable' ? '#313851'
                  : day.status === 'missed' ? '#ef4444'
                  : '#C2CBD3',
              }}
            >
              {DAY_LABELS[i]}
            </span>

            {/* Micro label */}
            {day.status === 'claimable' && (
              <motion.span
                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#313851]/10 text-[#313851]"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Claim
              </motion.span>
            )}
            {day.status === 'completed' && day.isToday && (
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Claimed</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Claim Button */}
      <div className="mt-6 sm:mt-8">
        <style>{`
          @keyframes btnShimmer {
            0% { left: -30%; }
            100% { left: 130%; }
          }
        `}</style>
        <button
          onClick={onClaim}
          disabled={buttonState !== 'claimable'}
          className="w-full py-4 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 relative overflow-hidden active:scale-[0.98] focus:outline-none"
          style={{
            ...(buttonState === 'claimable' ? {
              background: '#313851',
              color: '#F6F3ED',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(49,56,81,0.2)',
            } : buttonState === 'claiming' ? {
              background: '#313851',
              color: '#F6F3ED',
              cursor: 'wait',
              opacity: 0.8,
            } : buttonState === 'claimed' || buttonState === 'all-done' ? {
              background: '#F6F3ED',
              color: '#313851',
              cursor: 'default',
              border: '1px solid #C2CBD3',
            } : {
              background: '#F6F3ED',
              color: '#313851',
              cursor: 'pointer',
              border: '1px solid #C2CBD3',
            }),
          }}
        >
          {buttonState === 'claimable' && (
            <>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Claim {DAILY_COIN_REWARD} Coins Today
              </span>
              <div
                className="absolute top-0 h-full w-[40%] pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  animation: 'btnShimmer 3s ease-in-out infinite',
                }}
              />
            </>
          )}
          {buttonState === 'claiming' && (
            <span className="flex items-center justify-center gap-2">
              <LoaderIcon />
              Processing...
            </span>
          )}
          {buttonState === 'claimed' && 'Today\'s Reward Claimed ✓'}
          {buttonState === 'all-done' && '🎉 7-Day Streak Complete!'}
          {buttonState === 'broken' && (
            <span className="flex items-center justify-center gap-2">
              <RestartIcon />
              Reset Streak
            </span>
          )}
        </button>
      </div>

      {/* Bonus info */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#313851]/40 font-bold uppercase tracking-[0.1em]">
        <SparkleIcon />
        <span>7-Day Streak Bonus: <span className="text-[#313851]">2X Coins</span></span>
      </div>
    </motion.section>
  );
};

export default DailyStreak;
