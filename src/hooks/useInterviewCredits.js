import { useState, useEffect, useCallback } from 'react';
import { generateUUID } from '../utils/uuid';

const STORAGE_KEY = 'ottobon_interview_credits';

const getInitialState = () => ({
  freeCreditsRemaining: 5,
  purchasedCreditsRemaining: 0,
  purchasedHumanCreditsRemaining: 0,
  totalUsed: 0,
  transactions: [
    {
      id: generateUUID(),
      type: 'free_trial_grant',
      amount: 5,
      description: 'Welcome bonus',
      timestamp: new Date().toISOString()
    }
  ]
});

export const useInterviewCredits = () => {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed.freeCreditsRemaining === 'number' &&
          typeof parsed.purchasedCreditsRemaining === 'number' &&
          Array.isArray(parsed.transactions)
        ) {
          if (typeof parsed.purchasedHumanCreditsRemaining !== 'number') {
            parsed.purchasedHumanCreditsRemaining = 0;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse interview credits storage, resetting:', e);
    }
    return getInitialState();
  });

  // Sync state across multiple tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(parsed);
        } catch (err) {
          console.error('Error syncing credits storage across tabs:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Error refreshing credits from storage:', e);
    }
    return state;
  }, [state]);

  const saveState = useCallback((newState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setState(newState);
  }, []);

  const initializeCredits = useCallback(() => {
    const fresh = refreshFromStorage();
    if (!fresh) {
      const defaultState = getInitialState();
      saveState(defaultState);
      return defaultState;
    }
    return fresh;
  }, [refreshFromStorage, saveState]);

  const useCredit = useCallback((interviewTitle = 'Mock Interview', allowFree = true, isHuman = false) => {
    // Always refresh first to handle race conditions / multi-tab usages
    const currentState = refreshFromStorage();
    let { freeCreditsRemaining, purchasedCreditsRemaining, purchasedHumanCreditsRemaining = 0, totalUsed, transactions } = currentState;

    if (isHuman) {
      if (purchasedHumanCreditsRemaining > 0) {
        purchasedHumanCreditsRemaining -= 1;
      } else {
        return { success: false, reason: 'no_credits' };
      }
    } else {
      if (allowFree && freeCreditsRemaining > 0) {
        freeCreditsRemaining -= 1;
      } else if (purchasedCreditsRemaining > 0) {
        purchasedCreditsRemaining -= 1;
      } else {
        return { success: false, reason: 'no_credits' };
      }
    }

    totalUsed += 1;
    const newTransaction = {
      id: generateUUID(),
      type: 'interview_used',
      amount: -1,
      description: `${isHuman ? 'Human ' : ''}Mock Interview: ${interviewTitle}`,
      timestamp: new Date().toISOString()
    };

    const newState = {
      freeCreditsRemaining,
      purchasedCreditsRemaining,
      purchasedHumanCreditsRemaining,
      totalUsed,
      transactions: [newTransaction, ...transactions]
    };

    saveState(newState);
    return { success: true };
  }, [refreshFromStorage, saveState]);

  const addCredits = useCallback((amount, source = 'shop_purchase', description = 'Interview Credits Pack', creditType = 'ai') => {
    const currentState = refreshFromStorage();
    const { freeCreditsRemaining, purchasedCreditsRemaining, purchasedHumanCreditsRemaining = 0, totalUsed, transactions } = currentState;

    const newTransaction = {
      id: generateUUID(),
      type: 'shop_purchase',
      amount: amount,
      description: description,
      timestamp: new Date().toISOString()
    };

    const newState = {
      freeCreditsRemaining,
      purchasedCreditsRemaining: creditType === 'ai' ? purchasedCreditsRemaining + amount : purchasedCreditsRemaining,
      purchasedHumanCreditsRemaining: creditType === 'human' ? purchasedHumanCreditsRemaining + amount : purchasedHumanCreditsRemaining,
      totalUsed,
      transactions: [newTransaction, ...transactions]
    };

    saveState(newState);
  }, [refreshFromStorage, saveState]);

  const reconcileCredits = useCallback((backendRedemptions = [], aiInterviews = [], humanInterviews = []) => {
    const totalAiInterviewsTaken = aiInterviews.length;
    const totalHumanInterviewsTaken = humanInterviews.length;
    const totalInterviewsTaken = totalAiInterviewsTaken + totalHumanInterviewsTaken;
    
    let aiRedeemedCount = 0;
    let humanRedeemedCount = 0;

    backendRedemptions.forEach(h => {
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
      
      const lowerName = rewardName.toLowerCase();
      if (lowerName.includes('human mock')) {
        humanRedeemedCount += 1;
      } else if (lowerName.includes('mock interview')) {
        aiRedeemedCount += 1;
      }
    });

    const currentState = refreshFromStorage();
    const { freeCreditsRemaining, purchasedCreditsRemaining, purchasedHumanCreditsRemaining = 0, totalUsed } = currentState;

    const aiUsedFree = Math.min(5, totalAiInterviewsTaken);
    const aiUsedPurchased = Math.max(0, totalAiInterviewsTaken - 5);
    const humanUsedPurchased = totalHumanInterviewsTaken;

    const correctedFreeRemaining = Math.max(0, 5 - aiUsedFree);
    const correctedAiPurchasedRemaining = Math.max(0, aiRedeemedCount - aiUsedPurchased);
    const correctedHumanPurchasedRemaining = Math.max(0, humanRedeemedCount - humanUsedPurchased);

    if (
      correctedAiPurchasedRemaining !== purchasedCreditsRemaining ||
      correctedHumanPurchasedRemaining !== purchasedHumanCreditsRemaining ||
      correctedFreeRemaining !== freeCreditsRemaining ||
      totalInterviewsTaken !== totalUsed
    ) {
      console.log('[InterviewCredits Sync] Reconciling with backend:', {
        totalInterviewsTaken,
        aiRedeemedCount,
        humanRedeemedCount,
        correctedFreeRemaining,
        correctedAiPurchasedRemaining,
        correctedHumanPurchasedRemaining
      });

      const newState = {
        ...currentState,
        freeCreditsRemaining: correctedFreeRemaining,
        purchasedCreditsRemaining: correctedAiPurchasedRemaining,
        purchasedHumanCreditsRemaining: correctedHumanPurchasedRemaining,
        totalUsed: totalInterviewsTaken
      };
      saveState(newState);
    }
  }, [refreshFromStorage, saveState]);

  const totalCreditsRemaining = state.freeCreditsRemaining + state.purchasedCreditsRemaining + (state.purchasedHumanCreditsRemaining || 0);
  const hasFreeTrialRemaining = state.freeCreditsRemaining > 0;
  const isFirstTimeUser = state.totalUsed === 0 && state.freeCreditsRemaining === 5;

  // Development debugging helper object
  const creditDebug = {
    freeRemaining: state.freeCreditsRemaining,
    purchasedRemaining: state.purchasedCreditsRemaining,
    purchasedHumanRemaining: state.purchasedHumanCreditsRemaining || 0,
    totalRemaining: totalCreditsRemaining,
    totalGranted: 5 + state.transactions.reduce((acc, t) => t.type === 'shop_purchase' ? acc + t.amount : acc, 0),
    totalUsed: state.totalUsed
  };

  useEffect(() => {
    console.debug('[InterviewCredits Debug]', creditDebug);
  }, [state, creditDebug]);

  return {
    freeCreditsRemaining: state.freeCreditsRemaining,
    purchasedCreditsRemaining: state.purchasedCreditsRemaining,
    purchasedHumanCreditsRemaining: state.purchasedHumanCreditsRemaining || 0,
    totalCreditsRemaining,
    totalUsed: state.totalUsed,
    transactions: state.transactions,
    useCredit,
    addCredits,
    reconcileCredits,
    hasFreeTrialRemaining,
    isFirstTimeUser,
    initializeCredits,
    creditDebug
  };
};
