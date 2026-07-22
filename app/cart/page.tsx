'use client';

import React from 'react';
import Link from 'next/link';
import { useShopStore } from '@/store/use-shop';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useShopStore();

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-display font-bold text-bark mb-4">Your Cart is Empty</h2>
        <p className="text-oak font-body mb-8">Looks like you haven`t added anything yet.</p>
        <Link 
          href="/" 
          className="bg-caramel text-cream px-6 py-3 rounded-sm font-bold hover:bg-amber transition-colors"
        >
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-display font-bold text-bark mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex gap-4 p-4 bg-ivory border border-parchment rounded-sm"
              style={{ boxShadow: "0 1px 4px rgba(30,15,6,0.02)" }}
            >
              <div className="w-24 h-24 shrink-0 bg-parchment rounded-sm overflow-hidden">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-body font-bold text-bark leading-tight line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-oak text-xs mt-1">Shop: {item.shop}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-parchment rounded-sm bg-cream">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1 text-bark hover:bg-parchment transition-colors font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-body text-sm font-bold border-x border-parchment">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-bark hover:bg-parchment transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display font-bold text-amber">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-oak hover:text-caramel text-sm transition-colors font-body"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-ivory border border-parchment rounded-sm p-6 sticky top-24 shadow-sm">
            <h2 className="font-display font-bold text-bark text-xl mb-4">Order Summary</h2>
            
            <div className="space-y-3 font-body text-sm text-bark mb-6 border-b border-parchment pb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-sage font-bold">Free</span>
              </div>
            </div>
            
            <div className="flex justify-between font-display font-bold text-xl text-bark mb-6">
              <span>Total</span>
              <span className="text-amber">€{total.toFixed(2)}</span>
            </div>
            
            <button className="w-full bg-bark text-cream py-3 rounded-sm font-bold hover:bg-caramel transition-colors">
              Proceed to Checkout
            </button>
            
            <button 
              onClick={clearCart}
              className="w-full mt-4 font-body text-oak text-sm hover:text-bark transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}