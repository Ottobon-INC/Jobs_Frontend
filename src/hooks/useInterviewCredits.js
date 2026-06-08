import { useState, useEffect, useCallback, useMemo } from 'react';
import { generateUUID } from '../utils/uuid';

const STORAGE_KEY = 'ottobon_interview_credits';

const getInitialState = () => ({
  freeCreditsRemaining: 5,
  freeMatchCreditsRemaining: 5,
  purchasedCreditsRemaining: 0,
  purchasedHumanCreditsRemaining: 0,
  purchasedMatchCreditsRemaining: 0,
  totalUsed: 0,
  aiInterviewsUsed: 0,
  humanInterviewsUsed: 0,
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

export const useInterviewCredits = (userId) => {
  const STORAGE_KEY = userId ? `ottobon_interview_credits_${userId}` : 'ottobon_interview_credits_guest';

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
          if (typeof parsed.freeMatchCreditsRemaining !== 'number') {
            parsed.freeMatchCreditsRemaining = 5;
          }
          if (typeof parsed.purchasedHumanCreditsRemaining !== 'number') {
            parsed.purchasedHumanCreditsRemaining = 0;
          }
          if (typeof parsed.purchasedMatchCreditsRemaining !== 'number') {
            parsed.purchasedMatchCreditsRemaining = 0;
          }
          if (typeof parsed.aiInterviewsUsed !== 'number') {
            parsed.aiInterviewsUsed = 0;
          }
          if (typeof parsed.humanInterviewsUsed !== 'number') {
            parsed.humanInterviewsUsed = 0;
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
  }, [STORAGE_KEY]);

  // Dynamically update state when storage key (user ID) changes
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed.freeCreditsRemaining === 'number' &&
          typeof parsed.purchasedCreditsRemaining === 'number' &&
          Array.isArray(parsed.transactions)
        ) {
          if (typeof parsed.freeMatchCreditsRemaining !== 'number') {
            parsed.freeMatchCreditsRemaining = 5;
          }
          if (typeof parsed.purchasedHumanCreditsRemaining !== 'number') {
            parsed.purchasedHumanCreditsRemaining = 0;
          }
          if (typeof parsed.purchasedMatchCreditsRemaining !== 'number') {
            parsed.purchasedMatchCreditsRemaining = 0;
          }
          if (typeof parsed.aiInterviewsUsed !== 'number') {
            parsed.aiInterviewsUsed = 0;
          }
          if (typeof parsed.humanInterviewsUsed !== 'number') {
            parsed.humanInterviewsUsed = 0;
          }
          setState(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse interview credits storage on user switch:', e);
      }
    }
    
    // If not found or invalid, set and save initial state
    const defaultState = getInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    setState(defaultState);
  }, [STORAGE_KEY]);

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
  }, [state, STORAGE_KEY]);

  const saveState = useCallback((newState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setState(newState);
  }, [STORAGE_KEY]);

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
    let { 
      freeCreditsRemaining, 
      freeMatchCreditsRemaining = 5,
      purchasedCreditsRemaining, 
      purchasedHumanCreditsRemaining = 0, 
      purchasedMatchCreditsRemaining = 0, 
      totalUsed, 
      aiInterviewsUsed = 0,
      humanInterviewsUsed = 0,
      transactions 
    } = currentState;

    const isMatch = typeof interviewTitle === 'string' && interviewTitle.toLowerCase().includes('check match');

    if (isHuman) {
      if (purchasedHumanCreditsRemaining > 0) {
        purchasedHumanCreditsRemaining -= 1;
        humanInterviewsUsed += 1;
      } else {
        return { success: false, reason: 'no_credits' };
      }
    } else if (isMatch) {
      if (allowFree && freeMatchCreditsRemaining > 0) {
        freeMatchCreditsRemaining -= 1;
      } else if (purchasedMatchCreditsRemaining > 0) {
        purchasedMatchCreditsRemaining -= 1;
      } else {
        return { success: false, reason: 'no_credits' };
      }
    } else {
      if (allowFree && freeCreditsRemaining > 0) {
        freeCreditsRemaining -= 1;
        aiInterviewsUsed += 1;
      } else if (purchasedCreditsRemaining > 0) {
        purchasedCreditsRemaining -= 1;
        aiInterviewsUsed += 1;
      } else {
        return { success: false, reason: 'no_credits' };
      }
    }

    totalUsed += 1;
    const newTransaction = {
      id: generateUUID(),
      type: 'interview_used',
      amount: -1,
      description: isMatch ? `Check Match: ${interviewTitle}` : `${isHuman ? 'Human ' : ''}Mock Interview: ${interviewTitle}`,
      timestamp: new Date().toISOString()
    };

    const newState = {
      freeCreditsRemaining,
      freeMatchCreditsRemaining,
      purchasedCreditsRemaining,
      purchasedHumanCreditsRemaining,
      purchasedMatchCreditsRemaining,
      totalUsed,
      aiInterviewsUsed,
      humanInterviewsUsed,
      transactions: [newTransaction, ...transactions]
    };

    saveState(newState);
    return { success: true };
  }, [refreshFromStorage, saveState]);

  const addCredits = useCallback((amount, source = 'shop_purchase', description = 'Interview Credits Pack', creditType = 'ai') => {
    const currentState = refreshFromStorage();
    const { 
      freeCreditsRemaining, 
      freeMatchCreditsRemaining = 5,
      purchasedCreditsRemaining, 
      purchasedHumanCreditsRemaining = 0, 
      purchasedMatchCreditsRemaining = 0, 
      totalUsed, 
      transactions 
    } = currentState;

    const newTransaction = {
      id: generateUUID(),
      type: 'shop_purchase',
      amount: amount,
      description: description,
      timestamp: new Date().toISOString()
    };

    const newState = {
      freeCreditsRemaining,
      freeMatchCreditsRemaining,
      purchasedCreditsRemaining: creditType === 'ai' || creditType === 'ai_interview' ? purchasedCreditsRemaining + amount : purchasedCreditsRemaining,
      purchasedHumanCreditsRemaining: creditType === 'human' ? purchasedHumanCreditsRemaining + amount : purchasedHumanCreditsRemaining,
      purchasedMatchCreditsRemaining: creditType === 'ai_match' ? purchasedMatchCreditsRemaining + amount : purchasedMatchCreditsRemaining,
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
    let matchRedeemedCount = 0;

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
      } else if (lowerName.includes('match')) {
        matchRedeemedCount += 1;
      }
    });

    const currentState = refreshFromStorage();
    const { 
      freeCreditsRemaining, 
      freeMatchCreditsRemaining = 5,
      purchasedCreditsRemaining, 
      purchasedHumanCreditsRemaining = 0, 
      purchasedMatchCreditsRemaining = 0,
      totalUsed,
      transactions = []
    } = currentState;

    const aiUsedFree = Math.min(5, totalAiInterviewsTaken);
    const aiUsedPurchased = Math.max(0, totalAiInterviewsTaken - 5);
    const humanUsedPurchased = totalHumanInterviewsTaken;

    // Count Check Match scans locally from transactions
    const matchScansUsed = transactions.filter(t => t.type === 'interview_used' && t.description && t.description.toLowerCase().includes('check match')).length;

    const correctedFreeRemaining = Math.max(0, 5 - aiUsedFree);
    
    const matchUsedFree = Math.min(5, matchScansUsed);
    const matchUsedPurchased = Math.max(0, matchScansUsed - 5);
    const correctedFreeMatchRemaining = Math.max(0, 5 - matchUsedFree);

    const correctedAiPurchasedRemaining = Math.max(0, aiRedeemedCount - aiUsedPurchased);
    const correctedHumanPurchasedRemaining = Math.max(0, humanRedeemedCount - humanUsedPurchased);
    const correctedMatchPurchasedRemaining = Math.max(0, matchRedeemedCount - matchUsedPurchased);

    if (
      correctedAiPurchasedRemaining !== purchasedCreditsRemaining ||
      correctedHumanPurchasedRemaining !== purchasedHumanCreditsRemaining ||
      correctedMatchPurchasedRemaining !== purchasedMatchCreditsRemaining ||
      correctedFreeRemaining !== freeCreditsRemaining ||
      correctedFreeMatchRemaining !== freeMatchCreditsRemaining ||
      totalInterviewsTaken !== totalUsed
    ) {
      console.log('[InterviewCredits Sync] Reconciling with backend:', {
        totalInterviewsTaken,
        aiRedeemedCount,
        humanRedeemedCount,
        matchRedeemedCount,
        correctedFreeRemaining,
        correctedFreeMatchRemaining,
        correctedAiPurchasedRemaining,
        correctedHumanPurchasedRemaining,
        correctedMatchPurchasedRemaining
      });

      const newState = {
        ...currentState,
        freeCreditsRemaining: correctedFreeRemaining,
        freeMatchCreditsRemaining: correctedFreeMatchRemaining,
        purchasedCreditsRemaining: correctedAiPurchasedRemaining,
        purchasedHumanCreditsRemaining: correctedHumanPurchasedRemaining,
        purchasedMatchCreditsRemaining: correctedMatchPurchasedRemaining,
        totalUsed: totalInterviewsTaken,
        aiInterviewsUsed: totalAiInterviewsTaken,
        humanInterviewsUsed: totalHumanInterviewsTaken
      };
      saveState(newState);
    }
  }, [refreshFromStorage, saveState]);

  const totalCreditsRemaining = state.freeCreditsRemaining + (state.freeMatchCreditsRemaining || 0) + state.purchasedCreditsRemaining + (state.purchasedHumanCreditsRemaining || 0) + (state.purchasedMatchCreditsRemaining || 0);
  const hasFreeTrialRemaining = state.freeCreditsRemaining > 0 || state.freeMatchCreditsRemaining > 0;
  const isFirstTimeUser = state.totalUsed === 0 && state.freeCreditsRemaining === 5 && state.freeMatchCreditsRemaining === 5;

  // Development debugging helper object
  const creditDebug = useMemo(() => ({
    freeRemaining: state.freeCreditsRemaining,
    freeMatchRemaining: state.freeMatchCreditsRemaining || 0,
    purchasedRemaining: state.purchasedCreditsRemaining,
    purchasedHumanRemaining: state.purchasedHumanCreditsRemaining || 0,
    purchasedMatchRemaining: state.purchasedMatchCreditsRemaining || 0,
    totalRemaining: totalCreditsRemaining,
    totalGranted: 5 + state.transactions.reduce((acc, t) => t.type === 'shop_purchase' ? acc + t.amount : acc, 0),
    totalUsed: state.totalUsed
  }), [
    state.freeCreditsRemaining,
    state.freeMatchCreditsRemaining,
    state.purchasedCreditsRemaining,
    state.purchasedHumanCreditsRemaining,
    state.purchasedMatchCreditsRemaining,
    totalCreditsRemaining,
    state.transactions,
    state.totalUsed
  ]);

  useEffect(() => {
    console.debug('[InterviewCredits Debug]', creditDebug);
  }, [state, creditDebug]);

  return {
    freeCreditsRemaining: state.freeCreditsRemaining,
    freeMatchCreditsRemaining: state.freeMatchCreditsRemaining || 0,
    purchasedCreditsRemaining: state.purchasedCreditsRemaining,
    purchasedHumanCreditsRemaining: state.purchasedHumanCreditsRemaining || 0,
    purchasedMatchCreditsRemaining: state.purchasedMatchCreditsRemaining || 0,
    totalCreditsRemaining,
    totalUsed: state.totalUsed,
    aiInterviewsUsed: state.aiInterviewsUsed || 0,
    humanInterviewsUsed: state.humanInterviewsUsed || 0,
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
