import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import RewardCard from './RewardCard';

const ShoppingBagIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const CoinShop = ({ items = [], coinBalance, onRedeem, history = [] }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filterTabs = useMemo(() => {
    const categories = new Set(items.map(item => item.category));
    return ['All', ...Array.from(categories).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') return items;
    return items.filter(item => item.category === activeFilter);
  }, [activeFilter, items]);

  const getCategoryCount = (category) => {
    if (category === 'All') return items.length;
    return items.filter(item => item.category === category).length;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-5 text-[#313851]">
        <ShoppingBagIcon />
        <h2 className="text-lg sm:text-xl font-bold">Reward Shop</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {filterTabs.map((tab) => {
          const count = getCategoryCount(tab);
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 focus:outline-none"
              style={{
                ...(isActive ? {
                  background: '#313851',
                  color: '#F6F3ED',
                  boxShadow: '0 4px 12px rgba(49,56,81,0.2)',
                } : {
                  background: '#F6F3ED',
                  color: '#313851',
                  border: '1px solid #C2CBD3',
                }),
              }}
            >
              {tab}
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#ffffff',
                  color: isActive ? '#fff' : '#313851/60',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((item, index) => {
            const isClamReward = item.category === 'clam reward' || item.category === 'Claim Reward';
            const isLocked = isClamReward && history.some(h => {
              if (h.reward_item_id !== item.id) return false;
              const date = new Date(h.created_at);
              const now = new Date();
              return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
            });
            const canAfford = isClamReward ? true : coinBalance >= item.cost;
            return (
              <RewardCard
                key={item.id}
                item={item}
                index={index}
                canAfford={canAfford}
                isLocked={isLocked}
                onRedeem={onRedeem}
              />
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-[#C2CBD3]/40 p-10 text-center shadow-sm"
          style={{ background: '#ffffff' }}
        >
          <div className="flex justify-center mb-3 text-[#313851]/20">
            <ShoppingBagIcon />
          </div>
          <p className="text-[#313851]/60 text-sm font-semibold">
            {items.length === 0 ? "The shop is currently empty." : `No items found in "${activeFilter}".`}<br />
            <span className="text-[#313851]/40 text-xs font-bold uppercase tracking-widest">Check back soon for new rewards!</span>
          </p>
        </motion.div>
      )}
    </motion.section>
  );
};

export default CoinShop;
