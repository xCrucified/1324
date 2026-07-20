'use client';
import React, { useEffect, useState } from 'react';
import BadgePill from '../ui/badge-pill';

interface Props {
  className?: string;
  onAdd(): void;
}

function useCountdown(targetSeconds: number) {
  const [secs, setSecs] = useState(targetSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return { h, m, s };
}


type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  sold: number;
  rating: number;
  reviews: number;
  shop: string;
  img: string;
  badge?: string;
  freeShip?: boolean;
};

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Handthrown Stoneware Mug — Wheat Glaze",
    price: 18.9,
    originalPrice: 26.0,
    sold: 4832,
    rating: 4.9,
    reviews: 612,
    shop: "Harrow Ceramics Studio",
    img: "https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=400&fit=crop&auto=format",
    badge: "HOT",
    freeShip: true,
  },
  {
    id: 2,
    name: "Linen Table Runner — Natural Undyed",
    price: 14.5,
    originalPrice: 22.0,
    sold: 2105,
    rating: 4.8,
    reviews: 388,
    shop: "Wold & Weft",
    img: "https://images.unsplash.com/photo-1591625591034-75d303d2e1a4?w=400&h=400&fit=crop&auto=format",
    badge: "NEW",
    freeShip: true,
  },
  {
    id: 3,
    name: "Beeswax Pillar Candle Set of 3",
    price: 22.0,
    sold: 3210,
    rating: 4.9,
    reviews: 540,
    shop: "Meadow & Wick",
    img: "https://images.unsplash.com/photo-1733127040689-0e8a2823e391?w=400&h=400&fit=crop&auto=format",
    freeShip: true,
  },
  {
    id: 4,
    name: "Pressed Wildflower Gift Wrap — 5 Sheets",
    price: 8.4,
    originalPrice: 12.0,
    sold: 1876,
    rating: 4.7,
    reviews: 203,
    shop: "The Paper Hedgerow",
    img: "https://images.unsplash.com/photo-1706641248702-6ff0a3d2812d?w=400&h=400&fit=crop&auto=format",
    badge: "30% OFF",
  },
  {
    id: 5,
    name: "Acacia Serving Board — Hand-oiled",
    price: 31.0,
    originalPrice: 44.0,
    sold: 987,
    rating: 4.8,
    reviews: 176,
    shop: "Thornwood Workshop",
    img: "https://images.unsplash.com/photo-1666013942797-9daa4b8b3b4f?w=400&h=400&fit=crop&auto=format",
    freeShip: true,
  },
  {
    id: 6,
    name: "Single-Origin Ground Coffee — 250 g",
    price: 12.8,
    sold: 6540,
    rating: 4.9,
    reviews: 1102,
    shop: "Thornfield Roastery",
    img: "https://images.unsplash.com/photo-1563311977-d285756282dc?w=400&h=400&fit=crop&auto=format",
    badge: "TOP",
    freeShip: true,
  },
  {
    id: 7,
    name: "White Ceramic Pour-Over Dripper",
    price: 24.0,
    originalPrice: 32.0,
    sold: 1430,
    rating: 4.7,
    reviews: 211,
    shop: "Harrow Ceramics Studio",
    img: "https://images.unsplash.com/photo-1536936812504-0e77dc3f0b40?w=400&h=400&fit=crop&auto=format",
    freeShip: true,
  },
  {
    id: 8,
    name: "Natural Jute Tote Bag — Market Size",
    price: 9.9,
    originalPrice: 14.0,
    sold: 5201,
    rating: 4.6,
    reviews: 834,
    shop: "Wold & Weft",
    img: "https://images.unsplash.com/photo-1588610992315-5654831ceebd?w=400&h=400&fit=crop&auto=format",
    badge: "SALE",
  },
  {
    id: 9,
    name: "Tealight Candle Holder — Turned Oak",
    price: 16.5,
    sold: 742,
    rating: 4.8,
    reviews: 98,
    shop: "Thornwood Workshop",
    img: "https://images.unsplash.com/photo-1574200542287-4a5ee8b5ed4f?w=400&h=400&fit=crop&auto=format",
    freeShip: true,
  },
  {
    id: 10,
    name: "Dried Herb Bunch — Lavender & Chamomile",
    price: 7.2,
    sold: 3340,
    rating: 4.9,
    reviews: 479,
    shop: "The Paper Hedgerow",
    img: "https://images.unsplash.com/photo-1604304194650-3ba3cfa752fd?w=400&h=400&fit=crop&auto=format",
    freeShip: true,
  },
  {
    id: 11,
    name: "Woven Wool Throw — Oat & Flax Stripe",
    price: 58.0,
    originalPrice: 74.0,
    sold: 612,
    rating: 4.9,
    reviews: 145,
    shop: "Wold & Weft",
    img: "https://images.unsplash.com/photo-1634665810235-011d663754e7?w=400&h=400&fit=crop&auto=format",
    badge: "NEW",
  },
  {
    id: 12,
    name: "Coffee Pour-Over Kettle — Matte Black",
    price: 46.0,
    sold: 2198,
    rating: 4.8,
    reviews: 367,
    shop: "Thornfield Roastery",
    img: "https://images.unsplash.com/photo-1551266681-ba5f0b95e2e5?w=400&h=400&fit=crop&auto=format",
    freeShip: true,
  },
];

