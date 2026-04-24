import React from 'react';

const emojis = [
  { label: 'Terrible', emoji: '😞', value: 1, color: 'text-red-500' },
  { label: 'Bad', emoji: '🙁', value: 2, color: 'text-orange-500' },
  { label: 'Neutral', emoji: '😐', value: 3, color: 'text-yellow-500' },
  { label: 'Good', emoji: '🙂', value: 4, color: 'text-green-500' },
  { label: 'Excellent', emoji: '🤩', value: 5, color: 'text-emerald-500' },
];

const EmojiScale = ({ value, onChange, label }) => {
  return (
    <div className="flex flex-col gap-4">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        {emojis.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`flex flex-col items-center gap-2 transition-all duration-300 transform ${
              value === item.value 
                ? 'scale-125' 
                : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-110'
            }`}
          >
            <span className="text-4xl">{item.emoji}</span>
            <span className={`text-xs font-semibold ${value === item.value ? item.color : 'text-gray-400'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiScale;
