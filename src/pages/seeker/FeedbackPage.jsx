import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, MessageSquare, History, CheckCircle2, ChevronRight, ChevronLeft, Send } from 'lucide-react';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import { feedbackApi } from '../../api/feedbackApi';
import { useNotifications } from '../../context/NotificationContext';

const FeedbackPage = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [step, setStep] = useState(1);
  const [platformData, setPlatformData] = useState({ rating: 3, feedback_text: '', meta: {} });
  const [mockData, setMockData] = useState({ rating: 3, feedback_text: '', meta: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await feedbackApi.getMyHistory();
      setHistory(response.data);
    } catch (error) {
      addNotification({ title: 'Error', message: 'Failed to fetch feedback history', type: 'error' });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Step 1: Submit platform feedback
      await feedbackApi.submit({ ...platformData, type: 'job_platform' });
      
      // Step 2: Submit mock interview feedback
      await feedbackApi.submit({ ...mockData, type: 'mock_interview' });

      setSubmitted(true);
      addNotification({ title: 'Success', message: 'Thank you for your insights!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (data) => {
    return data.rating > 0 && data.feedback_text.length >= 3;
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-green-500" size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Insights Received!</h2>
            <p className="text-gray-500">Your feedback helps us build a better Ottobon for everyone.</p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setActiveTab('history');
            }}
            className="mt-4 px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all"
          >
            View History
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black rounded-2xl shadow-lg shadow-black/10">
              <MessageSquare className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Feedback Center</h1>
          </div>
          <p className="text-gray-500 font-medium tracking-tight uppercase text-xs">Share & track your insights</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100/50 p-1 rounded-full border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'new' ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-gray-500 hover:text-black'
            }`}
          >
            <Send size={16} />
            Share New
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'history' ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-gray-500 hover:text-black'
            }`}
          >
            <History size={16} />
            My History
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'new' ? (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden"
          >
            {/* Wizard Header / Progress */}
            <div className="bg-gray-50/50 border-b border-gray-100 p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                        step === i
                          ? 'bg-black text-white scale-110 shadow-lg shadow-black/20'
                          : step > i
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-300 border border-gray-200'
                      }`}
                    >
                      {step > i ? <CheckCircle2 size={18} /> : i}
                    </div>
                    {i === 1 && (
                      <div className={`w-12 h-px mx-2 ${step > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Intelligence</p>
                <p className="font-bold text-gray-900">
                  {step === 1 ? 'Platform Performance' : 'Mock Interview Flow'}
                </p>
              </div>
            </div>

            <div className="p-8 md:p-12">
              {step === 1 ? (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Layout size={20} className="text-gray-900" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Platform Experience</h2>
                      <p className="text-sm text-gray-500">Rate our portal and search intelligence</p>
                    </div>
                  </div>
                  <FeedbackForm
                    type="job_platform"
                    initialData={platformData}
                    onDataChange={setPlatformData}
                  />
                  <div className="mt-12 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!isStepValid(platformData)}
                      className="flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next Step
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <MessageSquare size={20} className="text-gray-900" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Mock Interview Experience</h2>
                      <p className="text-sm text-gray-500">Evaluate your recent practice session</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="mb-6 flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-all"
                  >
                    <ChevronLeft size={14} />
                    Back to Platform
                  </button>
                  <FeedbackForm
                    type="mock_interview"
                    initialData={mockData}
                    onDataChange={setMockData}
                  />
                  <div className="mt-12 flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={!isStepValid(mockData) || isSubmitting}
                      className="flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubmitting ? 'Sending...' : 'Submit All Insights'}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {isLoadingHistory ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                <p className="text-gray-400 font-medium">Loading your insights...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white p-20 rounded-[2rem] border border-dashed border-gray-200 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <History className="text-gray-300" size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">No History Yet</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">Start by sharing your first feedback to help us improve.</p>
                </div>
                <button
                  onClick={() => setActiveTab('new')}
                  className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold"
                >
                  Share Now
                </button>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        item.type === 'mock_interview' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                      }`}>
                        {item.type === 'mock_interview' ? <MessageSquare size={18} /> : <Layout size={18} />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {item.type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${i < item.rating ? 'bg-yellow-400' : 'bg-gray-100'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">"{item.feedback_text}"</p>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackPage;