const FLASH_PRODUCTS = PRODUCTS.filter((p) => p.originalPrice).slice(0, 4);

export const FlashSale: React.FC<Props> = ({ className, onAdd }) => {
  const { h, m, s } = useCountdown(4 * 3600 + 22 * 60 + 18);


  return (
    <section className="max-w-7xl mx-auto px-3 mb-4">
      <div className="bg-ivory border border-parchment rounded-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-parchment bg-parchment">
          <div className="flex items-center gap-3">
            <span
              className="font-display text-bark font-bold"
              style={{ fontSize: "1.1rem" }}
            >
              ⚡ Flash Sale
            </span>
            <div className="flex items-center gap-1">
              <span className="font-body text-xs text-oak">Ends in</span>
              {[h, m, s].map((unit, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span
                    className="font-body text-cream bg-bark rounded px-1.5 py-0.5 tabular-nums"
                    style={{ fontSize: "0.78rem", fontWeight: 700 }}
                  >
                    {unit}
                  </span>
                  {i < 2 && (
                    <span className="text-bark font-bold text-xs">:</span>
                  )}
                </span>
              ))}
            </div>
          </div>
          <button className="font-body text-caramel text-xs hover:text-amber transition-colors">
            View all flash deals →
          </button>
        </div>

        {/* Product row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-parchment">
          {FLASH_PRODUCTS.map((p) => (
            <div key={p.id} className="bg-ivory p-3 group cursor-pointer">
              <div
                className="relative overflow-hidden rounded-sm mb-2 bg-parchment"
                style={{ aspectRatio: "1/1" }}
              >
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                />
                {p.badge && (
                  <div className="absolute top-1.5 left-1.5">
                    <BadgePill text={p.badge} />
                  </div>
                )}
                {p.originalPrice && (
                  <div
                    className="absolute top-1.5 right-1.5 bg-amber text-cream font-body rounded-sm px-1.5 py-px"
                    style={{ fontSize: "0.6rem", fontWeight: 700 }}
                  >
                    -{Math.round((1 - p.price / p.originalPrice) * 100)}%
                  </div>
                )}
              </div>
              <p className="font-body text-bark text-xs leading-snug mb-1 line-clamp-2">
                {p.name}
              </p>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span
                  className="font-display text-amber font-bold"
                  style={{ fontSize: "1.05rem" }}
                >
                  £{p.price.toFixed(2)}
                </span>
                {p.originalPrice && (
                  <span
                    className="font-body text-oak line-through"
                    style={{ fontSize: "0.72rem" }}
                  >
                    £{p.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <button
                onClick={onAdd}
                className="w-full font-body text-xs py-1.5 bg-parchment hover:bg-caramel hover:text-cream text-oak border border-oak transition-colors rounded-sm"
              >
                Add to Cart{" "}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashSale;