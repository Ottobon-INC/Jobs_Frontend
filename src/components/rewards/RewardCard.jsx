import { motion } from 'framer-motion';
import { GoldCoinIcon } from './CoinBalance';

/* ─── Category Icons (inline SVGs) ─── */
const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <circle cx="7" cy="7" r="1"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const LockSmallIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b6b82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const MicrophoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const categoryConfig = {
  Coupons: {
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    icon: TagIcon,
    emoji: '🏷️',
  },
  Boosts: {
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    icon: RocketIcon,
    emoji: '🚀',
  },
  Digital: {
    gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    icon: DownloadIcon,
    emoji: '💾',
  },
  Exclusive: {
    gradient: 'linear-gradient(135deg, #818cf8, #6366f1)',
    icon: StarIcon,
    emoji: '⭐',
  },
};

const RewardCard = ({ item, canAfford, isLocked, onRedeem, index }) => {
  const config = categoryConfig[item.category] || categoryConfig.Boosts;
  const IconComp = item.grantType === 'interview_credits' ? MicrophoneIcon : (config.icon || TagIcon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.06 * index }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl border border-[#C2CBD3]/40 overflow-hidden flex flex-col transition-all duration-300 shadow-sm"
      style={{
        background: '#ffffff',
      }}
    >
      {/* Absolute Overlapping Badge */}
      {item.badge && (
        <div 
          className={`absolute top-2 right-2.5 z-10 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
            item.badge === 'POPULAR'
              ? 'bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/20'
              : 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/20'
          }`}
        >
          {item.badge}
        </div>
      )}

      {/* Category banner */}
      <div
        className="h-10 flex items-center justify-center gap-2"
        style={{ background: '#313851' }}
      >
        <IconComp />
        <span className="text-[10px] font-bold text-[#F6F3ED] uppercase tracking-widest">{item.category}</span>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-[#313851] mb-2 leading-tight flex items-center gap-2">
          {item.name}
          {item.grantType === 'interview_credits' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          )}
        </h3>
        <p className="text-xs text-[#313851]/60 mb-4 line-clamp-2 leading-relaxed font-medium">{item.description}</p>

        {/* Details row */}
        <div className="flex flex-col gap-2 mt-auto">
          {item.grantType === 'interview_credits' && (
            <div className="text-xs text-[#6b6b82] font-semibold">
              🎵 Grants {item.grantAmount} {item.grantAmount === 1 ? 'credit' : 'credits'}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap text-[10px] text-[#313851]/40 font-bold uppercase tracking-wider">
            <span>{item.expiry_days || 30} Days Expiry</span>
            <span className="text-[#C2CBD3]">·</span>
            <span className="text-[#313851]/60">{item.redeemed || 0} redeemed</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#C2CBD3]/20 px-4 py-3 flex items-center justify-between bg-[#F6F3ED]/50">
        <div className="flex items-center gap-1.5">
          <GoldCoinIcon size={16} />
          <span className="font-bold text-[#313851]">{item.cost.toLocaleString()}</span>
        </div>

        <button
          onClick={() => onRedeem(item)}
          disabled={!canAfford || isLocked}
          className="relative rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 focus:outline-none"
          style={{
            ...((canAfford && !isLocked) ? {
              background: '#313851',
              color: '#F6F3ED',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(49,56,81,0.15)',
            } : {
              background: '#F6F3ED',
              color: '#313851/40',
              border: '1px solid #C2CBD3',
              cursor: 'not-allowed',
            }),
          }}
        >
          {isLocked ? (
            <span className="flex items-center gap-1.5">
              <LockSmallIcon />
              Locked
            </span>
          ) : !canAfford ? (
            <span className="flex items-center gap-1.5">
              <LockSmallIcon />
              Locked
            </span>
          ) : item.category === 'clam reward' ? (
            'CLAIM'
          ) : (
            'Redeem'
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default RewardCard;
