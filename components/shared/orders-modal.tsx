/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getOrders } from '@/app/actions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrdersModal({ isOpen, onClose }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Загружаем заказы из базы данных при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getOrders()
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-bark/40 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-cream shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-parchment bg-ivory">
          <h2 className="font-display font-bold text-xl text-bark">
            My Orders {!loading && orders.length > 0 && <span className="text-oak font-body text-sm font-normal ml-2">({orders.length})</span>}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-oak hover:text-caramel hover:bg-parchment rounded-full transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
              <p className="font-body text-oak text-sm">Loading orders from database...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center text-3xl">
                📦
              </div>
              <div>
                <p className="font-display font-bold text-bark text-lg">No orders yet</p>
                <p className="font-body text-oak text-sm mt-1">When you place orders, they will appear here.</p>
              </div>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 bg-ivory border border-parchment rounded-sm space-y-3">
                <div className="flex justify-between items-center border-b border-parchment pb-2">
                  <span className="font-body font-bold text-bark text-xs">Order #{order.id.slice(-6)}</span>
                  <span className={`font-body text-xs px-2 py-0.5 rounded-sm font-bold ${
                    order.status === 'Delivered' ? 'bg-sage text-cream' : 'bg-parchment text-oak'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between font-body text-xs text-oak">
                  <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>Items: {order.itemsCount}</span>
                </div>
                <div className="font-body text-xs text-oak">
                  <p>Deliver to: <strong className="text-bark">{order.city}, {order.address}</strong></p>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-parchment/50">
                  <span className="font-body text-xs text-oak">Total amount:</span>
                  <span className="font-display font-bold text-amber text-base">€{order.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}