import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Star, 
  MessageSquare, 
  Layout, 
  ChevronDown, 
  RotateCw,
  Users,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { feedbackApi } from '../../api/feedbackApi';
import { useNotifications } from '../../context/NotificationContext';

const FeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    rating: '',
    search: ''
  });
  const [expandedId, setExpandedId] = useState(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchFeedbacks();
  }, [filters.type, filters.rating]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.rating) params.rating = filters.rating;
      
      const response = await feedbackApi.getAllForAdmin(params);
      setFeedbacks(response.data);
    } catch (error) {
      addNotification({ title: 'Error', message: 'Failed to fetch feedbacks', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: feedbacks.length,
    avgRating: feedbacks.length > 0 
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) 
      : 0,
    mockCount: feedbacks.filter(f => f.type === 'mock_interview').length,
    platformCount: feedbacks.filter(f => f.type === 'job_platform').length
  };

  const filteredFeedbacks = feedbacks.filter(f => 
    f.feedback_text.toLowerCase().includes(filters.search.toLowerCase()) ||
    (f.user_full_name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
    (f.user_email || '').toLowerCase().includes(filters.search.toLowerCase())
  );

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {label === 'Avg Rating' && <span className="text-gray-400 font-medium">/5</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black rounded-2xl shadow-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Feedback Intelligence</h1>
          </div>
          <p className="text-gray-400 font-medium tracking-tight uppercase text-xs">Sentiment Analysis & User Experience Insights</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search feedback..."
              className="pl-12 pr-6 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none w-64 shadow-sm"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <button 
            onClick={fetchFeedbacks}
            className="p-3 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Feedback" value={stats.total} icon={MessageSquare} color="bg-gray-100 text-gray-900" />
        <StatCard label="Avg Rating" value={stats.avgRating} icon={Star} color="bg-yellow-50 text-yellow-500" />
        <StatCard label="Mock Interviews" value={stats.mockCount} icon={Users} color="bg-blue-50 text-blue-500" />
        <StatCard label="Platform Feedback" value={stats.platformCount} icon={Briefcase} color="bg-purple-50 text-purple-500" />
      </div>

      {/* Filters & List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mr-4">
            <Filter size={14} />
            Filters
          </div>
          
          <select
            className="px-4 py-2 bg-gray-50 rounded-xl border-none text-sm font-semibold focus:ring-2 focus:ring-black outline-none"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="job_platform">Job Platform</option>
            <option value="mock_interview">Mock Interview</option>
          </select>

          <select
            className="px-4 py-2 bg-gray-50 rounded-xl border-none text-sm font-semibold focus:ring-2 focus:ring-black outline-none"
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map(r => (
              <option key={r} value={r}>{r} Stars</option>
            ))}
          </select>
        </div>

        <div className="divide-y divide-gray-50">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No feedback found matching your criteria.</div>
          ) : (
            filteredFeedbacks.map((item) => (
              <div key={item.id} className="group">
                <div 
                  className={`p-6 hover:bg-gray-50/50 transition-all cursor-pointer flex items-center justify-between ${expandedId === item.id ? 'bg-gray-50/50' : ''}`}
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
                      {item.user_full_name ? item.user_full_name.charAt(0).toUpperCase() : <Users size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.user_full_name || 'Anonymous'}</h4>
                      <p className="text-xs text-gray-400 font-medium">{item.user_email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'mock_interview' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {item.type.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>

                    <span className="text-xs text-gray-400 w-24 text-right">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>

                    <ChevronDown size={18} className={`text-gray-300 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden bg-gray-50/30 px-6 pb-6"
                  >
                    <div className="ml-14 p-6 bg-white rounded-2xl border border-gray-100 space-y-6 shadow-sm">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Feedback Narrative</span>
                        <p className="text-gray-700 leading-relaxed italic">"{item.feedback_text}"</p>
                      </div>

                      {item.meta && Object.keys(item.meta).length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                          {Object.entries(item.meta).map(([key, value]) => (
                            key !== 'suggestions' && (
                              <div key={key} className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                  {key.replace('_', ' ')}
                                </span>
                                <p className="text-sm font-bold text-gray-900 capitalize">
                                  {typeof value === 'number' ? `${value} Stars` : value}
                                </p>
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {item.meta?.suggestions && (
                        <div className="pt-6 border-t border-gray-50 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Proposed Improvements</span>
                          <p className="text-sm text-gray-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                            {item.meta.suggestions}
                          </p>
                        </div>
                      )}

                      {(item.interview_id || item.job_id) && (
                        <div className="pt-4 flex justify-end">
                          <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-all">
                            View Related Record
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackDashboard;
