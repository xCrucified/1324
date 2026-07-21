'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  className?: string;
  onAdd(): void;
  products: {
    id: string;
    title: string;
    price: number;
    image: string | null;
  }[];
}

function useCountdown(targetSeconds: number) {
  const [secs, setSecs] = useState(targetSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecs((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');

  return { h, m, s };
}

export const FlashSale: React.FC<Props> = ({
  className,
  onAdd,
  products,
}) => {
  const { h, m, s } = useCountdown(4 * 3600 + 22 * 60 + 18);

  const flashProducts = products.slice(0, 4);

  if (flashProducts.length === 0) return null;

  return (
    <section className={`max-w-7xl mx-auto px-3 mb-4 ${className ?? ''}`}>
      <div className="bg-ivory border border-parchment rounded-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-parchment bg-parchment">
          <div className="flex items-center gap-3">
            <span
              className="font-display text-bark font-bold"
              style={{ fontSize: '1.1rem' }}
            >
              ⚡ Flash Sale
            </span>

            <div className="flex items-center gap-1">
              <span className="font-body text-xs text-oak">
                Ends in
              </span>

              {[h, m, s].map((unit, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span
                    className="font-body text-cream bg-bark rounded px-1.5 py-0.5 tabular-nums"
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {unit}
                  </span>

                  {i < 2 && (
                    <span className="text-bark font-bold text-xs">
                      :
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <button className="font-body text-caramel text-xs hover:text-amber transition-colors">
            View all →
          </button>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-parchment">
          {flashProducts.map((product) => (
            <div
              key={product.id}
              className="bg-ivory p-3 group cursor-pointer"
            >
              <div
                className="relative overflow-hidden rounded-sm mb-2 bg-parchment"
                style={{ aspectRatio: '1 / 1' }}
              >
                <img
                  src={product.image || '/placeholder.png'}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <p className="font-body text-bark text-xs leading-snug mb-2 line-clamp-2">
                {product.title}
              </p>

              <div className="mb-3">
                <span
                  className="font-display text-amber font-bold"
                  style={{ fontSize: '1.05rem' }}
                >
                  €{product.price.toFixed(2)}
                </span>
              </div>

              <button
                onClick={onAdd}
                className="w-full font-body text-xs py-1.5 bg-parchment hover:bg-caramel hover:text-cream text-oak border border-oak transition-colors rounded-sm"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashSale;