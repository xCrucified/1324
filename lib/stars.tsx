import React from 'react';
import { cn } from './utils';

interface Props {
  className?: string;
  rating?: number; 
}

export const Stars: React.FC<Props> = ({ className, rating = 0 }) => {

    return (
    <span className={cn(className, "flex gap-px")}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 10 10">
          <path
            d="M5 1l1.12 2.27L9 3.64 7 5.59l.47 2.73L5 7l-2.47 1.32L3 5.59 1 3.64l2.88-.37z"
            fill={i <= Math.round(rating) ? "#C07630" : "#E8D9B0"}
          />
        </svg>
      ))}
    </span>
  );

};

export default Stars;