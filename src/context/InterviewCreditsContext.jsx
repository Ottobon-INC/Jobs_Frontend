import { createContext, useContext, useEffect } from 'react';
import { useInterviewCredits } from '../hooks/useInterviewCredits';
import { useAuth } from '../hooks/useAuth';
import { getMyRedemptions } from '../api/rewardsApi';
import { getMyMockInterviews } from '../api/mockInterviewApi';

const InterviewCreditsContext = createContext(null);

export const InterviewCreditsProvider = ({ children }) => {
  const credits = useInterviewCredits();
  const { session } = useAuth();

  // Seed on mount
  useEffect(() => {
    credits.initializeCredits();
  }, []);

  // Dynamically reconcile purchased credits count with backend redemptions and completed interviews
  useEffect(() => {
    if (session?.user?.id) {
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
          credits.reconcileCredits(redemptions, aiInterviews, humanInterviews);
        })
        .catch((err) => {
          console.error('[InterviewCredits Provider] Failed to auto-reconcile with backend:', err);
        });
    }
  }, [session, credits.reconcileCredits]);

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
