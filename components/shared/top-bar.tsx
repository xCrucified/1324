'use client';

import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { getOrders } from '@/app/actions';
import OrdersModal from './orders-modal';


interface Props {
  className?: string;
}

export const TopBar: React.FC<Props> = ({ className }) => {
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);

  // Подтягиваем количество заказов для быстрой проверки при клике на Track Order
  useEffect(() => {
    getOrders()
      .then((data) => setOrdersCount(data.length))
      .catch(() => setOrdersCount(0));
  }, [ordersOpen]);

  const handleTopBarClick = (item: string) => {
    if (item === "Track Order") {
      setOrdersOpen(true);
    } else if (item === "Sign In" || item === "Register") {
      alert(`${item} feature will be connected to database soon!`);
    } else if (item === "Help") {
      alert("Support: support@pentu24.com");
    }
  };

  return (
    <>
      <div className={cn("bg-bark text-parchment text-[0.71rem]", className)}>
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex gap-4 items-center font-body opacity-80">
            <span>
              Welcome to{" "}
              <strong className="text-wheat opacity-100">
                Pentu Market
              </strong>
            </span>
            <span className="hidden sm:inline opacity-40">|</span>
            <span className="hidden sm:inline">Free shipping over £40</span>
          </div>
          
          <div className="flex gap-5 items-center font-body">
            {["Track Order", "Help", "Sign In", "Register"].map((l) => (
              <button
                key={l}
                onClick={() => handleTopBarClick(l)}
                className="hover:text-wheat transition-colors opacity-80 hover:opacity-100 relative"
              >
                {l}
                {l === "Track Order" && ordersCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber text-cream rounded-full text-[9px] w-3 h-3 flex items-center justify-center font-bold">
                    {ordersCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Модалка заказов для кнопки Track Order */}
      <OrdersModal 
        isOpen={ordersOpen} 
        onClose={() => {
          setOrdersOpen(false);
          getOrders().then((data) => setOrdersCount(data.length));
        }} 
      />
    </>
  );
};

export default TopBar;