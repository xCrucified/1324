'use client';

import React, { useState, useEffect } from 'react';
import { useShopStore } from '@/store/use-shop';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, clearCart } = useShopStore();
  const [paddle, setPaddle] = useState<Paddle>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializePaddle({ 
      environment: 'sandbox', 
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN! 
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  const handleCheckout = () => {
    if (!paddle) {
      alert('Модуль оплаты еще загружается...');
      return;
    }

    setLoading(true);

    try {
      const paddleItems = items.map((item) => ({
        priceId: 'pri_01kyd62vsnj6dypqbjtz0qkgm2',
        quantity: item.quantity,
      }));

      paddle.Checkout.open({
        items: paddleItems,
        settings: {
          successUrl: `${window.location.origin}/`,
        }
      });
    } catch (error) {
      console.error('Ошибка Paddle Checkout:', error);
      alert('Не удалось запустить оплату.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center text-3xl mb-4">
          🛒
        </div>
        <h1 className="font-display font-bold text-2xl text-bark mb-2">Your cart is empty</h1>
        <Link 
          href="/"
          className="px-6 py-2.5 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10 px-4 relative">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="font-body text-xs text-oak hover:text-caramel transition-colors mb-6 inline-block">
          ← Back to Marketplace
        </Link>
        
        <h1 className="font-display font-bold text-3xl text-bark mb-8">Checkout</h1>

        <div className="bg-ivory border border-parchment p-6 rounded-sm space-y-6">
          <h2 className="font-display font-bold text-lg text-bark border-b border-parchment pb-2">
            Order Summary
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm font-body">
                <span className="text-oak">{item.name} x{item.quantity}</span>
                <span className="font-bold text-bark">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-parchment pt-4 space-y-2 font-body text-sm">
            <div className="flex justify-between text-bark font-bold text-base pt-2">
              <span>Total (Tax & VAT handled by Paddle)</span>
              <span className="text-amber">€{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || !paddle}
            className="w-full py-3.5 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Opening Checkout...' : 'Pay with Paddle'}
          </button>
        </div>
      </div>
    </div>
  );
}