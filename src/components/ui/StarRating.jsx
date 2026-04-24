import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value, onChange, label, max = 5 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex gap-1">
        {[...Array(max)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={index}
              type="button"
              className="focus:outline-none transition-transform active:scale-90"
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                size={24}
                className={`transition-colors duration-200 ${
                  starValue <= (hover || value)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StarRating;
