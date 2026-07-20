import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  className?: string;
}

export const TopBar: React.FC<Props> = ({ className }) => {
  return (
     <div className={cn("bg-bark text-parchment text-[0.71rem]", className)}>
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
        <div className="flex gap-4 items-center font-body opacity-80">
          <span>
            Welcome to{" "}
            <strong className="text-wheat opacity-100">
              Thornfield Market
            </strong>
          </span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="hidden sm:inline">Free shipping over £40</span>
        </div>
        <div className="flex gap-5 items-center font-body">
          {["Track Order", "Help", "Sign In", "Register"].map((l) => (
            <button
              key={l}
              className="hover:text-wheat transition-colors opacity-80 hover:opacity-100"
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBar;