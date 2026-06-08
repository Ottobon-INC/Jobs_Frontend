import { createContext, useContext, useEffect, useRef } from 'react';
import { useInterviewCredits } from '../hooks/useInterviewCredits';
import { useAuth } from '../hooks/useAuth';
import { getMyRedemptions } from '../api/rewardsApi';
import { getMyMockInterviews } from '../api/mockInterviewApi';

const InterviewCreditsContext = createContext(null);

export const InterviewCreditsProvider = ({ children }) => {
  const { session, user } = useAuth();
  const userId = user?.id || session?.user?.id || null;
  const credits = useInterviewCredits(userId);

  // Seed on mount
  useEffect(() => {
    credits.initializeCredits();
  }, []);

  // Use a ref to store the latest reconcileCredits function
  // to avoid infinite re-render loops since reconcileCredits updates state
  const reconcileCreditsRef = useRef(credits.reconcileCredits);
  useEffect(() => {
    reconcileCreditsRef.current = credits.reconcileCredits;
  }, [credits.reconcileCredits]);

  // Dynamically reconcile purchased credits count with backend redemptions and completed interviews
  useEffect(() => {
    if (userId) {
      Promise.all([
        getMyRedemptions(), 
        getMyMockInterviews(),
        import('../api/humanMockInterviewApi').then(m => m.getMyHumanMockInterviews())
      ])
        .then(([redemptionsRes, aiInterviewsRes, humanInterviewsRes]) => {
          const redemptions = redemptionsRes.redemptions || [];
          const aiInterviews = aiInterviewsRes || [];
          const humanInterviews = humanInterviewsRes || [];
          
          // Pass AI and Human mock interviews separately to handle free credit deduction correctly
          reconcileCreditsRef.current(redemptions, aiInterviews, humanInterviews);
        })
        .catch((err) => {
          console.error('[InterviewCredits Provider] Failed to auto-reconcile with backend:', err);
        });
    }
  }, [userId]);

  return (
    <InterviewCreditsContext.Provider value={credits}>
      {children}
    </InterviewCreditsContext.Provider>
  );
};

export const useInterviewCreditsContext = () => {
  const context = useContext(InterviewCreditsContext);
  if (!context) {
    throw new Error('useInterviewCreditsContext must be used within an InterviewCreditsProvider');
  }
  return context;
};
