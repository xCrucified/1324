'use client';

import React, { useEffect } from 'react';
import { useShopStore } from '@/store/use-shop';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SavedModal({ isOpen, onClose }: Props) {
  const { savedItems, toggleSave, addToCart } = useShopStore();

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
            Saved Items {savedItems.length > 0 && <span className="text-oak font-body text-sm font-normal ml-2">({savedItems.length})</span>}
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
          {savedItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center text-3xl">
                🤍
              </div>
              <div>
                <p className="font-display font-bold text-bark text-lg">No saved items</p>
                <p className="font-body text-oak text-sm mt-1">Tap the heart icon on products to save them for later.</p>
              </div>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            savedItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-ivory border border-parchment rounded-sm items-center">
                <div className="w-20 h-20 shrink-0 bg-parchment rounded-sm overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <h3 className="font-body font-bold text-bark text-sm leading-tight line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display font-bold text-amber">
                      €{item.price.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => {
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          originalPrice: item.price * 1.2,
                          img: item.img,
                          shop: item.shop,
                          sold: 0,
                          rating: 5,
                          reviews: 0
                        });
                        toggleSave(item);
                      }}
                      className="px-3 py-1 bg-caramel text-cream font-body text-xs rounded-sm hover:bg-amber transition-colors"
                    >
                      Move to Cart
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => toggleSave(item)}
                  className="text-oak hover:text-amber p-1 self-start"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}