import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import CoinBalance from '../../components/rewards/CoinBalance';
import DailyStreak from '../../components/rewards/DailyStreak';
import CoinShop from '../../components/rewards/CoinShop';
import RedeemModal from '../../components/rewards/RedeemModal';
import RedemptionHistory from '../../components/rewards/RedemptionHistory';
import { useInterviewCreditsContext } from '../../context/InterviewCreditsContext';
import {
  getRewardsState,
  claimDailyReward,
  getRewardItems,
  redeemReward,
  getMyRedemptions
} from '../../api/rewardsApi';

const RewardsPage = () => {
  const { addCredits, syncCreditsWithBackend, redemptions: history } = useInterviewCreditsContext();

  // State
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [rewardsState, setRewardsState] = useState({
    coin_balance: 0,
    streak_data: [],
    current_streak: 0,
    can_claim_today: false,
  });
  const isClaimingRef = useRef(false);
  const [shopItems, setShopItems] = useState([]);
  const [coinDelta, setCoinDelta] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [modalItem, setModalItem] = useState(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [stateRes, itemsRes] = await Promise.all([
        getRewardsState(),
        getRewardItems()
      ]);
      setRewardsState(stateRes);
      setShopItems(itemsRes.items || []);
      // Sync credits & redemptions with backend
      await syncCreditsWithBackend();
    } catch (error) {
      console.error('Failed to fetch rewards data:', error);
      toast.error('Could not load rewards. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [syncCreditsWithBackend]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleClaim = useCallback(async () => {
    if (isClaiming || isClaimingRef.current || !rewardsState.can_claim_today) return;

    setIsClaiming(true);
    isClaimingRef.current = true;
    try {
      const result = await claimDailyReward();
      setCoinDelta(result.coins_awarded);

      // Refresh state from server to be safe
      const newState = await getRewardsState();
      setRewardsState(newState);

      toast.success(`Claimed ${result.coins_awarded} coins!`);

      // Clear delta after animation
      setTimeout(() => setCoinDelta(0), 3000);
    } catch (error) {
      const errorDetail = error.response?.data?.detail || 'Failed to claim reward';
      if (errorDetail.toLowerCase().includes('already claimed')) {
        // Just refresh the state if they already claimed it (e.g. double click or stale tab)
        const newState = await getRewardsState();
        setRewardsState(newState);
      } else {
        toast.error(errorDetail);
      }
    } finally {
      setIsClaiming(false);
      isClaimingRef.current = false;
    }
  }, [isClaiming, rewardsState.can_claim_today]);

  const handleWeekChange = useCallback((dir) => {
    setWeekOffset(prev => Math.min(0, prev + dir));
  }, []);

  const handleOpenRedeem = useCallback((item) => {
    setModalItem(item);
  }, []);

  const handleConfirmRedeem = useCallback(async (item, quantity = 1) => {
    try {
      const result = await redeemReward(item.id, quantity);
      toast.success(quantity > 1 ? `Successfully redeemed ${quantity} x ${item.name}!` : `Successfully redeemed ${item.name}!`);
 
      // Detect if this is a mock interview session and add interview credits!
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
      
      const multiplier = (item.grantAmount || 1) * quantity;
      
      if (isAiMock) {
        addCredits(multiplier, 'shop_purchase', `Redeemed: ${item.name}`, 'ai_interview');
        toast.success(`Added ${multiplier} AI Interview credit${multiplier > 1 ? 's' : ''} to your balance!`);
      } else if (isAiMatch) {
        addCredits(multiplier, 'shop_purchase', `Redeemed: ${item.name}`, 'ai_match');
        toast.success(`Added ${multiplier} AI Match credit${multiplier > 1 ? 's' : ''} to your balance!`);
      } else if (isHumanMock) {
        addCredits(multiplier, 'shop_purchase', `Redeemed: ${item.name}`, 'human');
        toast.success(`Added ${multiplier} Human interview credit${multiplier > 1 ? 's' : ''} to your balance!`);
      }
 
      // Refresh all data to update balance and history
      fetchData();
      setModalItem(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Redemption failed');
      throw error; // Let modal handle processing state
    }
  }, [fetchData, addCredits]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-[#D45B34]/20 border-t-[#D45B34] rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24 sm:pb-8"
      style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-sans)' }}
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C1A17] mb-2 tracking-tight">Rewards Shop</h1>
          <p className="text-base text-[#1C1A17]/70 font-medium">Earn coins daily & redeem for premium job-seeking perks</p>
        </motion.div>

        {/* Coin Balance */}
        <CoinBalance balance={rewardsState.coin_balance} coinDelta={coinDelta} />

        {/* Daily Streak */}
        <DailyStreak
          streakData={weekOffset === 0 ? rewardsState.streak_data : rewardsState.streak_data.map(d => ({ ...d, status: 'completed', isToday: false }))}
          onClaim={handleClaim}
          isClaiming={isClaiming}
          weekOffset={weekOffset}
          onWeekChange={handleWeekChange}
          buttonState={!rewardsState.can_claim_today ? 'claimed' : 'claimable'}
        />

        {/* Coin Shop */}
        <CoinShop
          items={shopItems}
          coinBalance={rewardsState.coin_balance}
          onRedeem={handleOpenRedeem}
          history={history}
        />

        <RedemptionHistory
          history={history.map(h => {
            let rewardName = '';
            if (h.rewardName) {
              rewardName = h.rewardName;
            } else if (h.reward_items) {
              if (Array.isArray(h.reward_items)) {
                rewardName = h.reward_items[0]?.name || '';
              } else {
                rewardName = h.reward_items.name || '';
              }
            }
            if (!rewardName) {
              rewardName = 'Unknown Reward';
            }
            return {
              id: h.id,
              date: h.redeemed_at,
              rewardName: rewardName,
              coinsSpent: h.coins_spent,
              status: h.status
            };
          })}
        />
      </div>

      {/* Redeem Modal */}
      <RedeemModal
        isOpen={!!modalItem}
        onClose={() => setModalItem(null)}
        item={modalItem}
        coinBalance={rewardsState.coin_balance}
        onConfirm={handleConfirmRedeem}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RewardsPage;
