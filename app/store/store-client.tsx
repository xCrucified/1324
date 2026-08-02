'use client';

import React, { useState, useMemo } from 'react';
import { useShopStore } from '@/store/use-shop';
import { ProductCard } from '@/components/shared/product-card';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  description?: string | null;
  categoryId?: string | null;
}

interface Props {
  initialProducts: Product[];
}

export default function StoreClient({ initialProducts }: Props) {
  // Отримуємо збережені товари, функцію toggleSave та додавання до кошика із Zustand
  const { savedItems, toggleSave, addToCart } = useShopStore();
  
  // Категорії
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Визначаємо максимальну ціну за замовчуванням
  const defaultMaxPrice = useMemo(() => {
    if (initialProducts.length === 0) return 20000;
    const max = Math.max(...initialProducts.map((p) => p.price));
    return Math.ceil(max / 1000) * 1000 || 20000;
  }, [initialProducts]);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(defaultMaxPrice);

  // Сортування
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

  // Отримуємо список унікальних категорій
  const categories = useMemo(() => {
    const cats = initialProducts
      .map((p) => p.categoryId)
      .filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(cats))];
  }, [initialProducts]);

  // Фільтрація та сортування товарів (без пошуку)
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
        const matchesPrice = p.price >= minPrice && p.price <= maxPrice;

        return matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') return a.price - b.price;
        if (sortOrder === 'desc') return b.price - a.price;
        return 0;
      });
  }, [initialProducts, selectedCategory, minPrice, maxPrice, sortOrder]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(defaultMaxPrice);
    setSortOrder('default');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Сайдбар з фільтрами */}
      <aside className="w-full lg:w-72 bg-white border border-parchment rounded-sm p-5 h-fit shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-parchment pb-3">
          <h2 className="font-display font-bold text-sm text-bark tracking-wide uppercase">
            Фільтри
          </h2>
          <button
            onClick={resetFilters}
            className="text-xs text-caramel hover:text-amber transition-colors underline"
          >
            Скинути все
          </button>
        </div>

        {/* Фільтр за категоріями */}
        <div>
          <label className="block text-xs font-semibold text-oak mb-2">
            Категорія / Тип
          </label>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-left px-3 py-1.5 rounded text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-bark text-cream font-medium'
                    : 'bg-ivory text-bark hover:bg-parchment'
                }`}
              >
                {cat === 'all' ? '📦 Усі категорії' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Двостороннє регулювання ціни */}
        <div>
          <label className="block text-xs font-semibold text-oak mb-2">
            Ціна (₴)
          </label>
          
          {/* Числові поля введення */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-oak">від</span>
              <input
                type="number"
                min="0"
                max={maxPrice}
                value={minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxPrice);
                  setMinPrice(Math.max(0, val));
                }}
                className="w-full border border-parchment rounded pl-7 pr-2 py-1.5 text-xs bg-ivory text-bark focus:outline-none focus:ring-1 focus:ring-bark"
              />
            </div>
            <span className="text-oak text-xs">—</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-oak">до</span>
              <input
                type="number"
                min={minPrice}
                max={defaultMaxPrice * 2}
                value={maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minPrice);
                  setMaxPrice(val);
                }}
                className="w-full border border-parchment rounded pl-7 pr-2 py-1.5 text-xs bg-ivory text-bark focus:outline-none focus:ring-1 focus:ring-bark"
              />
            </div>
          </div>

          {/* Подвійний слайдер (Range Inputs Dual) */}
          <div className="relative h-5 flex items-center">
            {/* Базова сіра лінія */}
            <div className="absolute w-full h-1 bg-parchment rounded-sm" />

            {/* Активна лінія між бігунками */}
            <div
              className="absolute h-1 bg-bark rounded-sm pointer-events-none"
              style={{
                left: `${(minPrice / defaultMaxPrice) * 100}%`,
                right: `${100 - (maxPrice / defaultMaxPrice) * 100}%`,
              }}
            />

            {/* Повзунок для мінімальної ціни */}
            <input
              type="range"
              min="0"
              max={defaultMaxPrice}
              step="1"
              value={minPrice}
              onChange={(e) => {
                const value = Math.min(Number(e.target.value), maxPrice - 1);
                setMinPrice(value);
              }}
              className="absolute w-full appearance-none bg-transparent pointer-events-none accent-bark [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-bark [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none"
            />

            {/* Повзунок для максимальної ціни */}
            <input
              type="range"
              min="0"
              max={defaultMaxPrice}
              step="1"
              value={maxPrice}
              onChange={(e) => {
                const value = Math.max(Number(e.target.value), minPrice + 1);
                setMaxPrice(value);
              }}
              className="absolute w-full appearance-none bg-transparent pointer-events-none accent-bark [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-bark [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none"
            />
          </div>
        </div>

        {/* Сортування */}
        <div>
          <label className="block text-xs font-semibold text-oak mb-2">
            Сортування
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full border border-parchment rounded p-2 text-xs bg-ivory text-bark focus:outline-none focus:ring-1 focus:ring-bark"
          >
            <option value="default">За замовчуванням</option>
            <option value="asc">Від дешевих до дорогих</option>
            <option value="desc">Від дорогих до дешевих</option>
          </select>
        </div>
      </aside>

      {/* Основна частина з результатами */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4 bg-white border border-parchment p-3 rounded-sm">
          <span className="text-xs text-oak">
            Знайдено товарів: <span className="font-bold text-bark">{filteredProducts.length}</span>
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-parchment rounded p-12 text-center text-oak text-sm">
            За вашим запитом товари не знайдені. Спробуйте змінити фільтри.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const isSaved = savedItems.some((item) => item.id === product.id);

              const cardProduct = {
                id: product.id,
                name: product.title,
                price: product.price,
                originalPrice: product.price * 1.2,
                sold: 0,
                rating: 5,
                reviews: 0,
                shop: 'Pentu',
                img: product.image || '/placeholder.png',
              };

              return (
                <ProductCard
                  key={product.id}
                  product={cardProduct}
                  isSaved={isSaved}
                  onToggleSave={() => {
                    toggleSave({
                      id: cardProduct.id,
                      name: cardProduct.name,
                      price: cardProduct.price,
                      originalPrice: cardProduct.originalPrice,
                      img: cardProduct.img,
                      shop: cardProduct.shop,
                      sold: cardProduct.sold,
                      rating: cardProduct.rating,
                      reviews: cardProduct.reviews,
                    });
                  }}
                  onAdd={() => {
                    addToCart({
                      id: cardProduct.id,
                      name: cardProduct.name,
                      price: cardProduct.price,
                      originalPrice: cardProduct.originalPrice,
                      img: cardProduct.img,
                      shop: cardProduct.shop,
                      sold: cardProduct.sold,
                      rating: cardProduct.rating,
                      reviews: cardProduct.reviews,
                    });
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}