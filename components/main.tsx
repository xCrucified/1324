'use client';

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
  products: {
    id: string;
    title: string;
    price: number;
    description: string | null;
    image: string | null;
    images: string[];
  }[];
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

export const Main: React.FC<Props> = ({ className, products }) => {
  const [, setCart] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [query] = useState("");

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

    toastTimer.current = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  }, []);

  // Преобразуем товары из Prisma в формат ProductCard
  const catalog: Product[] = useMemo(
    () =>
      products.map((p, index) => ({
        id: index + 1,
        name: p.title,
        price: p.price,
        originalPrice: undefined,
        sold: 0,
        rating: 5,
        reviews: 0,
        shop: "Pentu",
        img: p.image || "/placeholder.png",
        badge: undefined,
        freeShip: true,
      })),
    [products]
  );

  const { filtered, hotItems, newArrivals, recommended } = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();

    const filteredList = trimmedQuery
      ? catalog.filter(
          (p) =>
            p.name.toLowerCase().includes(trimmedQuery) ||
            p.shop.toLowerCase().includes(trimmedQuery)
        )
      : catalog;

    return {
      filtered: filteredList,
      hotItems: filteredList.filter((p) => p.sold > 2000),
      newArrivals: filteredList,
      recommended: filteredList,
    };
  }, [catalog, query]);

  if (catalog.length === 0) {
    return (
      <div className={cn(className, "bg-cream min-h-screen")}>
        <main className="max-w-7xl mx-auto py-20 text-center">
          <h2 className="text-3xl font-bold text-bark">
            No products yet
          </h2>
          <p className="text-oak mt-3">
            Add products from the admin panel.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={cn(className, "bg-cream min-h-screen")}>
      <main>
        {!query.trim() && (
          <>
            <Banner />
           <FlashSale
    products={products}
    onAdd={handleAdd}
/>
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
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </section>
        ) : (
          <>
            <ProductSection
              title="🔥 Hot Items"
              products={hotItems.length ? hotItems : catalog.slice(0, 6)}
              onAdd={handleAdd}
            />

            <ProductSection
              title="✨ New Arrivals"
              products={newArrivals.slice(0, 6)}
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