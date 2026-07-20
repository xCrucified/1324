'use client'
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import CartToast from "./ui/cart-toast";
import ProductSection from "./shared/product-section";
import { ProductCard } from "./shared/product-card";
import TrustBar from "./ui/trust-bar";
import CategoryGrid from "./shared/category-grid";
import FlashSale from "./shared/flash-sale";
import Banner from "./ui/banner";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
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

export const Main: React.FC<Props> = ({ className }) => {
  const [cart, setCart] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [query, setQuery] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const handleAdd = useCallback(() => {
    setCart((c) => c + 1);
    setToastVisible(true);
    
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const { filtered, hotItems, newArrivals, recommended } = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    
    const filteredList = trimmedQuery
      ? PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(trimmedQuery) ||
            p.shop.toLowerCase().includes(trimmedQuery)
        )
      : PRODUCTS;

    return {
      filtered: filteredList,
      hotItems: filteredList.filter((p) => p.sold > 2000),
      newArrivals: filteredList.filter((p) => p.badge === "NEW" || p.id > 8),
      recommended: filteredList,
    };
  }, [PRODUCTS, query]);

  return (
    <div className={cn(className, "bg-cream min-h-screen")}>

      <main>
        {!query.trim() && (
          <>
            <Banner />
            <FlashSale onAdd={handleAdd} />
            <CategoryGrid />
            <TrustBar />
          </>
        )}

        {query.trim() ? (
          <section className="max-w-7xl mx-auto px-3 py-4">
            <div className="bg-ivory border border-parchment rounded-sm p-4 mb-3">
              <p className="font-body text-bark text-sm">
                {filtered.length} results for <strong>{query}</strong>
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <ProductSection
              title="🔥 Hot Items"
              products={hotItems.length ? hotItems : PRODUCTS.slice(0, 6)}
              onAdd={handleAdd}
            />
            <ProductSection
              title="✨ New Arrivals"
              products={
                newArrivals.length ? newArrivals : PRODUCTS.slice(4, 10)
              }
              onAdd={handleAdd}
            />
            <ProductSection
              title="Recommended for You"
              products={recommended.slice(0, 6)}
              onAdd={handleAdd}
            />
          </>
        )}
      </main>

      <CartToast visible={toastVisible} />
    </div>
  );
};

export default Main;