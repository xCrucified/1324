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
import { useShopStore } from "@/store/use-shop";
import ActionToast from "./ui/action-toast";

interface Props {
  className?: string;
  selectedCategory?: string; // Добавили категорию в пропсы
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
  id: string;
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

export const Main: React.FC<Props> = ({ className, products, selectedCategory = 'Home' }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  
  const { query, addToCart, savedItems, toggleSave } = useShopStore();

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const handleAdd = useCallback(
    (product: Product) => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice ?? product.price * 1.2,
        img: product.img,
        shop: product.shop,
        sold: product.sold,
        rating: product.rating,
        reviews: product.reviews,
      });

      setToastVisible(true);

      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }

      toastTimer.current = setTimeout(() => {
        setToastVisible(false);
      }, 2200);
    },
    [addToCart]
  );

  const handleToggleSave = useCallback(
    (product: { id: string; name: string; price: number; img: string; shop: string }) => {
      const isCurrentlySaved = savedItems.some((item) => item.id === product.id);
      toggleSave(product);
      
      setSavedMessage(isCurrentlySaved ? 'Removed from saved items' : 'Added to saved items');
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    },
    [savedItems, toggleSave]
  );

  const catalog: Product[] = useMemo(
    () =>
      products.map((p) => ({
        id: p.id,
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
          <h2 className="text-3xl font-bold text-bark">No products yet</h2>
          <p className="text-oak mt-3">Add products from the admin panel.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={cn(className, "bg-cream min-h-screen")}>
      <main>
        {/* Баннеры и FlashSale показываются ТОЛЬКО на главной (Home) и при отсутствии поиска */}
        {selectedCategory === 'Home' && !query.trim() && (
          <>
            <Banner />
            <FlashSale products={products} onAdd={handleAdd} />
            <CategoryGrid />
            <TrustBar />
          </>
        )}

        {/* Если выбран поисковый запрос ИЛИ открыта любая другая категория */}
        {query.trim() || selectedCategory !== 'Home' ? (
          <section className="max-w-7xl mx-auto px-3 py-6">
            <div className="bg-ivory border border-parchment rounded-sm p-4 mb-4 flex items-center justify-between">
              <h1 className="font-display font-bold text-xl text-bark">
                {query.trim() ? `Search results for "${query}"` : selectedCategory}
              </h1>
              <span className="font-body text-oak text-xs">
                {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-ivory border border-parchment rounded-sm">
                <p className="font-display font-bold text-bark text-lg">No products found</p>
                <p className="font-body text-oak text-xs mt-1">Try selecting a different category or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((p) => {
                  const isSaved = savedItems.some((item) => item.id === p.id);
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onAdd={() => handleAdd(p)}
                      isSaved={isSaved}
                      onToggleSave={() =>
                        handleToggleSave({
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          img: p.img,
                          shop: p.shop,
                        })
                      }
                    />
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          /* Стандартные секции для главной страницы (Home) */
          <>
            <ProductSection
              title="🔥 Hot Items"
              products={hotItems.length ? hotItems.slice(0, 6) : catalog.slice(0, 6)}
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
      <ActionToast visible={savedToast} message={savedMessage} icon="🤍" />
    </div>
  );
};

export default Main;