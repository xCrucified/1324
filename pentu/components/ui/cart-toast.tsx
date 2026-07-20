import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  className?: string;
  visible: boolean;
}

export const CartToast: React.FC<Props> = ({ className, visible }) => {

  return (
    <div
      className={cn(className, `fixed bottom-6 right-6 z-50 bg-bark text-wheat font-body text-sm px-5 py-3 rounded-sm shadow-lg flex items-center gap-2 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8l3.5 3.5L13 4"
          stroke="#F4E8C1"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Added to cart
    </div>
  );
};

export default CartToast;