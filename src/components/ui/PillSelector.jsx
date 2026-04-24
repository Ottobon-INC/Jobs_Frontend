import React from 'react';

const PillSelector = ({ options, value, onChange, label }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              value === option.value
                ? 'bg-black text-white border-black shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PillSelector;
