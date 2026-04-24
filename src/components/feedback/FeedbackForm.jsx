import React, { useState } from 'react';
import EmojiScale from '../ui/EmojiScale';
import StarRating from '../ui/StarRating';
import PillSelector from '../ui/PillSelector';

const FeedbackForm = ({ type, onDataChange, initialData = {} }) => {
  const [data, setData] = useState({
    rating: 3,
    feedback_text: '',
    meta: {},
    ...initialData
  });

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onDataChange(newData);
  };

  const handleMetaChange = (key, value) => {
    const newMeta = { ...data.meta, [key]: value };
    const newData = { ...data, meta: newMeta };
    setData(newData);
    onDataChange(newData);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Universal Base Rating */}
      <EmojiScale
        label={type === 'job_platform' ? 'Overall Platform Experience' : 'Overall Interview Experience'}
        value={data.rating}
        onChange={(val) => handleChange('rating', val)}
      />

      {/* Context Specific Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {type === 'job_platform' ? (
          <>
            <StarRating
              label="Job Relevance (1-5)"
              value={data.meta.relevance || 0}
              onChange={(val) => handleMetaChange('relevance', val)}
            />
            <StarRating
              label="UI/UX Experience (1-5)"
              value={data.meta.ux_rating || 0}
              onChange={(val) => handleMetaChange('ux_rating', val)}
            />
            <PillSelector
              label="Was Job Search Easy?"
              options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
              value={data.meta.search_easy}
              onChange={(val) => handleMetaChange('search_easy', val)}
            />
            <PillSelector
              label="Recommendations Accurate?"
              options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
              value={data.meta.recommendations_accurate}
              onChange={(val) => handleMetaChange('recommendations_accurate', val)}
            />
          </>
        ) : (
          <>
            <PillSelector
              label="Interview Difficulty"
              options={[
                { label: 'Easy', value: 'easy' },
                { label: 'Medium', value: 'medium' },
                { label: 'Hard', value: 'hard' }
              ]}
              value={data.meta.difficulty}
              onChange={(val) => handleMetaChange('difficulty', val)}
            />
            <StarRating
              label="Communication Clarity (1-5)"
              value={data.meta.comm_rating || 0}
              onChange={(val) => handleMetaChange('comm_rating', val)}
            />
            <PillSelector
              label="How did you feel during the interview?"
              options={[
                { label: '😨 Nervous', value: 'nervous' },
                { label: '🙂 Comfortable', value: 'comfortable' },
                { label: '😎 Confident', value: 'confident' }
              ]}
              value={data.meta.feeling}
              onChange={(val) => handleMetaChange('feeling', val)}
            />
          </>
        )}
      </div>

      {/* Universal Feedback Text */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          {type === 'job_platform' ? 'What did you like about the platform?' : 'What went well during the session?'}
        </label>
        <textarea
          className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none min-h-[120px] transition-all"
          placeholder="Share your highlights (minimum 3 characters)..."
          value={data.feedback_text}
          onChange={(e) => handleChange('feedback_text', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Suggestions for Improvement</label>
        <textarea
          className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none min-h-[80px] transition-all"
          placeholder="Add dark mode for the dashboard, improve AI response speed, etc..."
          value={data.meta.suggestions || ''}
          onChange={(e) => handleMetaChange('suggestions', e.target.value)}
        />
      </div>
    </div>
  );
};

export default FeedbackForm;
